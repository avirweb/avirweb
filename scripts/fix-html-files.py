#!/usr/bin/env python3
"""
Script to fix all HTML files in the site directory.
Applies the following fixes:
1. Replace Typekit fonts with Google Fonts
2. Fix CSS paths to use CDN
3. Fix image paths to use CDN
4. Fix visibility CSS issues
5. Fix jQuery to use CDN version
"""

import os
import re
import glob

SITE_DIR = "/home/agent/avir/site"

# CDN base URL for Webflow assets
CDN_BASE = "https://cdn.prod.website-files.com/61aeaa63fc373a25c198ab33"

GOOGLE_FONTS_LINK = '''<link href="https://fonts.googleapis.com" rel="preconnect"/>
  <link href="https://fonts.gstatic.com" rel="preconnect" crossorigin="anonymous"/>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;600&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet"/>
  <style>
    .tk-termina, [class*="termina"], .nav-link { font-family: 'Manrope', sans-serif !important; }
    .page-content { opacity: 1 !important; transform: translate(0px) !important; pointer-events: auto !important; }
    .dept__item, .dept__heading, .dept__para, .dept__line { opacity: 1 !important; transform: none !important; }
    .hero-anim-wrap { display: none !important; }
    .left-bar { display: block !important; }
    .nav__site-logo-inner { height: 40px !important; width: auto !important; }
    .brands__product-image { display: block !important; }
  </style>'''

def fix_title(title):
    if not title:
        return "AVIR"
    title = title.strip()
    if title == "AVIR | Luxury Smart Home Solutions":
        return title
    if title.startswith("AVIR |") or title.startswith("AVIR:"):
        return title
    if title == "AVIR":
        return "AVIR | Luxury Smart Home Solutions"
    return f"AVIR | {title}"

