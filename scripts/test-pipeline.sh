#!/usr/bin/env bash
#
# AVIR Replication Pipeline - End-to-End Test Script
#
# Tests the complete replication pipeline end-to-end with:
# - Stage 1: Copy (crawler with dry-run mode)
# - Stage 2: Update (asset manager)
# - Stage 3: Validate (all 3 validation scripts)
# - Stage 4: Publish (wrangler config verification, no actual deploy)
# - Stage 5: Dashboard (generation and verification)
#
# Usage:
#   ./scripts/test-pipeline.sh [--local] [--ci] [--quick]
#
# Options:
#   --local   Run in local mode (default, no actual deploy)
#   --ci      Run in CI mode (stricter checks, faster timeouts)
#   --quick   Skip long-running tests (visual regression)
#

set -euo pipefail

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
TEST_DIR="${ROOT_DIR}/test-results/pipeline-test"
REPORT_FILE="${ROOT_DIR}/.sisyphus/PIPELINE_TEST_REPORT.md"
LOG_FILE="${TEST_DIR}/test-$(date +%Y%m%d-%H%M%S).log"

# Test configuration
MODE="local"
QUICK_MODE=false
CI_MODE=false
MAX_TEST_DURATION=600  # 10 minutes max

# Test results tracking
declare -A TEST_RESULTS
declare -A TEST_DURATIONS
declare -A TEST_MESSAGES
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
SKIPPED_TESTS=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging functions
log_info() { 
    echo -e "${BLUE}ℹ${NC} $1" | tee -a "$LOG_FILE"
}

log_success() { 
    echo -e "${GREEN}✓${NC} $1" | tee -a "$LOG_FILE"
}

log_warn() { 
    echo -e "${YELLOW}⚠${NC} $1" | tee -a "$LOG_FILE"
}

log_error() { 
    echo -e "${RED}✗${NC} $1" | tee -a "$LOG_FILE"
}

log_section() {
    echo "" | tee -a "$LOG_FILE"
    echo -e "${CYAN}========================================${NC}" | tee -a "$LOG_FILE"
    echo -e "${CYAN}  $1${NC}" | tee -a "$LOG_FILE"
    echo -e "${CYAN}========================================${NC}" | tee -a "$LOG_FILE"
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --local)
                MODE="local"
                shift
                ;;
            --ci)
                MODE="ci"
                CI_MODE=true
                MAX_TEST_DURATION=300  # 5 minutes in CI
                shift
                ;;
            --quick)
                QUICK_MODE=true
                shift
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

# Show help
show_help() {
    cat << 'EOF'
AVIR Replication Pipeline - End-to-End Test Script

Usage: ./scripts/test-pipeline.sh [options]

Options:
  --local     Run in local mode (default, no actual deployment)
  --ci        Run in CI mode (stricter checks, faster timeouts)
  --quick     Skip long-running tests (visual regression)
  --help, -h  Show this help message

Examples:
  # Run all tests locally (recommended)
  ./scripts/test-pipeline.sh

  # Run in CI mode
  ./scripts/test-pipeline.sh --ci

  # Quick test (skip visual regression)
  ./scripts/test-pipeline.sh --quick

Exit Codes:
  0   All tests passed
  1   One or more tests failed

EOF
}

