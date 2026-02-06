#!/usr/bin/env python3
"""
Download and localize CDN assets from Webflow sites.

This script parses HTML and CSS files for CDN asset references,
downloads them to a local directory, and rewrites URLs to point
to local copies. Supports multiple CDN domains and asset types.
"""

import os
import sys
import re
import requests
import argparse
import json
import time
from pathlib import Path
from urllib.parse import urlparse, urljoin, unquote
from typing import Set, List, Dict, Tuple, Optional
from bs4 import BeautifulSoup

# CDN domains to search for
CDN_DOMAINS = [
    'cdn.prod.website-files.com',
    'assets.website-files.com',
]

# Asset extensions to handle
ASSET_EXTENSIONS = {
    'image': ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico', '.bmp'],
    'font': ['.woff', '.woff2', '.ttf', '.otf', '.eot'],
    'css': ['.css'],
    'js': ['.js'],
    'video': ['.mp4', '.webm', '.ogg'],
    'audio': ['.mp3', '.wav', '.ogg', '.aac'],
    'document': ['.pdf', '.doc', '.docx', '.xls', '.xlsx'],
}

# Flatten all extensions for URL validation
ALL_EXTENSIONS = []
for exts in ASSET_EXTENSIONS.values():
    ALL_EXTENSIONS.extend(exts)

# User agent for requests
USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'


