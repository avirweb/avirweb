#!/usr/bin/env python3
"""
Universal Image Fix Script for AVIR Mirror

This script finds all empty src attributes in HTML files, fetches the corresponding
page from the live site, downloads the missing images, and updates the local HTML.
"""

import os
import re
import ssl
import json
import time
import shutil
import hashlib
from pathlib import Path
from urllib.parse import urljoin, urlparse
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime

try:
    import requests
    from bs4 import BeautifulSoup
    from tqdm import tqdm
except ImportError:
    print("Installing required packages...")
    import subprocess
    subprocess.check_call(['pip', 'install', 'requests', 'beautifulsoup4', 'tqdm', '-q'])
    import requests
    from bs4 import BeautifulSoup
    from tqdm import tqdm

# Configuration
SITE_DIR = Path("site")
LIVE_SITE = "https://www.avir.com"
CDN_PATTERN = re.compile(r'https://cdn\.prod\.website-files\.com/[^"\'\s<>]+')
SRC_EMPTY_PATTERN = re.compile(r'<img[^>]*src=["\']["\'][^>]*>', re.IGNORECASE)
BACKUP_DIR = Path(".sisyphus/backups")
EVIDENCE_DIR = Path(".sisyphus/evidence")
IMAGES_DIR = SITE_DIR / "images" / "fixed"

# SSL context for HTTPS requests
ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE

# Session for connection pooling
session = requests.Session()
session.headers.update({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
})

