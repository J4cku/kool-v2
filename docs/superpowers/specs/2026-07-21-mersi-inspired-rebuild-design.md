# Mersi-Inspired Site Rebuild Design

## Brief

Rebuild Kool Studio's public site so its first impression is as close as practical to the editorial, split-screen portfolio experience of mersi-architecture.com, while retaining Kool Studio's own work, copy, identity, URLs, and established technical constraints.

## Direction

Three approaches were considered:

1. Copy the reference's typefaces, project colors, and interaction model literally. This would be visually close but would erase Kool Studio's identity and conflict with the existing design-token rules.
2. Adapt the reference's composition and pacing to Kool Studio's brand. This preserves the beige, coral, dark, and Poppins system while adopting the reference's compact navigation, full-viewport paired photography, centered project folio, and restrained motion. This is the selected approach.
3. Keep the existing carousel and only restyle type and spacing. This is lower risk but does not materially achieve the requested resemblance.

## Visual System

- **Canvas:** `beige #E5DDD0` for editorial content and project labels.
- **Ink:** `dark #1A1A1A` for primary type and `muted #888888` for metadata.
- **Brand signal:** `coral #FC3117`, limited to the Kool logo/dot, hairlines, focus states, and concise accents.
- **Typography:** Poppins remains the sole family. Heavy, tightly tracked display text gives project titles character; compact uppercase utility text gives navigation and metadata the reference's precision.
- **Layout:** the home hero fills the viewport and divides it into two synchronized project images. On mobile, the images stack. A solid beige project folio bridges both images at the visual center.
- **Signature:** the folio is both information and navigation: project name, place, category, year, progress, and an arrow to the project. Changing slides replaces both images and the folio as a single composed scene.
- **Motion:** one orchestrated crossfade/slide transition every six seconds, manual previous/next controls, pause on hover/focus, and a static reduced-motion mode.

### Curated Project Sequence

The showcase order and image pairs are fixed to strong complementary views from the existing project source of truth:

1. `mieszkanie-walecznych`: `images[0]` + `images[1]`
2. `foodhall-piazza`: `images[0]` + `images[2]`
3. `kancelaria`: `images[0]` + `images[1]`
4. `lazienki-warszawa`: `images[0]` + `images[4]`
5. `mieszkanie-gdansk`: `images[0]` + `images[2]`
6. `biblioteka-gdansk`: `images[0]` + `images[2]`
7. `delikatesy-dehesa`: `images[0]` + `images[2]`
8. `winobar-lodz`: `images[0]` + `images[3]`

The order alternates residential and commercial work where practical and prioritizes recent projects without inventing or translating project facts.

### Geometry

- Desktop (`min-width: 1024px`): two `50vw × 100svh` image fields, separated by a one-pixel beige seam. The folio is `37.5vw`, clamped to `520–640px`, with a minimum height of `120px`, three information columns, and `20px` padding.
- Tablet/mobile (`max-width: 1023px`): two `100vw × 50svh` image fields. The folio sits across the center seam with `20px` viewport insets, at least `128px` high, and a two-column/two-row information grid.
- Navigation is fixed, `64px` high, with `20px` viewport insets. Desktop shows the full route list; below `768px`, it shows logo and menu control only.
- Manifesto content uses the existing `1400px` maximum width and switches from a two-column to single-column flow below `768px`.

## Page Structure

The homepage opens directly into the project showcase under compact fixed navigation. It then moves into two quiet editorial manifesto sections using existing Kool Studio copy and dedicated home imagery, followed by the existing contact footer.

The projects page keeps its filters and real project data, but project cards adopt the same folio language so the visual system continues beyond the homepage. Detail, studio, services, and contact pages retain their working content architecture and inherit the revised global navigation and baseline styling.

## Components and Data

- `data/homepage-projects.ts` owns the curated project order and carousel index helpers.
- `components/ImageStrip.tsx` becomes the synchronized two-image showcase.
- `components/Navbar.tsx` becomes a compact always-visible desktop navigation with a full-screen mobile menu.
- `components/ManifestoSection.tsx` is restyled as a quieter editorial continuation.
- `components/ProjectCard.tsx` and `components/ProjectGrid.tsx` carry the folio treatment into the project archive.
- `messages/pl.json` and `messages/en.json` provide all new public labels with parity.

## Accessibility and Responsive Behavior

Controls have localized explicit labels, keyboard focus remains visible, the active slide is announced, and the carousel respects `prefers-reduced-motion`. Arrow keys navigate slides. The mobile menu traps focus while open, closes on Escape, restores focus to its opener, and locks body scrolling. Desktop uses a vertical 50/50 split; mobile uses two horizontal image fields with the folio spanning the center seam. Content remains usable without motion.

## Verification

- Run the homepage data tests through Node's test runner.
- Run `pnpm check` for typecheck, lint, translation parity, and production build.
- Run the repository `verify-site` workflow: status-check every static and project route in both locales, collect console output, and capture desktop/mobile screenshots.
- If the required browser surface is unavailable, keep the route-status evidence and explicitly report the incomplete visual gate rather than claiming it passed.
