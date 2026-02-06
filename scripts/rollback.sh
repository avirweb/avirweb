#!/usr/bin/env bash
# Rollback script with backup support for Cloudflare Pages deployments
#
# Features:
#   - Save backup before deployment (zip site/ directory)
#   - Store last 5 backups with timestamps
#   - Auto-rollback on deployment failure
#   - Manual rollback commands
#
# Usage:
#   ./scripts/rollback.sh --create-backup              # Create backup before deploy
#   ./scripts/rollback.sh --list                       # List available backups
#   ./scripts/rollback.sh --restore N                  # Restore backup by index
#   ./scripts/rollback.sh --auto-restore               # Auto-restore on failure
#   ./scripts/rollback.sh --cleanup                    # Clean old backups (keep 5)
#   ./scripts/rollback.sh --verify <backup_file>       # Verify backup integrity
#
# Environment variables:
#   CLOUDFLARE_API_TOKEN    - Cloudflare API token
#   CLOUDFLARE_ACCOUNT_ID   - Cloudflare account ID
#   PROJECT_NAME            - Cloudflare Pages project name (default: AVIRWEBTEST)
#   BACKUPS_TO_KEEP         - Number of backups to retain (default: 5)

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
BACKUP_DIR="${ROOT_DIR}/.sisyphus/backups"
SITE_DIR="${ROOT_DIR}/site"
BACKUP_LOG="${BACKUP_DIR}/backup.log"
BACKUP_INDEX="${BACKUP_DIR}/index.json"

# Default settings
PROJECT_NAME="${PROJECT_NAME:-AVIRWEBTEST}"
BACKUPS_TO_KEEP="${BACKUPS_TO_KEEP:-5}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging functions
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

# Show usage
usage() {
    cat << EOF
Rollback script with backup support for Cloudflare Pages deployments

USAGE:
  $(basename "$0") --create-backup [--tag <name>]
    Create a backup of the site/ directory before deployment.
    Optional tag for easy identification.

  $(basename "$0") --list
    List all available backups with their indices.

  $(basename "$0") --restore <index>
    Restore a specific backup by its index number.

  $(basename "$0") --auto-restore
    Automatically restore the most recent backup (for deployment failure).

  $(basename "$0") --cleanup
    Remove old backups, keeping only the last ${BACKUPS_TO_KEEP}.

  $(basename "$0") --verify <backup_file>
    Verify the integrity of a backup file.

  $(basename "$0") --help
    Show this help message.

ENVIRONMENT VARIABLES:
  PROJECT_NAME         Cloudflare Pages project name (default: AVIRWEBTEST)
  BACKUPS_TO_KEEP      Number of backups to retain (default: 5)
  SITE_DIR             Path to site directory (default: ./site)
  BACKUP_DIR           Path to backup directory (default: ./.sisyphus/backups)

EXAMPLES:
  # Create backup before deployment
  $(basename "$0") --create-backup --tag "pre-release-v2"

  # List available backups
  $(basename "$0") --list

  # Restore backup at index 1
  $(basename "$0") --restore 1

  # Auto-restore on deployment failure
  $(basename "$0") --auto-restore
EOF
}

# Initialize backup directory
init_backup_dir() {
    if [[ ! -d "$BACKUP_DIR" ]]; then
        mkdir -p "$BACKUP_DIR"
        log_info "Created backup directory: $BACKUP_DIR"
    fi
    
    # Initialize index file if not exists
    if [[ ! -f "$BACKUP_INDEX" ]]; then
        echo '{"backups": [], "last_updated": ""}' > "$BACKUP_INDEX"
    fi
    
    # Initialize log file if not exists
    if [[ ! -f "$BACKUP_LOG" ]]; then
        touch "$BACKUP_LOG"
    fi
}

# Generate backup filename
generate_backup_name() {
    local timestamp
    local tag="${1:-}"
    timestamp=$(date +%Y%m%d-%H%M%S)
    
    if [[ -n "$tag" ]]; then
        echo "site-backup-${timestamp}-${tag}.tar.gz"
    else
        echo "site-backup-${timestamp}.tar.gz"
    fi
}

