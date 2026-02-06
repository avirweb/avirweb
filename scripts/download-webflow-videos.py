#!/usr/bin/env python3
"""Download Webflow background videos from data-video-urls attributes."""

import os
import sys
import re
import time
import hashlib
import argparse
import shutil
from pathlib import Path
from urllib.parse import urljoin, urlparse, unquote
from urllib.request import urlopen, HTTPError
from urllib.error import URLError

SITE_DIR = Path("site")
VIDEOS_DIR = SITE_DIR / "videos"
LIVE_SITE = "https://www.avir.com"
MAX_FILE_SIZE_MB = 100
MAX_RETRIES = 3
RETRY_DELAY_SECONDS = 2


def ensure_videos_dir():
    """Ensure the videos directory exists."""
    VIDEOS_DIR.mkdir(parents=True, exist_ok=True)
    print(f"[INFO] Videos directory: {VIDEOS_DIR}")


def extract_video_urls(html_content, base_url):
    """Extract all video URLs from HTML content.
    
    Args:
        html_content: HTML string to parse
        base_url: Base URL for resolving relative URLs
    
    Returns:
        List of (original_url, video_filename) tuples
    """
    urls = []
    
    # Pattern for w-background-video elements with data-video-urls attribute
    # Matches: data-video-urls="url1 url2 url3"
    bg_video_pattern = r'<[^>]*class="[^"]*w-background-video[^"]*"[^>]*data-video-urls="([^"]*)"'
    
    for match in re.finditer(bg_video_pattern, html_content, re.DOTALL | re.IGNORECASE):
        video_urls_attr = match.group(1)
        # Split by whitespace to get individual URLs
        for url in video_urls_attr.split():
            if url:
                # Resolve relative URLs
                full_url = urljoin(base_url, url)
                urls.append(full_url)
    
    # Pattern for data-video-urls attribute that comes after class attribute
    bg_video_pattern2 = r'data-video-urls="([^"]*)"[^>]*class="[^"]*w-background-video[^"]*"'
    
    for match in re.finditer(bg_video_pattern2, html_content, re.DOTALL | re.IGNORECASE):
        video_urls_attr = match.group(1)
        for url in video_urls_attr.split():
            if url:
                full_url = urljoin(base_url, url)
                if full_url not in urls:
                    urls.append(full_url)
    
    # Pattern for video source elements
    video_source_pattern = r'<video[^>]*>.*?<source[^>]*src="([^"]*)"[^>]*>.*?</video>'
    
    for match in re.finditer(video_source_pattern, html_content, re.DOTALL | re.IGNORECASE):
        src = match.group(1)
        if src:
            full_url = urljoin(base_url, src)
            if full_url not in urls:
                urls.append(full_url)
    
    # Pattern for source elements with video/mp4 type
    source_pattern = r'<source[^>]*src="([^"]*)"[^>]*type="video/[^"]*"[^>]*>'
    
    for match in re.finditer(source_pattern, html_content, re.IGNORECASE):
        src = match.group(1)
        if src:
            full_url = urljoin(base_url, src)
            if full_url not in urls:
                urls.append(full_url)
    
    # Remove duplicates while preserving order
    seen = set()
    unique_urls = []
    for url in urls:
        if url not in seen:
            seen.add(url)
            unique_urls.append(url)
    
    return unique_urls


def get_video_filename(url):
    """Generate a filename for a video URL.
    
    Args:
        url: Video URL
    
    Returns:
        Filename for the video
    """
    parsed = urlparse(url)
    path = unquote(parsed.path)
    
    # Try to get filename from URL path
    if '/' in path:
        filename = path.split('/')[-1]
        if filename and '.' in filename:
            # Clean up the filename
            filename = re.sub(r'[^\w\-\.]', '_', filename)
            return filename
    
    # Fallback: generate filename from URL hash
    url_hash = hashlib.md5(url.encode()).hexdigest()[:8]
    # Determine extension from URL or default to mp4
    if '.webm' in url.lower():
        ext = 'webm'
    elif '.ogv' in url.lower() or '.ogg' in url.lower():
        ext = 'ogv'
    else:
        ext = 'mp4'
    
    return f"video_{url_hash}.{ext}"


def format_size(size_bytes):
    """Format bytes to human readable string."""
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    else:
        return f"{size_bytes / (1024 * 1024):.1f} MB"


