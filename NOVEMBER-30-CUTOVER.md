# November 30 — NSPDM Cutover Checklist (Manitou)

## Before you start
- Confirm with TOM that the NSPDM booking page is live and taking reservations
- Confirm staging looks correct at https://manitou-stage.onrender.com
- Confirm `bookingOpen: true` is set in the NSPDM feed for Manitou listings

## Steps

### 1. Merge staging → main (pushes to production)
```
git checkout main
git merge staging
git push
git checkout staging
```

### 2. Update the GitHub Actions workflow
In `.github/workflows/sync-guesty.yml`, make these changes:

**Change the job name/title** (optional but clear):
```yaml
name: Sync NSPDM Listings
```

**Change the sync script line** from:
```
run: python3 scripts/sync-guesty.py
```
to:
```
run: python3 scripts/sync-nspdm.py
```

**Replace the env vars block** — change:
```yaml
GUESTY_CLIENT_ID: ${{ secrets.GUESTY_CLIENT_ID }}
GUESTY_CLIENT_SECRET: ${{ secrets.GUESTY_CLIENT_SECRET }}
```
to:
```yaml
NSPDM_CLIENT_ID: ${{ secrets.NSPDM_CLIENT_ID }}
NSPDM_SECRET: ${{ secrets.NSPDM_SECRET }}
```

**Update the notification messages** — change "Guesty" to "NSPDM" in the notify steps.

### 3. Add GitHub secrets
In the repo settings (Settings → Secrets → Actions), add:
- `NSPDM_CLIENT_ID` = `nspdm_125ddce54453382a64`
- `NSPDM_SECRET` = (the secret TOM sent)

### 4. Trigger a manual sync
In GitHub Actions, run the sync workflow manually to confirm it pulls from NSPDM and updates `listings.json` cleanly.

### 5. Verify production
- Check https://manitoulodge.com — listings loading correctly, photos from Supabase CDN
- Click a "Book Now" button — should go to `app.nspdm.com/book/manitou-lodge`
- Check the footer version number to confirm the deploy completed

## Notes
- The new sync script is `scripts/sync-nspdm.py` (already on staging/main after merge)
- The old `scripts/sync-guesty.py` can be deleted after cutover is confirmed stable
- Same NSPDM client ID is used for both WCBNW and Manitou — TOM confirmed this is fine
- TOM mentioned thumbnails are portrait crops — flag to him if you want landscape thumbnails
