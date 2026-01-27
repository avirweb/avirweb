# Batch Repair Script

## Overview
`batch-repair.sh` automates the repair of all 144 HTML files in the site directory by:
1. Downloading fresh HTML from production
2. Applying localization fixes (CDN → root-relative paths)
3. Removing SRI and crossorigin attributes
4. Fixing title tags and meta tags

## Usage

```bash
./scripts/batch-repair.sh
```

## What It Does

For each path in `paths.txt`:
1. **Download**: Fetches HTML from `https://www.avir.com/{path}`
2. **Repair**: Applies transformations via `repair-html.py`
3. **Validate**: Checks for remaining CDN URLs, SRI attributes
4. **Save**: Writes repaired HTML to `site/{path}.html`

## Path Mapping

```
/city/palm-desert.html → https://www.avir.com/city/palm-desert
/post/coastal-source... → https://www.avir.com/post/coastal-source...
/about-avir.html → https://www.avir.com/about-avir
```

## Safety Features

- **Timeout**: 30 second timeout per download
- **Validation**: Checks file size before/after repair
- **Error handling**: Continues on failure, logs errors
- **Temp files**: Uses isolated temp directory
- **Cleanup**: Automatic cleanup on exit

## Logging

All operations logged to `batch-repair.log`:
- Timestamp for each operation
- Download size
- Repair status
- Warning counts (CDN URLs, SRI attributes)
- Final summary

## Output

```
[2026-01-27 09:35:00] Starting batch repair of 144 files
[2026-01-27 09:35:01] [1/144] Processing: /about-avir.html
[2026-01-27 09:35:01]   URL: https://www.avir.com/about-avir
[2026-01-27 09:35:02]   Downloaded: 45231 bytes
[2026-01-27 09:35:02]   Repaired: 45180 bytes
[2026-01-27 09:35:02]   SUCCESS: File repaired and saved
...
[2026-01-27 09:45:00] === BATCH REPAIR SUMMARY ===
[2026-01-27 09:45:00] Total files: 144
[2026-01-27 09:45:00] Success: 142
[2026-01-27 09:45:00] Failed: 2
[2026-01-27 09:45:00] Skipped: 0
```

## Exit Codes

- `0`: All files repaired successfully
- `1`: One or more files failed to repair

## Dependencies

- `paths.txt`: List of paths to repair
- `scripts/repair-html.py`: Python repair script
- `curl`: For downloading from production
- `python3`: For running repair script

## Testing Before Full Run

Test on a single file first:

```bash
# Test path mapping
path="/city/palm-desert.html"
path="${path#/}"
path="${path%.html}"
echo "https://www.avir.com/$path"

# Test download
curl -s -L "https://www.avir.com/city/palm-desert" -o /tmp/test.html

# Test repair
python3 scripts/repair-html.py /tmp/test.html /tmp/test-repaired.html

# Verify
grep -c "cdn.prod.website-files.com" /tmp/test-repaired.html || echo "0 (good)"
```

## Estimated Runtime

- ~2-3 seconds per file (download + repair)
- Total: ~7-10 minutes for 144 files
