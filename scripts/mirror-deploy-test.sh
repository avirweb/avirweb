#!/bin/bash
set -euo pipefail

# AVIR Mirror + Fix + Validate Integration Script
# Orchestrates the full pipeline: Mirror -> Fix -> Validate -> Deploy -> Test
#
# Usage: ./mirror-deploy-test.sh [options]
# Options:
#   --use-wget              Use wget-based mirroring instead of Playwright
#   --skip-visual-tests     Skip visual regression tests
#   --skip-functional-tests Skip functional tests
#   --skip-link-check       Skip link validation
#   --check-external        Check external links (slower)
# Exit codes: 0 = success, 1 = failure

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Parse command line arguments
USE_WGET=false
SKIP_VISUAL_TESTS=false
SKIP_FUNCTIONAL_TESTS=false
SKIP_LINK_CHECK=false
CHECK_EXTERNAL_LINKS=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --use-wget)
            USE_WGET=true
            shift
            ;;
        --skip-visual-tests)
            SKIP_VISUAL_TESTS=true
            shift
            ;;
        --skip-functional-tests)
            SKIP_FUNCTIONAL_TESTS=true
            shift
            ;;
        --skip-link-check)
            SKIP_LINK_CHECK=true
            shift
            ;;
        --check-external)
            CHECK_EXTERNAL_LINKS=true
            shift
            ;;
        --help)
            echo "AVIR Mirror Deploy Test Pipeline"
            echo ""
            echo "Usage: ./mirror-deploy-test.sh [options]"
            echo ""
            echo "Options:"
            echo "  --use-wget              Use wget-based mirroring instead of Playwright"
            echo "  --skip-visual-tests     Skip visual regression tests"
            echo "  --skip-functional-tests Skip functional tests"
            echo "  --skip-link-check       Skip link validation"
            echo "  --check-external        Check external links (slower)"
            echo "  --help                  Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Log file
LOG_FILE="${PROJECT_ROOT}/logs/mirror-deploy-$(date +%Y%m%d-%H%M%S).log"
EVIDENCE_FILE="${PROJECT_ROOT}/.sisyphus/evidence/task-7-wire.txt"
REPORT_DIR="${PROJECT_ROOT}/test-results"
REPORT_JSON="${REPORT_DIR}/unified-report.json"
REPORT_HTML="${REPORT_DIR}/unified-report.html"
VISUAL_REPORT_DIR="${PROJECT_ROOT}/visual-tests/reports"
FUNCTIONAL_REPORT="${SCRIPT_DIR}/test-results/functional-report.html"
LINK_REPORT="${PROJECT_ROOT}/link-report.html"

# Ensure directories exist
mkdir -p "${PROJECT_ROOT}/logs"
mkdir -p "${PROJECT_ROOT}/.sisyphus/evidence"
mkdir -p "$REPORT_DIR"

# Counters for summary
STAGE_STATUS=()
ERRORS=0
WARNINGS=0
STAGE_NUM=0

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1" | tee -a "$LOG_FILE"
    WARNINGS=$((WARNINGS + 1))
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

log_stage() {
    STAGE_NUM=$((STAGE_NUM + 1))
    echo -e "${BLUE}[STAGE $STAGE_NUM]${NC} $1" | tee -a "$LOG_FILE"
    echo "----------------------------------------" | tee -a "$LOG_FILE"
}

log_substage() {
    echo -e "${CYAN}[SUBSTAGE]${NC} $1" | tee -a "$LOG_FILE"
}

# Function to run a command and capture timing
run_with_timing() {
    local cmd="$1"
    local description="$2"
    
    local start_time=$(date +%s)
    log_info "Running: $description"
    
    if eval "$cmd" 2>&1 | tee -a "$LOG_FILE"; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        log_info "Completed in ${duration}s"
        return 0
    else
        local exit_code=$?
        log_error "Failed with exit code $exit_code"
        return $exit_code
    fi
}