def fix_html_file(filepath):
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    original_content = content
    
    def replace_title(match):
        old_title = match.group(1)
        new_title = fix_title(old_title)
        return f'<title>{new_title}</title>'
    
    content = re.sub(r'<title>([^<]*)</title>', replace_title, content)
    
    # 1. Remove Typekit scripts
    content = re.sub(
        r'<script src="https://use\.typekit\.net/[^"]+\.js"[^>]*></script>\s*<script[^>]*>try\{Typekit\.load\(\);\}catch\(e\)\{\}</script>',
        '',
        content,
        flags=re.DOTALL
    )
    
    # Also handle the WebFont.load pattern followed by Typekit
    content = re.sub(
        r'<script src="https://ajax\.googleapis\.com/ajax/libs/webfont/[^"]+/webfont\.js"[^>]*></script>\s*<script[^>]*>WebFont\.load\(\{[^}]+\}\);</script>\s*<script src="https://use\.typekit\.net/[^"]+\.js"[^>]*></script>\s*<script[^>]*>try\{Typekit\.load\(\);\}catch\(e\)\{\}</script>',
        '',
        content,
        flags=re.DOTALL
    )
    
    # 2. Fix CSS paths - replace local /css/ with CDN
    content = re.sub(
        r'href="/css/(avir-site\.[^"]+\.css)"',
        f'href="{CDN_BASE}/css/\\1"',
        content
    )
    
    def fix_image_path(img_path):
        if img_path.startswith('61aeaa63fc373a25c198ab33_'):
            return f'{CDN_BASE}/{img_path[len("61aeaa63fc373a25c198ab33_"):]}'
        else:
            return f'{CDN_BASE}/{img_path}'
    
    content = re.sub(
        r'src="/images/([^"]+)"',
        lambda m: f'src="{fix_image_path(m.group(1))}"',
        content
    )
    
    content = re.sub(
        r'content="/images/([^"]+)"',
        lambda m: f'content="{fix_image_path(m.group(1))}"',
        content
    )
    
    content = re.sub(
        r'href="/images/(61aeaa63fc373a25c198ab33_[^"]+)"',
        lambda m: f'href="{fix_image_path(m.group(1))}"',
        content
    )
    
    content = re.sub(
        rf'{CDN_BASE}/61aeaa63fc373a25c198ab33_',
        f'{CDN_BASE}/',
        content
    )
    
    old_google_fonts = r'<link href="https://fonts\.googleapis\.com"[^>]*>\s*<link href="https://fonts\.gstatic\.com"[^>]*>\s*<link href="https://fonts\.googleapis\.com/css2[^>]*>\s*<style>\s*\.tk-termina[^<]*</style>'
    content = re.sub(old_google_fonts, GOOGLE_FONTS_LINK, content, flags=re.DOTALL)
    
    if 'fonts.googleapis.com/css2' not in content:
        viewport_pattern = r'(<meta content="width=device-width, initial-scale=1" name="viewport"/>)'
        if re.search(viewport_pattern, content):
            content = re.sub(
                viewport_pattern,
                f'\\1\n  {GOOGLE_FONTS_LINK}',
                content
            )
    
    # 6. Fix visibility CSS - replace opacity:0 with opacity:1
    content = re.sub(
        r'\.page-content\s*\{opacity:\s*0;',
        '.page-content {opacity:1;',
        content
    )
    content = re.sub(
        r'transform:\s*translate\(-20px\)',
        'transform: translate(0px)',
        content
    )
    
    # 7. Add left-bar visibility fix if not present
    if '.left-bar { display: block' not in content:
        # Find the page-content style block and add left-bar fix
        content = re.sub(
            r'(\.page-content \{opacity:1[^}]+\})',
            '\\1\n    .left-bar { display: block !important; }',
            content
        )
    
    # 8. Fix jQuery to use CDN version
    content = re.sub(
        r'<script src="/js/jquery-3\.5\.1\.min\.js"[^>]*></script>',
        '<script src="https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js?site=61aeaa63fc373a25c198ab33" type="text/javascript" integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=" crossorigin="anonymous"></script>',
        content
    )
    
    # 9. Fix Webflow JS to use CDN version
    content = re.sub(
        r'<script src="/js/webflow\.js"[^>]*></script>',
        '<script src="https://cdn.prod.website-files.com/js/webflow.js" type="text/javascript"></script>',
        content
    )
    
    # 10. Fix Webflow chunk JS files to use CDN
    content = re.sub(
        r'<script src="/js/(avir-site\.[^"]+\.js)"',
        f'<script src="{CDN_BASE}/js/\\1"',
        content
    )
    
    content = re.sub(
        r'src="/videos/hero-animation\.mp4"',
        'src="https://www.dropbox.com/s/smwoyb18m04n2jn/Animation%20Longer%20Lines%20Website.mp4?raw=1"',
        content
    )
    
    content = re.sub(
        r'<!-- Start of LiveChat.*?<!-- End of LiveChat code -->',
        '',
        content,
        flags=re.DOTALL
    )
    
    jquery_transition_fix = '''<script>
(function() {
  function initTransitions() {
    if (typeof $ === "undefined" || typeof Webflow === "undefined") {
      setTimeout(initTransitions, 50);
      return;
    }
    var transitionTrigger = $(".transition-trigger");
    var introDurationMS = 1000;
    var exitDurationMS = 1000;
    var excludedClass = "no-transition";
    if (transitionTrigger.length > 0) {
      Webflow.push(function() { transitionTrigger.click(); });
      $("body").addClass("no-scroll-transition");
      setTimeout(function() { $("body").removeClass("no-scroll-transition"); }, introDurationMS);
    }
    $("a").on("click", function(e) {
      if ($(this).prop("hostname") == window.location.host && 
          $(this).attr("href").indexOf("#") === -1 &&
          !$(this).hasClass(excludedClass) && 
          $(this).attr("target") !== "_blank" && 
          transitionTrigger.length > 0) {
        e.preventDefault();
        $("body").addClass("no-scroll-transition");
        var transitionURL = $(this).attr("href");
        transitionTrigger.click();
        setTimeout(function() { window.location = transitionURL; }, exitDurationMS);
      }
    });
    window.onpageshow = function(event) { if (event.persisted) { window.location.reload(); } };
    setTimeout(function() {
      $(window).on("resize", function() {
        setTimeout(function() { $(".transition").css("display", "none"); }, 50);
      });
    }, introDurationMS);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTransitions);
  } else {
    initTransitions();
  }
})();
</script>'''
    
    content = re.sub(
        r'<script>\s*let transitionTrigger = \$\("[^"]+"\);.*?introDurationMS\);\s*</script>',
        jquery_transition_fix,
        content,
        flags=re.DOTALL
    )
    
    content = re.sub(
        r'<script>\s*\(function\(\)\s*\{\s*function tryInit\(\).*?setTimeout\(tryInit, 3000\);.*?\}\)\(\);\s*</script>',
        '',
        content,
        flags=re.DOTALL
    )
    
    content = re.sub(r'href="index\.html"', 'href="/"', content)
    content = re.sub(r'href="([^"]+)\.html"', r'href="/\1"', content)
    content = re.sub(r'href="//', 'href="/', content)
    
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    """Process all HTML files in the site directory."""
    html_files = glob.glob(os.path.join(SITE_DIR, "**/*.html"), recursive=True)
    
    modified_count = 0
    for filepath in html_files:
            
        try:
            if fix_html_file(filepath):
                print(f"Fixed: {filepath}")
                modified_count += 1
            else:
                print(f"No changes needed: {filepath}")
        except Exception as e:
            print(f"Error processing {filepath}: {e}")
    
    print(f"\nTotal files modified: {modified_count}")

if __name__ == "__main__":
    main()
