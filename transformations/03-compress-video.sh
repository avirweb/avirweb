#!/bin/bash
# Compress videos in mirrored site

if command -v ffmpeg &> /dev/null; then
    for video in site/**/*.mp4 site/**/*.webm; do
        if [[ -f "$video" ]]; then
            echo "Compressing: $video"
            ffmpeg -i "$video" -c:v libx264 -crf 28 -c:a aac -b:a 128k "${video}.compressed"
            mv "${video}.compressed" "$video"
        fi
    done
    echo "✓ Compressed videos"
else
    echo "⚠ ffmpeg not found, skipping video compression"
fi
