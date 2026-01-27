import os
import re

SCRIPTS_BLOCK = (
    '<script src="https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js?site=61aeaa63fc373a25c198ab33" type="text/javascript"></script>'
    '<script src="/js/avir-site.schunk.36b8fb49256177c8.js" type="text/javascript"></script>'
    '<script src="/js/avir-site.schunk.7f856e1c6c8f1316.js" type="text/javascript"></script>'
    '<script src="/js/avir-site.schunk.b4435221be879eb3.js" type="text/javascript"></script>'
    '<script src="/js/avir-site.86b83e24.08fc0919c2c74909.js" type="text/javascript"></script>'
)

def repair_footer(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove existing local JS includes to avoid duplicates
    content = re.sub(r'<script src="/js/avir-site\.[^"]+\.js"[^>]*></script>', '', content)
    # Remove the jquery include if it's local
    content = re.sub(r'<script src="/js/jquery[^"]+\.js"[^>]*></script>', '', content)
    # Remove the Cloudfront jquery if it's there (we will re-add it)
    content = re.sub(r'<script src="https://d3e54v103j8qbb\.cloudfront\.net/js/jquery[^"]+"[^>]*></script>', '', content)

    if '</body>' in content:
        new_content = content.replace('</body>', SCRIPTS_BLOCK + '</body>')
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

for root, dirs, files in os.walk('site'):
    for file in files:
        if file.endswith('.html'):
            path = os.path.join(root, file)
            if repair_footer(path):
                print(f"Repaired footer: {path}")

