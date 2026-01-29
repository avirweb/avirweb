# AVIR Live Website Analysis

**Analysis Date:** 2026-01-29  
**URL Analyzed:** https://www.avir.com/  
**Screenshot:** `/home/agent/avir/analysis/live-homepage.png`

---

## Executive Summary

The AVIR website is a luxury smart home solutions site built on **Webflow** and hosted on **Cloudflare Pages** (via avirwebtest.pages.dev). The site successfully loads and displays content for the Coachella Valley-based home automation company.

**Key Finding:** The www.avir.com domain redirects to avirwebtest.pages.dev, which appears to be a test/staging environment that is currently experiencing a 522 (Connection Timed Out) error. However, accessing via http://avir.com properly redirects to https://www.avir.com/ and loads successfully.

---

## Screenshot

Full-page screenshot saved to: `/home/agent/avir/analysis/live-homepage.png`

The screenshot shows:
- Hero section with "SOUND & VISION" branding
- "OUR PROCESS" section
- "PROFESSIONAL PARTNERS" section with Interior Designers, Architects, Builders
- "ENGAGE THE EXPERTS" contact form
- Footer with navigation, services, and location information

---

## Page Structure Analysis

### DOM Structure Summary

The page follows a standard Webflow-generated structure:

```
- Header/Navigation
  - AVIR Logo (SVG)
  - Menu Button
- Main Content
  - Hero Section (Video background)
  - Process Section (7-step process)
  - Professional Partners Section
  - Contact Form Section
- Footer
  - Contact Information
  - Navigation Links
  - Services Links
  - Service Area Cities
```

### Navigation Links

**Main Navigation:**
- Home (`/`)
- Services (`/services`)
- Brands (`/brands`)
- Exciting Products (`/exciting-new-products`)
- Portfolio (`/portfolio`)
- About (`/about-avir`)
- Careers (`/careers`)
- Contact (`/contact`)

**Services Section Links:**
- Home Cinema (`/services#home-cinema`)
- Automation (`/services#automation`)
- Lighting (`/services#lighting`)
- Shading (`/services#shading`)
- Music (`/services#music`)
- Security (`/services#security`)
- Networking (`/services#networking`)

**Professional Partners:**
- Interior Designers (`/processes#interior-designers`)
- Architects (`/processes#architects`)
- Builders (`/processes#builders`)

**Service Area Cities (27 cities):**
Banning, Beaumont, Bermuda Dunes, Big Bear, Cathedral City, Coachella, Idyllwild, Indian Wells, Indio, Joshua Tree, La Quinta, Lake Arrowhead, Moreno Valley, Murrieta, Palm Desert, Palm Springs, Rancho Mirage, Redlands, Riverside, San Bernardino, Temecula, Thermal, Thousand Palms, Yucaipa, Yucca Valley

---

## CSS Files Loaded

### External Stylesheets
1. **Main CSS:** `https://cdn.prod.website-files.com/61aeaa63fc373a25c198ab33/css/avir-site.shared.15a241810.css`
2. **Google Fonts:** `https://fonts.googleapis.com/css?family=Manrope:300,regular,600`

### Fonts Loaded
- **Manrope** (Google Fonts) - 300, 400, 600 weights
- **Adobe Typekit Fonts:**
  - n3 weight: `https://use.typekit.net/af/3a0b27/00000000000000007735b219/30/l`
  - n4 weight: `https://use.typekit.net/af/1d76ab/00000000000000007735b21c/30/l`
  - n5 weight: `https://use.typekit.net/af/3e72b6/00000000000000007735b21e/30/l`
  - n6 weight: `https://use.typekit.net/af/275a7d/00000000000000007735b220/30/l`

---

## JavaScript Files Loaded

### Core Libraries
1. **jQuery:** `https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js`
2. **WebFont Loader:** `https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js`
3. **Typekit:** `https://use.typekit.net/dqw5qdb.js`

### Webflow Generated Scripts
4. **Chunk 1:** `https://cdn.prod.website-files.com/61aeaa63fc373a25c198ab33/js/avir-site.schunk.36b8fb49256177c8.js`
5. **Chunk 2:** `https://cdn.prod.website-files.com/61aeaa63fc373a25c198ab33/js/avir-site.schunk.7f856e1c6c8f1316.js`
6. **Chunk 3:** `https://cdn.prod.website-files.com/61aeaa63fc373a25c198ab33/js/avir-site.schunk.b4435221be879eb3.js`
7. **Main:** `https://cdn.prod.website-files.com/61aeaa63fc373a25c198ab33/js/avir-site.86b83e24.08fc0919c2c74909.js`

### Third-Party Scripts
8. **Google Analytics (G-KV53ZP5CMM):** Google Tag Manager
9. **Google Ads (AW-918878069):** Conversion tracking
10. **Facebook Pixel:** `connect.facebook.net/en_US/fbevents.js`
11. **LiveChat:** `cdn.livechatinc.com/tracking.js`
12. **reCAPTCHA:** `www.google.com/recaptcha/api.js`

---

## Images and Media Assets

