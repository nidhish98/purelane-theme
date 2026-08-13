# Purelane — Shopify Theme Conversion Report

Built at `purelane-theme/` from the `purelane-homepage.html` design prototype.
Objective: a production-quality, Dawn-style OS 2.0 sectioned theme that reproduces the
prototype's visual design, driven by real Shopify data and merchant-editable everywhere.

---

## 1. Files delivered

```
purelane-theme/
├─ config/settings_schema.json   Brand colours + motion toggles (theme settings)
├─ layout/theme.liquid           Head/fonts, fixed scene background, header/footer groups
├─ assets/base.css               Full port of the prototype's V2 "light" design
├─ assets/global.js              Scoped section behaviours, cart, hero, rotator, rail
├─ locales/en.default.json       All translation strings
├─ sections/
│  ├─ announcement-bar.liquid    Scrolling ticker (header group)
│  ├─ header.liquid              Floating pill nav + cart bubble + mobile drawer
│  ├─ cart-drawer.liquid         AJAX slide-in cart (header group)
│  ├─ footer.liquid              Brand + link_list/text/contact blocks (footer group)
│  ├─ hero.liquid                ★ Priority 1
│  ├─ product-grid.liquid        ★ Priority 2 (Shop / bestsellers)
│  ├─ best-selling-combos.liquid ★ Priority 3
│  ├─ bundles.liquid             ★ Priority 4 (Pick any 3, pay ₹499)
│  ├─ reviews-rail.liquid        ★ Priority 5 (marquee)
│  ├─ ingredients.liquid         Secondary
│  ├─ pillars.liquid             Secondary
│  ├─ proof.liquid               Secondary (stats + product rotator)
│  ├─ full-range.liquid          Secondary (product strip)
│  ├─ why-bundles.liquid         Secondary
│  ├─ bundle-categories.liquid   Secondary
│  ├─ trust-bar.liquid           Secondary
│  ├─ newsletter.liquid          Secondary (customer form)
│  ├─ sticky-cta.liquid          Secondary (mobile bottom bar)
│  ├─ progress-rail.liquid       Secondary (desktop dot rail)
│  ├─ main-product.liquid        Product page (variants, qty, sticky buy)
│  ├─ main-collection.liquid     Collection page grid + pagination
│  ├─ main-cart.liquid           Cart page (native cart form)
│  └─ main-page.liquid           Page / 404
├─ snippets/
│  ├─ icon.liquid                20 icons (leaf, arrow, check, shield, …)
│  ├─ price.liquid               price + compare-at + computed % off
│  ├─ product-card.liquid        cards with edge-case handling
│  └─ section-heading.liquid     kicker + heading + leaf rule + lede
└─ templates/
   ├─ index.json       Homepage — prototype section order
   ├─ product.json    collection.json  cart.json  page.json  404.json
```

## 2. Architecture

- **OS 2.0 sections everywhere.** `theme.liquid` uses `{% sections 'header-group' %}`
  and `{% sections 'footer-group' %}`; every content section lives in `index.json`.
- **Visual fidelity.** CSS values (colours, radii, shadows, type) are copied verbatim
  from the prototype's V2 "light" scheme. Class names match the prototype. Only the
  water/light effects are simplified for performance.
- **Scroll-driven scene background.** `theme.liquid` renders 4 fixed gradients; each
  section sets a `scene` (1–4) and `global.js` crossfades as you scroll (rAF-throttled).
- **Editor-safe JS.** Behaviours are scoped per section root (`data-pl-module`).
  `shopify:section:load/unload/select/deselect` re-inits safely, so sections can be
  added, removed, duplicated and reordered. `prefers-reduced-motion` is respected.
- **Fonts.** Outfit (display) + Inter (body) via Google Fonts with `display=swap`.

## 3. Prototype data converted into editor settings

- **5 reviews** (Anita/Priya/Sunita/Rohit S./Verified buyer) → review blocks.
- **4 combos** (Kitchen ₹499/₹897 flag "Most popular", Laundry ₹499/₹947,
  Bathroom ₹499/₹897, Hard-water ₹349/₹598) → combo blocks.
- **3 bundle tiers** (Starter 2×₹349/₹598, Most popular 3×₹499/₹897 featured,
  Whole home 5×₹699/₹1295) → tier blocks.
- **Hero**: "Clean That Lasts" headline (last line in accent), badge rail
  (Plant powered / No harsh chemicals / Safe for kids & pets / Leaping bunny),
  3 product slides with prices and %-off pills.