class CDNAssetFixer:
    """Main class for downloading and localizing CDN assets."""
    
    def __init__(self, site_dir: Path, cdn_dir: str = 'cdn', dry_run: bool = False, 
                 max_retries: int = 3, timeout: int = 30):
        self.site_dir = Path(site_dir)
        self.cdn_dir = self.site_dir / cdn_dir
        self.dry_run = dry_run
        self.max_retries = max_retries
        self.timeout = timeout
        
        # Statistics
        self.stats = {
            'html_files_processed': 0,
            'css_files_processed': 0,
            'total_cdn_urls_found': 0,
            'unique_cdn_urls': 0,
            'assets_downloaded': 0,
            'assets_skipped': 0,
            'assets_failed': 0,
            'files_updated': 0,
            'by_type': {k: 0 for k in ASSET_EXTENSIONS.keys()},
        }
        
        # Tracking
        self.downloaded_assets: Set[str] = set()
        self.failed_assets: List[Tuple[str, str]] = []
        self.url_mapping: Dict[str, str] = {}  # old_url -> new_url
        
        # Ensure CDN directory exists
        if not self.dry_run:
            self.cdn_dir.mkdir(parents=True, exist_ok=True)
    
    def get_asset_type(self, url: str) -> str:
        """Determine asset type from URL extension."""
        parsed = urlparse(url)
        path_lower = parsed.path.lower()
        
        for asset_type, extensions in ASSET_EXTENSIONS.items():
            for ext in extensions:
                if path_lower.endswith(ext):
                    return asset_type
        
        # Default to image if no match
        return 'image'
    
    def extract_cdn_urls_from_html(self, html_content: str) -> Set[str]:
        """Extract all CDN asset URLs from HTML content using regex."""
        urls = set()
        
        for domain in CDN_DOMAINS:
            # Match URLs in various contexts: src, href, content, url(), etc.
            patterns = [
                # Standard HTML attributes
                rf'https://{re.escape(domain)}/([^"\'\s<>]+)',
                # CSS url() function
                rf'url\(["\']?https://{re.escape(domain)}/([^"\'\s<>()]+)["\']?\)',
                # JSON strings
                rf'"https://{re.escape(domain)}/([^"]+)"',
                rf"'https://{re.escape(domain)}/([^']+)'",
            ]
            
            for pattern in patterns:
                matches = re.findall(pattern, html_content)
                for match in matches:
                    # Reconstruct full URL
                    url = f"https://{domain}/{match}"
                    # Clean up URL
                    url = url.split('#')[0]  # Remove fragment
                    url = unquote(url)  # URL decode
                    # Only include if it has an asset extension
                    if any(url.lower().endswith(ext) for ext in ALL_EXTENSIONS):
                        urls.add(url)
        
        return urls
    
    def extract_cdn_urls_from_css(self, css_content: str) -> Set[str]:
        """Extract CDN URLs from CSS content."""
        urls = set()
        
        for domain in CDN_DOMAINS:
            # Match url() function with CDN URLs
            pattern = rf'url\(["\']?https://{re.escape(domain)}/([^"\'\s()]+)["\']?\)'
            matches = re.findall(pattern, css_content)
            for match in matches:
                url = f"https://{domain}/{match}"
                url = url.split('#')[0]
                url = unquote(url)
                if any(url.lower().endswith(ext) for ext in ALL_EXTENSIONS):
                    urls.add(url)
        
        return urls
    
    def get_local_path(self, url: str) -> Path:
        """Generate local file path for a CDN URL, maintaining directory structure."""
        parsed = urlparse(url)
        # Remove leading slash from path
        path = parsed.path.lstrip('/')
        
        # URL decode path
        path = unquote(path)
        
        # Create local path under cdn/
        local_path = self.cdn_dir / path
        return local_path
    
    def get_local_url(self, url: str) -> str:
        """Generate local URL path for a CDN URL."""
        parsed = urlparse(url)
        path = unquote(parsed.path)
        return f"/cdn{path}"
    
    def download_asset(self, url: str, local_path: Path) -> bool:
        """Download a single asset with retry logic."""
        if self.dry_run:
            self.downloaded_assets.add(url)
            return True
        
        # Skip if already downloaded
        if local_path.exists():
            self.downloaded_assets.add(url)
            self.stats['assets_skipped'] += 1
            return True
        
        # Ensure parent directory exists
        local_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Retry logic
        for attempt in range(1, self.max_retries + 1):
            try:
                headers = {'User-Agent': USER_AGENT}
                response = requests.get(url, headers=headers, timeout=self.timeout)
                response.raise_for_status()
                
                # Write file
                with open(local_path, 'wb') as f:
                    f.write(response.content)
                
                self.downloaded_assets.add(url)
                self.stats['assets_downloaded'] += 1
                
                # Update by_type stats
                asset_type = self.get_asset_type(url)
                self.stats['by_type'][asset_type] += 1
                
                return True
                
            except requests.exceptions.RequestException as e:
                if attempt == self.max_retries:
                    error_msg = f"{type(e).__name__}: {str(e)}"
                    self.failed_assets.append((url, error_msg))
                    self.stats['assets_failed'] += 1
                    return False
                
                # Wait before retry (exponential backoff)
                time.sleep(2 ** (attempt - 1))
        
        return False
    
    def scan_files(self) -> Tuple[Set[str], List[Tuple]]:
        """Scan all HTML and CSS files for CDN URLs."""
        all_urls = set()
        files_to_process = []
        
        # Find all HTML files
        html_files = list(self.site_dir.glob("**/*.html"))
        css_files = list(self.site_dir.glob("**/*.css"))
        
        print(f"\n📁 Scanning {len(html_files)} HTML and {len(css_files)} CSS files...")
        
        # Process HTML files
        for html_file in html_files:
            try:
                with open(html_file, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                
                urls = self.extract_cdn_urls_from_html(content)
                if urls:
                    all_urls.update(urls)
                    files_to_process.append(('html', html_file, content, urls))
                    self.stats['html_files_processed'] += 1
                    
            except Exception as e:
                print(f"  ⚠️  Could not read {html_file}: {e}")
        
        # Process CSS files
        for css_file in css_files:
            try:
                with open(css_file, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                
                urls = self.extract_cdn_urls_from_css(content)
                if urls:
                    all_urls.update(urls)
                    files_to_process.append(('css', css_file, content, urls))
                    self.stats['css_files_processed'] += 1
                    
            except Exception as e:
                print(f"  ⚠️  Could not read {css_file}: {e}")
        
        self.stats['total_cdn_urls_found'] = sum(len(urls) for _, _, _, urls in files_to_process)
        self.stats['unique_cdn_urls'] = len(all_urls)
        
        return all_urls, files_to_process
    
    def download_cdn_assets(self, urls: Set[str]) -> Dict[str, str]:
        """Download all CDN assets and build URL mapping."""
        url_mapping = {}
        
        if not urls:
            return url_mapping
        
        print(f"\n⬇️  Downloading {len(urls)} unique CDN assets...")
        print(f"   (with {self.max_retries} retries for failed downloads)")
        
        for i, url in enumerate(sorted(urls), 1):
            local_path = self.get_local_path(url)
            local_url = self.get_local_url(url)
            
            status = "📥"
            if self.dry_run:
                status = "🔍"
            elif local_path.exists():
                status = "⏭️ "
            
            print(f"   {status} [{i}/{len(urls)}] {url[:70]}...", end='')
            
            if self.download_asset(url, local_path):
                url_mapping[url] = local_url
                print(" ✓")
            else:
                print(" ✗ FAILED")
        
        self.url_mapping = url_mapping
        return url_mapping
    
    def rewrite_html_urls(self, html_content: str, url_mapping: Dict[str, str]) -> str:
        """Rewrite CDN URLs to local paths in HTML content."""
        new_content = html_content
        
        for old_url, new_url in url_mapping.items():
            # Handle URL-encoded variations
            old_url_encoded = old_url.replace(' ', '%20')
            
            # Replace in various contexts
            replacements = [
                (old_url, new_url),
                (old_url_encoded, new_url),
            ]
            
            for old, new in replacements:
                new_content = new_content.replace(old, new)
        
        return new_content
    
    def rewrite_css_urls(self, css_content: str, url_mapping: Dict[str, str]) -> str:
        """Rewrite CDN URLs in CSS content."""
        new_content = css_content
        
        for old_url, new_url in url_mapping.items():
            old_url_encoded = old_url.replace(' ', '%20')
            
            # Replace in url() functions
            new_content = new_content.replace(f'url("{old_url}")', f'url("{new_url}")')
            new_content = new_content.replace(f"url('{old_url}')", f"url('{new_url}')")
            new_content = new_content.replace(f'url({old_url})', f'url({new_url})')
            new_content = new_content.replace(f'url("{old_url_encoded}")', f'url("{new_url}")')
            new_content = new_content.replace(f"url('{old_url_encoded}')", f"url('{new_url}')")
            new_content = new_content.replace(f'url({old_url_encoded})', f'url({new_url})')
        
        return new_content
    
    def update_files(self, files_to_process: List[Tuple], url_mapping: Dict[str, str]):
        """Update all HTML and CSS files with new URLs."""
        if not url_mapping:
            return
        
        print(f"\n📝 Updating {len(files_to_process)} files with local URLs...")
        
        for file_type, file_path, original_content, _ in files_to_process:
            if file_type == 'html':
                new_content = self.rewrite_html_urls(original_content, url_mapping)
            else:  # css
                new_content = self.rewrite_css_urls(original_content, url_mapping)
            
            if new_content != original_content:
                if not self.dry_run:
                    # Create backup
                    backup_path = Path(str(file_path) + '.bak')
                    if not backup_path.exists():
                        with open(backup_path, 'w', encoding='utf-8') as f:
                            f.write(original_content)
                    
                    # Write updated content
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                
                self.stats['files_updated'] += 1
                print(f"   ✓ {'[DRY-RUN] ' if self.dry_run else ''}{file_path.relative_to(self.site_dir)}")
    
    def save_log(self):
        """Save download log to JSON file."""
        log_data = {
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
            'dry_run': self.dry_run,
            'stats': self.stats,
            'downloaded': list(self.downloaded_assets),
            'failed': [{'url': url, 'error': error} for url, error in self.failed_assets],
            'url_mapping': self.url_mapping,
        }
        
        log_path = self.site_dir / 'cdn-assets-log.json'
        with open(log_path, 'w', encoding='utf-8') as f:
            json.dump(log_data, f, indent=2)
        
        print(f"\n📄 Log saved to: {log_path}")
    
    def print_stats(self):
        """Print processing statistics."""
        print("\n" + "=" * 70)
        print("📊 CDN Asset Processing Statistics")
        print("=" * 70)
        print(f"  HTML files processed:     {self.stats['html_files_processed']}")
        print(f"  CSS files processed:      {self.stats['css_files_processed']}")
        print(f"  Total CDN URLs found:     {self.stats['total_cdn_urls_found']}")
        print(f"  Unique CDN URLs:          {self.stats['unique_cdn_urls']}")
        print(f"  Assets downloaded:        {self.stats['assets_downloaded']}")
        print(f"  Assets skipped (exist):   {self.stats['assets_skipped']}")
        print(f"  Assets failed:            {self.stats['assets_failed']}")
        print(f"  Files updated:            {self.stats['files_updated']}")
        print("\n  By asset type:")
        for asset_type, count in self.stats['by_type'].items():
            if count > 0:
                print(f"    - {asset_type}: {count}")
        
        if self.failed_assets:
            print("\n" + "=" * 70)
            print("❌ Failed Downloads:")
            print("=" * 70)
            for url, error in self.failed_assets:
                print(f"  {url[:60]}...")
                print(f"    Error: {error}")
        
        print("=" * 70)
    
    def run(self, stats_only: bool = False):
        """Run the complete CDN asset fixing process."""
        mode_str = "[DRY-RUN] " if self.dry_run else ""
        print(f"\n{'='*70}")
        print(f"🚀 {mode_str}CDN Asset Fixer")
        print(f"{'='*70}")
        print(f"  Site directory: {self.site_dir}")
        print(f"  CDN directory:  {self.cdn_dir}")
        print(f"  Max retries:    {self.max_retries}")
        print(f"  Timeout:        {self.timeout}s")
        
        # Scan files
        all_urls, files_to_process = self.scan_files()
        
        if stats_only:
            self.print_stats()
            return
        
        if not all_urls:
            print("\n✅ No CDN URLs found. Nothing to do.")
            return
        
        # Download assets
        url_mapping = self.download_cdn_assets(all_urls)
        
        # Update files
        self.update_files(files_to_process, url_mapping)
        
        # Print stats
        self.print_stats()
        
        # Save log
        if not self.dry_run:
            self.save_log()
        
        print(f"\n✅ {'[DRY-RUN] ' if self.dry_run else ''}Processing complete!")


def main():
    parser = argparse.ArgumentParser(
        description='Download and localize CDN assets from Webflow sites.',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s                         # Process site/ directory
  %(prog)s /path/to/site           # Process specific directory
  %(prog)s --dry-run               # Preview changes without downloading
  %(prog)s --stats-only            # Only show statistics
  %(prog)s --max-retries 5         # Set retry attempts to 5
        """
    )
    
    parser.add_argument(
        'site_dir',
        nargs='?',
        default='site',
        help='Site directory to process (default: site)'
    )
    parser.add_argument(
        '--cdn-dir',
        default='cdn',
        help='CDN output directory name (default: cdn)'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Show what would be done without making changes'
    )
    parser.add_argument(
        '--stats-only',
        action='store_true',
        help='Only show statistics, do not download or update'
    )
    parser.add_argument(
        '--max-retries',
        type=int,
        default=3,
        help='Maximum retry attempts for failed downloads (default: 3)'
    )
    parser.add_argument(
        '--timeout',
        type=int,
        default=30,
        help='Request timeout in seconds (default: 30)'
    )
    
    args = parser.parse_args()
    
    # Create fixer instance
    fixer = CDNAssetFixer(
        site_dir=Path(args.site_dir),
        cdn_dir=args.cdn_dir,
        dry_run=args.dry_run,
        max_retries=args.max_retries,
        timeout=args.timeout
    )
    
    # Run the fixer
    fixer.run(stats_only=args.stats_only)


if __name__ == "__main__":
    main()