# Log backup action
log_backup_action() {
    local action="$1"
    local backup_file="$2"
    local timestamp
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[${timestamp}] ${action}: ${backup_file}" >> "$BACKUP_LOG"
}

# Update backup index
update_backup_index() {
    local backup_file="$1"
    local size="$2"
    local tag="${3:-}"
    local timestamp
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    # Read current index
    local index_json
    index_json=$(cat "$BACKUP_INDEX")
    
    # Create new backup entry
    local new_entry
    new_entry=$(cat << EOF
{
  "file": "$(basename "$backup_file")",
  "path": "$backup_file",
  "timestamp": "$timestamp",
  "size": "$size",
  "tag": "${tag:-}"
}
EOF
)
    
    # Update index using Node.js
    node -e "
        const index = ${index_json};
        const newEntry = ${new_entry};
        index.backups.unshift(newEntry);
        index.last_updated = '${timestamp}';
        require('fs').writeFileSync('${BACKUP_INDEX}', JSON.stringify(index, null, 2));
    " 2>/dev/null || {
        # Fallback: manually update JSON
        log_warn "Could not update backup index automatically"
    }
}

# Create backup
create_backup() {
    local tag="${1:-}"
    
    log_section "Creating Backup"
    
    # Check site directory exists
    if [[ ! -d "$SITE_DIR" ]]; then
        log_error "Site directory not found: $SITE_DIR"
        exit 1
    fi
    
    # Generate backup filename
    local backup_name
    backup_name=$(generate_backup_name "$tag")
    local backup_path="${BACKUP_DIR}/${backup_name}"
    
    log_info "Creating backup: ${backup_name}"
    log_info "Source: ${SITE_DIR}"
    
    # Create tar.gz archive
    local site_size
    site_size=$(du -sh "$SITE_DIR" | cut -f1)
    log_info "Source size: ${site_size}"
    
    # Create backup with progress
    if tar -czf "$backup_path" -C "$ROOT_DIR" site/ 2>/dev/null; then
        local backup_size
        backup_size=$(du -h "$backup_path" | cut -f1)
        
        log_success "Backup created successfully"
        log_info "Backup size: ${backup_size}"
        log_info "Location: ${backup_path}"
        
        # Log and index
        log_backup_action "CREATED" "$backup_path"
        update_backup_index "$backup_path" "$backup_size" "$tag"
        
        # Cleanup old backups
        cleanup_old_backups
        
        # Return backup path for scripts
        echo "$backup_path"
        return 0
    else
        log_error "Failed to create backup"
        exit 1
    fi
}

# Cleanup old backups (keep only last N)
cleanup_old_backups() {
    log_info "Cleaning up old backups (keeping last ${BACKUPS_TO_KEEP})..."
    
    # Get list of backup files sorted by modification time
    local backup_count
    backup_count=$(find "$BACKUP_DIR" -name "site-backup-*.tar.gz" -type f | wc -l)
    
    if [[ "$backup_count" -le "$BACKUPS_TO_KEEP" ]]; then
        log_info "Found ${backup_count} backups, no cleanup needed"
        return 0
    fi
    
    # Remove oldest backups
    local to_delete=$((backup_count - BACKUPS_TO_KEEP))
    log_info "Removing ${to_delete} old backup(s)..."
    
    find "$BACKUP_DIR" -name "site-backup-*.tar.gz" -type f -printf '%T@ %p\n' | \
        sort -n | \
        head -n "$to_delete" | \
        while read -r line; do
            local old_file
            old_file=$(echo "$line" | cut -d' ' -f2-)
            rm -f "$old_file"
            log_backup_action "DELETED" "$old_file"
            log_info "Removed: $(basename "$old_file")"
        done
    
    log_success "Cleanup complete"
}

