#!/bin/bash
# Deploy mirror-raw/ to Cloudflare Pages (AVIRWEBTEST)
# With integrated backup and auto-rollback support

set -e

SECRETS_DIR="/home/agent/avir/.secrets"
SOURCE_DIR="/home/agent/avir/site"
PROJECT_NAME="${CLOUDFLARE_PAGES_PROJECT:-AVIRWEBTEST}"
CACHE_FILE="/home/agent/avir/node_modules/.cache/wrangler/pages.json"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

log_info() { echo -e "${BLUE}ℹ${NC} $1"; }
log_success() { echo -e "${GREEN}✓${NC} $1"; }
log_warn() { echo -e "${YELLOW}⚠${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1"; }
log_section() {
    echo ""
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}========================================${NC}"
}

if [[ -f "$CACHE_FILE" ]] && command -v node &> /dev/null; then
    CACHE_PROJECT=$(node -e "try{const p=require('$CACHE_FILE'); if(p && p.project_name){process.stdout.write(p.project_name)}}catch(e){}")
    if [[ -n "$CACHE_PROJECT" ]]; then
        PROJECT_NAME="$CACHE_PROJECT"
    fi
fi

# Singleton check
LOCKFILE="/tmp/cloudflare-deploy.lock"
if [[ -f "$LOCKFILE" ]]; then
    echo "Error: Another deployment is already in progress"
    echo "Lockfile: $LOCKFILE"
    exit 1
fi
echo "$(date)" > "$LOCKFILE"
trap "rm -f $LOCKFILE" EXIT

source scripts/lib/credentials.sh

log_section "Cloudflare Pages Deployment"
echo "Project: $PROJECT_NAME"
echo "Source: $SOURCE_DIR"
echo "Target: https://$PROJECT_NAME.pages.dev"
echo ""

# ========================================
# STAGE 1: Pre-Deploy Validation
# ========================================
log_section "Stage 1: Pre-Deploy Validation"

if [[ ! -d "$SOURCE_DIR" ]]; then
    log_error "site/ directory not found"
    exit 1
fi

if [[ ! -f "$SOURCE_DIR/index.html" ]]; then
    log_error "site/index.html not found"
    exit 1
fi

PAGE_COUNT=$(find "$SOURCE_DIR" -name "*.html" | wc -l)
log_success "Found $PAGE_COUNT HTML pages"

# Validate index.html is valid
if grep -q '<!DOCTYPE html>' "$SOURCE_DIR/index.html"; then
    log_success "index.html has valid DOCTYPE"
else
    log_warn "index.html missing DOCTYPE"
fi

# ========================================
# STAGE 2: Create Backup
# ========================================
log_section "Stage 2: Creating Backup"

BACKUP_FILE=""
if [[ -x "${SCRIPT_DIR}/rollback.sh" ]]; then
    BACKUP_FILE=$("${SCRIPT_DIR}/rollback.sh" --create-backup --tag "pre-deploy-$(date +%Y%m%d-%H%M%S)" 2>&1 | grep -E '^/' || echo "")
    if [[ -n "$BACKUP_FILE" ]] && [[ -f "$BACKUP_FILE" ]]; then
        log_success "Backup created: $(basename "$BACKUP_FILE")"
    else
        log_warn "Backup creation may have failed - continuing anyway"
    fi
else
    log_warn "Rollback script not found - backup skipped"
fi

# ========================================
# STAGE 3: Deploy to Cloudflare Pages
# ========================================
log_section "Stage 3: Deploying to Cloudflare Pages"

ACCOUNT_ID=$(get_cloudflare_account_id) || exit 1

API_KEY=""
EMAIL=""
if API_KEY=$(get_cloudflare_api_key 2>/dev/null) && EMAIL=$(get_cloudflare_email 2>/dev/null); then
    export CLOUDFLARE_API_KEY="$API_KEY"
    export CLOUDFLARE_EMAIL="$EMAIL"
    unset CLOUDFLARE_API_TOKEN
else
    TOKEN=$(get_cloudflare_token) || exit 1
    export CLOUDFLARE_API_TOKEN="$TOKEN"
    unset CLOUDFLARE_API_KEY
    unset CLOUDFLARE_EMAIL
fi

# Export for wrangler
export CLOUDFLARE_ACCOUNT_ID="$ACCOUNT_ID"

DEPLOY_SUCCESS=false
DEPLOY_URL=""

