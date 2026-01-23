# Implementation Plan: Replicate "AVIR" Website to GitHub + Cloudflare Pages
Generated: 2026-01-23 15:50:28 UTC

## Goal
Replicate the existing public website named "AVIR" into (1) a GitHub repository and (2) a Cloudflare Pages deployment, covering two paths:

- Scenario A: You already have the source code (static site, SPA, or framework like Next/Vite/Astro).
- Scenario B: You only have the public live URL and need a static mirror (best-effort).

This plan assumes the local workspace starts empty.

## Research Summary
- Cloudflare Pages deploys from a repo root (or configured root directory for monorepos) and uploads a "build output directory" as the site. Git integration creates production + preview deployments per branch. Cloudflare notes you cannot switch a Git-integrated project to Direct Upload later. Source: Cloudflare Pages "Git integration" docs.
- Build configuration is defined by "build command" + "build directory"; Cloudflare publishes common presets (Vite: `npm run build` -> `dist`, Astro: `npm run build` -> `dist`, Next.js (static export): `npx next build` -> `out`, etc.) and suggests `exit 0` if you are not using a preset and have no build step. Source: Cloudflare Pages "Build configuration" docs.
- Redirect behavior for static assets is configured via a plain text `public/_redirects` (or equivalent static assets directory) and supports 200 "proxying" rules (useful for SPA fallbacks), with limits (2,000 static + 100 dynamic). `_redirects` is not applied to Pages Functions routes. Source: Cloudflare Pages "Redirects" docs.
- Header behavior for static assets is configured via `public/_headers`, but `_headers` is not applied to Pages Functions responses (SSR / functions must set headers in code). Source: Cloudflare Pages "Headers" docs.
- Custom domains must be associated in the Pages dashboard first; for apex domains you must move DNS (nameservers) to Cloudflare; for subdomains you add a CNAME to `<YOUR_SITE>.pages.dev`. CAA records can block certificate issuance. Source: Cloudflare Pages "Custom domains" docs.

## Existing Codebase Analysis
- No existing source files detected in the current workspace.
- No existing conventions to follow; this plan uses a conventional Pages-friendly repo layout and Cloudflare-supported config files (`_redirects`, `_headers`).

## Implementation Phases

### Phase 0: Choose Approach + Inventory the Current Site
**Files to modify:**
- None (discovery phase)

**Steps:**
1. Identify which scenario applies:
   - Scenario A if you have the source project (zip, repo, local folder, or build artifacts).
   - Scenario B if you only have the live URL and cannot obtain source.
2. Inventory the site capabilities (impacts feasibility and hosting choices):
   - Routes: static pages vs SPA routes vs SSR.
   - Forms: native form POSTs, third-party embeds, or custom APIs.
   - Any authenticated areas or dynamic personalized content.
   - Any API endpoints the frontend calls.
   - Existing redirects and canonical domains (www vs apex).

**Acceptance criteria:**
- [ ] You can state whether the site is static/SPA/SSR and whether it depends on server-side APIs.

### Phase 1: Create the GitHub Repository Skeleton (Applies to Both Scenarios)
**Files to add:**
- `README.md` - what this repo deploys, how to build locally, and how Pages is configured.
- `.gitignore` - typical ignores for the chosen stack.
- `public/_redirects` (or `static/_redirects`) - only if you need redirects/SPA routing.
- `public/_headers` (or `static/_headers`) - only if you need custom cache/security/indexing headers.

**Repo structure recommendation (pick the minimal one that matches your stack):**
- Plain static (no build):
  - `site/` (or `public/`) contains `index.html`, assets, `_redirects`, `_headers`.
- Vite/Astro/Eleventy/etc:
  - `src/` source
  - `public/` static assets copied into build output (place `_redirects`, `_headers`, `robots.txt`, `sitemap.xml` here)
  - Build output: `dist/` (or framework-specific)
- Next.js:
  - `app/` or `pages/` + `public/`
  - If static export: output `out/`
  - If SSR/edge: use Pages Functions via next-on-pages (see Phase 3)

