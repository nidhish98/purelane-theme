# Build Notes — Purelane (for submission to nj@troopod.io)

Repo: `purelane-theme/` · Built from `purelane-homepage.html`
Full technical detail in `THEME-REPORT.md`; this is the short version for the brief.

---

## What I'd flag about the original file

1. **Hardcoded everything.** Prices, review text, hero copy, products, links — all
   literals in the markup. Nothing a marketing team could edit without touching code.
2. **No product/cart flow.** It's a static page; there are "Add" affordances but no
   product page, collection, or cart behind them.
3. **Heavy decorative layers.** Water / light-shaft gradients were expensive and
   animation-heavy (potential CLS and interaction-cost problems).
4. **Autoplaying marquees & carousels** with no keyboard control, no pause, no
   reduced-motion handling.
5. **Class names matched nothing semantic** — presentation-only structure, no
   landmarks, no focus styles, no aria wiring.
6. **No edge cases** — a sold-out product, a missing image, or a long title would
   have broken the layout.

## What I changed in the code and why

- **Rebuilt as OS 2.0 sections** on stock Dawn. `hero.liquid`, `product-grid.liquid`,
  `best-selling-combos.liquid`, `bundles.liquid`, `reviews-rail.liquid` are the five
  briefed sections; everything else in the file became bonus sections, plus native
  PDP / collection / cart / drawer templates.
- **Prototype copy/prices → editor settings & blocks.** Combos, bundle tiers,
  reviews, hero slides, stats, ingredients are all merchant-editable blocks.
- **Products, prices, availability → the platform.** Cards, hero tiles and the shop
  grid render from a real collection. Optional data (rating, review count, pills)
  comes from metafields and tags; missing values are omitted gracefully.
- **Fixed semantics/a11y:** landmarks, skip link, `h1`→`h2` hierarchy,
  `:focus-visible`, `role="dialog"`/`aria-modal` drawers with Escape + scroll lock,
  `aria-hidden` on marquee duplicates, `prefers-reduced-motion` everywhere.
- **Performance:** lazy images below the fold with `image_url` width params, one
  deferred JS file, rAF-throttled scroll, IntersectionObserver pausing autoplay
  off-screen, water effect optional (toggle), cheap fixed gradient scene layers.
- **Editor-safe JS:** behaviours scoped per section root and re-inited on
  `shopify:section:load/unload/select/deselect`, so adding/removing/reordering/
  duplicating never breaks, animations included.
- **Edge cases:** sold-out → disabled button + pill; no image → branded leaf
  placeholder; long titles → 2-line clamp; missing compare-at/rating → omitted.
- **Pricing note:** combo/bundle prices are merchant text fields (a flat bundle price
  has no native Shopify field) — I kept the picker so images come from real products.

## What I'd do with more time

- Wire the reviews rail to a real reviews app (Judge.me / Loox) instead of curated
  blocks, and aggregate the product-metafield ratings into it.
- Move bundle pricing to a proper Shopify **bundle/discount** (e.g. via a
  BOGO/bundle app or Shopify Bundles) so prices and discounts are calculated, not
  typed.
- Convert the multi-page header/footer scaffolding into a proper multi-language /
  multi-currency setup and re-verify across INR and USD.
- Add a settings-schema-driven "section preview" (via schema `presets`) so the theme
  editor shows nice placeholders for every section.
- Set up CI that runs a Liquid lint + Lighthouse budget on the repo before deploy.
