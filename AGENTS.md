# Agent Instructions

Read `CLAUDE.md` first; it is the detailed project guide. This file keeps Codex and Conductor agents aligned on the non-negotiables.

## Workflow

- Work in this repository root and prefer existing page/component patterns before adding new abstractions.
- Use `@/i18n/navigation` for internal links and `useTranslations()` or message JSON keys for public copy.
- Keep public pages localized in `messages/pl.json` and `messages/en.json`.
- Keep the private design-system route out of navigation and sitemap.

## Conductor

- The dev server must use `$CONDUCTOR_PORT` so parallel workspaces do not fight over a fixed port.
- Shared Conductor scripts live in `.conductor/settings.toml`.
- Workspace-only coordination notes belong in `.context/`.

## Verification

Run the smallest useful check while iterating, then run this before handoff:

```bash
pnpm typecheck
pnpm lint
pnpm build
```

Do not claim a command passed unless you ran it in this workspace and checked the exit code.