class ImageFixer:
    def __init__(self, max_workers=5, dry_run=False):
        self.max_workers = max_workers
        self.dry_run = dry_run
        self.results = {
            'processed': 0,
            'fixed': 0,
            'failed': 0,
            'skipped': 0,
            'downloaded': 0,
            'errors': []
        }
        self.cache = {}  # Cache for live page content
        self.downloaded_images = set()  # Track downloaded images to avoid duplicates
        
        # Create directories
        BACKUP_DIR.mkdir(parents=True, exist_ok=True)
        EVIDENCE_DIR.mkdir(parents=True, exist_ok=True)
        IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    
    def log(self, message, level='info'):
        """Log a message with timestamp"""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        log_msg = f"[{timestamp}] [{level.upper()}] {message}"
        print(log_msg)
        if level == 'error':
            self.results['errors'].append(log_msg)
    
    def get_live_url(self, local_path):
        """Convert local path to live site URL"""
        relative_path = local_path.relative_to(SITE_DIR)
        # Remove index.html if present
        path_str = str(relative_path).replace('index.html', '').rstrip('/')
        return f"{LIVE_SITE}/{path_str}"
    
    def fetch_live_page(self, url, retries=3):
        """Fetch page from live site with caching and retries"""
        if url in self.cache:
            return self.cache[url]
        
        for attempt in range(retries):
            try:
                response = session.get(url, timeout=30, verify=False)
                response.raise_for_status()
                self.cache[url] = response.text
                return response.text
            except Exception as e:
                if attempt < retries - 1:
                    time.sleep(2 ** attempt)  # Exponential backoff
                    continue
                self.log(f"Failed to fetch {url}: {e}", 'error')
                return None
    
    def extract_image_urls_from_html(self, html):
        """Extract all image URLs from HTML"""
        urls = []
        # CDN images
        urls.extend(CDN_PATTERN.findall(html))
        # Other absolute URLs
        urls.extend(re.findall(r'https?://[^"\'\s<>]+\.(?:jpg|jpeg|png|gif|webp|svg)', html, re.IGNORECASE))
        return list(set(urls))
    
    def find_matching_image(self, live_html, alt_text, class_names):
        """Find matching image in live HTML based on alt text and classes"""
        if not live_html:
            return None
        
        soup = BeautifulSoup(live_html, 'html.parser')
        
        # Strategy 1: Find by exact alt text match
        if alt_text:
            img = soup.find('img', alt=alt_text)
            if img and img.get('src'):
                return img['src']
        
        # Strategy 2: Find by class names
        if class_names:
            for class_name in class_names:
                img = soup.find('img', class_=lambda x: x and class_name in x.split())
                if img and img.get('src'):
                    return img['src']
        
        # Strategy 3: Find all images and look for CDN URLs
        all_images = soup.find_all('img')
        for img in all_images:
            src = img.get('src', '')
            if 'cdn.prod.website-files.com' in src:
                # Check if alt text is similar
                img_alt = img.get('alt', '')
                if alt_text and img_alt and (alt_text in img_alt or img_alt in alt_text):
                    return src
        
        # Strategy 4: Return first CDN image found
        cdn_urls = CDN_PATTERN.findall(live_html)
        if cdn_urls:
            return cdn_urls[0]
        
        return None
    
    def download_image(self, url, local_path, retries=3):
        """Download image to local path with retries"""
        if local_path.exists():
            self.log(f"Image already exists: {local_path}")
            return True
        
        # Create parent directory if needed
        local_path.parent.mkdir(parents=True, exist_ok=True)
        
        for attempt in range(retries):
            try:
                response = session.get(url, timeout=30, verify=False, stream=True)
                response.raise_for_status()
                
                with open(local_path, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        f.write(chunk)
                
                self.results['downloaded'] += 1
                return True
            except Exception as e:
                if attempt < retries - 1:
                    time.sleep(2 ** attempt)
                    continue
                self.log(f"Failed to download {url}: {e}", 'error')
                return False
    
    def get_local_image_path(self, original_url, alt_text):
        """Generate a local path for the downloaded image"""
        # Create a hash of the URL for uniqueness
        url_hash = hashlib.md5(original_url.encode()).hexdigest()[:8]
        
        # Extract extension from URL
        parsed = urlparse(original_url)
        path = parsed.path
        ext = Path(path).suffix or '.jpg'
        
        # Create filename from alt text or use hash
        if alt_text:
            safe_alt = re.sub(r'[^\w\s-]', '', alt_text).strip().replace(' ', '_')[:50]
            filename = f"{safe_alt}_{url_hash}{ext}"
        else:
            filename = f"image_{url_hash}{ext}"
        
        return IMAGES_DIR / filename
    
    def create_backup(self, file_path):
        """Create a backup of the file before modifying"""
        backup_path = BACKUP_DIR / file_path.relative_to(SITE_DIR)
        backup_path.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(file_path, backup_path)
        return backup_path
    
    def parse_empty_img(self, img_tag):
        """Parse an img tag with empty src and extract attributes"""
        soup = BeautifulSoup(img_tag, 'html.parser')
        img = soup.find('img')
        if not img:
            return None
        
        return {
            'alt': img.get('alt', ''),
            'class': img.get('class', []),
            'sizes': img.get('sizes', ''),
            'loading': img.get('loading', ''),
            'width': img.get('width', ''),
            'original': img_tag
        }
    
    def fix_file(self, file_path):
        """Fix empty src attributes in a single file"""
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            # Find all img tags with empty src
            empty_imgs = SRC_EMPTY_PATTERN.findall(content)
            
            if not empty_imgs:
                self.results['skipped'] += 1
                return True
            
            self.log(f"Processing {file_path} - found {len(empty_imgs)} empty src(s)")
            
            # Create backup
            if not self.dry_run:
                self.create_backup(file_path)
            
            # Fetch live page
            live_url = self.get_live_url(file_path)
            live_html = self.fetch_live_page(live_url)
            
            if not live_html:
                self.log(f"Could not fetch live page: {live_url}", 'error')
                self.results['failed'] += 1
                return False
            
            # Process each empty img
            new_content = content
            fixed_count = 0
            
            for img_tag in empty_imgs:
                img_info = self.parse_empty_img(img_tag)
                if not img_info:
                    continue
                
                alt_text = img_info['alt']
                class_names = img_info['class']
                
                # Find matching image in live HTML
                image_url = self.find_matching_image(live_html, alt_text, class_names)
                
                if not image_url:
                    self.log(f"Could not find matching image for alt='{alt_text}' in {file_path}", 'error')
                    continue
                
                # Download image
                local_path = self.get_local_image_path(image_url, alt_text)
                relative_path = '/' + str(local_path.relative_to(SITE_DIR))
                
                if not self.dry_run:
                    if image_url not in self.downloaded_images:
                        if self.download_image(image_url, local_path):
                            self.downloaded_images.add(image_url)
                        else:
                            continue
                
                # Replace in content
                # Create new img tag with proper src
                new_img_tag = img_tag.replace('src=""', f'src="{relative_path}"')
                new_img_tag = new_img_tag.replace("src=''", f'src="{relative_path}"')
                
                # Also fix empty srcset if present
                if 'srcset=""' in new_img_tag:
                    new_img_tag = new_img_tag.replace('srcset=""', f'srcset="{relative_path}"')
                if "srcset=''" in new_img_tag:
                    new_img_tag = new_img_tag.replace("srcset=''", f'srcset="{relative_path}"')
                
                new_content = new_content.replace(img_tag, new_img_tag, 1)
                fixed_count += 1
            
            # Write updated content
            if not self.dry_run and fixed_count > 0:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
            
            self.results['fixed'] += fixed_count
            self.log(f"Fixed {fixed_count}/{len(empty_imgs)} images in {file_path}")
            return True
            
        except Exception as e:
            self.log(f"Error processing {file_path}: {e}", 'error')
            self.results['failed'] += 1
            return False
    
    def find_files_with_empty_src(self):
        """Find all HTML files with empty src attributes"""
        files = []
        for html_file in SITE_DIR.rglob('*.html'):
            try:
                with open(html_file, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                if SRC_EMPTY_PATTERN.search(content):
                    files.append(html_file)
            except Exception as e:
                self.log(f"Error reading {html_file}: {e}", 'error')
        return files
    
    def run(self, test_subset=None):
        """Run the fix process"""
        self.log("=" * 60)
        self.log("Universal Image Fix Script Starting")
        self.log("=" * 60)
        
        # Find files
        if test_subset:
            files_to_process = test_subset
            self.log(f"Running in TEST MODE with {len(files_to_process)} files")
        else:
            self.log("Scanning for files with empty src...")
            files_to_process = self.find_files_with_empty_src()
            self.log(f"Found {len(files_to_process)} files with empty src")
        
        if not files_to_process:
            self.log("No files to process!")
            return self.results
        
        # Process files
        self.log(f"Processing {len(files_to_process)} files with {self.max_workers} workers...")
        
        with tqdm(total=len(files_to_process), desc="Processing files") as pbar:
            with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
                futures = {executor.submit(self.fix_file, f): f for f in files_to_process}
                
                for future in as_completed(futures):
                    file_path = futures[future]
                    try:
                        future.result()
                        self.results['processed'] += 1
                    except Exception as e:
                        self.log(f"Exception processing {file_path}: {e}", 'error')
                        self.results['failed'] += 1
                    pbar.update(1)
        
        # Generate report
        self.generate_report()
        
        return self.results
    
    def generate_report(self):
        """Generate and save report"""
        report_lines = [
            "=" * 60,
            "Image Fix Report",
            "=" * 60,
            f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            f"Mode: {'DRY RUN' if self.dry_run else 'LIVE'}",
            "",
            "Results:",
            f"  Files processed: {self.results['processed']}",
            f"  Images fixed: {self.results['fixed']}",
            f"  Images downloaded: {self.results['downloaded']}",
            f"  Files skipped (no empty src): {self.results['skipped']}",
            f"  Failures: {self.results['failed']}",
            "",
        ]
        
        if self.results['errors']:
            report_lines.extend([
                "Errors:",
                "-" * 40,
            ])
            for error in self.results['errors'][:50]:  # Limit to 50 errors
                report_lines.append(error)
            if len(self.results['errors']) > 50:
                report_lines.append(f"... and {len(self.results['errors']) - 50} more errors")
        
        report_lines.append("=" * 60)
        
        report_text = "\n".join(report_lines)
        print("\n" + report_text)
        
        # Save to evidence file
        evidence_file = EVIDENCE_DIR / "task-6-fix-script.txt"
        with open(evidence_file, 'w') as f:
            f.write(report_text)
        
        self.log(f"Report saved to {evidence_file}")
        
        # Also save JSON for programmatic access
        json_file = EVIDENCE_DIR / "task-6-fix-script.json"
        with open(json_file, 'w') as f:
            json.dump(self.results, f, indent=2)

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Fix empty src attributes in HTML files')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be done without making changes')
    parser.add_argument('--test', action='store_true', help='Test on a small subset (5 files)')
    parser.add_argument('--workers', type=int, default=5, help='Number of parallel workers (default: 5)')
    parser.add_argument('--file', type=str, help='Process a specific file only')
    
    args = parser.parse_args()
    
    fixer = ImageFixer(max_workers=args.workers, dry_run=args.dry_run)
    
    if args.file:
        # Process single file
        file_path = Path(args.file)
        if not file_path.exists():
            print(f"File not found: {file_path}")
            return 1
        fixer.run(test_subset=[file_path])
    elif args.test:
        # Test mode - find 5 files and process them
        files = fixer.find_files_with_empty_src()[:5]
        fixer.run(test_subset=files)
    else:
        # Full run
        fixer.run()
    
    return 0

if __name__ == "__main__":
    exit(main())