# List backups
list_backups() {
    log_section "Available Backups"
    
    init_backup_dir
    
    # Check for backup files
    local backup_files
    backup_files=$(find "$BACKUP_DIR" -name "site-backup-*.tar.gz" -type f 2>/dev/null | sort -r)
    
    if [[ -z "$backup_files" ]]; then
        log_warn "No backups found in ${BACKUP_DIR}"
        return 1
    fi
    
    # Display header
    printf "%-5s %-30s %-15s %-12s %-20s\n" "Index" "Filename" "Size" "Tag" "Date"
    printf "%-5s %-30s %-15s %-12s %-20s\n" "-----" "------------------------------" "---------------" "------------" "--------------------"
    
    # Display backups with index
    local index=0
    while IFS= read -r backup_file; do
        if [[ -f "$backup_file" ]]; then
            local filename size date tag
            filename=$(basename "$backup_file")
            size=$(du -h "$backup_file" | cut -f1)
            date=$(stat -c '%y' "$backup_file" 2>/dev/null | cut -d'.' -f1 || stat -f '%Sm' -t '%Y-%m-%d %H:%M:%S' "$backup_file" 2>/dev/null)
            
            # Extract tag from filename if present
            if [[ "$filename" =~ site-backup-[0-9]{8}-[0-9]{6}-(.+)\.tar\.gz ]]; then
                tag="${BASH_REMATCH[1]}"
            else
                tag="-"
            fi
            
            printf "%-5s %-30s %-15s %-12s %-20s\n" "$index" "$filename" "$size" "$tag" "$date"
            ((index++))
        fi
    done <<< "$backup_files"
    
    echo ""
    log_info "Total backups: ${index}"
    log_info "Use './scripts/rollback.sh --restore <index>' to restore a backup"
}

# Get backup file by index
get_backup_by_index() {
    local target_index="$1"
    
    local backup_files
    backup_files=$(find "$BACKUP_DIR" -name "site-backup-*.tar.gz" -type f 2>/dev/null | sort -r)
    
    local current_index=0
    while IFS= read -r backup_file; do
        if [[ "$current_index" -eq "$target_index" ]]; then
            echo "$backup_file"
            return 0
        fi
        ((current_index++))
    done <<< "$backup_files"
    
    return 1
}

# Restore backup
restore_backup() {
    local backup_file="$1"
    
    log_section "Restoring Backup"
    
    if [[ ! -f "$backup_file" ]]; then
        log_error "Backup file not found: $backup_file"
        exit 1
    fi
    
    log_info "Backup: $(basename "$backup_file")"
    log_info "Target: ${SITE_DIR}"
    
    # Create safety backup of current site (if exists)
    if [[ -d "$SITE_DIR" ]]; then
        local safety_backup="${BACKUP_DIR}/pre-restore-safety-$(date +%Y%m%d-%H%M%S).tar.gz"
        log_info "Creating safety backup of current site..."
        tar -czf "$safety_backup" -C "$ROOT_DIR" site/ 2>/dev/null || true
        log_info "Safety backup: $(basename "$safety_backup")"
    fi
    
    # Remove current site directory
    log_info "Removing current site directory..."
    rm -rf "$SITE_DIR"
    
    # Extract backup
    log_info "Extracting backup..."
    if tar -xzf "$backup_file" -C "$ROOT_DIR"; then
        log_success "Backup restored successfully"
        log_backup_action "RESTORED" "$backup_file"
        
        # Verify extraction
        if [[ -d "$SITE_DIR" ]] && [[ -f "${SITE_DIR}/index.html" ]]; then
            log_success "Verification: site/ directory restored with index.html"
            local restored_size
            restored_size=$(du -sh "$SITE_DIR" | cut -f1)
            log_info "Restored size: ${restored_size}"
            return 0
        else
            log_warn "Restoration may be incomplete - check site/ directory"
            return 1
        fi
    else
        log_error "Failed to extract backup"
        exit 1
    fi
}

