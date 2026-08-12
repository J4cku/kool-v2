# przelot — WebGL flythrough easter egg

**Date:** 2026-07-29
**Status:** approved, ready to implement
**Reference:** https://www.vincent-lowe.info/

## Context

An unlisted lab route that flies the viewer through kool studio's own project
photographs inside a log-polar tunnel. Inspired by vincent-lowe.info, which
renders eight photographs onto a receding vortex driven by a hijacked wheel.

Four decisions were taken before this spec, and they constrain everything below:

1. **Toy, not product.** Unlisted, permanently a lab piece. Freedom to be weird.
2. **A portal, not ambient.** The vanishing point is a door — the current
   project is reachable with one keystroke or click.
3. **URL-only discovery.** Nothing on the site links to it.
4. **Dark ground is an approved one-route exception.** See "Palette exception".

## Palette exception

`CLAUDE.md` forbids new colours, and `#1A1A1A` exists as a *text* token, never
as a ground. This route uses a near-black ground anyway, by explicit decision.

The reason is structural rather than aesthetic: a vanishing point is by
definition the darkest pixel on screen, and the vignette that makes a tunnel
read as depth is a fade to black. On `#E5DDD0` the warm, muted interiors smear
radially into pale grey-brown with a smudge at the centre — it reads as a
rendering fault. This is what the effect *is*, not a tuning failure.

The exception is scoped to `/przelot` and must not be cited as precedent for
any other surface. Coral (`#FC3117`) stays an accent and never enters the
tunnel itself — a coral term inside the shader reads as lens flare or a
colour-management bug. Coral appears only as chrome: the caption pill, the
progress hairline.

**Ground colour is a uniform, not a constant.** A `?ground=beige` query
parameter swaps the vanishing point and vignette to `#E5DDD0`. This is a
deliberate, cheap probe of the on-brand alternative — photographs dissolving
into paper rather than into a void. Nobody involved has seen it work (the
vanishing point stops reading as depth and the tunnel flattens toward a radial
blur), so it ships as a toggle to be looked at, not as a plan. Default is dark.

## Route and visibility

`app/[locale]/przelot/page.tsx` → `/pl/przelot`, `/en/przelot`. Polish segment,
matching `projekty` / `oferta` / `studio` / `kontakt`.

Unlisted means all of:

- absent from `staticPages` in `app/sitemap.ts`
- absent from the hand-written `## Pages` block in `app/llms.txt/route.ts`
- absent from `navLinks` in `components/Navbar.tsx`
- `robots: { index: false, follow: false }` in the route's own metadata, which
  overrides the blanket `allow: '/'` from `app/robots.ts` and the layout defaults

**Do not use `pageMetadata()` / `makePageMetadata()` from `lib/metadata.ts`.**
`MetaPageKey` is a closed union and `staticSocialImages` satisfies it exhaustively;
extending it forces a 1200×630 social JPEG and trips
`tests/social-metadata.test.ts`. This route exports its own minimal
`generateMetadata` with a title and the noindex robots directive. No canonical,
no hreflang, no OG image — a noindex page needs none of them.

**Do not copy the `/design-system` guard.** `NODE_ENV !== 'development' →
notFound()` makes a route unreachable in production, which is the opposite of
what is wanted here. The route stays live so the URL can be shared.

Staying out of the sitemap also has a mechanical benefit worth recording:
`tests-e2e/routes.spec.ts` derives its route list *from* `sitemap.xml` and
asserts zero console errors in headless Chromium on CI. Its ignore list
(`['/_vercel/', 'speed-insights', 'favicon', '/dot/', 'posthog']`) covers
nothing GL-related, so a single SwiftShader or context-creation warning on a
listed WebGL route would fail the build.

## Scroll model

A real scrollport. **No wheel hijacking.**

The reference sets `document.scrollHeight === innerHeight` and consumes wheel
events. Copying that silently breaks Space, PageDown/PageUp, Home/End and arrow
keys, because there is no scrollport for them to act on, and leaves `Tab`
nothing to land on.

Instead: a tall spacer element (~70vh per project, ~1050vh total), the canvas
`position: fixed inset-0`, and travel derived from `scrollY`. Keyboard scrolling
works unmodified, browser back/forward restores position, and the code is
simpler than a virtual scroller.

- Native scrollbar hidden (`scrollbar-width: none` + `::-webkit-scrollbar`).
- A coral progress hairline replaces it. Scroll-driven motion with no visible
  progress indicator is the single strongest tell that separates a gimmick from
  a considered piece.
- On load, a short fly-in from far depth so the page announces itself. After
  that the tunnel is entirely scroll-owned: no idle drift, no autoplay.
- Depth wraps, so project 15 rolls seamlessly back into project 1.
- `globals.css` sets `html { scroll-behavior: smooth }` globally. Any
  programmatic scroll positioning on this route must account for it.

## Shader

Log-polar, not the textbook `1/r` tunnel.

```
r     = length(p)
angle = atan(p.y, p.x)
depth = travel - log2(r)
```

