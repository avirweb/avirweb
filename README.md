# Static Website Mirror → Cloudflare Pages

This repo mirrors a public website into `site/` and deploys that static output on Cloudflare Pages (no app runtime).

## What this is

A static snapshot of upstream HTML/CSS/JS/assets. It is intended for simple, cacheable content without server-side logic.

## Limitations (Scenario B mirror)

- SPAs/SSR apps may not mirror correctly (client-side routes, API calls, auth).
- Personalized/dynamic content will not be captured reliably.
- Absolute links and canonical URLs may still point to the origin.
- You must have rights to mirror and rehost the content.

## Mirror a site

```bash
./scripts/mirror.sh https://example.com
```

Optional flags:

```bash
./scripts/mirror.sh --clean https://example.com
./scripts/mirror.sh --extra-domains cdn.example.com,images.examplecdn.com https://example.com
```

Output goes to `site/`.

## Serve locally

```bash
./scripts/serve.sh
```

Smoke test:

```bash
./scripts/smoke.sh
```

## Playwright browser dependencies

Playwright's `install-deps` helper only supports `apt-get`, `dnf`, and `yum`, so it fails on distributions such as Arch Linux (the builder VM here). Instead run:

```bash
sudo ./scripts/install-playwright-deps.sh
```

The script detects the available package manager (`apt-get`, `dnf`, `yum`, or `pacman`) and installs the libraries Chromium needs. After the dependencies are in place you can run `npx playwright install` (and `npx playwright install-deps chromium` if you still want to run the Playwright helper) without shared-library errors.

## Cloudflare Pages settings

- Production branch: `main`
- Build command: `exit 0`
- Publish directory: `site`

## Custom domains

Attach the domain in Pages first, then update DNS per Cloudflare instructions (CNAME to `*.pages.dev` for subdomains; apex usually requires Cloudflare nameservers).

## Redirects and headers

Place in the publish root:

- `site/_redirects`
- `site/_headers`

Note: `_redirects`/`_headers` apply to static assets only, not Pages Functions.

## Committing mirrored output

Pros:

- Deterministic deploys (Pages publishes what you reviewed).
- No dependency on upstream during deploy.
- Easy rollback with `git revert`.

Cons:

- Repo history grows quickly.
- Large binary assets can bloat the repo.

Default recommendation: **commit `site/`** for predictable deployments. If repo growth becomes a problem, move mirrors to a separate repo or generate in CI and ignore `site/` locally.