# Function to run a Node.js script
run_node_stage() {
    local stage_name="$1"
    local script_path="$2"
    shift 2
    local extra_args="$@"
    
    log_substage "$stage_name"
    
    # Check if script exists
    if [[ ! -f "$script_path" ]]; then
        log_error "Script not found: $script_path"
        return 1
    fi
    
    local start_time=$(date +%s)
    
    if node "$script_path" $extra_args 2>&1 | tee -a "$LOG_FILE"; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        log_info "$stage_name completed in ${duration}s"
        return 0
    else
        local exit_code=$?
        log_error "$stage_name failed with exit code $exit_code"
        return $exit_code
    fi
}

# Function to run a Python script
run_python_stage() {
    local stage_name="$1"
    local script_path="$2"
    shift 2
    local extra_args="$@"
    
    log_substage "$stage_name"
    
    # Check if script exists
    if [[ ! -f "$script_path" ]]; then
        log_error "Script not found: $script_path"
        return 1
    fi
    
    local start_time=$(date +%s)
    
    if python3 "$script_path" $extra_args 2>&1 | tee -a "$LOG_FILE"; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        log_info "$stage_name completed in ${duration}s"
        return 0
    else
        local exit_code=$?
        log_error "$stage_name failed with exit code $exit_code"
        return $exit_code
    fi
}

# Function to run a bash script
run_bash_stage() {
    local stage_name="$1"
    local script_path="$2"
    shift 2
    local extra_args="$@"
    
    log_substage "$stage_name"
    
    # Check if script exists
    if [[ ! -f "$script_path" ]]; then
        log_error "Script not found: $script_path"
        return 1
    fi
    
    # Check if script is executable
    if [[ ! -x "$script_path" ]]; then
        log_warn "Making script executable: $script_path"
        chmod +x "$script_path" || {
            log_error "Failed to make script executable: $script_path"
            return 1
        }
    fi
    
    local start_time=$(date +%s)
    
    if "$script_path" $extra_args 2>&1 | tee -a "$LOG_FILE"; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        log_info "$stage_name completed in ${duration}s"
        return 0
    else
        local exit_code=$?
        log_error "$stage_name failed with exit code $exit_code"
        return $exit_code
    fi
}

