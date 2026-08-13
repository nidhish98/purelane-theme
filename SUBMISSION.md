# Submission Runbook — AI Product Engineer Assignment

Steps to go from this repo to a submitted assignment. Target: done in ~30–60 min.

---

## 1. Dev store (once)

1. Create a free **Shopify Partner** account → https://partners.shopify.com
2. **Stores → Add store → Development store**, name it e.g. `purelane-dev`.
3. It ships with a clean **Dawn** install — leave Dawn as the theme.

## 2. Upload the theme

```bash
cd /Users/nidhishshetty/intern/purelane-theme
cd .. && zip -r purelane-theme.zip purelane-theme   # zip the folder
```

1. Admin → **Online Store → Themes → Add theme → Upload zip** → upload
   `purelane-theme.zip`.
2. On the uploaded theme card → **... → Publish** (or Customize → Publish).
3. Open **Customize** → confirm all five sections render with placeholder cards.

## 3. Seed products + metafields

1. **Settings → Custom data → Products** → create the two definitions in `METAFIELDS.md`
   (`custom.rating` decimal, `custom.reviews_count` integer).
2. **Products → Import** with the CSV in `METAFIELDS.md` (8 products incl. sold-out,
   no-image, long-title). Fix image paths or set images manually.
3. Tag products `best-seller`, `top-rated`, `new` as listed.
4. Reload the homepage → cards now show prices, pills, ratings, sold-out state.

## 4. Push the repo to GitHub

No `gh` CLI installed on this machine — use the web UI or install `gh`:

```bash
# Option A: web UI
#  1. github.com → New repository → name: purelane-theme (Private or Public) → Create
#  2. Run the "…or push an existing repository" commands it shows:

cd /Users/nidhishshetty/intern/purelane-theme
git remote add origin https://github.com/<you>/purelane-theme.git
git branch -M main
git push -u origin main
```

```bash
# Option B: install gh, then
brew install gh && gh auth login
gh repo create purelane-theme --source /Users/nidhishshetty/intern/purelane-theme --private --push
```

## 5. Share the dev store

Dev stores are password-protected by default. If the reviewer can't enter:

1. **Settings → Plan** → storefront password is auto-set on dev stores; send the
   store URL + that password.
2. Or add `nj@troopod.io` as a **collaborator**: Settings → Users → Invite (Staff).

## 6. Email the deliverables

To **nj@troopod.io** · Subject: `AI Product Engineer Assignment - Your Name`

Attach / link:
- Dev store URL + password
- GitHub repo link (`purelane-theme`, history intact)
- `METAFIELDS.md` (metafield definitions)
- `BUILD-NOTES.md` (build notes)
- `AI-WORKFLOW-NOTES.md` (AI workflow notes)
- `THEME-REPORT.md` (full technical report)