# Using Cloudflare Pages API to deploy
if command -v wrangler &> /dev/null; then
    log_info "Deploying with Wrangler..."
    
    # Change to source directory for deployment
    cd "$SOURCE_DIR"
    
    # Attempt deployment with error capture
    set +e
    DEPLOY_OUTPUT=$(wrangler pages deploy "$SOURCE_DIR" --project-name="$PROJECT_NAME" --branch=main 2>&1)
    DEPLOY_EXIT_CODE=$?
    set -e
    
    if [[ $DEPLOY_EXIT_CODE -eq 0 ]]; then
        DEPLOY_SUCCESS=true
        # Extract deployment URL from output
        DEPLOY_URL=$(echo "$DEPLOY_OUTPUT" | grep -oE 'https://[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.pages\.dev' | head -1)
        if [[ -z "$DEPLOY_URL" ]]; then
            DEPLOY_URL="https://${PROJECT_NAME}.pages.dev"
        fi
        log_success "Deployment successful: $DEPLOY_URL"
    else
        log_error "Deployment failed with exit code $DEPLOY_EXIT_CODE"
        echo "$DEPLOY_OUTPUT"
        DEPLOY_SUCCESS=false
    fi
else
    log_error "wrangler not found. Install with: npm install -g wrangler"
    exit 1
fi

# ========================================
# STAGE 4: Post-Deploy Verification
# ========================================
log_section "Stage 4: Post-Deploy Verification"

if [[ "$DEPLOY_SUCCESS" == "true" ]]; then
    log_info "Verifying deployment at $DEPLOY_URL..."
    sleep 5
    
    VERIFY_SUCCESS=false
    MAX_RETRIES=3
    RETRY_COUNT=0
    
    while [[ $RETRY_COUNT -lt $MAX_RETRIES ]]; do
        if curl -s -f "$DEPLOY_URL" > /dev/null 2>&1; then
            VERIFY_SUCCESS=true
            break
        fi
        RETRY_COUNT=$((RETRY_COUNT + 1))
        log_info "Retry $RETRY_COUNT/$MAX_RETRIES: Waiting for deployment to be ready..."
        sleep 5
    done
    
    if [[ "$VERIFY_SUCCESS" == "true" ]]; then
        log_success "Deployment verified and accessible"
    else
        log_warn "Could not verify deployment accessibility"
        VERIFY_SUCCESS=false
    fi
fi

# ========================================
# STAGE 5: Auto-Rollback on Failure
# ========================================
if [[ "$DEPLOY_SUCCESS" != "true" ]] || [[ "$VERIFY_SUCCESS" != "true" ]]; then
    log_section "Stage 5: Auto-Rollback"
    
    if [[ -n "$BACKUP_FILE" ]] && [[ -f "$BACKUP_FILE" ]]; then
        log_error "Deployment or verification failed - initiating auto-rollback"
        log_info "Restoring from: $(basename "$BACKUP_FILE")"
        
        if "${SCRIPT_DIR}/rollback.sh" --restore 0 2>&1; then
            log_success "Auto-rollback completed successfully"
            log_info "Previous version restored to site/"
            
            # Optionally re-deploy the restored version
            read -p "Re-deploy the restored version? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                log_info "Re-deploying restored version..."
                cd "$SOURCE_DIR"
                if wrangler pages deploy "$SOURCE_DIR" --project-name="$PROJECT_NAME" --branch=main; then
                    log_success "Re-deployment successful"
                else
                    log_error "Re-deployment failed"
                fi
            fi
        else
            log_error "Auto-rollback failed - manual intervention required"
            log_info "Backup file available at: $BACKUP_FILE"
            log_info "Manual restore: ./scripts/rollback.sh --restore 0"
        fi
    else
        log_error "Deployment failed but no backup available for rollback"
        log_info "To create a backup before deployment, ensure rollback.sh exists and is executable"
    fi
    
    exit 1
fi

# ========================================
# Deployment Complete
# ========================================
log_section "Deployment Complete"
echo ""
echo "✅ Successfully deployed to Cloudflare Pages"
echo "   URL: $DEPLOY_URL"
echo "   Project: $PROJECT_NAME"
if [[ -n "$BACKUP_FILE" ]]; then
    echo "   Backup: $(basename "$BACKUP_FILE")"
fi
echo ""
log_info "To rollback if needed:"
echo "   ./scripts/rollback.sh --list"
echo "   ./scripts/rollback.sh --restore 0"
echo ""