def download_video(url, output_path, dry_run=False, max_retries=MAX_RETRIES):
    """Download a video file with retry logic.
    
    Args:
        url: URL to download
        output_path: Path where to save the file
        dry_run: If True, only log what would be done
        max_retries: Maximum number of retry attempts
    
    Returns:
        True if successful, False otherwise
    """
    if dry_run:
        print(f"  [DRY RUN] Would download: {url}")
        return True
    
    # Skip if file already exists
    if output_path.exists():
        existing_size = output_path.stat().st_size
        print(f"  [SKIP] Already exists ({format_size(existing_size)}): {output_path.name}")
        return True
    
    # Check file size before downloading
    try:
        req = urlopen(url, timeout=30)
        content_length = req.headers.get('Content-Length')
        if content_length:
            size_mb = int(content_length) / (1024 * 1024)
            if size_mb > MAX_FILE_SIZE_MB:
                print(f"  [WARNING] File too large ({size_mb:.1f} MB > {MAX_FILE_SIZE_MB} MB): {url}")
                proceed = input("  Download anyway? (y/N): ").lower().strip() == 'y'
                if not proceed:
                    print(f"  [SKIP] Skipped large file: {url}")
                    return False
        req.close()
    except Exception as e:
        print(f"  [WARNING] Could not check file size: {e}")
    
    # Download with retry logic
    for attempt in range(1, max_retries + 1):
        try:
            print(f"  [DOWNLOAD] Attempt {attempt}/{max_retries}: {url}")
            
            req = urlopen(url, timeout=60)
            
            # Read content in chunks to handle large files
            chunk_size = 8192
            total_size = 0
            
            with open(output_path, 'wb') as f:
                while True:
                    chunk = req.read(chunk_size)
                    if not chunk:
                        break
                    f.write(chunk)
                    total_size += len(chunk)
                    # Print progress every MB
                    if total_size % (1024 * 1024) < chunk_size:
                        print(f"    Progress: {format_size(total_size)}", end='\r')
            
            req.close()
            print(f"  [SUCCESS] Downloaded ({format_size(total_size)}): {output_path.name}")
            return True
            
        except HTTPError as e:
            print(f"  [ERROR] HTTP {e.code}: {e.reason}")
            if e.code == 404:
                print(f"  [FAIL] Video not found: {url}")
                return False
        except URLError as e:
            print(f"  [ERROR] URL Error: {e.reason}")
        except Exception as e:
            print(f"  [ERROR] {type(e).__name__}: {e}")
        
        if attempt < max_retries:
            print(f"  [RETRY] Waiting {RETRY_DELAY_SECONDS}s before retry...")
            time.sleep(RETRY_DELAY_SECONDS)
        else:
            print(f"  [FAIL] All {max_retries} attempts failed for: {url}")
    
    return False


def update_html_paths(html_content, url_mapping, base_url=LIVE_SITE):
    """Update HTML content to use local video paths.
    
    Args:
        html_content: Original HTML string
        url_mapping: Dict mapping original URLs to local paths
        base_url: Base URL for matching
    
    Returns:
        Updated HTML string
    """
    updated_html = html_content
    
    for original_url, local_path in url_mapping.items():
        # Escape special regex characters in URL
        escaped_url = re.escape(original_url)
        
        # Update data-video-urls attributes
        pattern = rf'(data-video-urls="[^"]*){escaped_url}([^"]*")'
        replacement = rf'\1/videos/{local_path}\2'
        updated_html = re.sub(pattern, replacement, updated_html)
        
        # Update video source src attributes
        pattern = rf'(<source[^>]*src="){escaped_url}(")'
        replacement = rf'\1/videos/{local_path}\2'
        updated_html = re.sub(pattern, replacement, updated_html)
    
    return updated_html


def create_test_html():
    """Create a test HTML file for testing."""
    test_html = '''<!DOCTYPE html>
<html>
<head><title>Test Video Page</title></head>
<body>
    <div class="w-background-video" 
         data-video-urls="https://cdn.prod.website-files.com/test-video.mp4 https://cdn.prod.website-files.com/test-video.webm"
         data-autoplay="true" 
         data-loop="true">
    </div>
    
    <div class="hero w-background-video" 
         data-video-urls="https://cdn.prod.website-files.com/another-video.mp4"
         data-autoplay="true">
    </div>
    
    <video controls>
        <source src="https://cdn.prod.website-files.com/video-source.mp4" type="video/mp4">
    </video>
</body>
</html>'''
    return test_html