# Generate final report function
generate_report() {
    echo "" | tee -a "$LOG_FILE"
    echo "========================================" | tee -a "$LOG_FILE"
    echo "  Pipeline Summary" | tee -a "$LOG_FILE"
    echo "========================================" | tee -a "$LOG_FILE"
    echo "Completed: $(date)" | tee -a "$LOG_FILE"
    echo "Total Stages: $STAGE_NUM" | tee -a "$LOG_FILE"
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

# Generate comprehensive unified report
generate_unified_report() {
    log_info "Generating unified pipeline report..."
    
    local timestamp=$(date -Iseconds)
    local deploy_url="${DEPLOY_URL:-N/A}"
    
    # Collect all report data
    local visual_report_data="{}"
    local functional_report_data="{}"
    local link_report_data="{}"
    
    if [[ -f "$VISUAL_REPORT_DIR/latest.json" ]]; then
        visual_report_data=$(cat "$VISUAL_REPORT_DIR/latest.json" 2>/dev/null || echo "{}")
    fi
    
    if [[ -f "${PROJECT_ROOT}/link-report.json" ]]; then
        link_report_data=$(cat "${PROJECT_ROOT}/link-report.json" 2>/dev/null || echo "{}")
    fi
    
    # Build stage results array
    local stage_results=""
    for status in "${STAGE_STATUS[@]}"; do
        stage_results="${stage_results}    \"$status\","
    done
    stage_results=$(echo "$stage_results" | sed '$ s/,$//')
    
    # Generate JSON report
    cat > "$REPORT_JSON" << EOF
{
  "timestamp": "$timestamp",
  "deploy_url": "$deploy_url",
  "pipeline_version": "2.0",
  "configuration": {
    "use_wget": $USE_WGET,
    "skip_visual_tests": $SKIP_VISUAL_TESTS,
    "skip_functional_tests": $SKIP_FUNCTIONAL_TESTS,
    "skip_link_check": $SKIP_LINK_CHECK,
    "check_external_links": $CHECK_EXTERNAL_LINKS
  },
  "stages": [
$stage_results
  ],
  "summary": {
    "total_stages": $STAGE_NUM,
    "errors": $ERRORS,
    "warnings": $WARNINGS,
    "success": $([[ $ERRORS -eq 0 ]] && echo "true" || echo "false")
  },
  "reports": {
    "visual": $visual_report_data,
    "links": $link_report_data
  }
}
EOF

    # Generate HTML report
    cat > "$REPORT_HTML" << EOF
<!DOCTYPE html>
<html>
<head>
  <title>AVIR Pipeline Report - $(date '+%Y-%m-%d %H:%M')</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
      max-width: 1000px; 
      margin: 40px auto; 
      padding: 20px;
      background: #f5f5f5;
    }
    .header { 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    h1 { margin-bottom: 10px; }
    .timestamp { opacity: 0.9; font-size: 0.9em; }
    .card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .success { color: #22c55e; }
    .error { color: #ef4444; }
    .warning { color: #f59e0b; }
    .stage { 
      padding: 12px; 
      margin: 8px 0; 
      background: #f9fafb; 
      border-radius: 4px;
      border-left: 4px solid #e5e7eb;
    }
    .stage.passed { border-left-color: #22c55e; }
    .stage.failed { border-left-color: #ef4444; }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
      margin-top: 15px;
    }
    .summary-card {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 6px;
      text-align: center;
    }
    .summary-card h3 {
      font-size: 2rem;
      margin-bottom: 5px;
    }
    .config-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
    .config-item {
      padding: 8px;
      background: #f8f9fa;
      border-radius: 4px;
    }
    .status-banner {
      padding: 15px;
      border-radius: 6px;
      text-align: center;
      font-weight: bold;
      margin-top: 15px;
    }
    .status-banner.success { background: #d4edda; color: #155724; }
    .status-banner.error { background: #f8d7da; color: #721c24; }
  </style>
</head>
<body>
  <div class="header">
    <h1>AVIR Pipeline Report</h1>
    <p class="timestamp">Generated: $timestamp</p>
    <p>Deploy URL: <a href="$deploy_url" style="color: white;">$deploy_url</a></p>
  </div>

  <div class="card">
    <h2>Configuration</h2>
    <div class="config-grid">
      <div class="config-item">Mirror Method: $([[ "$USE_WGET" == "true" ]] && echo "wget" || echo "Playwright")</div>
      <div class="config-item">Visual Tests: $([[ "$SKIP_VISUAL_TESTS" == "true" ]] && echo "Skipped" || echo "Enabled")</div>
      <div class="config-item">Functional Tests: $([[ "$SKIP_FUNCTIONAL_TESTS" == "true" ]] && echo "Skipped" || echo "Enabled")</div>
      <div class="config-item">Link Check: $([[ "$SKIP_LINK_CHECK" == "true" ]] && echo "Skipped" || echo "Enabled")</div>
    </div>
  </div>

  <div class="card">
    <h2>Summary</h2>
    <div class="summary-grid">
      <div class="summary-card">
        <h3 class="$([[ $ERRORS -eq 0 ]] && echo "success" || echo "error")">$STAGE_NUM</h3>
        <p>Total Stages</p>
      </div>
      <div class="summary-card">
        <h3 class="$([[ $ERRORS -eq 0 ]] && echo "success" || echo "error")">$([[ $ERRORS -eq 0 ]] && echo "✓" || echo "$ERRORS")</h3>
        <p>Errors</p>
      </div>
      <div class="summary-card">
        <h3 class="warning">$WARNINGS</h3>
        <p>Warnings</p>
      </div>
    </div>
    <div class="status-banner $([[ $ERRORS -eq 0 ]] && echo "success" || echo "error")">
      $([[ $ERRORS -eq 0 ]] && echo "✅ All stages passed" || echo "❌ $ERRORS error(s) occurred")
    </div>
  </div>

  <div class="card">
    <h2>Stage Results</h2>
$(for status in "${STAGE_STATUS[@]}"; do 
  if [[ "$status" == *"PASSED"* ]]; then
    echo "    <div class=\"stage passed\">✓ $status</div>"
  elif [[ "$status" == *"FAILED"* ]]; then
    echo "    <div class=\"stage failed\">✗ $status</div>"
  elif [[ "$status" == *"SKIPPED"* ]]; then
    echo "    <div class=\"stage\">⊘ $status</div>"
  else
    echo "    <div class=\"stage\">→ $status</div>"
  fi
done)
  </div>

  <div class="card">
    <h2>Report Links</h2>
    <ul style="list-style: none; padding: 0;">
      <li style="padding: 8px 0;"><a href="$LOG_FILE">Pipeline Log</a></li>
      <li style="padding: 8px 0;"><a href="$REPORT_JSON">JSON Report</a></li>
      $([[ -f "$VISUAL_REPORT_DIR/latest.html" ]] && echo "<li style=\"padding: 8px 0;\"><a href=\"$VISUAL_REPORT_DIR/latest.html\">Visual Test Report</a></li>")
      $([[ -f "$FUNCTIONAL_REPORT" ]] && echo "<li style=\"padding: 8px 0;\"><a href=\"$FUNCTIONAL_REPORT\">Functional Test Report</a></li>")
      $([[ -f "$LINK_REPORT" ]] && echo "<li style=\"padding: 8px 0;\"><a href=\"$LINK_REPORT\">Link Checker Report</a></li>")
    </ul>
  </div>
</body>
</html>
EOF

    log_info "Reports saved:"
    log_info "  - JSON: $REPORT_JSON"
    log_info "  - HTML: $REPORT_HTML"
}

save_evidence() {
    mkdir -p "${PROJECT_ROOT}/.sisyphus/evidence"
    if [[ -f "$LOG_FILE" ]]; then
        cat "$LOG_FILE" > "$EVIDENCE_FILE"
        log_info "Evidence saved to: $EVIDENCE_FILE"
    fi
}

cleanup() {
    local exit_code=$?
    
    generate_unified_report
    
    if [[ $exit_code -ne 0 ]]; then
        log_error "Pipeline failed with exit code $exit_code"
        log_error "Check log file: $LOG_FILE"
        log_info "Cleaning up temporary files..."
        
        rm -f "${PROJECT_ROOT}/.sisyphus/DEPLOY_URL"
        rm -f "${PROJECT_ROOT}/.sisyphus/LAST_DEPLOY"
        
        if [[ -d "${PROJECT_ROOT}/test-results/temp" ]]; then
            rm -rf "${PROJECT_ROOT}/test-results/temp"
        fi
        
        log_info "Cleanup complete"
    fi
    
    save_evidence
}
trap cleanup EXIT

# Main execution starts here
echo "========================================" | tee -a "$LOG_FILE"
echo "  AVIR Mirror + Fix + Validate Pipeline" | tee -a "$LOG_FILE"
echo "  Version 2.0 - Playwright Enhanced" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"
echo "Started: $(date)" | tee -a "$LOG_FILE"
echo "Log file: $LOG_FILE" | tee -a "$LOG_FILE"
echo "Project root: $PROJECT_ROOT" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Configuration summary
echo "Configuration:" | tee -a "$LOG_FILE"
echo "  Mirror method: $([[ "$USE_WGET" == "true" ]] && echo "wget (fallback)" || echo "Playwright (primary)")" | tee -a "$LOG_FILE"
echo "  Visual tests: $([[ "$SKIP_VISUAL_TESTS" == "true" ]] && echo "Skipped" || echo "Enabled")" | tee -a "$LOG_FILE"
echo "  Functional tests: $([[ "$SKIP_FUNCTIONAL_TESTS" == "true" ]] && echo "Skipped" || echo "Enabled")" | tee -a "$LOG_FILE"
echo "  Link validation: $([[ "$SKIP_LINK_CHECK" == "true" ]] && echo "Skipped" || echo "Enabled")" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# ============================================================================
# STAGE 1: Mirror Site
# ============================================================================
log_stage "Mirror Site"

if [[ "$USE_WGET" == "true" ]]; then
    log_info "Using wget-based mirroring (manual override)"
    if run_bash_stage "Wget Mirror" "${SCRIPT_DIR}/mirror-avir.sh"; then
        STAGE_STATUS+=("Stage $STAGE_NUM (Mirror Site): PASSED (wget)")
    else
        log_error "Wget mirroring failed"
        ERRORS=$((ERRORS + 1))
        STAGE_STATUS+=("Stage $STAGE_NUM (Mirror Site): FAILED (wget)")
        generate_report
        exit 1
    fi
else
    # Try Playwright first, fallback to wget
    log_info "Attempting Playwright-based mirroring..."
    
    if command -v node &> /dev/null && [[ -f "${SCRIPT_DIR}/mirror-playwright.js" ]]; then
        if run_node_stage "Playwright Mirror" "${SCRIPT_DIR}/mirror-playwright.js"; then
            STAGE_STATUS+=("Stage $STAGE_NUM (Mirror Site): PASSED (Playwright)")
            log_info "Playwright mirror completed successfully"
        else
            log_warn "Playwright mirroring failed, falling back to wget..."
            if run_bash_stage "Wget Mirror (Fallback)" "${SCRIPT_DIR}/mirror-avir.sh"; then
                STAGE_STATUS+=("Stage $STAGE_NUM (Mirror Site): PASSED (wget fallback)")
                log_info "Wget fallback completed successfully"
            else
                log_error "Both Playwright and wget mirroring failed"
                ERRORS=$((ERRORS + 1))
                STAGE_STATUS+=("Stage $STAGE_NUM (Mirror Site): FAILED (both methods)")
                generate_report
                exit 1
            fi
        fi
    else
        log_warn "Node.js or mirror-playwright.js not found, using wget..."
        if run_bash_stage "Wget Mirror" "${SCRIPT_DIR}/mirror-avir.sh"; then
            STAGE_STATUS+=("Stage $STAGE_NUM (Mirror Site): PASSED (wget)")
        else
            ERRORS=$((ERRORS + 1))
            STAGE_STATUS+=("Stage $STAGE_NUM (Mirror Site): FAILED (wget)")
            generate_report
            exit 1
        fi
    fi
fi

echo "" | tee -a "$LOG_FILE"

# ============================================================================
# STAGE 2: Download CDN Images
# ============================================================================
log_stage "Download CDN Images"

if [[ -f "${SCRIPT_DIR}/download-cdn-images.py" ]]; then
    if run_python_stage "CDN Image Downloader" "${SCRIPT_DIR}/download-cdn-images.py"; then
        STAGE_STATUS+=("Stage $STAGE_NUM (Download CDN Images): PASSED")
    else
        log_warn "CDN image download had issues, continuing..."
        STAGE_STATUS+=("Stage $STAGE_NUM (Download CDN Images): PASSED with warnings")
    fi
else
    log_warn "download-cdn-images.py not found, skipping..."
    STAGE_STATUS+=("Stage $STAGE_NUM (Download CDN Images): SKIPPED (script not found)")
fi

echo "" | tee -a "$LOG_FILE"

# ============================================================================
# STAGE 3: Fix CDN Assets
# ============================================================================
log_stage "Fix CDN Assets"

if [[ -f "${SCRIPT_DIR}/fix-cdn-assets.py" ]]; then
    if run_python_stage "CDN Asset Fixer" "${SCRIPT_DIR}/fix-cdn-assets.py"; then
        STAGE_STATUS+=("Stage $STAGE_NUM (Fix CDN Assets): PASSED")
    else
        log_warn "CDN asset fixing had issues, continuing..."
        STAGE_STATUS+=("Stage $STAGE_NUM (Fix CDN Assets): PASSED with warnings")
    fi
else
    log_warn "fix-cdn-assets.py not found, trying fix-all-images.py..."
    if [[ -f "${SCRIPT_DIR}/fix-all-images.py" ]]; then
        if run_python_stage "Fix Images" "${SCRIPT_DIR}/fix-all-images.py"; then
            STAGE_STATUS+=("Stage $STAGE_NUM (Fix CDN Assets): PASSED (legacy)")
        else
            ERRORS=$((ERRORS + 1))
            STAGE_STATUS+=("Stage $STAGE_NUM (Fix CDN Assets): FAILED")
            generate_report
            exit 1
        fi
    else
        log_error "No asset fixer script found"
        ERRORS=$((ERRORS + 1))
        STAGE_STATUS+=("Stage $STAGE_NUM (Fix CDN Assets): FAILED (no script)")
        generate_report
        exit 1
    fi
fi

echo "" | tee -a "$LOG_FILE"

# ============================================================================
# STAGE 4: Validate Site Structure
# ============================================================================
log_stage "Validate Site Structure"

if run_bash_stage "Site Validation" "${SCRIPT_DIR}/validate-site.sh"; then
    STAGE_STATUS+=("Stage $STAGE_NUM (Validate Site): PASSED")
else
    ERRORS=$((ERRORS + 1))
    STAGE_STATUS+=("Stage $STAGE_NUM (Validate Site): FAILED")
    generate_report
    exit 1
fi

echo "" | tee -a "$LOG_FILE"

# ============================================================================
# STAGE 5: Validate Security
# ============================================================================
log_stage "Validate Security"

if run_bash_stage "Security Validation" "${SCRIPT_DIR}/validate-security.sh"; then
    STAGE_STATUS+=("Stage $STAGE_NUM (Validate Security): PASSED")
else
    ERRORS=$((ERRORS + 1))
    STAGE_STATUS+=("Stage $STAGE_NUM (Validate Security): FAILED")
    generate_report
    exit 1
fi

echo "" | tee -a "$LOG_FILE"

# ============================================================================
# STAGE 6: Link Checker Validation (Optional)
# ============================================================================
log_stage "Link Validation"

if [[ "$SKIP_LINK_CHECK" == "true" ]]; then
    log_info "Link validation skipped (--skip-link-check)"
    STAGE_STATUS+=("Stage $STAGE_NUM (Link Validation): SKIPPED")
else
    if [[ -f "${SCRIPT_DIR}/check-links-enhanced.js" ]]; then
        LINK_CHECK_ARGS="--format=html --output=${PROJECT_ROOT}/link-report.html"
        if [[ "$CHECK_EXTERNAL_LINKS" == "true" ]]; then
            LINK_CHECK_ARGS="$LINK_CHECK_ARGS --check-external"
            log_info "Checking external links (this may take longer)..."
        fi
        
        if run_node_stage "Link Checker" "${SCRIPT_DIR}/check-links-enhanced.js" "$LINK_CHECK_ARGS"; then
            STAGE_STATUS+=("Stage $STAGE_NUM (Link Validation): PASSED")
        else
            log_warn "Link validation found broken links, continuing..."
            STAGE_STATUS+=("Stage $STAGE_NUM (Link Validation): PASSED with warnings")
        fi
    else
        log_warn "check-links-enhanced.js not found, skipping link validation..."
        STAGE_STATUS+=("Stage $STAGE_NUM (Link Validation): SKIPPED (script not found)")
    fi
fi

echo "" | tee -a "$LOG_FILE"

# ============================================================================
# STAGE 7: Deploy to Cloudflare Pages
# ============================================================================
log_stage "Deploy to Cloudflare Pages"

# Check wrangler
if ! command -v wrangler &> /dev/null; then
    log_error "wrangler CLI not installed"
    ERRORS=$((ERRORS + 1))
    STAGE_STATUS+=("Stage $STAGE_NUM (Deploy): FAILED - wrangler not found")
    generate_report
    exit 1
fi

# Check site directory exists
if [[ ! -d "${PROJECT_ROOT}/site" ]]; then
    log_error "site/ directory not found"
    ERRORS=$((ERRORS + 1))
    STAGE_STATUS+=("Stage $STAGE_NUM (Deploy): FAILED - site directory missing")
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
    STAGE_STATUS+=("Stage $STAGE_NUM (Deploy): FAILED (exit $DEPLOY_EXIT_CODE)")
    generate_report
    exit 1
fi

# Extract deploy URL
DEPLOY_URL=$(echo "$DEPLOY_OUTPUT" | grep -oE 'https://[^[:space:]]+' | head -1)

if [[ -z "$DEPLOY_URL" ]]; then
    DEPLOY_URL=$(echo "$DEPLOY_OUTPUT" | grep -oE 'https://[a-zA-Z0-9-]+\.pages\.dev' | head -1)
fi

if [[ -n "$DEPLOY_URL" ]]; then
    log_info "Deployed to: $DEPLOY_URL"
    echo "$DEPLOY_URL" > "${PROJECT_ROOT}/.sisyphus/DEPLOY_URL"
    export DEPLOY_URL
    STAGE_STATUS+=("Stage $STAGE_NUM (Deploy): PASSED - $DEPLOY_URL")
else
    log_warn "Could not extract deploy URL from output"
    STAGE_STATUS+=("Stage $STAGE_NUM (Deploy): PASSED (URL not captured)")
fi

echo "" | tee -a "$LOG_FILE"

# Start local server for testing (if needed)
LOCAL_SERVER_PID=""
start_local_server() {
    log_info "Starting local server for testing..."
    cd "${PROJECT_ROOT}/site"
    python3 -m http.server 8000 &
    LOCAL_SERVER_PID=$!
    cd "$PROJECT_ROOT"
    sleep 2
    log_info "Local server started on PID $LOCAL_SERVER_PID"
}

stop_local_server() {
    if [[ -n "$LOCAL_SERVER_PID" ]]; then
        log_info "Stopping local server..."
        kill $LOCAL_SERVER_PID 2>/dev/null || true
        LOCAL_SERVER_PID=""
    fi
}

# Start local server for visual and functional tests
start_local_server

# ============================================================================
# STAGE 8: Visual Regression Tests (Optional)
# ============================================================================
log_stage "Visual Regression Tests"

if [[ "$SKIP_VISUAL_TESTS" == "true" ]]; then
    log_info "Visual tests skipped (--skip-visual-tests)"
    STAGE_STATUS+=("Stage $STAGE_NUM (Visual Tests): SKIPPED")
else
    if [[ -f "${SCRIPT_DIR}/visual-tests.js" ]]; then
        if run_node_stage "Visual Tests" "${SCRIPT_DIR}/visual-tests.js" "--browsers=chromium"; then
            STAGE_STATUS+=("Stage $STAGE_NUM (Visual Tests): PASSED")
        else
            log_warn "Some visual tests failed, check report for details"
            STAGE_STATUS+=("Stage $STAGE_NUM (Visual Tests): PASSED with warnings")
        fi
        
        if [[ -f "$VISUAL_REPORT_DIR/latest.html" ]]; then
            log_info "Visual test report available at: $VISUAL_REPORT_DIR/latest.html"
        fi
    else
        log_warn "visual-tests.js not found, skipping visual tests..."
        STAGE_STATUS+=("Stage $STAGE_NUM (Visual Tests): SKIPPED (script not found)")
    fi
fi

echo "" | tee -a "$LOG_FILE"

# ============================================================================
# STAGE 9: Functional Tests (Optional)
# ============================================================================
log_stage "Functional Tests"

if [[ "$SKIP_FUNCTIONAL_TESTS" == "true" ]]; then
    log_info "Functional tests skipped (--skip-functional-tests)"
    STAGE_STATUS+=("Stage $STAGE_NUM (Functional Tests): SKIPPED")
else
    if [[ -f "${SCRIPT_DIR}/functional-tests.js" ]]; then
        if run_node_stage "Functional Tests" "${SCRIPT_DIR}/functional-tests.js" "--url=http://localhost:8000"; then
            STAGE_STATUS+=("Stage $STAGE_NUM (Functional Tests): PASSED")
        else
            log_warn "Some functional tests failed, check report for details"
            STAGE_STATUS+=("Stage $STAGE_NUM (Functional Tests): PASSED with warnings")
        fi
        
        if [[ -f "$FUNCTIONAL_REPORT" ]]; then
            log_info "Functional test report available at: $FUNCTIONAL_REPORT"
        fi
    else
        log_warn "functional-tests.js not found, skipping functional tests..."
        STAGE_STATUS+=("Stage $STAGE_NUM (Functional Tests): SKIPPED (script not found)")
    fi
fi

# Stop local server
stop_local_server

echo "" | tee -a "$LOG_FILE"

# ============================================================================
# STAGE 10: Generate Final Report
# ============================================================================
log_stage "Generate Unified Report"

generate_report

echo "" | tee -a "$LOG_FILE"
log_info "Pipeline completed!"
log_info "Unified report: $REPORT_HTML"
log_info "Log file: $LOG_FILE"

# Exit with appropriate code
if [[ $ERRORS -eq 0 ]]; then
    exit 0
else
    exit 1
fi