### Images
1. **AVIR Logo:** `AVIR logo website Final.svg` (100x28px)
2. **Service Icons (SVG):**
   - Completed_Home cinema.svg
   - Completed_Whole Home AV.svg
   - Completed_Lighting.svg
   - Completed_Shades.svg
   - Completed_Hone Audio.svg
   - Completed_Security.svg
   - Completed_Networkibng.svg
3. **Partners Image:** `Shutterstock Partners Pic 220502.jpg` (408x480px)
4. **Footer Logo:** `Full Logo in white.svg` (60x13px)

### Video
- **Background Video:** Dropbox-hosted MP4
  - URL: `https://www.dropbox.com/s/smwoyb18m04n2jn/Animation%20Longer%20Lines%20Website.mp4`
  - Alternative: `https://www.dropbox.com/scl/fi/r384keqzel08g0eg53s81/Animation-Longer-Lines-Website.mp4`

---

## Forms and Interactive Elements

### Contact Form ("Engage the experts")
- **Fields:**
  - Your name (text)
  - Project type (text)
  - Your email address (email)
  - Budget (text)
- **Security:** Google reCAPTCHA v2 ("I'm not a robot")
- **Submit Button:** "Let's go"
- **Privacy Note:** "We will never share your information with third parties..."

### Interactive Elements
- Mobile menu button
- Navigation links
- Service area city links
- reCAPTCHA widget

---

## Network Requests Summary

**Total Requests:** 54

### By Type:
- **HTML:** 3 (redirects + final page)
- **CSS:** 2 stylesheets + Google Fonts
- **JavaScript:** 15+ scripts
- **Images:** 10 images
- **Video:** 1 video file (Dropbox)
- **Analytics/Tracking:** 10+ requests
- **Fonts:** 6 font files (Typekit + Google Fonts)

### Key External Domains:
- `cdn.prod.website-files.com` (Webflow CDN)
- `fonts.googleapis.com` / `fonts.gstatic.com`
- `use.typekit.net` (Adobe Fonts)
- `www.googletagmanager.com`
- `www.google-analytics.com`
- `connect.facebook.net`
- `cdn.livechatinc.com`
- `www.dropbox.com`
- `d3e54v103j8qbb.cloudfront.net` (jQuery CDN)

---

## Console Errors Found

### Error 1: Attribution Reporting
```
[ERROR] Attestation check for Attribution Reporting on https://www.google-analytics.com failed.
```
**Severity:** Low - Analytics feature limitation

### Error 2: LiveChat License Expired
```
Uncaught (in promise) Error: License expired
    at <anonymous> (https://cdn.livechatinc.com/tracking.js:0:27072)
```
**Severity:** Medium - LiveChat widget non-functional

---

## Key Observations

### Site Architecture
1. **Platform:** Webflow (evident from website-files.com CDN)
2. **Hosting:** Cloudflare Pages (avirwebtest.pages.dev)
3. **Domain:** www.avir.com redirects to Pages domain
4. **SSL:** HTTPS enabled with valid certificate

### Content Structure
1. **Business Type:** Luxury smart home automation (Coachella Valley)
2. **Services:** 7 main service categories
3. **Target Audience:** Homeowners + Professional partners (designers, architects, builders)
4. **Service Area:** 27 cities in Coachella Valley and surrounding areas

### Technical Characteristics
1. **Responsive:** Mobile menu present
2. **Performance:** Uses chunked JS loading
3. **SEO:** Proper heading hierarchy (h1, h2, h3, h4)
4. **Accessibility:** Alt tags on images, semantic HTML
5. **Analytics:** Google Analytics 4 + Google Ads + Facebook Pixel
6. **Security:** reCAPTCHA on forms

### Potential Issues
1. **LiveChat License Expired** - Chat widget not functional
2. **Test Domain in Production** - avirwebtest.pages.dev suggests staging
3. **522 Error on Direct Access** - Direct access to pages.dev times out
4. **External Video Hosting** - Video hosted on Dropbox (not CDN)

### Redirect Chain
```
http://avir.com → https://avir.com → https://www.avir.com/
```

---

## Comparison Notes for Cloudflare Migration

### What Works Well
- Clean Webflow-generated HTML/CSS
- Proper asset organization on CDN
- SSL/HTTPS properly configured
- Mobile-responsive design

### Areas of Concern
1. **External Dependencies:**
   - Dropbox-hosted video
   - Multiple third-party scripts (analytics, chat, reCAPTCHA)
   - Adobe Typekit fonts

2. **Dynamic Elements:**
   - Contact form with reCAPTCHA
   - LiveChat integration (currently broken)
   - Google Analytics events

3. **Asset Hosting:**
   - Main assets on website-files.com (Webflow CDN)
   - Fonts from multiple sources
   - Video from Dropbox

### Recommendations for Static Mirror
1. Download all assets from website-files.com CDN
2. Host video locally or use Cloudflare Stream
3. Replace dynamic form with static form or form service
4. Document all third-party integrations
5. Test all navigation links post-migration

---

## File Locations

- **Screenshot:** `/home/agent/avir/analysis/live-homepage.png`
- **Network Requests:** `/home/agent/avir/analysis/network-requests.txt`
- **Console Messages:** `/home/agent/avir/analysis/console-messages.txt`

---

*Analysis completed on 2026-01-29*
