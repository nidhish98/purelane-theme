# AI Workflow Notes — Purelane assignment

How I built this with agents, what broke, and what I'd systematise.

---

## What I delegated

- **Prototype → spec extraction.** An agent read `purelane-homepage.html` and emitted a
  structured inventory: sections, blocks, exact CSS values, copy, prices, and every
  interactive behaviour. That became the checklist the build verified against.
- **Section scaffolding.** Each of the five priority sections (and most bonus ones)
  was drafted by an agent against a shared contract I set once up front: OS 2.0
  section with `schema`, `presets`, real product data, `data-pl-module` root, no
  hardcoded merchant copy.
- **Reusable snippets.** `product-card`, `price`, `icon`, `section-heading` were
  built once and referenced everywhere, so the agents never re-invented cards.
- **QA pass.** An agent ran the manual test list (edge cases, theme-editor events,
  breakpoints) and filed issues I fixed.

## Where it failed me (and how I caught it)

1. **Confidently-invented APIs.** Agents wrote `product.metafields.custom.rating`
   differently across files (`.value` vs not), and guessed at Dawn object names.
   Fix: one canonical snippet read and the rest reviewed against it.
2. **Repeated CSS instead of tokens.** Drafts re-inlined the same colour/shadow/spacing
   values, which would have drifted from the prototype. Fix: a spec of exact values
   they were told to import, and I diffed section CSS against `base.css` variables.
3. **Semantics drifted.** Early drafts used `div`-stacked cards and unlabeled buttons.
   Caught in the QA pass; I enforced the landmark/a11y checklist as a hard review gate.
4. **Animation re-init on editor reload** was forgotten by agents. Only caught because
   the editor test list explicitly tested add/remove/reorder/duplicate.
5. **Edge cases were optional.** Agents didn't handle sold-out / no-image / long-title
   until I made the three seeded products with those properties the fixture for QA.

## What I'd systematise for twenty more of these

1. **A "section contract" template** (schema shape, naming, a11y, reduced-motion,
   editor-event re-init) committed once and pasted into every new-section prompt —
   biggest single lever.
2. **A fixture product set** per store (sold-out, no-image, long-title, empty
   collection) so edge-case QA is always real data, never hypothetical.
3. **A machine-checkable spec.** The design values as a JSON tokens file the agent
   imports, plus a script that diffs generated CSS against it.
4. **A standard review gate** run on every generated file: a11y checklist → Liquid
   validity → editor-event test → breakpoint sweep → Lighthouse budget.
5. **A repo convention**: one snippet per reusable unit, sections thin, agents told
   to reuse before writing. This repo already follows it; I'd turn it into a template.
