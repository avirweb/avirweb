#!/bin/bash

set -e

SECRETS_DIR="/home/agent/avir/.secrets"

echo "========================================"
echo "  AVIR Mirror System - Credential Setup"
echo "========================================"
echo ""
echo "This script will securely collect credentials."
echo "All credentials are stored in $SECRETS_DIR"
echo "They will NEVER be committed to git"
echo ""

if [ ! -d "$SECRETS_DIR" ]; then
    echo "ERROR: Secrets directory not found. Run Task 1 first."
    exit 1
fi

prompt_credential() {
    local name="$1"
    local file="$2"
    local is_secret="${3:-false}"
    
    echo ""
    echo "Setting up: $name"
    
    if [ "$is_secret" = "true" ]; then
        read -rs -p "Enter $name: " value
        echo ""
    else
        read -r -p "Enter $name: " value
    fi
    
    if [ -n "$value" ]; then
        echo "$value" > "$file"
        chmod 600 "$file"
        echo "✓ $name saved"
    fi
}

echo ""
echo "========================================"
echo "  Cloudflare Credentials"
echo "========================================"

prompt_credential "Cloudflare API Token" "$SECRETS_DIR/cloudflare-token" "true"
prompt_credential "Cloudflare Account ID" "$SECRETS_DIR/cloudflare-account-id"

echo ""
echo "========================================"
echo "  GitHub Credentials"
echo "========================================"

prompt_credential "GitHub SSH Private Key (paste entire key)" "$SECRETS_DIR/github-ssh-key" "true"
prompt_credential "Git Username" "$SECRETS_DIR/github-username"
prompt_credential "Git Email" "$SECRETS_DIR/github-email"

echo ""
echo "========================================"
echo "  Turnstile Credentials"
echo "========================================"

prompt_credential "Turnstile Site Key" "$SECRETS_DIR/turnstile-site-key"

echo ""
echo "========================================"
echo "  Setup Complete!"
echo "========================================"
