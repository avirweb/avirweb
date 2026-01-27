#!/usr/bin/env python3
"""
Download all CDN images from HTML files and update references to local paths.
"""
import os
import re
import urllib.request
import urllib.parse
from pathlib import Path

SITE_DIR = Path("/home/agent/avir/site")
IMAGES_DIR = SITE_DIR / "images"

def get_cdn_urls(content):
    pattern = r'https://cdn\.prod\.website-files\.com/[^"\'<>\s)]+'
    urls = re.findall(pattern, content)
    extensions = ('.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico', '.js', '.css', '.woff', '.woff2', '.ttf', '.otf')
    unique_urls = set()
    for url in urls:
        base_url = url.split('?')[0]
        if any(base_url.lower().endswith(ext) for ext in extensions):
            unique_urls.add(url)
    return unique_urls


def url_to_local_info(url):
    parsed = urllib.parse.urlparse(url)
    path = parsed.path.lstrip('/')
    filename = path.replace('/', '_')
    
    if '.js' in filename:
        return f"/js/{filename}", SITE_DIR / "js" / filename
    elif '.css' in filename:
        return f"/css/{filename}", SITE_DIR / "css" / filename
    elif any(ext in filename for ext in ('.woff', '.woff2', '.ttf', '.otf')):
        return f"/fonts/{filename}", SITE_DIR / "fonts" / filename
    else:
        return f"/images/{filename}", SITE_DIR / "images" / filename

def download_asset(url, local_path):
    local_path.parent.mkdir(parents=True, exist_ok=True)
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=30) as response:
            with open(local_path, 'wb') as f:
                f.write(response.read())
        return True
    except Exception as e:
        print(f"  ❌ Failed to download {url}: {e}")
        return False

def update_files():
    files = list(SITE_DIR.glob("**/*.html")) + list(SITE_DIR.glob("**/*.css"))
    
    for file_path in files:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        content = re.sub(r'(src|href|content)=["\']images/', r'\1="/images/', content)
        content = re.sub(r'url\(["\']?images/', 'url("/images/', content)
        content = re.sub(r'url\(["\']?https://www\.avir\.com/.*?images/', 'url("/images/', content)
        content = re.sub(r'/images/(.*?)&quot;', r'/images/\1"', content)
        
        cdn_urls = get_cdn_urls(content)
        if cdn_urls:
            print(f"  Processing {file_path.relative_to(SITE_DIR)}: {len(cdn_urls)} CDN assets")
            for url in sorted(cdn_urls, key=len, reverse=True):
                local_url, local_path = url_to_local_info(url)
                content = content.replace(url, local_url)
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"    ✅ Updated {file_path.relative_to(SITE_DIR)}")





def main():
    print("=" * 60)
    print("CDN Asset Downloader & Path Fixer")
    print("=" * 60)
    
    SITE_DIR.mkdir(parents=True, exist_ok=True)
    (SITE_DIR / "images").mkdir(parents=True, exist_ok=True)
    (SITE_DIR / "js").mkdir(parents=True, exist_ok=True)
    (SITE_DIR / "css").mkdir(parents=True, exist_ok=True)
    (SITE_DIR / "fonts").mkdir(parents=True, exist_ok=True)
    
    files = list(SITE_DIR.glob("**/*.html")) + list(SITE_DIR.glob("**/*.css"))
    print(f"\nFound {len(files)} HTML/CSS files")
    
    all_urls = set()
    for file_path in files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            urls = get_cdn_urls(content)
            all_urls.update(urls)
        except Exception as e:
            print(f"  ⚠️ Could not read {file_path}: {e}")
    
    print(f"Found {len(all_urls)} unique CDN asset URLs")
    
    downloaded = 0
    failed = 0
    if all_urls:
        print("\nDownloading assets...")
        for url in sorted(all_urls):
            local_url, local_path = url_to_local_info(url)
            if local_path.exists():
                downloaded += 1
            else:
                print(f"  📥 Downloading: {url[-60:]}...")
                if download_asset(url, local_path):
                    downloaded += 1
                else:
                    failed += 1
    
    print(f"\nProcessed assets: {downloaded}, Failed: {failed}")
    
    print("\nUpdating files and fixing paths...")
    update_files()
    
    print("\n" + "=" * 60)
    print("Done!")
    print("=" * 60)



if __name__ == "__main__":
    main()

