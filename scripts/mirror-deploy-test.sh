#!/bin/bash
set -euo pipefail

# AVIR Mirror + Fix + Validate Integration Script
# Orchestrates the full pipeline: Mirror -> Fix -> Validate
#
# Usage: ./mirror-deploy-test.sh
# Exit codes: 0 = success, 1 = failure

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"

# Log file
LOG_FILE="${PROJECT_ROOT}/mirror-deploy-$(date +%Y%m%d-%H%M%S).log"
EVIDENCE_FILE="${PROJECT_ROOT}/.sisyphus/evidence/task-2-integrate.txt"

# Ensure evidence directory exists
mkdir -p "${PROJECT_ROOT}/.sisyphus/evidence"

# Counters for summary
STAGE_STATUS=()
ERRORS=0

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

log_stage() {
    echo -e "${BLUE}[STAGE $1]${NC} $2" | tee -a "$LOG_FILE"
}

# Generate final report function (defined early for use in error handling)
generate_report() {
    echo "" | tee -a "$LOG_FILE"
    echo "========================================" | tee -a "$LOG_FILE"
    echo "  Pipeline Summary" | tee -a "$LOG_FILE"
    echo "========================================" | tee -a "$LOG_FILE"
    echo "Completed: $(date)" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"

    for status in "${STAGE_STATUS[@]}"; do
        echo "  $status" | tee -a "$LOG_FILE"
    done

    echo "" | tee -a "$LOG_FILE"

    if [[ $ERRORS -eq 0 ]]; then
        echo -e "${GREEN}✅ All stages completed successfully!${NC}" | tee -a "$LOG_FILE"
        echo "Site is ready for deployment." | tee -a "$LOG_FILE"
    else
        echo -e "${RED}❌ Pipeline completed with $ERRORS error(s)${NC}" | tee -a "$LOG_FILE"
        echo "Review the log file for details: $LOG_FILE" | tee -a "$LOG_FILE"
    fi

    echo "" | tee -a "$LOG_FILE"
    echo "Log saved to: $LOG_FILE" | tee -a "$LOG_FILE"
}

# Cleanup function
cleanup() {
    local exit_code=$?
    if [[ $exit_code -ne 0 ]]; then
        log_error "Pipeline failed with exit code $exit_code"
        log_error "Check log file: $LOG_FILE"
    fi
}
trap cleanup EXIT

# Function to run a stage
run_stage() {
    local stage_num="$1"
    local stage_name="$2"
    local script_path="$3"
    shift 3
    local extra_args="$@"

    log_stage "$stage_num" "$stage_name"
    echo "----------------------------------------" | tee -a "$LOG_FILE"

    # Check if script exists
    if [[ ! -f "$script_path" ]]; then
        log_error "Script not found: $script_path"
        STAGE_STATUS+=("Stage $stage_num ($stage_name): FAILED - Script not found")
        return 1
    fi

    # Check if script is executable
    if [[ ! -x "$script_path" ]]; then
        log_warn "Script not executable, attempting to make it executable: $script_path"
        chmod +x "$script_path" || {
            log_error "Failed to make script executable: $script_path"
            STAGE_STATUS+=("Stage $stage_num ($stage_name): FAILED - Cannot execute")
            return 1
        }
    fi

    # Run the script and capture exit code
    local start_time=$(date +%s)

    if [[ "$script_path" == *.py ]]; then
        # Python script
        if python3 "$script_path" $extra_args 2>&1 | tee -a "$LOG_FILE"; then
            local end_time=$(date +%s)
            local duration=$((end_time - start_time))
            log_info "Stage $stage_num completed in ${duration}s"
            STAGE_STATUS+=("Stage $stage_num ($stage_name): PASSED (${duration}s)")
            return 0
        else
            local exit_code=$?
            log_error "Stage $stage_num failed with exit code $exit_code"
            STAGE_STATUS+=("Stage $stage_num ($stage_name): FAILED (exit $exit_code)")
            return 1
        fi
    else
        # Bash script
        if "$script_path" $extra_args 2>&1 | tee -a "$LOG_FILE"; then
            local end_time=$(date +%s)
            local duration=$((end_time - start_time))
            log_info "Stage $stage_num completed in ${duration}s"
            STAGE_STATUS+=("Stage $stage_num ($stage_name): PASSED (${duration}s)")
            return 0
        else
            local exit_code=$?
            log_error "Stage $stage_num failed with exit code $exit_code"
            STAGE_STATUS+=("Stage $stage_num ($stage_name): FAILED (exit $exit_code)")
            return 1
        fi
    fi
}