def process_html_file(html_file, base_url=LIVE_SITE, dry_run=False, update_html=False):
    """Process a single HTML file to extract and download videos.
    
    Args:
        html_file: Path to HTML file
        base_url: Base URL for resolving relative URLs
        dry_run: If True, don't actually download
        update_html: If True, update HTML to use local paths
    
    Returns:
        Tuple of (urls_found, downloaded_count, failed_count)
    """
    print(f"\n[PROCESSING] {html_file}")
    
    try:
        with open(html_file, 'r', encoding='utf-8', errors='ignore') as f:
            html_content = f.read()
    except Exception as e:
        print(f"  [ERROR] Could not read file: {e}")
        return [], 0, 0
    
    urls = extract_video_urls(html_content, base_url)
    
    if not urls:
        print(f"  [INFO] No video URLs found in {html_file}")
        return [], 0, 0
    
    print(f"  [FOUND] {len(urls)} video URL(s)")
    for i, url in enumerate(urls, 1):
        print(f"    {i}. {url}")
    
    if dry_run:
        print(f"  [DRY RUN] Would download {len(urls)} video(s)")
        return urls, 0, 0
    
    # Download videos
    downloaded = 0
    failed = 0
    url_mapping = {}
    
    ensure_videos_dir()
    
    for url in urls:
        filename = get_video_filename(url)
        output_path = VIDEOS_DIR / filename
        
        success = download_video(url, output_path, dry_run=False)
        
        if success:
            downloaded += 1
            url_mapping[url] = filename
        else:
            failed += 1
    
    # Update HTML if requested
    if update_html and url_mapping and not dry_run:
        updated_html = update_html_paths(html_content, url_mapping, base_url)
        
        # Create backup
        backup_path = Path(str(html_file) + '.bak')
        if not backup_path.exists():
            shutil.copy2(html_file, backup_path)
            print(f"  [BACKUP] Created: {backup_path}")
        
        # Write updated HTML
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(updated_html)
        print(f"  [UPDATED] HTML file with local video paths")
    
    return urls, downloaded, failed


def process_all_html_files(base_url=LIVE_SITE, dry_run=False, update_html=False):
    """Process all HTML files in the site directory."""
    print(f"[INFO] Processing all HTML files in {SITE_DIR}")
    
    html_files = list(SITE_DIR.rglob("*.html"))
    print(f"[INFO] Found {len(html_files)} HTML file(s)")
    
    all_urls = set()
    total_downloaded = 0
    total_failed = 0
    
    for html_file in html_files:
        urls, downloaded, failed = process_html_file(
            html_file, base_url, dry_run, update_html
        )
        all_urls.update(urls)
        total_downloaded += downloaded
        total_failed += failed
    
    print(f"\n[SUMMARY]")
    print(f"  Total unique video URLs found: {len(all_urls)}")
    print(f"  Successfully downloaded: {total_downloaded}")
    print(f"  Failed: {total_failed}")
    
    return all_urls, total_downloaded, total_failed


def main():
    global VIDEOS_DIR
    
    parser = argparse.ArgumentParser(
        description='Download Webflow background videos from data-video-urls attributes'
    )
    parser.add_argument(
        'html_file', 
        nargs='?', 
        help='HTML file to process (if not specified, processes all HTML files in site/)'
    )
    parser.add_argument(
        '--base-url', 
        default=LIVE_SITE,
        help=f'Base URL for resolving relative URLs (default: {LIVE_SITE})'
    )
    parser.add_argument(
        '--dry-run', 
        action='store_true', 
        help='Show what would be downloaded without downloading'
    )
    parser.add_argument(
        '--test-mode', 
        action='store_true', 
        help='Test mode with sample HTML'
    )
    parser.add_argument(
        '--update-html', 
        action='store_true',
        help='Update HTML files to reference local video paths'
    )
    parser.add_argument(
        '--videos-dir',
        type=Path,
        default=None,
        help=f'Output directory for videos (default: {VIDEOS_DIR})'
    )
    
    args = parser.parse_args()
    
    # Update global VIDEOS_DIR if specified
    if args.videos_dir:
        VIDEOS_DIR = args.videos_dir
    
    print("=" * 60)
    print("Webflow Video Downloader")
    print("=" * 60)
    print(f"Base URL: {args.base_url}")
    print(f"Videos directory: {VIDEOS_DIR}")
    print(f"Dry run: {args.dry_run}")
    print(f"Update HTML: {args.update_html}")
    print("=" * 60)
    
    if args.test_mode:
        print("\n[TEST MODE] Using sample HTML content")
        test_html = create_test_html()
        urls = extract_video_urls(test_html, args.base_url)
        print(f"\nFound {len(urls)} video URL(s):")
        for i, url in enumerate(urls, 1):
            print(f"  {i}. {url}")
        return
    
    if args.html_file:
        # Process single file
        html_file = Path(args.html_file)
        if not html_file.exists():
            print(f"[ERROR] File not found: {html_file}")
            sys.exit(1)
        
        urls, downloaded, failed = process_html_file(
            html_file, args.base_url, args.dry_run, args.update_html
        )
    else:
        # Process all HTML files
        urls, downloaded, failed = process_all_html_files(
            args.base_url, args.dry_run, args.update_html
        )
    
    # Exit with error code if any downloads failed
    if failed > 0:
        print(f"\n[WARNING] {failed} download(s) failed")
        sys.exit(1)
    
    print("\n[SUCCESS] All operations completed successfully")


if __name__ == "__main__":
    main()
