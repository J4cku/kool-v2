# kool studio Website

Portfolio website for [kool studio](https://koolstudio.pl), a Wroclaw-based interior architecture practice.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion · next-intl (Polish default, English) · pnpm

## Development

```bash
pnpm install
pnpm dev        # dev server on http://localhost:8080 (or $CONDUCTOR_PORT)
pnpm build      # production build
pnpm start      # production server
pnpm lint       # ESLint
pnpm typecheck  # TypeScript
pnpm check      # typecheck + lint + build
```

See [CLAUDE.md](CLAUDE.md) for the full project guide (structure, conventions, design tokens) and [AGENTS.md](AGENTS.md) for agent workflow notes.
