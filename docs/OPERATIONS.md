# AVIR Mirror System - Operations Guide

## Initial Setup

1. **Set up credentials:**
   ```bash
   bash scripts/setup-credentials.sh
   ```

## Daily Operations

Run full cycle:
```bash
node scripts/mirror-manager.js
```

## Troubleshooting

Check logs:
```bash
cat mirror-raw/crawl-log.json
```