# Main execution
echo "========================================" | tee -a "$LOG_FILE"
echo "  AVIR Mirror + Fix + Validate Pipeline" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"
echo "Started: $(date)" | tee -a "$LOG_FILE"
echo "Log file: $LOG_FILE" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Stage 1: Mirror
if ! run_stage 1 "Mirror Site" "${SCRIPT_DIR}/scripts/mirror-avir.sh"; then
    ERRORS=$((ERRORS + 1))
    log_error "Stage 1 failed. Stopping pipeline."
    generate_report
    exit 1
fi

echo "" | tee -a "$LOG_FILE"

# Stage 2: Fix Images
if ! run_stage 2 "Fix Images" "${SCRIPT_DIR}/scripts/fix-all-images.py"; then
    ERRORS=$((ERRORS + 1))
    log_error "Stage 2 failed. Stopping pipeline."
    generate_report
    exit 1
fi

echo "" | tee -a "$LOG_FILE"

# Stage 3a: Validate Site
if ! run_stage 3a "Validate Site Structure" "${SCRIPT_DIR}/scripts/validate-site.sh"; then
    ERRORS=$((ERRORS + 1))
    log_error "Stage 3a failed. Stopping pipeline."
    generate_report
    exit 1
fi

echo "" | tee -a "$LOG_FILE"

# Stage 3b: Validate Security
if ! run_stage 3b "Validate Security" "${SCRIPT_DIR}/scripts/validate-security.sh"; then
    ERRORS=$((ERRORS + 1))
    log_error "Stage 3b failed. Stopping pipeline."
    generate_report
    exit 1
fi

echo "" | tee -a "$LOG_FILE"

# Stage 4: Deploy to Cloudflare Pages
log_stage "4" "Deploying to Cloudflare Pages"
echo "----------------------------------------" | tee -a "$LOG_FILE"

# Check wrangler
if ! command -v wrangler &> /dev/null; then
    log_error "wrangler not installed"
    ERRORS=$((ERRORS + 1))
    generate_report
    exit 1
fi

# Check site directory exists
if [[ ! -d "${PROJECT_ROOT}/site" ]]; then
    log_error "site/ directory not found"
    ERRORS=$((ERRORS + 1))
    generate_report
    exit 1
fi

# Deploy
log_info "Deploying to avirwebtest project..."
DEPLOY_OUTPUT=$(wrangler pages deploy "${PROJECT_ROOT}/site" --project-name=avirwebtest --branch=main 2>&1)
DEPLOY_EXIT_CODE=$?

echo "$DEPLOY_OUTPUT" | tee -a "$LOG_FILE"

if [[ $DEPLOY_EXIT_CODE -ne 0 ]]; then
    log_error "Deployment failed with exit code $DEPLOY_EXIT_CODE"
    ERRORS=$((ERRORS + 1))
    STAGE_STATUS+=("Stage 4 (Deploy): FAILED (exit $DEPLOY_EXIT_CODE)")
    generate_report
    exit 1
fi

# Extract deploy URL
DEPLOY_URL=$(echo "$DEPLOY_OUTPUT" | grep -oE 'https://[^[:space:]]+' | head -1)

if [[ -z "$DEPLOY_URL" ]]; then
    # Try alternative pattern for Cloudflare Pages URLs
    DEPLOY_URL=$(echo "$DEPLOY_OUTPUT" | grep -oE 'https://[a-zA-Z0-9-]+\.pages\.dev' | head -1)
fi

if [[ -n "$DEPLOY_URL" ]]; then
    log_info "Deployed to: $DEPLOY_URL"
    echo "$DEPLOY_URL" > "${PROJECT_ROOT}/.sisyphus/DEPLOY_URL"
    export DEPLOY_URL
    STAGE_STATUS+=("Stage 4 (Deploy): PASSED")
else
    log_warn "Could not extract deploy URL from output"
    STAGE_STATUS+=("Stage 4 (Deploy): PASSED (URL not captured)")
fi

echo "" | tee -a "$LOG_FILE"

# Generate report
generate_report

# Save evidence
cat "$LOG_FILE" > "$EVIDENCE_FILE"

# Exit with appropriate code
if [[ $ERRORS -eq 0 ]]; then
    exit 0
else
    exit 1
fi
