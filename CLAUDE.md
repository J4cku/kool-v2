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
pnpm dev      # Start dev server
pnpm build    # Production build
pnpm start    # Start production server
pnpm lint     # Run Next.js linter
```

## Project Structure

```
app/
  globals.css              # Tailwind @theme tokens (colors, fonts, max-width)
  robots.ts                # SEO robots.txt
  sitemap.ts               # Dynamic sitemap from project data
  [locale]/                # All pages nested under locale segment
    layout.tsx             # Root layout, Poppins font, JSON-LD, NextIntlClientProvider
    page.tsx               # Homepage (Navbar, ImageStrip, ManifestoSection, FooterBanner)
    projekty/              # Projects listing + [slug] detail pages
    studio/                # Studio/about page
    oferta/                # Services page
    kontakt/               # Contact page
components/                # All UI components (flat, no subdirectories)
data/projects.ts           # Project data + types (Project type, heroImages)
i18n/
  request.ts               # Locale config, getRequestConfig
  navigation.ts            # Typed Link, redirect, usePathname, useRouter
messages/
  pl.json                  # Polish translations
  en.json                  # English translations
public/
  images/                  # Project photos organized by project slug
  logo.svg, dot.svg        # Brand assets
  llms.txt                 # LLM-friendly site description
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

## Conventions

- **Components**: PascalCase, flat in `components/`, one component per file
- **Client components**: Explicit `'use client'` directive when using hooks/motion
- **Imports**: Use `@/` path alias (maps to project root)
- **Navigation**: Use `Link`, `usePathname`, `useRouter` from `@/i18n/navigation` (not `next/link`)
- **Translations**: Use `useTranslations()` from `next-intl` with keys matching `messages/*.json`
- **Images**: Use `next/image` with `Image` component. Project photos in `public/images/<slug>/`
- **Project data**: All project metadata lives in `data/projects.ts` — `Project` type is the source of truth
- **Content language**: Site content and project descriptions are in Polish; translations in `messages/`
- **Font**: Poppins via `next/font/google`, exposed as CSS variable `--font-poppins`

## Adding a New Project

1. Add project images to `public/images/<slug>/`
2. Add project entry to `data/projects.ts` following the `Project` type
3. Add any needed translation keys to `messages/pl.json` and `messages/en.json`
4. The project automatically appears in listings and sitemap

## i18n

- Locales: `pl` (default), `en`
- Locale prefix: `always` (URLs always include `/pl/` or `/en/`)
- Locale detection: disabled (defaults to Polish)
- Messages loaded dynamically in layout via `import(`../../messages/${locale}.json`)`

## SEO

- Metadata in `app/[locale]/layout.tsx` (title, OG, alternates)
- JSON-LD `ProfessionalService` schema in layout `<head>`
- Dynamic sitemap at `app/sitemap.ts` covers all locale + page + project combinations
- `public/llms.txt` for LLM discovery
