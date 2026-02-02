#!/usr/bin/env python3
import re
import urllib.request
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def fetch_url(url):
    try:
        with urllib.request.urlopen(url, context=ctx, timeout=30) as response:
            return response.read().decode('utf-8')
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def extract_image_urls(html_content):
    urls = []
    pattern = r'src="(https://cdn\.prod\.website-files\.com/[^"]+)"'
    matches = re.findall(pattern, html_content)
    return matches

urls = {
    'commercial': 'https://www.avir.com/galleries/commercial',
    'lifestyle': 'https://www.avir.com/galleries/lifestyle',
    'home-cinema': 'https://www.avir.com/galleries/home-cinema'
}

for name, url in urls.items():
    print(f"\n=== {name.upper()} ===")
    html = fetch_url(url)
    if html:
        image_urls = extract_image_urls(html)
        gallery_urls = [u for u in image_urls if 'asset' in u.lower() or 'theater' in u.lower() or 'screenshot' in u.lower()]
        print(f"Found {len(gallery_urls)} gallery images")
        for i, img_url in enumerate(gallery_urls[:5]):
            print(f"  {i+1}. {img_url}")
        if len(gallery_urls) > 5:
            print(f"  ... and {len(gallery_urls)-5} more")