**Git/GitHub steps:**
1. Create a new GitHub repo (prefer `avir` or `avir-site`).
2. Locally:
   - `git init`
   - add initial files (`README.md`, `.gitignore`)
   - first commit
   - add remote and push to `main`
3. Use branches/PRs for changes if you want Pages preview deployments.

**Acceptance criteria:**
- [ ] `main` branch exists on GitHub with a bootstrapped project layout.

### Phase 2A (Scenario A): Import and Validate the Real Source Code
**Files to modify:**
- Framework-specific; expect at least:
  - `package.json` (or equivalent)
  - framework config files (`vite.config.*`, `astro.config.*`, `next.config.*`, etc.)
  - `public/` and/or `static/` directory for `_redirects`/`_headers`.

**Steps:**
1. Copy the project source into the repo root (or a subfolder if you plan a monorepo).
2. Ensure local build works:
   - Node-based: `npm ci` then `npm run build` (or project-specific).
   - Static generators: run their build command.
3. Identify build output directory:
   - Vite/Astro/Vue: usually `dist`
   - Gatsby/Hugo: usually `public`
   - Next.js static export: `out`
4. Add Cloudflare Pages static config files (only if needed):
   - SPA fallback (common): in `public/_redirects`:
     - `/* /index.html 200`
     (This uses Pages' "proxying" redirect behavior; review SEO impact if many routes should be indexed differently.)
   - Security/caching headers in `public/_headers` (example patterns):
     - Fingerprinted assets: `/assets/*  Cache-Control: public, max-age=31556952, immutable`
     - Prevent indexing of `*.pages.dev`: `https://:project.pages.dev/*  X-Robots-Tag: noindex`
5. Commit and push.

**Acceptance criteria:**
- [ ] `npm run build` (or equivalent) succeeds locally.
- [ ] The build output directory is known and stable.

### Phase 2B (Scenario B): Produce a Static Mirror from the Live URL (Best-Effort)
**Files to add/modify:**
- A generated mirror folder, for example `mirror/` containing `index.html` + assets.

**Steps (best-effort; results depend on how the site is built):**
1. Confirm you have the right to mirror and redeploy the site (terms, copyright, robots policies).
2. Attempt an offline mirror using one of:
   - `wget` mirroring (works best for simple static sites):
     - Typical starting point:
       - `wget --mirror --page-requisites --convert-links --adjust-extension --no-parent https://example.com/`
   - HTTrack (often better at rewriting links and assets):
     - Use HTTrack GUI/CLI to download the site and fix link structure.
3. Validate completeness:
   - Open the mirrored `index.html` locally; confirm CSS/JS/images load.
   - Crawl common pages; confirm internal links do not point back to the origin domain unless intended.
4. If the site is a JS-rendered SPA and the mirroring tool captures only a shell HTML:
   - A static mirror will likely be incomplete unless you can generate a prerendered export.
   - Options: obtain source (preferred), or use a headless rendering snapshot pipeline (more complex; often fragile).
5. Place the final mirror in a clean deploy folder (recommended):
   - `site/` or `public/` (no build)
6. Add `public/_redirects` if you need SPA routing and you have a real `index.html` entry point:
   - `/* /index.html 200`
7. Commit and push.

**Acceptance criteria:**
- [ ] The mirrored site renders without missing assets.
- [ ] Primary navigation works on the mirrored deployment.

### Phase 3: Deploy to Cloudflare Pages (GitHub Integration)
**Files to modify:**
- None required for Pages itself (configuration is in the Cloudflare dashboard), but you may add:
  - `public/_redirects`
  - `public/_headers`
  - `functions/*` (if you add Pages Functions for forms/APIs)

**Steps:**
1. In Cloudflare Dashboard: Workers & Pages -> Create application -> Pages -> Connect to Git.
2. Select the GitHub repo and set:
   - Production branch: `main`.
   - Root directory (advanced):
     - Repo root for single-site repos.
     - Subdirectory for monorepos.
3. Configure build settings (examples; match your project):
   - No build/static HTML: Build command `exit 0` (or blank if you truly do not need a build step) and output directory `site` (or wherever your static files live).
   - Vite/Astro: Build command `npm run build`, output directory `dist`.
   - Next.js:
     - Static export: Build command `npx next build`, output directory `out`.
     - SSR/edge: Build command `npx @cloudflare/next-on-pages@1`, output directory `.vercel/output/static`.
4. Environment variables:
   - Add needed build-time variables in Settings -> Environment variables.
   - Prefer separate values per environment (Preview vs Production).
5. Deploy and verify the `*.pages.dev` URL.

**Acceptance criteria:**
- [ ] Production deployment succeeds from `main`.
- [ ] Preview deployments build on PR branches (if enabled).

### Phase 4: Custom Domains, Redirects, Caching, and External Dependencies
**Files to modify:**
- `public/_redirects` - canonical host redirects, path redirects, SPA fallback.
- `public/_headers` - cache/security/indexing headers for static assets.
- `functions/*` - if you need server behavior (forms, API, SSR headers).

**Steps:**
1. Attach custom domain in Pages first (Workers & Pages -> project -> Custom domains -> Set up a domain).
2. DNS setup:
   - Apex (example.com): move nameservers to Cloudflare; Pages will create the needed CNAME.
   - Subdomain (www.example.com or shop.example.com): add a CNAME pointing to `<YOUR_SITE>.pages.dev`.
   - Do not create the CNAME without also attaching it in Pages first (can cause 522 / verification failures).
3. Canonical domain redirects (example patterns):
   - Redirect `www` -> apex (or the reverse) using either `_redirects` or Cloudflare redirect features; prefer permanent `301`.
4. Forms:
   - If the original site used a server endpoint, you must re-home it:
     - Simplest: third-party form backend (Formspree, Basin, etc.).
     - Cloudflare-native: implement a Pages Function under `functions/`.
5. SSR / APIs:
   - If the original site relies on SSR or API routes, static-only hosting will not replicate behavior.
   - Use Pages Functions or separate Workers/APIs; remember `_redirects`/`_headers` do not apply to Functions responses.
6. Caching:
   - For immutable fingerprinted assets, use `_headers` cache-control rules.
   - Avoid long cache on `index.html` for SPAs unless you also do cache-busting.

**Acceptance criteria:**
- [ ] Custom domain active with valid TLS.
- [ ] Canonical host redirect works.
- [ ] Forms/APIs function or degrade gracefully.

## Testing Strategy
- Local:
  - Build locally and serve the build output (for SPA/frameworks) to catch missing base paths and asset URLs.
  - Validate that `_redirects` and `_headers` are present in the static assets directory that gets copied into the final build output.
- Pre-deploy checks:
  - Link check: ensure internal links are relative or point to the new domain.
  - Asset check: no 404s for CSS/JS/images/fonts.
- Post-deploy:
  - Smoke test on `*.pages.dev` and on the custom domain.
  - Verify SPA routing (deep links) if applicable.
  - Check response headers (cache-control, security headers, `X-Robots-Tag`) on representative routes.

## Risks & Considerations
- Scenario B is often incomplete for JS-rendered apps or sites requiring authenticated APIs; mirroring may capture only a shell HTML.
- Legal/terms/robots constraints can prohibit mirroring.
- Pages `_redirects`/`_headers` apply only to static asset responses, not Pages Functions; SSR/apps must set headers/redirects in code.
- SEO: using `/* /index.html 200` for SPAs can duplicate content unless routes are handled carefully.

## Estimated Complexity
- Scenario A (source available): Low to Medium (1-2 hours for a simple static site; 0.5-2 days for SSR/forms/APIs).
- Scenario B (URL-only mirror): Medium to High (can be quick for purely static; can be effectively infeasible for dynamic/SPA sites without source).
