# AVIR Mirror System - Troubleshooting Guide

## Common Issues

### Credential errors
Run setup again: `bash scripts/setup-credentials.sh`

### Images not loading
Check lazy-loading triggers in crawler

### Deployment lock file
Remove stale locks: `rm -f /tmp/cloudflare-deploy.lock`

