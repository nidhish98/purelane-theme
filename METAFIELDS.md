# Purelane — Metafield & Metaobject Definitions

Created in **Settings → Custom data** (Shopify Admin) so the theme can pull real
platform data. The theme degrades gracefully when any of these are missing.

---

## 1. Product metafields

Namespace `custom` · Used by `snippets/product-card.liquid`

| Key | Type | Content type | Example value | Used for |
| --- | --- | --- | --- | --- |
| `custom.rating` | Product | Decimal | `4.9` | Star rating shown on product cards |
| `custom.reviews_count` | Product | Integer | `127` | Review count next to the rating |

### Definition (Settings → Custom data → Products → Add definition)

**custom.rating**
- Name: `Rating`
- Namespace: `custom`
- Key: `rating`
- Type: **Number → Decimal**
- Validations: Min `0`, Max `5`

**custom.reviews_count**
- Name: `Review count`
- Namespace: `custom`
- Key: `reviews_count`
- Type: **Number → Integer**
- Validations: Min `0`

> Product **tags** (`best-seller`, `top-rated`, `new`) drive the pills on cards;
> those are plain tags, not metafields. See `snippets/product-card.liquid`.

---

## 2. No metaobjects required

The prototype's combos, bundle tiers and reviews are implemented as **section
blocks** (merchant-editable in the theme editor, with real product pickers for
images). No metaobjects were needed; keep it that way unless you need to reuse a
combo/review across multiple pages.

---

## 3. CSV seed (for the dev store)

Apply in **Admin → Products → Import** (`settings.csv`), or enter manually.
Every optional metafield is blank on purpose so the graceful-degradation paths
(no image, no rating, sold out, long title) are visible on the homepage.

```csv
Handle,Title,Body (HTML),Variant SKU,Variant Price,Variant Compare At Price,Status,Tags,Option1 Name,Option1 Value,Image Src,Image Alt Text,Metafield:custom.rating,Metafield:custom.reviews_count
purelane-kitchen-cleaner,Kitchen Cleaner All-Purpose Spray 500ml,"<p>Plant-powered, soap-nut based.</p>",KIT-500,399,499,active,best-seller,Size,500ml,/images/products/kitchen-cleaner.jpg,Kitchen Cleaner Spray,4.9,212
purelane-laundry-liquid,Laundry Liquid Concentrated 1L,<p>Removes stains without harsh chemicals.</p>,LND-1L,499,599,active,top-rated,Size,1L,/images/products/laundry-liquid.jpg,Laundry Liquid,4.8,187
purelane-bathroom-cleaner,Bathroom Cleaner Spray 500ml,<p>Cuts soap scum, safe for kids & pets.</p>,BTH-500,399,499,active,,Size,500ml,/images/products/bathroom-cleaner.jpg,Bathroom Cleaner,4.7,96
purelane-floor-cleaner,Floor Cleaner Concentrated 1L,<p>Streak-free shine on all floors.</p>,FLR-1L,449,549,active,new,Size,1L,/images/products/floor-cleaner.jpg,Floor Cleaner,4.6,74
purelane-dishwash-liquid,Dishwash Liquid Lemon 500ml,<p>Grease-cutter from coconut oil.</p>,DSH-500,299,399,active,,Size,500ml,/images/products/dishwash.jpg,Dishwash Liquid,, 
purelane-glass-cleaner,Glass & Mirror Cleaner 500ml,<p>Streak-free glass and mirrors.</p>,GLS-500,349,449,active,,Size,500ml,,,,
purelane-multi-surface-roll,The Complete Plant-Powered Cleaning Range — Kitchen, Bathroom, Laundry, Floor, Dishwash, Glass & Mirror Concentrates for Every Room in Your Home,<p>Everything you need, one refillable range.</p>,MSR-1L,699,999,active,best-seller,Size,1L,/images/products/multi-surface.jpg,Multi Surface Range,4.9,158
purelane-laundry-powder,Laundry Powder — Sold Out Edition,<p>Low-foam powder, plant enzymes.</p>,LND-P,399,499,sold-out,,Size,1kg,/images/products/laundry-powder.jpg,Laundry Powder,4.5,63
```

### Seed requirements checklist (from the brief)

- [x] 8+ products (8 above)
- [x] One **sold out** → `purelane-laundry-powder` (Status `sold-out`)
- [x] One **no image** → `purelane-glass-cleaner` (Image Src blank)
- [x] One **very long title** → `purelane-multi-surface-roll`

> Replace the `/images/products/*.jpg` paths with your uploaded files (Admin →
> Files), or set images manually. The leaf placeholder covers any that stay blank.