`1/r` (Iñigo Quilez's classic formulation) accelerates oddly toward the edges.
Log-polar gives constant apparent speed at every radius, so content genuinely
*emerges* from the centre rather than rushing past.

- **Spiral streaks** — `angle += twist * depth`. A curve with θ ∝ log r *is* a
  logarithmic spiral, so the reference's counter-rotating eyes cost one term.
- **Smear** — 8–16 taps marching backward along `travel`. Because screen radius
  is exponential in depth, a fixed Δtravel maps to a screen offset proportional
  to `r`: streaks are short at the centre and long at the edges for free, with
  no streak-direction computation.
- **A→B handoff** — a hard per-ring owner, `useB = step(handoff, floor(depth))`.
  **Not `mix()`.** The boundary circle inflates outward from the least legible
  ~2% of the screen. This is the single detail that makes the transition read as
  continuous rather than as a crossfade; a `mix()` over a window will look like
  a dissolve no matter how it is tuned.

Two implementation musts, both non-obvious:

- Upload as `SRGB8_ALPHA8` so tap accumulation happens in linear space.
  Accumulating in sRGB darkens the smear and shifts hue.
- `generateMipmap` plus **explicit `textureLod`**. The radial warp defeats
  hardware derivative-based LOD selection; without an explicit level the
  vanishing point shimmers badly.

Wrap mode `MIRRORED_REPEAT` on both axes.

### Licensing

Derive the math from Iñigo Quilez's published articles
(<https://iquilezles.org/articles/tunnel/>, `/articles/deform/`) and the MIT
`gl-transitions` set. **Do not paste a Shadertoy shader body**: Shadertoy's
default licence for shaders with no explicit header is CC BY-NC-SA 3.0
(non-commercial), and koolstudio.pl is a commercial site. `akella/webGLImageTransitions`
has no LICENSE file at all and is therefore all-rights-reserved. iquilezles.org
licenses code *snippets* MIT but explicitly reserves the shader art, so
re-derive from the article text rather than copying a listing.

## Portal

The ring owner at the centre *is* the current project.

- A coral pill at the bottom names the current project and its location.
- **The pill is a real `<a href="/{locale}/projekty/{slug}">`**, not a canvas
  click handler. `Tab` reaches it; screen readers announce it. The canvas is
  `aria-hidden="true"` decoration.
- Clicking the centre of the canvas, or pressing Enter while the pill has focus,
  commits: travel velocity punches forward while the frame fades out over
  ~400 ms, then navigate via `useRouter` from `@/i18n/navigation`.
- Under reduced motion, commit navigates immediately with no punch-in.
- Behind the canvas, a visually-hidden `<ol>` of all 15 project links, so
  assistive tech gets the whole set rather than only the current ring.

## Textures

15 projects, one `thumbnail` square each (all 1440×1440, consistent crop). The
existing display order from `projectDisplayOrder` is the starting sequence.

VRAM is the binding constraint, not download. WebGL decodes to raw RGBA, so
source compression buys nothing at rest:

| set | resident RGBA | mipmapped | download |
|---|---|---|---|
| 1440² × 15 (as shipped) | 124 MB | 166 MB | 12.1 MB |
| **512² × 15 (generated)** | **15 MB** | **20 MB** | **~1 MB** |

512² is the choice. The radial smear destroys fine detail anyway, so the
resolution drop is not visible in motion.

**Format is JPEG, not webp, and this is deliberate.** `sharp` is not resolvable
from the repo root under pnpm's strict layout, and macOS `sips` can *read* webp
but cannot *write* it (`Error: Can't write format: org.webmproject.webp`).
JPEG at quality 75 measures 66 KB per 512² texture — ~1 MB for all 15 — and
`sips` handles it natively. These are photographs with no alpha, so JPEG costs
nothing. **This avoids adding any new dependency.**

`scripts/build-textures.mjs` shells out to `sips`, reads `projectDisplayOrder`
and each entry's `thumbnail`, and writes `public/textures/przelot/<slug>.jpg`.
Generated assets are committed; the script is re-run only when projects change.

Textures load via `fetch` + `createImageBitmap`, bypassing `next/image` entirely
(and therefore bypassing the `qualities: [75, 90]` restriction in
`next.config.mjs` and `tests/image-quality-policy.test.ts`). Decoded bitmaps are
cached at module scope — see "Layout conflicts" for why.

Hand-picking adjacent pairs for compatible tonality and horizon lines is where
the real quality lives, but it is a tuning pass after the thing runs, not a
prerequisite.

## Reduced motion and fallback

**The canvas never mounts.** Use the early-return pattern from
`components/Reveal.tsx`, not a paused RAF loop — the GPU context, the shader
compile and the texture uploads *are* the cost, so pausing is not a fallback.

One trap, and it is easy to get wrong: `hooks/useReducedMotion.ts:17`
hardcodes the server/hydration snapshot to `false`. The first client render
therefore always reports "motion allowed", and any effect scheduled in that
render fires before the correction lands. **The init effect must re-check
`window.matchMedia(REDUCED_MOTION_QUERY).matches` itself** before creating the
GL context. Reuse the exported `REDUCED_MOTION_QUERY` constant; do not write a
second media query string.

The same early return covers browsers without WebGL2 and a failed
`getContext('webgl2')`.

The fallback is a server-rendered grid of the same 15 photographs via
`next/image`, each linking to its project — same content, same destinations.
It is not a second code path; it is the layer that was always underneath.

## Layout conflicts

- `app/globals.css` hard-codes `background-color: #E5DDD0` on `html, body`.
  The route needs a `fixed inset-0 -z-10` dark layer plus `overscroll-none`,
  or iOS rubber-band scrolling exposes beige gutters at the edges.
- No navbar and no footer on this route — it owns the viewport.
- `components/PageTransition.tsx` wraps children in `<motion.div key={locale}>`,
  so a pl↔en switch destroys and rebuilds the GL context and re-uploads every
  texture. Only reachable here by hand-editing the URL (there is no language
  switcher without a navbar), but caching decoded `ImageBitmap`s at module scope
  is a few lines and makes it a non-issue.
- The idle dot-drop (`lib/dot-drop.ts`) requires a footer hairline, of which
  there is none here, so it should self-suppress. **Verify this rather than
  assume it** — a stray dot flight over the tunnel would be a bug.

## Performance guardrails

Cost model is exact: `texture fetches per frame = devicePixels × taps × 2`.

- Device pixel ratio capped at **1.5**.
- **16 taps** on desktop, **8** on mobile.
- Adaptive downshift: drop tap count when rolling frame time exceeds 20 ms.
- Pause the RAF loop on `document.hidden` (precedent: the dot-drop easter egg
  already does this).
- Free the GL context and delete textures on unmount.

Route isolation was measured on a real Turbopack build during research: adding
a raw-WebGL2 chunk left 25 of 30 existing chunks byte-identical and the shared
app chunk got slightly *smaller*. Raw WebGL2 costs ~1.6 KB gzip on the route
chunk, against 129 KB for tree-shaken three.js and 241 KB for React Three Fiber.
Roughly 90% of this effect is one fragment shader, and that shader is identical
whichever library wraps it — so no library is used. Given the site's PSI-72
history, this isolation is the property that makes the route safe to ship.

## i18n

New keys under a `przelot.*` namespace in **both** `messages/pl.json` and
`messages/en.json`. `pnpm check:i18n` (`scripts/check-i18n.mjs`) hard-fails on
any leaf-key divergence.

Minimum set: page title, the "enter this project" affordance label, the
scroll-to-begin hint, and a heading plus intro for the static fallback.

## Analytics

Two events via `track()` from `@/lib/analytics`, following the existing
convention (lowercase snake_case, shared family prefix, flat low-cardinality
properties):

- `przelot_entered` — the route mounted with a live canvas
- `przelot_project_opened` — `{ project: slug }`

Never import `posthog-js` in a component. Do not gate anything on a feature
flag: per `CLAUDE.md`, flags never reach the browser on this site because
posthog-js sends `distinct_id: "$posthog_cookieless"` and PostHog answers
`flags: {}`.

## Files

```
app/[locale]/przelot/page.tsx              server; own generateMetadata (noindex)
components/przelot/PrzelotMount.tsx        'use client'; capability + reduced-motion gate
components/przelot/PrzelotCanvas.tsx       'use client'; GL context, textures, RAF, scroll
components/przelot/tunnel.shaders.ts       GLSL source strings
components/przelot/CaptionRail.tsx         coral pill <a>, progress hairline
components/przelot/StaticFallback.tsx      server-renderable grid + hidden <ol>
scripts/build-textures.mjs                 sips-driven 512² JPEG generation
public/textures/przelot/<slug>.jpg         15 generated, committed
messages/pl.json, messages/en.json         przelot.* keys
```

Roughly 450 lines of new code. The shader is the only real risk; the rest is
mechanical.

## Out of scope

- Any link into this route from the live site. It stays URL-only. If it earns a
  quiet entry point later, that is a one-line change.
- Hand-curated project adjacency. Follow-up tuning pass.
- Graduating any part of this to the homepage hero or the projects grid. This
  route is a lab piece; a different effect (a displacement morph in an editorial
  frame, on beige) is the candidate for that, and it is a separate spec.

## Verification

- `pnpm check` — vitest, `node --test`, `tsc --noEmit`, eslint, i18n parity, build.
- Browser: `/pl/przelot` and `/en/przelot` — scroll through all 15, confirm the
  handoff reads as continuous, confirm Enter and centre-click both navigate.
- Keyboard only: Space, PageDown, Home/End scroll; `Tab` reaches the pill.
- `prefers-reduced-motion: reduce` — confirm no canvas mounts and the grid renders.
- Confirm the dot-drop easter egg stays silent on this route.
- Confirm no other route's chunk changed size.
- `?ground=beige` — look at it, then decide whether it survives.
