---
name: add-project
description: Use when adding a new project to the portfolio, or when updating an existing project's images, copy, or layout hints in data/projects.ts.
---

# Add Project

## Checklist

1. **Images** into `public/images/<slug>/`:
   - webp, named `kool_<short-slug>_NN.webp` (existing sets vary in casing — use this lowercase form for new projects)
   - a gallery needs an orientation mix (squares, portraits, occasional full-width hero) — see the inline row comments on `delikatesy-dehesa` for how orientation drives layout
   - check dimensions: `sips -g pixelWidth -g pixelHeight public/images/<slug>/*.webp`
   - resize anything wider than 2560px: `sips --resampleWidth 2560 <file>` (**overwrites in place** — work on copies)
   - projects without a final photo set (any status — see `winobar-lodz`, completed) may use a single placeholder jpg in `public/images/` root (existing pattern: `prs.jpg`, `fnd.jpg`), repeated in `images` to fill the gallery
2. **Data entry** in `data/projects.ts` conforming to the `Project` type.
   - `id`: next unused integer as string — **scan every entry; array order does not match id order** (`rg "^    id:" data/projects.ts`)
   - **Array order = listing order** on `/pl/projekty`. Append at the end unless told where it belongs.
   - `title` lowercase except proper nouns (`hotel Belmonte`); the UI uppercases for display
   - `featured`: currently read by nothing in the UI — set `false` unless told otherwise
   - Other required: `slug`, `location`, `category` (`'mieszkalne' | 'komercyjne'`), `status` (`'completed' | 'in_progress'`), `year`, `area` (`'NNN m²'`), `scope` (Polish phrases), `thumbnail`, `images`, `description`
   - Optional layout/credit fields: copy the patterns from `dom-dobrzykowice` (`fullWidthIndices`, `descriptionBlocks`) and `mieszkanie-widmo` (`containedPairs`, `reverseLastRow`); `photoCredit` as in `delikatesy-dehesa`
   - Designer-specified layouts: `biblioteka-gdansk` shows `textRows` (explicit text-block row/side placement), `reel` (self-hosted mp4 in `public/videos/` occupying a gallery slot — its `index` shares the `fullWidthIndices` space), and `meta` (detail-page overrides for title/location plus `collaboration`); `lazienki-warszawa` shows `flipRowParity` (flush image right on even rows) and `portraitIndices` (2:3 instead of square in flush slots)
3. **Copy rules:** project copy is Polish (canonical) and lives in `data/projects.ts`, not in `messages/`. Only touch `messages/*.json` when page chrome needs a new label — then add the key to BOTH `pl.json` and `en.json`. Paste Polish text exactly; never retype diacritics from screenshots.
   - Every entry also needs the required `en: ProjectTranslation` block (English `scope`, `description`, `descriptionBlocks`, plus `title`/`location`/`meta` when the Polish value isn't a pure proper noun). Reuse the established vocabulary from existing `en` blocks — e.g. scope phrases like 'interior conceptual design', "author's supervision"; 'lastryko' → 'terrazzo'. British English spelling. Slider/pair labels ('przed'/'po', 'noc'/'dzień') are NOT per-project copy — they're translated by the `LABELS_EN` dictionary next to `localizeProject()`; extend it if a new label appears.
4. **Verify:** `pnpm check:i18n && pnpm typecheck` while iterating (fast loop), then the verify-site skill — it covers `/pl/projekty` and the new detail route, no separate manual check needed. Full `pnpm check` before handoff, per CLAUDE.md.
5. **Committing is the caller's decision** — this skill ends at verification.

## Gotchas

- `thumbnail` must also appear in `images` — unless the designer delivered a dedicated square crop for the card (see `biblioteka-gdansk`'s `_MAIN`)
- `description` is the 1-2 sentence listing/SEO teaser; `descriptionBlocks` are the long-form detail-page paragraphs
- Sitemap picks the project up automatically from `data/projects.ts` — no manual step
- Follow the Design Language section of CLAUDE.md for any layout deviation