# Restore by index
restore_by_index() {
    local index="$1"
    
    log_info "Looking up backup at index ${index}..."
    
    local backup_file
    backup_file=$(get_backup_by_index "$index")
    
    if [[ -z "$backup_file" ]]; then
        log_error "No backup found at index ${index}"
        log_info "Run './scripts/rollback.sh --list' to see available backups"
        exit 1
    fi
    
    restore_backup "$backup_file"
}

# Auto-restore (most recent backup)
auto_restore() {
    log_section "Auto-Restoring Latest Backup"
    
    local latest_backup
    latest_backup=$(find "$BACKUP_DIR" -name "site-backup-*.tar.gz" -type f 2>/dev/null | sort -r | head -n1)
    
    if [[ -z "$latest_backup" ]]; then
        log_error "No backups available for auto-restore"
        exit 1
    fi
    
    log_info "Latest backup: $(basename "$latest_backup")"
    restore_backup "$latest_backup"
}

# Verify backup integrity
verify_backup() {
    local backup_file="$1"
    
    log_section "Verifying Backup"
    
    if [[ ! -f "$backup_file" ]]; then
        log_error "Backup file not found: $backup_file"
        exit 1
    fi
    
    log_info "File: $(basename "$backup_file")"
    
    # Check if valid tar.gz
    if tar -tzf "$backup_file" > /dev/null 2>&1; then
        log_success "Archive integrity: OK"
        
        # Check for site/ directory
        if tar -tzf "$backup_file" | grep -q "^site/"; then
            log_success "Contains site/ directory: Yes"
        else
            log_warn "Does not contain site/ directory"
        fi
        
        # Check for index.html
        if tar -tzf "$backup_file" | grep -q "site/index.html"; then
            log_success "Contains index.html: Yes"
        else
            log_warn "Does not contain index.html"
        fi
        
        # Show archive contents summary
        local file_count
        file_count=$(tar -tzf "$backup_file" | wc -l)
        log_info "Total files in archive: ${file_count}"
        
        return 0
    else
        log_error "Archive integrity: FAILED - file may be corrupted"
        return 1
    fi
}

# Check prerequisites
check_prerequisites() {
    # Check for tar
    if ! command -v tar &> /dev/null; then
        log_error "tar is required but not installed"
        exit 1
    fi
    
    # Check site directory
    if [[ ! -d "$SITE_DIR" ]]; then
        log_warn "Site directory not found: $SITE_DIR"
    fi
}

# Main function
main() {
    local mode=""
    local index=""
    local tag=""
    local backup_file=""
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --create-backup)
                mode="create-backup"
                shift
                ;;
            --tag)
                tag="${2:-}"
                shift 2
                ;;
            --list)
                mode="list"
                shift
                ;;
            --restore)
                mode="restore"
                index="${2:-}"
                if [[ -z "$index" ]]; then
                    log_error "--restore requires an index argument"
                    usage
                    exit 1
                fi
                shift 2
                ;;
            --auto-restore)
                mode="auto-restore"
                shift
                ;;
            --cleanup)
                mode="cleanup"
                shift
                ;;
            --verify)
                mode="verify"
                backup_file="${2:-}"
                if [[ -z "$backup_file" ]]; then
                    log_error "--verify requires a backup file path"
                    usage
                    exit 1
                fi
                shift 2
                ;;
            --help|-h)
                usage
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                usage
                exit 1
                ;;
        esac
    done
    
    # Validate mode
    if [[ -z "$mode" ]]; then
        log_error "No mode specified"
        usage
        exit 1
    fi
    
    # Initialize
    init_backup_dir
    check_prerequisites
    
    # Execute based on mode
    case "$mode" in
        create-backup)
            create_backup "$tag"
            ;;
        list)
            list_backups
            ;;
        restore)
            restore_by_index "$index"
            ;;
        auto-restore)
            auto_restore
            ;;
        cleanup)
            cleanup_old_backups
            ;;
        verify)
            verify_backup "$backup_file"
            ;;
    esac
}

# Run main
main "$@"
