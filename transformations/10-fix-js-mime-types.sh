#!/bin/bash
# Fix JavaScript MIME types in _headers

HEADERS_FILE="site/_headers"

# Add Content-Type headers for JS files
if [[ -f "$HEADERS_FILE" ]]; then
    # Check if JS content-type already exists
    if ! grep -q "Content-Type: application/javascript" "$HEADERS_FILE"; then
        cat >> "$HEADERS_FILE" << 'EOF'

# JavaScript files - explicit MIME type
/images/js/*
  Content-Type: application/javascript
  Cache-Control: public, max-age=31536000, immutable

# Chunked JS files
/images/js/*.js
  Content-Type: application/javascript
  Cache-Control: public, max-age=31536000, immutable
EOF
        echo "✓ Added JS MIME type headers"
    else
        echo "✓ JS MIME type headers already present"
    fi
else
    echo "Error: _headers file not found"
    exit 1
fi
