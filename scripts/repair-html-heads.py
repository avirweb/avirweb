#!/usr/bin/env python3
"""
Repair HTML files in site/ directory by restoring missing head tags.

This script inserts the missing viewport, CSS, script, and favicon tags
that were accidentally deleted from the <head> section of HTML files.

Usage:
    python scripts/repair-html-heads.py --dry-run    # Preview changes
    python scripts/repair-html-heads.py              # Apply changes
"""

import os
import sys
import argparse
from pathlib import Path
import re


# The block of HTML to insert (without the opening <style> tag at the end)
HEAD_TAGS_BLOCK = '''<meta content="width=device-width, initial-scale=1" name="viewport"/><link href="/css/avir-site.shared.15a241810.css" rel="stylesheet" type="text/css"/><link href="https://fonts.googleapis.com" rel="preconnect"/><link href="https://fonts.gstatic.com" rel="preconnect"/><script src="https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js" type="text/javascript"></script><script type="text/javascript">WebFont.load({  google: {    families: ["Manrope:300,regular,600"]  }});</script><script src="https://use.typekit.net/dqw5qdb.js" type="text/javascript"></script><script type="text/javascript">try{Typekit.load();}catch(e){}</script><script type="text/javascript">!function(o,c){var n=c.documentElement,t=" w-mod-";n.className+=t+"js",("ontouchstart"in o||o.DocumentTouch&&c instanceof DocumentTouch)&&(n.className+=t+"touch")}(window,document);</script><link href="/images/61aeaa63fc373a25c198ab33_63615767e74213730c40ab8a_AVIR Favicon.png" rel="shortcut icon" type="image/x-icon"/><link href="/images/61aeaa63fc373a25c198ab33_6361576fab509500a09d952b_Webclip.png" rel="apple-touch-icon"/><script src="https://www.google.com/recaptcha/api.js" type="text/javascript"></script><style>'''


def find_html_files(site_dir):
    """Recursively find all HTML files in the site directory."""
    html_files = []
    for root, dirs, files in os.walk(site_dir):
        for file in files:
            if file.endswith('.html'):
                html_files.append(os.path.join(root, file))
    return sorted(html_files)


def needs_repair(content):
    """
    Check if the HTML file needs repair.
    
    A file needs repair if it's missing the viewport meta tag or the CSS link.
    """
    has_viewport = 'name="viewport"' in content
    has_css_link = '/css/avir-site.shared.15a241810.css' in content
    
    return not (has_viewport and has_css_link)


def repair_html(content):
    """
    Repair the HTML content by inserting missing head tags.
    
    Strategy:
    1. Look for the canonical link tag
    2. Insert the missing tags right after it
    3. If no canonical link, look for the .page-content CSS block and insert before it
    """
    
    # Pattern 1: Insert after canonical link
    # Match: <link rel="canonical" href="..."/>
    canonical_pattern = r'(<link rel="canonical" href="[^"]*"/>)\s*'
    
    if re.search(canonical_pattern, content):
        # Insert after canonical link, before any existing content
        repaired = re.sub(
            canonical_pattern,
            r'\1\n' + HEAD_TAGS_BLOCK + '\n',
            content,
            count=1
        )
        return repaired
    
    # Pattern 2: Insert before .page-content CSS block
    # Match: .page-content {opacity:0; transform: translate(-20px);}
    page_content_pattern = r'(\.page-content \{opacity:0; transform: translate\(-20px\);\})'
    
    if re.search(page_content_pattern, content):
        # Insert before the .page-content block
        repaired = re.sub(
            page_content_pattern,
            HEAD_TAGS_BLOCK + '\n' + r'\1',
            content,
            count=1
        )
        return repaired
    
    # If neither pattern found, return original content unchanged
    return content


def process_file(filepath, dry_run=False):
    """
    Process a single HTML file.
    
    Returns:
        tuple: (was_modified, error_message)
    """
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            original_content = f.read()
        
        # Check if repair is needed
        if not needs_repair(original_content):
            return (False, None)
        
        # Repair the content
        repaired_content = repair_html(original_content)
        
        # Check if anything changed
        if repaired_content == original_content:
            return (False, "Could not find insertion point")
        
        # Write back if not dry-run
        if not dry_run:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(repaired_content)
        
        return (True, None)
    
    except Exception as e:
        return (False, str(e))


def main():
    parser = argparse.ArgumentParser(
        description='Repair HTML files by restoring missing head tags'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Preview changes without modifying files'
    )
    parser.add_argument(
        '--site-dir',
        default='site',
        help='Path to site directory (default: site)'
    )
    
    args = parser.parse_args()
    
    # Resolve site directory path
    site_dir = Path(args.site_dir)
    if not site_dir.exists():
        print(f"Error: Site directory '{site_dir}' does not exist")
        sys.exit(1)
    
    # Find all HTML files
    print(f"Scanning for HTML files in {site_dir}...")
    html_files = find_html_files(site_dir)
    print(f"Found {len(html_files)} HTML files\n")
    
    if args.dry_run:
        print("DRY RUN MODE - No files will be modified\n")
    
    # Process each file
    modified_count = 0
    skipped_count = 0
    error_count = 0
    
    for filepath in html_files:
        rel_path = os.path.relpath(filepath, site_dir)
        was_modified, error = process_file(filepath, dry_run=args.dry_run)
        
        if error:
            print(f"⚠️  ERROR: {rel_path}")
            print(f"    {error}")
            error_count += 1
        elif was_modified:
            status = "WOULD MODIFY" if args.dry_run else "MODIFIED"
            print(f"✓ {status}: {rel_path}")
            modified_count += 1
        else:
            skipped_count += 1
    
    # Summary
    print(f"\n{'=' * 60}")
    print("SUMMARY")
    print(f"{'=' * 60}")
    print(f"Total files scanned:  {len(html_files)}")
    print(f"Files modified:       {modified_count}")
    print(f"Files skipped:        {skipped_count}")
    print(f"Errors:               {error_count}")
    
    if args.dry_run and modified_count > 0:
        print(f"\nRun without --dry-run to apply changes")
    
    return 0 if error_count == 0 else 1


if __name__ == '__main__':
    sys.exit(main())
