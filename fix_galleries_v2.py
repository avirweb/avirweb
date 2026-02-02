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

def fix_gallery_html(local_path, live_url, local_img_prefix):
    live_html = fetch_url(live_url)
    if not live_html:
        print(f"Failed to fetch {live_url}")
        return 0
    
    with open(local_path, 'r') as f:
        local_html = f.read()
    
    img_count = 0
    
    def replace_src_with_live(match):
        nonlocal img_count
        img_count += 1
        alt_text = match.group(1)
        sizes = match.group(2) if match.group(2) else ''
        
        live_pattern = rf'src="(https://cdn\.prod\.website-files\.com/[^"]+)"[^>]*alt="{re.escape(alt_text)}"'
        live_match = re.search(live_pattern, live_html)
        
        if live_match:
            live_src = live_match.group(1)
            filename = live_src.split('/')[-1]
            local_path = f"{local_img_prefix}/{filename.replace('%20', ' ')}"
            if sizes:
                return f'src="{local_path}" loading="lazy" alt="{alt_text}" sizes="{sizes}"'
            return f'src="{local_path}" loading="lazy" alt="{alt_text}"'
        return match.group(0)
    
    pattern = r'<img src="" loading="lazy" alt="([^"]+)"(?: sizes="([^"]+)")?[^>]*>'
    fixed_html = re.sub(pattern, replace_src_with_live, local_html)
    
    json_count = 0
    def replace_json_url(match):
        nonlocal json_count
        json_count += 1
        
        live_json_pattern = r'"url": "(https://cdn\.prod\.website-files\.com/[^"]+)"[^}]*"type": "image"'
        live_json_matches = re.findall(live_json_pattern, live_html)
        
        if json_count <= len(live_json_matches):
            live_url = live_json_matches[json_count - 1]
            filename = live_url.split('/')[-1]
            local_path = f"{local_img_prefix}/{filename.replace('%20', ' ')}"
            return f'"url": "{local_path}",\n      "type": "image"'
        return match.group(0)
    
    json_pattern = r'"url": "",\s*"type": "image"'
    fixed_html = re.sub(json_pattern, replace_json_url, fixed_html)
    
    with open(local_path, 'w') as f:
        f.write(fixed_html)
    
    print(f"Fixed {local_path}: {img_count} img src, {json_count} json urls")
    return img_count

fix_gallery_html(
    '/home/agent/avir/site/galleries/commercial/index.html',
    'https://www.avir.com/galleries/commercial',
    '/images/galleries/commercial'
)

fix_gallery_html(
    '/home/agent/avir/site/galleries/lifestyle/index.html',
    'https://www.avir.com/galleries/lifestyle',
    '/images/galleries/lifestyle'
)

fix_gallery_html(
    '/home/agent/avir/site/galleries/home-cinema/index.html',
    'https://www.avir.com/galleries/home-cinema',
    '/images/galleries/home-cinema'
)

print("\nAll galleries fixed!")