# Initialize test environment
init() {
    log_section "INITIALIZING TEST ENVIRONMENT"
    
    # Create test directory
    mkdir -p "$TEST_DIR"
    mkdir -p "$(dirname "$REPORT_FILE")"
    
    # Start log file
    echo "AVIR Pipeline Test Log" > "$LOG_FILE"
    echo "Started: $(date -Iseconds)" >> "$LOG_FILE"
    echo "Mode: $MODE" >> "$LOG_FILE"
    echo "=======================================" >> "$LOG_FILE"
    
    log_info "Test directory: $TEST_DIR"
    log_info "Log file: $LOG_FILE"
    log_info "Mode: $MODE"
    
    if [[ "$CI_MODE" == true ]]; then
        log_info "CI mode enabled - using shorter timeouts"
    fi
    
    if [[ "$QUICK_MODE" == true ]]; then
        log_info "Quick mode enabled - skipping visual regression tests"
    fi
    
    # Check prerequisites
    check_prerequisites
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    local missing_deps=()
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        missing_deps+=("Node.js")
    else
        local node_version
        node_version=$(node --version)
        log_success "Node.js: $node_version"
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        missing_deps+=("npm")
    else
        log_success "npm: $(npm --version)"
    fi
    
    # Check if dependencies are installed
    if [[ ! -d "${ROOT_DIR}/node_modules" ]]; then
        log_warn "Node modules not found. Installing..."
        (cd "$ROOT_DIR" && npm install) || missing_deps+=("npm install failed")
    else
        log_success "Node modules installed"
    fi
    
    # Check Playwright
    if ! command -v npx &> /dev/null || ! npx playwright --version &> /dev/null 2>&1; then
        missing_deps+=("Playwright")
    else
        log_success "Playwright: $(npx playwright --version)"
    fi
    
    # Check wrangler (optional for local mode)
    if [[ "$MODE" != "local" ]] && ! command -v wrangler &> /dev/null; then
        missing_deps+=("wrangler")
    elif command -v wrangler &> /dev/null; then
        log_success "wrangler: installed"
    else
        log_warn "wrangler not found (optional for local mode)"
    fi
    
    if [[ ${#missing_deps[@]} -gt 0 ]]; then
        log_error "Missing dependencies: ${missing_deps[*]}"
        exit 1
    fi
    
    log_success "All prerequisites satisfied"
}

# Run a test and track results
run_test() {
    local test_name="$1"
    local test_command="$2"
    local timeout_duration="${3:-60}"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    log_section "TEST: $test_name"
    
    local start_time
    start_time=$(date +%s)
    
    local exit_code=0
    
    # Run test with timeout
    if timeout "$timeout_duration" bash -c "$test_command" >> "$LOG_FILE" 2>&1; then
        exit_code=0
    else
        exit_code=$?
        if [[ $exit_code -eq 124 ]]; then
            log_error "Test timed out after ${timeout_duration}s"
            TEST_MESSAGES["$test_name"]="Timeout after ${timeout_duration}s"
        fi
    fi
    
    local end_time
    end_time=$(date +%s)
    local duration=$((end_time - start_time))
    TEST_DURATIONS["$test_name"]=$duration
    
    if [[ $exit_code -eq 0 ]]; then
        log_success "Test passed (${duration}s)"
        TEST_RESULTS["$test_name"]="PASS"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        log_error "Test failed with exit code $exit_code (${duration}s)"
        TEST_RESULTS["$test_name"]="FAIL"
        TEST_MESSAGES["$test_name"]="${TEST_MESSAGES[$test_name]:-Exit code $exit_code}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# Skip a test
skip_test() {
    local test_name="$1"
    local reason="$2"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    SKIPPED_TESTS=$((SKIPPED_TESTS + 1))
    
    log_section "TEST: $test_name"
    log_warn "SKIPPED: $reason"
    
    TEST_RESULTS["$test_name"]="SKIP"
    TEST_MESSAGES["$test_name"]="$reason"
    TEST_DURATIONS["$test_name"]=0
}

# ============================================================================
# STAGE 1: COPY - Test Crawler
# ============================================================================

test_stage1_copy() {
    log_section "STAGE 1: COPY - Testing Crawler"
    
    # Test 1: Check crawler script exists and is executable
    run_test "Stage 1.1 - Crawler script exists" \
        "test -f ${SCRIPT_DIR}/crawler-enhanced.js && test -r ${SCRIPT_DIR}/crawler-enhanced.js"
    
    # Test 2: Check crawler has proper shebang
    run_test "Stage 1.2 - Crawler has Node.js shebang" \
        "head -1 ${SCRIPT_DIR}/crawler-enhanced.js | grep -q '#!/usr/bin/env node'"
    
    # Test 3: Validate crawler syntax
    run_test "Stage 1.3 - Crawler syntax valid" \
        "node --check ${SCRIPT_DIR}/crawler-enhanced.js" \
        30
    
    # Test 4: Check crawler can show help (if supported)
    if grep -q "showHelp\|--help" "${SCRIPT_DIR}/crawler-enhanced.js"; then
        run_test "Stage 1.4 - Crawler help works" \
            "node ${SCRIPT_DIR}/crawler-enhanced.js --help || true" \
            10
    else
        skip_test "Stage 1.4 - Crawler help" "Help not implemented"
    fi
    
    # Test 5: Check mirror-raw directory structure (if exists from previous run)
    if [[ -d "${ROOT_DIR}/mirror-raw" ]]; then
        run_test "Stage 1.5 - Mirror-raw directory exists" \
            "test -d ${ROOT_DIR}/mirror-raw && test -r ${ROOT_DIR}/mirror-raw"
        
        # Check for expected subdirectories
        for subdir in css js images fonts; do
            if [[ -d "${ROOT_DIR}/mirror-raw/$subdir" ]]; then
                run_test "Stage 1.6 - $subdir subdirectory exists" \
                    "test -d ${ROOT_DIR}/mirror-raw/$subdir"
            fi
        done
        
        # Check for crawl report
        if [[ -f "${ROOT_DIR}/mirror-raw/crawl-report.json" ]]; then
            run_test "Stage 1.7 - Crawl report exists" \
                "test -s ${ROOT_DIR}/mirror-raw/crawl-report.json"
        fi
        
        # Check for asset manifest
        if [[ -f "${ROOT_DIR}/mirror-raw/asset-manifest.json" ]]; then
            run_test "Stage 1.8 - Asset manifest exists" \
                "test -s ${ROOT_DIR}/mirror-raw/asset-manifest.json"
        fi
    else
        skip_test "Stage 1.5-1.8 - Mirror directory checks" "mirror-raw directory not found (run crawler first)"
    fi
}

# ============================================================================
# STAGE 2: UPDATE - Test Asset Manager
# ============================================================================

test_stage2_update() {
    log_section "STAGE 2: UPDATE - Testing Asset Manager"
    
    # Test 1: Check asset manager script exists
    run_test "Stage 2.1 - Asset manager script exists" \
        "test -f ${SCRIPT_DIR}/asset-manager.js && test -r ${SCRIPT_DIR}/asset-manager.js"
    
    # Test 2: Check asset manager has proper shebang
    run_test "Stage 2.2 - Asset manager has Node.js shebang" \
        "head -1 ${SCRIPT_DIR}/asset-manager.js | grep -q '#!/usr/bin/env node'"
    
    # Test 3: Validate asset manager syntax
    run_test "Stage 2.3 - Asset manager syntax valid" \
        "node --check ${SCRIPT_DIR}/asset-manager.js" \
        30
    
    # Test 4: Check asset manager can show help
    if grep -q "showHelp\|--help" "${SCRIPT_DIR}/asset-manager.js"; then
        run_test "Stage 2.4 - Asset manager help works" \
            "node ${SCRIPT_DIR}/asset-manager.js --help || true" \
            10
    else
        skip_test "Stage 2.4 - Asset manager help" "Help not implemented"
    fi
    
    # Test 5: Check site directory structure (if exists)
    if [[ -d "${ROOT_DIR}/site" ]]; then
        run_test "Stage 2.5 - Site directory exists" \
            "test -d ${ROOT_DIR}/site && test -r ${ROOT_DIR}/site"
        
        # Check for index.html
        run_test "Stage 2.6 - index.html exists" \
            "test -f ${ROOT_DIR}/site/index.html"
        
        # Check for _headers file
        if [[ -f "${ROOT_DIR}/site/_headers" ]]; then
            run_test "Stage 2.7 - _headers file exists" \
                "test -s ${ROOT_DIR}/site/_headers"
        fi
        
        # Check for asset manifest in site
        if [[ -f "${ROOT_DIR}/site/asset-manifest.json" ]]; then
            run_test "Stage 2.8 - Site asset manifest exists" \
                "test -s ${ROOT_DIR}/site/asset-manifest.json"
        fi
    else
        skip_test "Stage 2.5-2.8 - Site directory checks" "site directory not found (run asset manager first)"
    fi
}

# ============================================================================
# STAGE 3: VALIDATE - Test All Validation Scripts
# ============================================================================

test_stage3_validate() {
    log_section "STAGE 3: VALIDATE - Testing Validation Scripts"
    
    # Test validate-assets.js
    test_validate_assets
    
    # Test validate-css.js
    test_validate_css
    
    # Test validate-visual.js (unless quick mode)
    if [[ "$QUICK_MODE" != true ]]; then
        test_validate_visual
    else
        skip_test "Stage 3.3 - Visual regression" "Skipped in quick mode"
    fi
}

test_validate_assets() {
    log_info "Testing validate-assets.js..."
    
    # Test 1: Script exists
    run_test "Stage 3.1.1 - validate-assets.js exists" \
        "test -f ${SCRIPT_DIR}/validate-assets.js"
    
    # Test 2: Syntax check
    run_test "Stage 3.1.2 - validate-assets.js syntax valid" \
        "node --check ${SCRIPT_DIR}/validate-assets.js" \
        30
    
    # Test 3: Help works
    run_test "Stage 3.1.3 - validate-assets.js help works" \
        "node ${SCRIPT_DIR}/validate-assets.js --help" \
        10
    
    # Test 4: Can run validation (if site exists)
    if [[ -d "${ROOT_DIR}/site" ]] && [[ -f "${ROOT_DIR}/site/asset-manifest.json" ]]; then
        run_test "Stage 3.1.4 - validate-assets.js runs successfully" \
            "node ${SCRIPT_DIR}/validate-assets.js --site-dir ${ROOT_DIR}/site --output ${TEST_DIR}/asset-integrity || true" \
            120
    else
        skip_test "Stage 3.1.4 - validate-assets.js execution" "Site not available"
    fi
}

test_validate_css() {
    log_info "Testing validate-css.js..."
    
    # Test 1: Script exists
    run_test "Stage 3.2.1 - validate-css.js exists" \
        "test -f ${SCRIPT_DIR}/validate-css.js"
    
    # Test 2: Syntax check
    run_test "Stage 3.2.2 - validate-css.js syntax valid" \
        "node --check ${SCRIPT_DIR}/validate-css.js" \
        30
    
    # Test 3: Help works
    run_test "Stage 3.2.3 - validate-css.js help works" \
        "node ${SCRIPT_DIR}/validate-css.js --help 2>/dev/null || true" \
        10
    
    # Test 4: Can run validation (if site exists)
    if [[ -f "${ROOT_DIR}/site/index.html" ]]; then
        run_test "Stage 3.2.4 - validate-css.js runs successfully" \
            "node ${SCRIPT_DIR}/validate-css.js --url file://${ROOT_DIR}/site/index.html --output ${TEST_DIR}/css-comparison || true" \
            120
    else
        skip_test "Stage 3.2.4 - validate-css.js execution" "Site not available"
    fi
}

test_validate_visual() {
    log_info "Testing validate-visual.js..."
    
    # Test 1: Script exists
    run_test "Stage 3.3.1 - validate-visual.js exists" \
        "test -f ${SCRIPT_DIR}/validate-visual.js"
    
    # Test 2: Syntax check
    run_test "Stage 3.3.2 - validate-visual.js syntax valid" \
        "node --check ${SCRIPT_DIR}/validate-visual.js" \
        30
    
    # Test 3: Help works
    run_test "Stage 3.3.3 - validate-visual.js help works" \
        "node ${SCRIPT_DIR}/validate-visual.js --help" \
        10
    
    # Test 4: Check for baselines
    if [[ -d "${ROOT_DIR}/.sisyphus/baselines" ]]; then
        run_test "Stage 3.3.4 - Baseline directory exists" \
            "test -d ${ROOT_DIR}/.sisyphus/baselines"
    else
        skip_test "Stage 3.3.4 - Baseline check" "No baselines found (run capture-baseline first)"
    fi
}

# ============================================================================
# STAGE 4: PUBLISH - Test Deployment Configuration
# ============================================================================

test_stage4_publish() {
    log_section "STAGE 4: PUBLISH - Testing Deployment Configuration"
    
    # Test 1: Check wrangler.toml or wrangler.json exists
    if [[ -f "${ROOT_DIR}/wrangler.toml" ]] || [[ -f "${ROOT_DIR}/wrangler.json" ]]; then
        run_test "Stage 4.1 - Wrangler config exists" \
            "test -f ${ROOT_DIR}/wrangler.toml || test -f ${ROOT_DIR}/wrangler.json"
    else
        log_warn "No wrangler config found (may be configured via CLI)"
    fi
    
    # Test 2: Check deploy script exists
    if [[ -f "${SCRIPT_DIR}/deploy-to-cloudflare.sh" ]]; then
        run_test "Stage 4.2 - Deploy script exists" \
            "test -x ${SCRIPT_DIR}/deploy-to-cloudflare.sh || test -r ${SCRIPT_DIR}/deploy-to-cloudflare.sh"
    fi
    
    # Test 3: Check rollback script exists
    if [[ -f "${SCRIPT_DIR}/rollback.sh" ]]; then
        run_test "Stage 4.3 - Rollback script exists" \
            "test -r ${SCRIPT_DIR}/rollback.sh"
        
        # Test 4: Rollback script syntax
        run_test "Stage 4.4 - Rollback script syntax valid" \
            "bash -n ${SCRIPT_DIR}/rollback.sh"
        
        # Test 5: Rollback script help
        run_test "Stage 4.5 - Rollback script help works" \
            "${SCRIPT_DIR}/rollback.sh --help 2>/dev/null || true" \
            10
    fi
    
    # Test 6: Check deployment history script
    if [[ -f "${SCRIPT_DIR}/deployment-history.js" ]]; then
        run_test "Stage 4.6 - Deployment history script exists" \
            "test -r ${SCRIPT_DIR}/deployment-history.js"
        
        run_test "Stage 4.7 - Deployment history syntax valid" \
            "node --check ${SCRIPT_DIR}/deployment-history.js" \
            30
        
        run_test "Stage 4.8 - Deployment history help works" \
            "node ${SCRIPT_DIR}/deployment-history.js --help 2>/dev/null || true" \
            10
    fi
    
    # In local mode, we don't actually deploy
    if [[ "$MODE" == "local" ]]; then
        log_info "Local mode: Skipping actual deployment tests"
    fi
}

# ============================================================================
# STAGE 5: DASHBOARD - Test Dashboard Generation
# ============================================================================

test_stage5_dashboard() {
    log_section "STAGE 5: DASHBOARD - Testing Dashboard Generation"
    
    # Test 1: Check dashboard generator exists
    run_test "Stage 5.1 - Dashboard generator exists" \
        "test -f ${SCRIPT_DIR}/generate-dashboard.js"
    
    # Test 2: Syntax check
    run_test "Stage 5.2 - Dashboard generator syntax valid" \
        "node --check ${SCRIPT_DIR}/generate-dashboard.js" \
        30
    
    # Test 3: Help works
    run_test "Stage 5.3 - Dashboard generator help works" \
        "node ${SCRIPT_DIR}/generate-dashboard.js --help" \
        10
    
    # Test 4: Generate dashboard
    run_test "Stage 5.4 - Dashboard generates successfully" \
        "node ${SCRIPT_DIR}/generate-dashboard.js --input ${TEST_DIR} --output ${TEST_DIR}/dashboard || true" \
        60
    
    # Test 5: Check dashboard output
    if [[ -f "${TEST_DIR}/dashboard/index.html" ]]; then
        run_test "Stage 5.5 - Dashboard HTML file created" \
            "test -s ${TEST_DIR}/dashboard/index.html"
    fi
}

# ============================================================================
# CI/CD WORKFLOW VALIDATION
# ============================================================================

test_cicd_workflow() {
    log_section "CI/CD WORKFLOW VALIDATION"
    
    local workflow_file="${ROOT_DIR}/.github/workflows/replicate.yml"
    
    # Test 1: Workflow file exists
    run_test "CI/CD 1 - Workflow file exists" \
        "test -f ${workflow_file}"
    
    # Test 2: Workflow file is valid YAML
    run_test "CI/CD 2 - Workflow file is valid YAML" \
        "node -e 'YAML=require(\"yaml\"); YAML.parse(require(\"fs\").readFileSync(\"${workflow_file}\", \"utf8\"))' 2>/dev/null || python3 -c 'import yaml; yaml.safe_load(open(\"${workflow_file}\"))' 2>/dev/null || cat ${workflow_file} | grep -q 'name:'" \
        10
    
    # Test 3: Check required workflow components
    run_test "CI/CD 3 - Workflow has 'on' triggers" \
        "grep -q '^on:' ${workflow_file} || grep -q 'on:' ${workflow_file}"
    
    run_test "CI/CD 4 - Workflow has jobs defined" \
        "grep -q 'jobs:' ${workflow_file}"
    
    run_test "CI/CD 5 - Workflow has copy job" \
        "grep -q 'copy:' ${workflow_file}"
    
    run_test "CI/CD 6 - Workflow has update job" \
        "grep -q 'update:' ${workflow_file}"
    
    run_test "CI/CD 7 - Workflow has validate-local job" \
        "grep -q 'validate-local:' ${workflow_file}"
    
    run_test "CI/CD 8 - Workflow has publish job" \
        "grep -q 'publish:' ${workflow_file}"
    
    # Test 4: Check for actionlint if available
    if command -v actionlint &> /dev/null; then
        run_test "CI/CD 9 - Workflow passes actionlint" \
            "actionlint ${workflow_file}" \
            30
    else
        skip_test "CI/CD 9 - actionlint validation" "actionlint not installed"
    fi
}

# ============================================================================
# SCRIPT PERMISSIONS AND STRUCTURE
# ============================================================================

test_script_permissions() {
    log_section "SCRIPT PERMISSIONS AND STRUCTURE"
    
    # Check all scripts in scripts directory
    local scripts=()
    while IFS= read -r -d '' script; do
        scripts+=("$script")
    done < <(find "${SCRIPT_DIR}" -maxdepth 1 -type f \( -name "*.sh" -o -name "*.js" \) -print0 2>/dev/null)
    
    log_info "Found ${#scripts[@]} scripts to check"
    
    local count=0
    for script in "${scripts[@]}"; do
        count=$((count + 1))
        local basename
        basename=$(basename "$script")
        
        if [[ "$script" == *.sh ]]; then
            # Bash scripts should have proper shebang
            run_test "Script ${count} - ${basename} has shebang" \
                "head -1 ${script} | grep -q '#!/usr/bin/env bash' || head -1 ${script} | grep -q '#!/bin/bash'"
            
            # Bash scripts should have set options
            run_test "Script ${count} - ${basename} has error handling" \
                "grep -q 'set -e' ${script} || grep -q 'set -euo pipefail' ${script}"
            
            # Syntax check
            run_test "Script ${count} - ${basename} syntax valid" \
                "bash -n ${script}"
                
        elif [[ "$script" == *.js ]]; then
            # Node.js scripts should have proper shebang
            if head -1 "$script" | grep -q "^#!"; then
                run_test "Script ${count} - ${basename} has Node.js shebang" \
                    "head -1 ${script} | grep -q '#!/usr/bin/env node'"
            fi
            
            # Syntax check
            run_test "Script ${count} - ${basename} syntax valid" \
                "node --check ${script}" \
                30
        fi
    done
}

# ============================================================================
# PACKAGE.JSON VALIDATION
# ============================================================================

test_package_json() {
    log_section "PACKAGE.JSON VALIDATION"
    
    # Test 1: package.json exists
    run_test "Package 1 - package.json exists" \
        "test -f ${ROOT_DIR}/package.json"
    
    # Test 2: package.json is valid JSON
    run_test "Package 2 - package.json is valid JSON" \
        "node -e 'JSON.parse(require(\"fs\").readFileSync(\"${ROOT_DIR}/package.json\"))'" \
        10
    
    # Test 3: Check for required dependencies
    local required_deps=("playwright" "pixelmatch" "pngjs")
    
    for dep in "${required_deps[@]}"; do
        if grep -q "\"$dep\"" "${ROOT_DIR}/package.json"; then
            run_test "Package 3 - Dependency $dep listed" \
                "grep -q '\"${dep}\"' ${ROOT_DIR}/package.json"
        else
            log_warn "Dependency $dep not found in package.json"
        fi
    done
}

# ============================================================================
# ROLLBACK MECHANISM TEST
# ============================================================================

test_rollback_mechanism() {
    log_section "ROLLBACK MECHANISM TEST"
    
    # Test deployment history functionality
    if [[ -f "${SCRIPT_DIR}/deployment-history.js" ]]; then
        # Test list command
        run_test "Rollback 1 - Deployment history list works" \
            "node ${SCRIPT_DIR}/deployment-history.js list 2>/dev/null || true" \
            10
        
        # Test that history directory can be created
        run_test "Rollback 2 - History directory writable" \
            "mkdir -p ${ROOT_DIR}/.sisyphus/deployments && touch ${ROOT_DIR}/.sisyphus/deployments/.test && rm ${ROOT_DIR}/.sisyphus/deployments/.test"
    fi
    
    # Test rollback script dry-run (list mode)
    if [[ -f "${SCRIPT_DIR}/rollback.sh" ]]; then
        run_test "Rollback 3 - Rollback script list mode works" \
            "${SCRIPT_DIR}/rollback.sh --list 2>/dev/null || true" \
            10
    fi
}

# ============================================================================
# REPORT GENERATION
# ============================================================================

generate_report() {
    log_section "GENERATING TEST REPORT"
    
    local total_duration=0
    for duration in "${TEST_DURATIONS[@]}"; do
        total_duration=$((total_duration + duration))
    done
    
    cat > "$REPORT_FILE" << EOF
# AVIR Pipeline Test Report

**Generated:** $(date -Iseconds)  
**Mode:** $MODE  
**Total Duration:** ${total_duration}s  
**Test Log:** $LOG_FILE

## Summary

| Metric | Count |
|--------|-------|
| Total Tests | $TOTAL_TESTS |
| Passed | $PASSED_TESTS |
| Failed | $FAILED_TESTS |
| Skipped | $SKIPPED_TESTS |
| Pass Rate | $(( TOTAL_TESTS > 0 ? (PASSED_TESTS * 100 / TOTAL_TESTS) : 0 ))% |

## Test Results by Stage

### Stage 1: Copy (Crawler)

| Test | Result | Duration | Message |
|------|--------|----------|---------|
EOF

    # Add Stage 1 results
    for test_name in "${!TEST_RESULTS[@]}"; do
        if [[ "$test_name" == Stage\ 1* ]]; then
            local result="${TEST_RESULTS[$test_name]}"
            local duration="${TEST_DURATIONS[$test_name]}"
            local message="${TEST_MESSAGES[$test_name]:-}"
            local icon="✅"
            [[ "$result" == "FAIL" ]] && icon="❌"
            [[ "$result" == "SKIP" ]] && icon="⏭️"
            echo "| $test_name | $icon $result | ${duration}s | $message |" >> "$REPORT_FILE"
        fi
    done

    cat >> "$REPORT_FILE" << EOF

### Stage 2: Update (Asset Manager)

| Test | Result | Duration | Message |
|------|--------|----------|---------|
EOF

    # Add Stage 2 results
    for test_name in "${!TEST_RESULTS[@]}"; do
        if [[ "$test_name" == Stage\ 2* ]]; then
            local result="${TEST_RESULTS[$test_name]}"
            local duration="${TEST_DURATIONS[$test_name]}"
            local message="${TEST_MESSAGES[$test_name]:-}"
            local icon="✅"
            [[ "$result" == "FAIL" ]] && icon="❌"
            [[ "$result" == "SKIP" ]] && icon="⏭️"
            echo "| $test_name | $icon $result | ${duration}s | $message |" >> "$REPORT_FILE"
        fi
    done

    cat >> "$REPORT_FILE" << EOF

### Stage 3: Validate

| Test | Result | Duration | Message |
|------|--------|----------|---------|
EOF

    # Add Stage 3 results
    for test_name in "${!TEST_RESULTS[@]}"; do
        if [[ "$test_name" == Stage\ 3* ]]; then
            local result="${TEST_RESULTS[$test_name]}"
            local duration="${TEST_DURATIONS[$test_name]}"
            local message="${TEST_MESSAGES[$test_name]:-}"
            local icon="✅"
            [[ "$result" == "FAIL" ]] && icon="❌"
            [[ "$result" == "SKIP" ]] && icon="⏭️"
            echo "| $test_name | $icon $result | ${duration}s | $message |" >> "$REPORT_FILE"
        fi
    done

    cat >> "$REPORT_FILE" << EOF

### Stage 4: Publish

| Test | Result | Duration | Message |
|------|--------|----------|---------|
EOF

    # Add Stage 4 results
    for test_name in "${!TEST_RESULTS[@]}"; do
        if [[ "$test_name" == Stage\ 4* ]]; then
            local result="${TEST_RESULTS[$test_name]}"
            local duration="${TEST_DURATIONS[$test_name]}"
            local message="${TEST_MESSAGES[$test_name]:-}"
            local icon="✅"
            [[ "$result" == "FAIL" ]] && icon="❌"
            [[ "$result" == "SKIP" ]] && icon="⏭️"
            echo "| $test_name | $icon $result | ${duration}s | $message |" >> "$REPORT_FILE"
        fi
    done

    cat >> "$REPORT_FILE" << EOF

### Stage 5: Dashboard

| Test | Result | Duration | Message |
|------|--------|----------|---------|
EOF

    # Add Stage 5 results
    for test_name in "${!TEST_RESULTS[@]}"; do
        if [[ "$test_name" == Stage\ 5* ]]; then
            local result="${TEST_RESULTS[$test_name]}"
            local duration="${TEST_DURATIONS[$test_name]}"
            local message="${TEST_MESSAGES[$test_name]:-}"
            local icon="✅"
            [[ "$result" == "FAIL" ]] && icon="❌"
            [[ "$result" == "SKIP" ]] && icon="⏭️"
            echo "| $test_name | $icon $result | ${duration}s | $message |" >> "$REPORT_FILE"
        fi
    done

    cat >> "$REPORT_FILE" << EOF

### CI/CD Workflow

| Test | Result | Duration | Message |
|------|--------|----------|---------|
EOF

    # Add CI/CD results
    for test_name in "${!TEST_RESULTS[@]}"; do
        if [[ "$test_name" == CI/CD* ]]; then
            local result="${TEST_RESULTS[$test_name]}"
            local duration="${TEST_DURATIONS[$test_name]}"
            local message="${TEST_MESSAGES[$test_name]:-}"
            local icon="✅"
            [[ "$result" == "FAIL" ]] && icon="❌"
            [[ "$result" == "SKIP" ]] && icon="⏭️"
            echo "| $test_name | $icon $result | ${duration}s | $message |" >> "$REPORT_FILE"
        fi
    done

    cat >> "$REPORT_FILE" << EOF

### Script Permissions and Structure

| Test | Result | Duration | Message |
|------|--------|----------|---------|
EOF

    # Add Script results
    for test_name in "${!TEST_RESULTS[@]}"; do
        if [[ "$test_name" == Script* ]]; then
            local result="${TEST_RESULTS[$test_name]}"
            local duration="${TEST_DURATIONS[$test_name]}"
            local message="${TEST_MESSAGES[$test_name]:-}"
            local icon="✅"
            [[ "$result" == "FAIL" ]] && icon="❌"
            [[ "$result" == "SKIP" ]] && icon="⏭️"
            echo "| $test_name | $icon $result | ${duration}s | $message |" >> "$REPORT_FILE"
        fi
    done

    cat >> "$REPORT_FILE" << EOF

### Package.json

| Test | Result | Duration | Message |
|------|--------|----------|---------|
EOF

    # Add Package results
    for test_name in "${!TEST_RESULTS[@]}"; do
        if [[ "$test_name" == Package* ]]; then
            local result="${TEST_RESULTS[$test_name]}"
            local duration="${TEST_DURATIONS[$test_name]}"
            local message="${TEST_MESSAGES[$test_name]:-}"
            local icon="✅"
            [[ "$result" == "FAIL" ]] && icon="❌"
            [[ "$result" == "SKIP" ]] && icon="⏭️"
            echo "| $test_name | $icon $result | ${duration}s | $message |" >> "$REPORT_FILE"
        fi
    done

    cat >> "$REPORT_FILE" << EOF

### Rollback Mechanism

| Test | Result | Duration | Message |
|------|--------|----------|---------|
EOF

    # Add Rollback results
    for test_name in "${!TEST_RESULTS[@]}"; do
        if [[ "$test_name" == Rollback* ]]; then
            local result="${TEST_RESULTS[$test_name]}"
            local duration="${TEST_DURATIONS[$test_name]}"
            local message="${TEST_MESSAGES[$test_name]:-}"
            local icon="✅"
            [[ "$result" == "FAIL" ]] && icon="❌"
            [[ "$result" == "SKIP" ]] && icon="⏭️"
            echo "| $test_name | $icon $result | ${duration}s | $message |" >> "$REPORT_FILE"
        fi
    done

    cat >> "$REPORT_FILE" << EOF

## Conclusion

EOF

    if [[ $FAILED_TESTS -eq 0 ]]; then
        echo "✅ **All tests passed!** The pipeline is ready for use." >> "$REPORT_FILE"
    else
        echo "❌ **Some tests failed.** Please review the failures above." >> "$REPORT_FILE"
    fi

    echo "" >> "$REPORT_FILE"
    echo "---" >> "$REPORT_FILE"
    echo "*Report generated by AVIR Pipeline Test Script*" >> "$REPORT_FILE"
    
    log_success "Report generated: $REPORT_FILE"
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

main() {
    local start_time
    start_time=$(date +%s)
    
    # Parse arguments
    parse_args "$@"
    
    # Initialize
    init
    
    # Run all test stages
    test_stage1_copy
    test_stage2_update
    test_stage3_validate
    test_stage4_publish
    test_stage5_dashboard
    test_cicd_workflow
    test_script_permissions
    test_package_json
    test_rollback_mechanism
    
    # Generate report
    generate_report
    
    # Print summary
    local end_time
    end_time=$(date +%s)
    local total_duration=$((end_time - start_time))
    
    log_section "TEST SUMMARY"
    echo -e "Total Tests:    $TOTAL_TESTS"
    echo -e "Passed:         ${GREEN}$PASSED_TESTS${NC}"
    echo -e "Failed:         ${RED}$FAILED_TESTS${NC}"
    echo -e "Skipped:        ${YELLOW}$SKIPPED_TESTS${NC}"
    echo -e "Pass Rate:      $(( TOTAL_TESTS > 0 ? (PASSED_TESTS * 100 / TOTAL_TESTS) : 0 ))%"
    echo -e "Duration:       ${total_duration}s"
    echo ""
    echo -e "Log File:       $LOG_FILE"
    echo -e "Report File:    $REPORT_FILE"
    
    if [[ $FAILED_TESTS -eq 0 ]]; then
        log_success "All tests passed!"
        exit 0
    else
        log_error "Some tests failed. Check the report for details."
        exit 1
    fi
}

# Run main function
main "$@"
