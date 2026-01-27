#!/usr/bin/env python3
"""
Repair HTML file by applying localization fixes:
1. Convert CDN URLs to root-relative paths
2. Remove SRI integrity and crossorigin attributes
3. Add missing meta tags (description, og:title, etc.)
"""

import re
import sys

def repair_html(html_content):
    """Apply all necessary fixes to HTML content."""
    
    # 1. Convert CDN CSS URLs to root-relative
    html_content = re.sub(
        r'https://cdn\.prod\.website-files\.com/61aeaa63fc373a25c198ab33/css/',
        '/css/',
        html_content
    )
    
    # 2. Convert CDN image URLs to root-relative
    # Handle main site images
    html_content = re.sub(
        r'https://cdn\.prod\.website-files\.com/61aeaa63fc373a25c198ab33/',
        '/images/61aeaa63fc373a25c198ab33_',
        html_content
    )
    
    # Handle blog post images (different CDN path)
    html_content = re.sub(
        r'https://cdn\.prod\.website-files\.com/61d85621390c3d3f845db5b4/',
        '/images/61d85621390c3d3f845db5b4_',
        html_content
    )
    
    # Handle third-party images (dunclyde logo, etc.)
    html_content = re.sub(
        r'https://cdn\.prod\.website-files\.com/([^/]+)/',
        r'/images/\1_',
        html_content
    )
    
    # 3. Remove integrity attributes
    html_content = re.sub(
        r'\s+integrity="[^"]*"',
        '',
        html_content
    )
    
    # 4. Remove crossorigin attributes
    html_content = re.sub(
        r'\s+crossorigin="[^"]*"',
        '',
        html_content
    )
    
    # Also handle crossorigin without value
    html_content = re.sub(
        r'\s+crossorigin(?=\s|>|/>)',
        '',
        html_content
    )
    
    # 5. Fix title tag (production has generic "AVIR", we need specific title)
    # Extract the item slug from data-wf-item-slug
    slug_match = re.search(r'data-wf-item-slug="([^"]+)"', html_content)
    if slug_match:
        slug = slug_match.group(1)
        # Convert slug to title (capitalize words, replace hyphens)
        title = ' '.join(word.capitalize() for word in slug.split('-'))
        
        # Replace generic AVIR title with specific title
        html_content = re.sub(
            r'<title>AVIR</title>',
            f'<title>{title}</title>',
            html_content
        )
    
    # 6. Add missing meta tags after <title> if they don't exist
    # Check if description meta exists
    if 'name="description"' not in html_content:
        # Extract title for description
        title_match = re.search(r'<title>([^<]+)</title>', html_content)
        if title_match:
            title = title_match.group(1)
            # Insert description after title
            html_content = re.sub(
                r'(<title>[^<]+</title>)',
                r'\1<meta content="' + title + '" name="description"/>',
                html_content
            )
    
    # 7. Add og:title if missing
    if 'property="og:title"' not in html_content:
        title_match = re.search(r'<title>([^<]+)</title>', html_content)
        if title_match:
            title = title_match.group(1)
            # Find the description meta and add og:title after it
            html_content = re.sub(
                r'(<meta content="[^"]*" name="description"/>)',
                r'\1\n<meta content="' + title + '" property="og:title"/>',
                html_content
            )
    
    # 8. Fix canonical URL to use avir.com (not www.avir.com)
    html_content = re.sub(
        r'href="https://www\.avir\.com/',
        'href="https://avir.com/',
        html_content
    )
    
    return html_content

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Usage: repair-html.py <input_file> <output_file>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    with open(input_file, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    repaired_html = repair_html(html_content)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(repaired_html)
    
    print(f"Repaired HTML written to {output_file}")
