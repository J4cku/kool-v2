# Kool Studio Website (kool-v2)

Portfolio website for Kool Studio, a Wroclaw-based interior architecture practice.

## Quick Reference

- **Framework**: Next.js 16 (App Router) with TypeScript
- **Styling**: Tailwind CSS v4 (PostCSS plugin, `@theme` in globals.css)
- **Animations**: Framer Motion
- **i18n**: next-intl (Polish `pl` default, English `en`)
- **Package manager**: pnpm
- **Domain**: koolstudio.pl

## Commands

```bash
pnpm dev       # Start dev server on $CONDUCTOR_PORT, falling back to 8080
pnpm build     # Production build
pnpm start     # Start production server on $PORT, falling back to 8080
pnpm lint      # Run ESLint CLI
pnpm typecheck # Run TypeScript without emitting files
pnpm check:i18n # Verify pl.json/en.json translation keys match
pnpm check     # Typecheck, lint, i18n parity, and build
```

## Project Structure

```
app/
  globals.css              # Tailwind @theme tokens (colors, fonts, max-width)
  robots.ts                # SEO robots.txt
  sitemap.ts               # Dynamic sitemap from project data
  llms.txt/route.ts        # llms.txt generated from data/projects.ts + data/press.ts
  [locale]/                # All pages nested under locale segment
    layout.tsx             # Root layout, Poppins font, JSON-LD, NextIntlClientProvider
    page.tsx               # Homepage (Navbar, ImageStrip, ManifestoSection, FooterBanner)
    projekty/              # Projects listing + [slug] detail pages
    studio/                # Studio/about page
    oferta/                # Services page
    kontakt/               # Contact page
    design-system/         # Private styleguide (dev-only, 404s in production)
    [...rest]/             # Catch-all route -> notFound()
    not-found.tsx          # Custom 404 page
components/                # Shared UI components (PascalCase)
  oferta/                  # Page-scoped components (ServiceSection, ProcessSection)
data/projects.ts           # Project data + types (Project type)
data/press.ts              # Press features (studio page + llms.txt)
lib/site.ts                # BASE_URL, INSTAGRAM_URL (client-safe constants)
lib/metadata.ts            # localeAlternates + pageMetadata helpers (server-only)
i18n/
  request.ts               # Locale config, getRequestConfig
  navigation.ts            # Typed Link, redirect, usePathname, useRouter
messages/
  pl.json                  # Polish translations
  en.json                  # English translations
public/
  images/                  # Project photos organized by project slug
  videos/                  # Video assets (reel.mp4)
  logo.svg, dot.svg        # Brand assets
docs/superpowers/          # Design spec + implementation plan (historical records)
.claude/                   # Agent settings + project skills (verify-site, add-project, build-from-design)
design/                    # Gitignored inbox for designer PDF/.ai mockups
scripts/check-i18n.mjs     # pl/en translation key parity check
proxy.ts                   # next-intl locale proxy (Next.js 16 proxy convention)
next.config.mjs            # next-intl plugin + image remotePatterns
eslint.config.mjs          # ESLint flat config (next/core-web-vitals + typescript)
AGENTS.md                  # Cross-agent instructions (Codex, Conductor)
```

## Design Tokens (globals.css @theme)

| Token              | Value     | Usage                        |
|--------------------|-----------|------------------------------|
| `--color-beige`    | `#E5DDD0` | Background, body             |
| `--color-coral`    | `#FC3117` | Accent, nav links, dot       |
| `--color-dark`     | `#1A1A1A` | Text                         |
| `--color-muted`    | `#888888` | Secondary text               |
| `--color-white`    | `#FFFFFF` | White                        |
| `--font-sans`      | Poppins   | Primary typeface             |
| `--max-width-content` | `1400px` | Content max-width          |

## Design System

- Local development only: `/pl/design-system` and `/en/design-system`
- Route file: `app/[locale]/design-system/page.tsx`
- Purpose: private reference for the new PDF direction: dark primary typography, coral accents, current tokens, layout, image treatment, interaction patterns, and project cards
- Do not add this route to public navigation or sitemap unless the access model changes
- The route hard-404s outside development (`NODE_ENV` guard in page.tsx) — under `pnpm build && pnpm start` a 404 here is expected, not a regression; view it with `pnpm dev`
- Background: design spec and implementation plan live in `docs/superpowers/specs/2026-04-11-design-system-design.md` and `docs/superpowers/plans/2026-04-11-design-system-implementation.md`

## Design Language

Rules for any UI work. Visual reference: `/pl/design-system` (dev only); primitives in `components/DesignSystem.tsx`.