- **Stats** (99.9% germ kill, 14+ formulas, 0% harsh chemicals, 4.9 rating),
  ingredients (Coconut/Orange/Soapnut/Neem/Lemongrass line art), 3 pillars,
  4 category cards, 4 trust promises, newsletter copy.

## 4. Merchant-editable (what to change, and where)

- Brand colours & motion toggles → **Theme settings → Brand / Motion**.
- Nav links & footer columns → **Menus** and footer blocks (link lists).
- All homepage copy/prices → each section's settings/blocks in the **theme editor**.
- Product grid → pick a **collection** (Shop section). Cards, prices, tags and
  availability come from Shopify automatically.
- Ratings on cards → product **metafields** `custom.rating` (decimal) and
  `custom.reviews_count` (integer); omitted automatically when missing.
- Pills on cards → product **tags** `best-seller`, `top-rated`, `new`.
- Combo/bundle prices are **merchant text fields** (a flat bundle price has no native
  Shopify field); images come from the picked products.

## 5. Accessibility

- Semantic landmarks (`header`, `main`, `footer`, `nav`), skip link to `#MainContent`.
- Focus styles via `:focus-visible`; sectioned headings (`h1`/`h2` hierarchy).
- All icon buttons carry `aria-label`; drawers/menus are `role="dialog"` +
  `aria-modal`, close on Escape, lock scroll, and update `aria-hidden`.
- Marquee duplicates (announcement, reviews) marked `aria-hidden`.
- `prefers-reduced-motion` disables autoplay, reveals, parallax and scene animation.
- Colour contrast checked against the light scheme; focus ring uses the leaf green.

## 6. Performance

- Images sized via `image_url` width params, `loading="lazy"` below the fold,
  `eager` for the first hero slide.
- One CSS file, one deferred JS file; rAF-throttled scroll handlers; IntersectionObserver
  pauses hero/rotator autoplay off-screen.
- Water effect is optional (toggle); scene gradients are cheap fixed layers.

## 7. Edge cases handled

- Sold-out products → disabled button + "Sold out" pill; unavailable variants
  disabled in the PDP select.
- No product image → branded leaf placeholder (grid, hero tiles, combos, tiers, cart).
- Long titles → 2-line clamp on cards.
- Missing compare-at / rating / metafields → omitted gracefully.
- Empty collection → placeholder cards + empty-state message.
- 375px / 390px / tablet / desktop layouts, safe-area padding for the sticky bars.

## 8. Known limitations

- **No review app.** The reviews rail is curated blocks, not live reviews.
- **Combo/bundle prices are text**, not calculated from products.
- **PDP variant price** updates client-side with Intl (₹) formatting.
- **Checkout** link `/checkout` on the cart page; line-item removals on the cart
  page are native links (drawer uses AJAX).
- **Hero slide "auto price"** only applies when a slide has exactly one product and
  no typed price.

## 9. Production-unsuitable spots in the prototype (resolved or flagged)

- Prototype hardcoded prices, review text and products → now editor data.
- Prototype used placeholder imagery → now real product/collection images.
- Water/light-shaft layers were heavy → simplified + toggleable.
- Autoplaying marquee/carousel content is now keyboard-settable and reduced-motion aware.
- Prototype had no product/cart flows → added PDP, collection, cart page, drawer.

## 10. Manual test list

1. Homepage loads in the theme editor; add/remove/reorder/duplicate every section
   and confirm nothing breaks (editor events re-init).
2. Hero slides auto-cycle, pause on hover/focus, dots work; parallax on scroll.
3. Add to cart from a card, the PDP and the sticky buy bar → drawer opens with
   correct line/qty/subtotal; quantity +/- and remove update totals.
4. PDP variant switch updates price, compare-at and button state; sold-out variant
   is disabled; qty stepper works.
5. Collection page pagination; empty collection message.
6. Cart page: change qty + update; remove; checkout link.
7. Newsletter submit shows success/error.
8. Resize 375 / 768 / 1280; no horizontal overflow; sticky bar present on mobile,
   hidden ≥960px; rail present ≥1180px.
9. `prefers-reduced-motion` → no animation, everything visible.
10. Disable scene/water toggles in Theme settings → background flattens, still usable.
11. Set no image / long title / missing metafields on a product → card degrades cleanly.

*Theme can be uploaded via the Shopify Admin → Online Store → Themes → Upload
(70+ MB zip of the `purelane-theme/` folder).*
