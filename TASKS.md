# Manitou — Project Task List

## 1. Scrape Existing Site ✓
- [x] Download manitoulodge.com for content reference (copy, page structure, images)
- [x] Extract sitemap and identify all pages
- [x] Identify content to carry forward vs. replace with designer's new copy

## 2. Home Page ✓ (complete)
- [x] Nav partial — desktop + hamburger mobile, Accommodations dropdown
- [x] Footer partial — contact info, nav links, version number
- [x] Hero section — "Escape to the Forest", BOOK NOW, lodge photo
- [x] Welcome / About section — Hemlock + Manitou Sign photos, centered text
- [x] Our Spaces section — 5-category grid, live pricing from listings.json, links to accommodations sections
- [x] Rainforest & Coast section — wcb-2.jpg background, green box, copy
- [x] Come In From The Rain — 3-column layout, Direct Booking Benefits
- [x] Instagram strip — amber panel linking to @manitou_lodge, 4 IG photos from saved pages
- [ ] **Lantern illustration** — get asset from designer, add to Come In From The Rain column 1
- [ ] **Instagram live feed** — requires IG Business/Creator account + Facebook App (LightWidget recommended when login available)
- [ ] Mobile QA at 375px width

## 3. Static Pages ✓ (all built)
- [x] `accommodations.html` — sticky cat nav, carousels, dropdown, unique descriptions, cream cards
- [x] `about.html` — history, property features, distances, beaches, Hoh Rainforest
- [x] `policies.html` — rates, check-in/out, cancellations, pets, groups
- [x] `specials.html` — coming soon page
- [x] `contact.html` — info panel + Formspree form + feature strip
- [ ] **Formspree endpoint** — sign up at formspree.io, replace `XXXXXXXX` in `contact.html` form action with real endpoint ID
- [ ] Mobile QA all pages

## 4. Guesty Integration ✓
- [x] `scripts/sync-guesty.py` — fetches listings, writes `listings.json`
- [x] `NEW/data/listings.json` — 26 listings, 5 categories, photos + pricing
- [x] Property cards use unique per-property descriptions (first paragraph of Guesty description field)
- [x] Home page prices pulled live from listings.json

## 5. GitHub Actions — Nightly Guesty Sync
- [ ] Copy `.github/workflows/sync-guesty.yml` from WCBNW
- [ ] Add secrets: `GUESTY_CLIENT_ID` + `GUESTY_CLIENT_SECRET` (repo Settings → Secrets → Actions)
- [ ] Trigger manually via `workflow_dispatch` to verify end-to-end

## 6. Final QA
- [ ] Mobile QA full site at 375px width
- [ ] Confirm all nav links work on every page
- [ ] Verify Formspree form submits correctly (after endpoint is set)
- [ ] Check Render deploy — version number in footer matches latest push
