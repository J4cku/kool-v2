# Task 3 report — WebMCP origin-trial availability and operations

## Status

Complete. The locale layout conditionally renders an early server-configured origin-trial meta, production registration no longer retains the obsolete base-gate export or configuration, the debug gate remains intact, and deployment/evaluation guidance records the supported browser paths and prepare-only safety boundary.

## TDD evidence

### Availability RED

Command:

```bash
pnpm vitest run components/WebMcpProvider.test.tsx && node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --experimental-strip-types --test tests/webmcp-config.test.ts
```

Exit code: `1`. Result: `9` provider tests passed and exactly `2` failed.

Observed failures:

- The flags module still exported the obsolete base-gate helper.
- A configured server token produced no `<meta http-equiv="origin-trial">` in the locale layout.

The Node half did not execute because the prescribed command uses `&&`. It was run separately and passed `2/2`, confirming the existing exact `Origin-Agent-Cluster: ?1` assertion remained green before production changes.

### Availability GREEN

Command:

```bash
pnpm vitest run components/WebMcpProvider.test.tsx && node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --experimental-strip-types --test tests/webmcp-config.test.ts
```

Exit code: `0`. Result: `11/11` Vitest tests and `2/2` Node tests passed. The layout omits the meta for an empty token, renders the exact configured token once, the obsolete export is absent, the debug helper retains its behavior, the token is not exposed through Next.js public env, and the OAC header remains exactly `Origin-Agent-Cluster: ?1`.

### Focused integration GREEN

Command:

```bash
pnpm vitest run components/WebMcpProvider.test.tsx components/kontakt/BriefModal.test.tsx lib/webmcp/tools/prepare-project-inquiry.test.ts
```

Exit code: `0`. Result: `3` test files and `53/53` tests passed.

### Repository safety search

Command:

```bash
rg -n "kool_submit_project_inquiry|requestSubmit|NEXT_PUBLIC_WEBMCP_ENABLED" app components lib messages .env.example docs/webmcp CLAUDE.md
```

Exit code: `1`, the expected ripgrep no-match status. No automatic submission tool, imperative DOM submission call, or obsolete base-gate configuration remains in the requested runtime/config/documentation scope.

## Final verification

Command:

```bash
pnpm check
```

Exit code: `0` on the final fresh run.

Summary:

- Vitest: `14` files, `158/158` tests passed.
- Native Node tests: `58/58` passed.
- TypeScript: passed.
- ESLint: passed.
- i18n parity: `466` keys matched across `pl` and `en`.
- Next.js production build: passed; `58/58` static pages generated.

An earlier full-gate run passed all tests but found one TypeScript narrowing error in the new layout-test helper. The guard was corrected, `pnpm typecheck` passed, and the complete gate was rerun from the beginning to the successful result above.

## Changed files

- `.env.example`
- `CLAUDE.md`
- `app/[locale]/layout.tsx`
- `components/WebMcpProvider.test.tsx`
- `docs/webmcp/evals.md`
- `docs/webmcp/repo-findings.md`
- `lib/webmcp/flags.ts`
- `tests/webmcp-config.test.ts`

## Implementation commit

`def6b8707f2d2fbedc45f1111db5a763aa1d63ed` (`feat: document WebMCP production availability`)

## Concerns

- Native browser discovery and Site tools manifest inspection were not available in this workspace, so they remain explicitly unverified. The operational log records reproducible checks for ChatGPT's in-app browser and Chrome 149.
- Preview and production trial activation depends on registering and configuring a valid token for each exact origin. The repository intentionally contains no real or fake token.
- No implementation blockers or known functional concerns remain within Task 3 scope. Automatic submission remains permanently absent; only the visible human-controlled form can contact kool studio.
