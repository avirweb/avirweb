#!/bin/bash
# Visual comparison wrapper for verify-all.js
node "$(dirname "$0")/../verify-all.js" --visual "$@"
