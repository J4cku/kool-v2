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
    polityka-prywatnosci/  # Privacy policy (GDPR; cookie settings re-open button)
    design-system/         # Private styleguide (dev-only, 404s in production)
    [...rest]/             # Catch-all route -> notFound()
    not-found.tsx          # Custom 404 page
components/                # Shared UI components (PascalCase)
  oferta/                  # Page-scoped components (ServiceSection, ProcessSection)
data/projects.ts           # Project data + types (Project type)
data/press.ts              # Press features (studio page + llms.txt)
lib/site.ts                # BASE_URL, INSTAGRAM_URL (client-safe constants)
lib/metadata.ts            # localeAlternates + pageMetadata helpers (server-only)
lib/analytics.ts           # track() helper for PostHog custom events
instrumentation-client.ts  # PostHog init (EU, cookieless, proxied via /dot)
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
next.config.mjs            # next-intl plugin + image remotePatterns + PostHog /dot rewrites
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
- **Content language**: Site content and project descriptions are in Polish (canonical); page chrome translations in `messages/`. Project copy is translated via the required `en: ProjectTranslation` block on each entry in `data/projects.ts`, resolved with `localizeProject(project, locale)` — pages must never render a raw project without localizing first
- **Font**: Poppins via `next/font/google`, exposed as CSS variable `--font-poppins`
- **Verification**: Before handoff, run `pnpm check` (typecheck + lint + i18n parity + build)

## Adding a New Project

1. Add project images to `public/images/<slug>/`
2. Add project entry to `data/projects.ts` following the `Project` type
3. Fill the entry's required `en` block (English title/scope/description/descriptionBlocks; align terminology with existing entries)
4. Add any needed translation keys to `messages/pl.json` and `messages/en.json`
5. The project automatically appears in listings and sitemap

## i18n

- Locales: `pl` (default), `en`
- Locale prefix: `always` (URLs always include `/pl/` or `/en/`) — enforced in `proxy.ts` (and mirrored in `i18n/navigation.ts` for the typed helpers)
- Locale detection: disabled (defaults to Polish) — set in `proxy.ts`
- Messages loaded dynamically in layout via `import(`../../messages/${locale}.json`)`

## Gotchas

- Next.js 16 App Router: route `params` is a Promise — type as `params: Promise<{...}>` and `await params` (see `app/[locale]/layout.tsx`)
- There is intentionally no `tailwind.config.*` — Tailwind v4 design tokens live in `@theme` in `app/globals.css`
- There are no automated tests — `pnpm check` (typecheck + lint + i18n parity + build) is the verification gate before claiming work done

## Analytics

- PostHog EU in `cookieless_mode: 'on_reject'` + `opt_out_capturing_by_default: true` — `CookieBanner.tsx` gates consent: accept = cookies + session replay; decline **and** not-yet-answered = anonymous server-side hash (no storage, still counted); `identify()` stays forbidden for pending/declined visitors; "Cookieless server hash mode" must stay enabled in the PostHog project settings (Settings → Web analytics) or anonymous events are silently dropped
- Consent is re-openable via `openCookieSettings()` (`lib/analytics.ts`) — wired to the FooterBar "cookies" link and the privacy page button; the privacy policy lives at `/polityka-prywatnosci` (both locales, copy in `messages/*.json` under `privacy.*`)
- Founder/internal traffic: open any page with `?kool=<name>` once per device → auto-opts-in and identifies as `team-<name>` with person property `internal: true`; the PostHog project's "Filter out internal and test users" filter (`internal` is not set) excludes those persons from insights — this is the only place `identify()` is allowed
- Init lives in `instrumentation-client.ts`, gated on `NEXT_PUBLIC_POSTHOG_KEY` (no-op when unset, e.g. local dev)
- Events proxied first-party through `/dot/*` (rewrites in `next.config.mjs`) to bypass ad blockers; `/dot` is excluded from the next-intl matcher in `proxy.ts` and `skipTrailingSlashRedirect` is required — keep all three in sync
- Custom events go through `track()` in `lib/analytics.ts` (never import `posthog-js` in components directly); current events: `contact_email_click`, `instagram_click` (`placement`), `hero_slide_change`/`hero_project_click` (`project`), `map_address_click`, `language_switch` (`to`), `contact_form_started`/`contact_form_submitted`/`contact_form_mailto_fallback`
- Vercel Analytics + Speed Insights remain in `app/[locale]/layout.tsx` alongside PostHog
- Contact/brief form (`components/kontakt/BriefForm.tsx` + server action in `app/[locale]/kontakt/actions.ts`): validation/spam logic in `lib/brief.ts` (tested in `tests/brief-validation.test.ts`); delivers via Resend (`RESEND_API_KEY`, `BRIEF_FROM_EMAIL`, `BRIEF_TO_EMAIL`) with a customer receipt in the form's locale, and falls back to a prefilled mailto when unconfigured or on delivery failure
- `skipTrailingSlashRedirect` removes Next's sitewide slash normalization, so `proxy.ts` restores the trailing-slash 308 for page routes itself
- The `kool-posthog` MCP server (`.mcp.json`) needs a PostHog *personal* API key (phx_…) exported as `KOOL_POSTHOG_PERSONAL_API_KEY` in the shell environment (not `.env.local` — MCP reads the process env)
- Main dashboard: ["Kool Studio — witryna"](https://eu.posthog.com/project/230717/dashboard/843909) (project 230717, EU) — visitors, channels/referrers (Instagram vs rest), top projects, contact clicks, consent split, and the wejście → projekt → kontakt funnel; insights respect the internal-traffic filter (`internal` person property is not set AND `$host` = koolstudio.pl — excludes founders, localhost, and Vercel previews)

## SEO

- Locale-aware metadata via `generateMetadata` in `app/[locale]/layout.tsx`; each static subpage sets its own title/description/canonical via `pageMetadata()` from `lib/metadata.ts` (strings live in `messages/*.json` under `meta.*` — keep pl/en parity)
- JSON-LD `ProfessionalService` schema in layout `<head>`; per-project `CreativeWork` + `BreadcrumbList` in `app/[locale]/projekty/[slug]/page.tsx`
- Dynamic sitemap at `app/sitemap.ts` covers all locale + page + project combinations
- `/llms.txt` for LLM discovery — generated from `data/projects.ts` + `data/press.ts` in `app/llms.txt/route.ts` (never hand-edit project facts)
- Crawlability invariants: nav links stay in the server HTML (Navbar animates visibility by state, no conditional mounting) and the projects listing grid is server-rendered from `searchParams`
