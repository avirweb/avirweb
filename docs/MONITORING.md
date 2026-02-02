# AVIR Mirror System - Monitoring Guide

## Key Metrics

- Pages crawled: Check `mirror-raw/crawl-log.json`
- Assets downloaded: CDN count
- Errors: Review logs

## Health Checks

```bash
# Check page count
cat mirror-raw/crawl-log.json | jq '.pagesCrawled'
```
