#!/bin/bash
#
# Credential Retrieval Library for AVIR Mirror System
# Usage: source scripts/lib/credentials.sh
#

# Base directory for secrets
SECRETS_DIR="/home/agent/avir/.secrets"

# Generic function to get a credential from a file
# Usage: get_credential <filename>
# Returns: credential value on stdout, exit code 0 on success, 1 on failure
get_credential() {
    local filename="$1"
    local filepath="${SECRETS_DIR}/${filename}"
    
    if [[ -z "$filename" ]]; then
        echo "Error: No credential filename specified" >&2
        return 1
    fi
    
    if [[ ! -f "$filepath" ]]; then
        echo "Error: Credential file not found: ${filepath}" >&2
        return 1
    fi
    
    if [[ ! -r "$filepath" ]]; then
        echo "Error: Credential file not readable: ${filepath}" >&2
        return 1
    fi
    
    # Read and trim whitespace/newlines
    local value
    value=$(cat "$filepath" 2>/dev/null | tr -d '\n\r')
    
    if [[ -z "$value" ]]; then
        echo "Error: Credential file is empty: ${filepath}" >&2
        return 1
    fi
    
    echo "$value"
    return 0
}

# Get Cloudflare API token
get_cloudflare_token() {
    get_credential "cloudflare-token"
}

# Get Cloudflare API key (legacy)
get_cloudflare_api_key() {
    get_credential "cloudflare-api-key"
}

# Get Cloudflare account email (legacy auth)
get_cloudflare_email() {
    get_credential "cloudflare-email"
}

# Get Cloudflare account ID
get_cloudflare_account_id() {
    get_credential "cloudflare-account-id"
}

# Get GitHub SSH private key
get_github_ssh_key() {
    get_credential "github-ssh-key"
}

# Get GitHub username
get_github_username() {
    get_credential "github-username"
}

# Get GitHub email
get_github_email() {
    get_credential "github-email"
}

# Get Turnstile site key
get_turnstile_site_key() {
    get_credential "turnstile-site-key"
}

# Get Microsoft Graph API client ID
get_graph_client_id() {
    get_credential "graph-api/client-id"
}

# Get Microsoft Graph API client secret
get_graph_client_secret() {
    get_credential "graph-api/client-secret"
}

# Get Microsoft Graph API tenant ID
get_graph_tenant_id() {
    get_credential "graph-api/tenant-id"
}

# Validate that all required credentials exist
# Returns: 0 if all exist, 1 if any are missing
validate_all_credentials() {
    local missing=()
    
    # Check each credential
    if ! get_cloudflare_token > /dev/null 2>&1; then
        if ! get_cloudflare_api_key > /dev/null 2>&1 || ! get_cloudflare_email > /dev/null 2>&1; then
            missing+=("cloudflare-token or cloudflare-api-key+cloudflare-email")
        fi
    fi
    get_cloudflare_account_id > /dev/null 2>&1 || missing+=("cloudflare-account-id")
    get_github_ssh_key > /dev/null 2>&1 || missing+=("github-ssh-key")
    get_github_username > /dev/null 2>&1 || missing+=("github-username")
    get_github_email > /dev/null 2>&1 || missing+=("github-email")
    get_turnstile_site_key > /dev/null 2>&1 || missing+=("turnstile-site-key")
    
    if [[ ${#missing[@]} -gt 0 ]]; then
        echo "Error: Missing credentials: ${missing[*]}" >&2
        return 1
    fi
    
    return 0
}

# Export functions for use in other scripts
export -f get_credential
export -f get_cloudflare_token
export -f get_cloudflare_api_key
export -f get_cloudflare_email
export -f get_cloudflare_account_id
export -f get_github_ssh_key
export -f get_github_username
export -f get_github_email
export -f get_turnstile_site_key
export -f get_graph_client_id
export -f get_graph_client_secret
export -f get_graph_tenant_id
export -f validate_all_credentials