- **Typography is dark and editorial.** Display headings and body copy use `dark` on `beige`. Display headings are uppercase Poppins.
- **Coral is an accent, used sparingly:** logo, dot, small labels, separator lines, text links, marquee/accent text, project-status accents. Never body copy, never large fills. Keep `#FC3117` exactly — do not resample reds from PDF exports.
- **Muted** (`#888888`) is for secondary text and metadata only.
- **Layout:** content constrained to `--max-width-content` (1400px), generous whitespace, image-led sections.
- **Images:** `next/image`, webp under `public/images/<slug>/`, aspect patterns from `ProjectGrid` (squares, portraits, full-width breaks).
- **Motion:** Framer Motion, subtle; marquee treatment for footer/accent text.
- **Never** introduce new colors, typefaces, or a component library without an explicit token discussion first.

## Agent Toolkit

Project skills live in `.claude/skills/`; shared agent permissions in `.claude/settings.json`.

- **verify-site** — browser QA gate: every route × both locales, status + console + screenshots. Run before handoff of visual changes.
- **add-project** — the images → `data/projects.ts` → verification workflow for portfolio entries.
- **build-from-design** — implement a view faithfully from a PDF/.ai mockup in `design/` (gitignored inbox). Extract copy/photos with poppler, map colors to `@theme` tokens (stop and ask on off-token values).
- **check:i18n** — `pnpm check:i18n` enforces pl/en key parity (part of `pnpm check`).

## Conductor

- Shared workspace scripts live in `.conductor/settings.toml`
- `pnpm dev` reads `$CONDUCTOR_PORT` and falls back to `8080` for ordinary local development
- Keep temporary multi-agent handoff notes in `.context/`
- Use `run_mode = "concurrent"` only while local services remain port-isolated

## Conventions

- **Components**: PascalCase, one component per file (exception: `components/DesignSystem.tsx` groups the design-system primitives). Shared components sit at the top of `components/`; page-scoped components go in subdirectories (e.g. `components/oferta/`)
- **Client components**: Explicit `'use client'` directive when using hooks/motion
- **Imports**: Use `@/` path alias (maps to project root)
- **Navigation**: Use `Link`, `usePathname`, `useRouter` from `@/i18n/navigation` (not `next/link`)
- **Translations**: Use `useTranslations()` from `next-intl` with keys matching `messages/*.json`
- **Images**: Use `next/image` with `Image` component. Project photos in `public/images/<slug>/`
- **Project data**: All project metadata lives in `data/projects.ts` — `Project` type is the source of truth
- **Content language**: Site content and project descriptions are in Polish; translations in `messages/`
- **Font**: Poppins via `next/font/google`, exposed as CSS variable `--font-poppins`
- **Verification**: Before handoff, run `pnpm check` (typecheck + lint + i18n parity + build)

## Adding a New Project

1. Add project images to `public/images/<slug>/`
2. Add project entry to `data/projects.ts` following the `Project` type
3. Add any needed translation keys to `messages/pl.json` and `messages/en.json`
4. The project automatically appears in listings and sitemap

## i18n

- Locales: `pl` (default), `en`
- Locale prefix: `always` (URLs always include `/pl/` or `/en/`) — enforced in `proxy.ts` (and mirrored in `i18n/navigation.ts` for the typed helpers)
- Locale detection: disabled (defaults to Polish) — set in `proxy.ts`
- Messages loaded dynamically in layout via `import(`../../messages/${locale}.json`)`

## Gotchas

- Next.js 16 App Router: route `params` is a Promise — type as `params: Promise<{...}>` and `await params` (see `app/[locale]/layout.tsx`)
- There is intentionally no `tailwind.config.*` — Tailwind v4 design tokens live in `@theme` in `app/globals.css`
- There are no automated tests — `pnpm check` (typecheck + lint + i18n parity + build) is the verification gate before claiming work done

## SEO

- Locale-aware metadata via `generateMetadata` in `app/[locale]/layout.tsx`; each static subpage sets its own title/description/canonical via `pageMetadata()` from `lib/metadata.ts` (strings live in `messages/*.json` under `meta.*` — keep pl/en parity)
- JSON-LD `ProfessionalService` schema in layout `<head>`; per-project `CreativeWork` + `BreadcrumbList` in `app/[locale]/projekty/[slug]/page.tsx`
- Dynamic sitemap at `app/sitemap.ts` covers all locale + page + project combinations
- `/llms.txt` for LLM discovery — generated from `data/projects.ts` + `data/press.ts` in `app/llms.txt/route.ts` (never hand-edit project facts)
- Crawlability invariants: nav links stay in the server HTML (Navbar animates visibility by state, no conditional mounting) and the projects listing grid is server-rendered from `searchParams`
