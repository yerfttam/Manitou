# Manitou — Project Task List

## 1. Scrape Existing Site ✓
- [x] Download manitoulodge.com for content reference (copy, page structure, images)
- [x] Extract sitemap and identify all pages
- [x] Identify content to carry forward vs. replace with designer's new copy

Content saved to `scraped-site/CONTENT-REFERENCE.md`. Old site has 4 real pages:
- **Home** — good copy, won't use much visually
- **About Us** (at `/internal`) — rich content on history, property, region; use for `about.html`
- **Policies** — solid, use largely as-is for `policies.html`
- **Contact** — minimal, use for contact section in footer / contact page

## 2. Build Home Page ← IN PROGRESS
Establishes the design system — colors, fonts, nav/footer partials — that all other pages inherit.

- [ ] Implement nav partial (`partials/nav.html`) with desktop + hamburger mobile
- [ ] Implement footer partial (`partials/footer.html`) with contact info and nav links
- [ ] Hero section — "Escape to the Forest" headline, BOOK NOW button, cabin photo
- [ ] Welcome / About section — two photos, body copy, BOOK NOW
- [ ] Our Spaces section — photo grid with room names and pricing
- [ ] Rainforest & Coast section — full-bleed photo, dark overlay text box
- [ ] Come In From The Rain section — lantern, copy, Direct Booking Benefits
- [ ] Photo strip and Instagram / Stay Connected block
- [ ] Mobile QA at 375px width
- [ ] Deploy and verify on Render

## 3. Build Static Pages
Nav/footer partials from step 2 make these straightforward.

- [ ] `about.html`
- [ ] `specials.html`
- [ ] `resources.html`
- [ ] `policies.html`
- [ ] Mobile QA all pages

## 4. Guesty Setup ✓
- [x] Confirm `GUESTY_CLIENT_ID` + `GUESTY_CLIENT_SECRET` — same credentials as WCBNW
- [x] Booking hostname confirmed: `manitoulodge.guestybookings.com`
- [x] Booking engine ID: `1197` (newer Next.js standalone app — no widget embed needed)
- [x] `scripts/sync-guesty.py` adapted from WCBNW (updated booking host)
- [x] `NEW/property-map.txt` created — 26 active listings across 5 categories
- [x] `NEW/data/listings.json` generated and verified (26 listings, all with photos + pricing)

**Categories:** Lodge Rooms (5) | Cottage Rooms (2) | Cabins (2) | A-Frames (2) | Camping And Tent Sites (15)
**Note:** Category names must avoid `/` — breaks the parser regex. Use "AND" instead.

## 5. Build Accommodations + Reservations Pages
- [ ] `accommodations.html` — property cards rendered from `listings.json`, organized by category, each linking to its Guesty booking URL
- [ ] `reservations.html`
- [ ] Mobile QA both pages

**No widget embed needed.** Manitou uses a newer standalone Guesty booking engine (Next.js app at `manitoulodge.guestybookings.com`, engine ID `1197`). Each property card links directly to its booking URL from `listings.json`.

## 6. GitHub Actions — Nightly Guesty Sync
Runs `sync-guesty.py`, commits and pushes `listings.json` if changed. `[skip ci]` prevents deploy loop. `workflow_dispatch` allows manual runs.

- [ ] Copy `.github/workflows/sync-guesty.yml` from WCBNW (no structural changes needed)
- [ ] Add GitHub Actions secrets: `GUESTY_CLIENT_ID` and `GUESTY_CLIENT_SECRET` — same values as WCBNW (repo Settings → Secrets → Actions)
- [ ] Confirm schedule: `cron: '0 3 * * *'` (3 AM UTC)
- [ ] Trigger manually via `workflow_dispatch` to verify end-to-end

## 7. Publish to Render + Final QA
- [ ] Confirm `render.yaml` is correctly configured (publish dir: `NEW`)
- [ ] Connect GitHub repo to Render
- [ ] Verify auto-deploy on push to `main`
- [ ] Confirm version number appears correctly in footer on live site
- [ ] Mobile QA full site at 375px width
