# AVIR Site Deployment Guide

## Cloudflare Pages Deployment

### 1. Environment Variables Required

Set these in Cloudflare Pages → Settings → Environment Variables:

| Variable | Description | How to Get |
|----------|-------------|------------|
| `TURNSTILE_KEY` | Turnstile secret key | [Create at Cloudflare Dashboard](https://dash.cloudflare.com/?to=/:account/turnstile) |
| `AZURE_APP_ID` | Microsoft Graph App ID | Azure Portal → App registrations |
| `AZURE_CLIENT_ID` | Azure Client ID | Same as AZURE_APP_ID |
| `AZURE_DIRECTORY_ID` | Azure Tenant ID | Azure Portal → Tenant properties |
| `AZURE_OBJECT_ID` | User Object ID | Azure Portal → Users |
| `AZURE_SECRET_ID` | Client Secret Value | Azure Portal → Certificates & secrets |

### 2. Update Turnstile Site Key

**Current**: Using test key `1x00000000000000000000AA` (always passes)

**Production**: Replace in `scripts/add-turnstile.sh` line 7:
```bash
TURNSTILE_SITE_KEY="YOUR_PRODUCTION_SITE_KEY"
```

Then re-run:
```bash
bash scripts/add-turnstile.sh
```

Get production site key from: https://dash.cloudflare.com/?to=/:account/turnstile

### 3. Deploy to Cloudflare Pages

```bash
cd /home/agent/avir
git add .
git commit -m "Deploy AVIR site with all fixes"
git push origin main
```

Cloudflare Pages will automatically deploy from the `main` branch.

### 4. Post-Deployment Checklist

- [ ] Test forms submit successfully
- [ ] Verify Turnstile CAPTCHA appears and validates
- [ ] Check email delivery to sales@avir.com and alvaro@avir.com
- [ ] Test clean URLs (e.g., `/services` not `/services.html`)
- [ ] Verify 404 page displays correctly
- [ ] Check sitemap.xml is accessible
- [ ] Test mobile responsiveness on real devices

### 5. Form Submission Flow

1. User fills form and completes Turnstile
2. Form POSTs to `/api/submit-form`
3. Cloudflare Pages Function validates Turnstile token
4. Function sends email via Microsoft Graph API
5. Email sent from `jnunn@avir.com` to recipients

### 6. Known Issues

**Non-Critical**:
- `t is not a function` error in Webflow IX2 animations (cosmetic, doesn't affect functionality)

## Files Modified

**Infrastructure**:
- `site/robots.txt` - SEO configuration
- `site/sitemap.xml` - 143 URLs
- `site/404.html` - Custom error page
- `site/_redirects` - Clean URL redirects
- `site/_worker.js` - Routing logic

**Scripts**:
- `scripts/fix-html-files.py` - Main site fixes (fonts, CDN paths, titles)
- `scripts/fix-forms.sh` - Form configuration
- `scripts/add-turnstile.sh` - Turnstile integration

**Forms Updated** (6 total):
- `site/index.html`
- `site/commercial-form.html`
- `site/residential-form.html`
- `site/service-request.html`
- `site/careers/assistant-technician.html`
- `site/careers/integration-technician.html`

**All HTML files** (144 total):
- Typekit → Google Fonts (Outfit, Manrope)
- Local paths → CDN URLs
- Page titles → `AVIR | {Subpage}`
- LiveChat removed
- CSS visibility fixes
