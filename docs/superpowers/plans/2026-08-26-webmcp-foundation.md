# WebMCP Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a feature-gated native WebMCP adapter and a development-only `kool_webmcp_debug` tool that can be discovered, invoked, and cleanly unregistered without affecting unsupported browsers.

**Architecture:** A renderless client provider mounted by the shared locale layout registers page tools through a small native `document.modelContext` adapter. Registration lifetime is owned by `AbortController`; feature gates are build-time environment values, and origin isolation is configured globally in Next.js. This slice exposes only a read-only diagnostic tool.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5.9, Vitest/jsdom, Node test runner, `webmcp-types@0.1.5`, native WebMCP imperative API

**Spec:** `docs/superpowers/specs/2026-08-26-webmcp-site-tools-design.md`

## Global Constraints

- Implement Phase 0 and Phase 1 only; do not implement portfolio search, enquiry preparation, or submission.
- Reuse the native `document.modelContext.registerTool()` API; do not add a runtime polyfill or MCP server.
- Unsupported browsers must be a silent no-op.
- Local development enables WebMCP and the debug tool automatically.
- Non-development builds require `NEXT_PUBLIC_WEBMCP_ENABLED=true`; the debug tool additionally requires `NEXT_PUBLIC_WEBMCP_DEBUG=true`.
- The debug tool name is exactly `kool_webmcp_debug` and it must be read-only.
- Apply `Origin-Agent-Cluster: ?1` consistently to application responses.
- Use `@/` imports and existing repository conventions.
- Public UI copy is unchanged; no translation keys are added in this slice.
- Run `pnpm check` and inspect the exit code before handoff.

## File Map

- Create `docs/webmcp/repo-findings.md`: verified Phase 0 repository map and plan deviations.
- Create `types/webmcp.d.ts`: load the ambient declarations from `webmcp-types` without duplicating them.
- Create `lib/webmcp/model-context.ts`: native feature detection, duplicate prevention, registration, error isolation, and cleanup.
- Create `lib/webmcp/model-context.test.ts`: adapter lifecycle tests.
- Create `lib/webmcp/flags.ts`: pure environment-gate helpers.
- Create `lib/webmcp/tools/debug.ts`: diagnostic tool definition.
- Create `components/WebMcpProvider.tsx`: renderless React lifecycle integration.
- Create `components/WebMcpProvider.test.tsx`: feature-gate, tool metadata, invocation, and cleanup tests.
- Modify `vitest.config.ts`: include `lib/**/*.test.ts` in Vitest.
- Modify `app/[locale]/layout.tsx`: mount `WebMcpProvider` with the validated locale.
- Modify `next.config.mjs`: add the origin-agent-cluster response header.
- Create `tests/webmcp-config.test.ts`: verify the Next.js header configuration using the existing Node test lane.
- Modify `package.json` and `pnpm-lock.yaml`: add `webmcp-types@0.1.5` as a development dependency.

---

### Task 1: Record the Verified Repository Findings

**Files:**
- Create: `docs/webmcp/repo-findings.md`

**Interfaces:**
- Consumes: `CLAUDE.md`, `package.json`, `app/[locale]/layout.tsx`, `data/projects.ts`, `components/kontakt/BriefForm.tsx`, `components/kontakt/BriefModal.tsx`, `lib/brief.ts`, `app/[locale]/kontakt/actions.ts`, `instrumentation-client.ts`, `vitest.config.ts`, `next.config.mjs`
- Produces: the factual architecture baseline later implementers use; no runtime interface

- [ ] **Step 1: Reconfirm the repository facts**

Run:

```bash
rg -n '"next"|"react"|"typescript"|"vitest"|"test"|"check"' package.json
rg -n 'projects|localizeProject|BriefForm|submitBrief|featureFlagEnabled|PostHog|Resend' app components data lib instrumentation-client.ts
```

Expected: Next 16, React 19, TypeScript 5.9, canonical project data in `data/projects.ts`, and the existing brief flow in the files named above.

- [ ] **Step 2: Write the findings document**

Create `docs/webmcp/repo-findings.md` with this factual structure:

```markdown
# WebMCP Repository Findings

## Runtime and deployment

- Next.js 16 App Router, React 19, TypeScript, pnpm.
- Locale-prefixed `pl` and `en` routes are rendered below `app/[locale]`.
- Vercel is the production deployment platform.
- `app/[locale]/layout.tsx` is the shared server layout and the integration point for a renderless client provider.

## Portfolio source

- `data/projects.ts` is canonical.
- Existing deterministic fields: slug, title, location, category, status, year, textual area, scope, and localized copy.
- Missing deterministic search fields: curated building-era and objective-feature tags. Later search must not infer or claim them until added explicitly.

## Existing enquiry flow

- `components/kontakt/BriefForm.tsx` renders named localized inputs.
- `lib/brief.ts` owns shared normalization and validation.
- `app/[locale]/kontakt/actions.ts` sends through Resend and falls back to mailto.
- `components/kontakt/BriefModal.tsx` owns dialog visibility.
- The current PostHog `brief-form` gate is known to fail closed in production, so WebMCP rollout will not depend on PostHog flags.

## Verification and observability

- Vitest/jsdom covers component and hook tests.
- Node's test runner covers `tests/*.test.ts`.
- `pnpm check` runs tests, typecheck, lint, i18n parity, and build.
- PostHog analytics is initialized in `instrumentation-client.ts`; WebMCP Phase 0–1 adds no analytics.

## Phase 0–1 files

- Add a native adapter under `lib/webmcp/`.
- Add a renderless `components/WebMcpProvider.tsx` mounted from `app/[locale]/layout.tsx`.
- Add `Origin-Agent-Cluster: ?1` through `next.config.mjs`.
- Add deterministic unit and configuration tests.

## Deviations from the supplied plan

- Do not build a new enquiry form or backend; extend the existing validated flow in a later phase.
- Do not use PostHog feature flags for WebMCP rollout.
- Do not claim portfolio matching on metadata that is not yet canonical.
- Phase 0–1 exposes only `kool_webmcp_debug`.
```

- [ ] **Step 3: Validate the document**

Run:

```bash
rg -n 'TBD|TODO|FIXME' docs/webmcp/repo-findings.md
git diff --check
```

Expected: the first command has no output; `git diff --check` exits 0.

- [ ] **Step 4: Commit the findings**

```bash
git add docs/webmcp/repo-findings.md
git commit -m "docs: record WebMCP repository findings"
```

Expected: one documentation-only commit.

---

### Task 2: Add the Typed Native Registration Adapter

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `vitest.config.ts`
- Create: `types/webmcp.d.ts`
- Create: `lib/webmcp/model-context.test.ts`
- Create: `lib/webmcp/model-context.ts`

**Interfaces:**
- Consumes: ambient `WebMCP.ModelContext`, `WebMCP.ModelContextTool`, and `WebMCP.ToolExecuteCallback` from `webmcp-types@0.1.5`
- Produces: `WebMcpTool`, `RegisterWebMcpToolOptions`, and `registerWebMcpTool(tool, options): () => void`

- [ ] **Step 1: Add the type-only dependency and ambient reference**

Run:

```bash
pnpm add -D webmcp-types@0.1.5
```

Create `types/webmcp.d.ts`:

```ts
/// <reference types="webmcp-types" />
```

Expected: `package.json` contains `webmcp-types` under `devDependencies`; no runtime dependency is added.

- [ ] **Step 2: Extend the Vitest include pattern**

Change `vitest.config.ts` from:

```ts
include: ['{components,hooks}/**/*.test.{ts,tsx}'],
```

to:

```ts
include: ['{components,hooks,lib}/**/*.test.{ts,tsx}'],
```

- [ ] **Step 3: Write the failing adapter lifecycle tests**

Create `lib/webmcp/model-context.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from 'vitest';
import { registerWebMcpTool, type WebMcpTool } from '@/lib/webmcp/model-context';

const cleanups: Array<() => void> = [];

function tool(name = 'test_tool'): WebMcpTool {
  return {
    name,
    description: 'Read test state.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
    execute: async () => ({ ok: true }),
  };
}

function context(registerTool = vi.fn().mockResolvedValue(undefined)) {
  return {
    registerTool,
  } as unknown as WebMCP.ModelContext;
}

afterEach(() => {
  cleanups.splice(0).forEach((cleanup) => cleanup());
  vi.restoreAllMocks();
});

describe('registerWebMcpTool', () => {
  it('does nothing when the browser has no model context', () => {
    const cleanup = registerWebMcpTool(tool(), { context: undefined });
    expect(cleanup).toBeTypeOf('function');
    cleanup();
  });

  it('registers exact metadata with an AbortSignal', () => {
    const registerTool = vi.fn().mockResolvedValue(undefined);
    const definition = tool();
    const cleanup = registerWebMcpTool(definition, { context: context(registerTool) });
    cleanups.push(cleanup);

    expect(registerTool).toHaveBeenCalledOnce();
    expect(registerTool).toHaveBeenCalledWith(
      definition,
      { signal: expect.any(AbortSignal) },
    );
  });

  it('prevents a duplicate live registration and allows it after cleanup', () => {
    const registerTool = vi.fn().mockResolvedValue(undefined);
    const modelContext = context(registerTool);
    const firstCleanup = registerWebMcpTool(tool(), { context: modelContext });
    const duplicateCleanup = registerWebMcpTool(tool(), { context: modelContext });

    expect(registerTool).toHaveBeenCalledOnce();
    duplicateCleanup();
    firstCleanup();

    const remountCleanup = registerWebMcpTool(tool(), { context: modelContext });
    cleanups.push(remountCleanup);
    expect(registerTool).toHaveBeenCalledTimes(2);
  });

  it('aborts registration exactly once during cleanup', () => {
    const registerTool = vi.fn().mockResolvedValue(undefined);
    const cleanup = registerWebMcpTool(tool(), { context: context(registerTool) });
    const signal = registerTool.mock.calls[0][1].signal as AbortSignal;

    expect(signal.aborted).toBe(false);
    cleanup();
    cleanup();
    expect(signal.aborted).toBe(true);
  });

  it('isolates an asynchronous registration failure and frees the name', async () => {
    const error = new Error('registration rejected');
    const registerTool = vi.fn()
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce(undefined);
    const onError = vi.fn();
    const modelContext = context(registerTool);

    registerWebMcpTool(tool(), { context: modelContext, onError });
    await vi.waitFor(() => expect(onError).toHaveBeenCalledWith(error));

    const cleanup = registerWebMcpTool(tool(), { context: modelContext, onError });
    cleanups.push(cleanup);
    expect(registerTool).toHaveBeenCalledTimes(2);
  });

  it('supports the Strict Mode register-cleanup-register sequence', () => {
    const registerTool = vi.fn().mockResolvedValue(undefined);
    const modelContext = context(registerTool);

    const strictCleanup = registerWebMcpTool(tool(), { context: modelContext });
    strictCleanup();
    const liveCleanup = registerWebMcpTool(tool(), { context: modelContext });
    cleanups.push(liveCleanup);

    expect(registerTool).toHaveBeenCalledTimes(2);
  });
});
```

- [ ] **Step 4: Run the adapter test and verify it fails**

Run:

```bash
pnpm vitest run lib/webmcp/model-context.test.ts
```

Expected: FAIL because `lib/webmcp/model-context.ts` does not exist.

- [ ] **Step 5: Implement the minimal adapter**

Create `lib/webmcp/model-context.ts`:

```ts
export type WebMcpTool = WebMCP.ModelContextTool;

export interface RegisterWebMcpToolOptions {
  context?: WebMCP.ModelContext;
  onError?: (error: unknown) => void;
}

const activeRegistrations = new Map<string, AbortController>();

function currentModelContext(): WebMCP.ModelContext | undefined {
  return typeof document === 'undefined' ? undefined : document.modelContext;
}

export function registerWebMcpTool(
  tool: WebMcpTool,
  options: RegisterWebMcpToolOptions = {},
): () => void {
  const modelContext = options.context ?? currentModelContext();
  if (!modelContext || activeRegistrations.has(tool.name)) return () => {};

  const controller = new AbortController();
  activeRegistrations.set(tool.name, controller);

  void modelContext.registerTool(tool, { signal: controller.signal }).catch((error) => {
    if (activeRegistrations.get(tool.name) === controller) {
      activeRegistrations.delete(tool.name);
    }
    if (!controller.signal.aborted) options.onError?.(error);
  });

  return () => {
    if (activeRegistrations.get(tool.name) !== controller) return;
    activeRegistrations.delete(tool.name);
    controller.abort();
  };
}
```

- [ ] **Step 6: Run targeted tests and typecheck**

Run:

```bash
pnpm vitest run lib/webmcp/model-context.test.ts
pnpm typecheck
```

Expected: both commands exit 0.

- [ ] **Step 7: Commit the adapter**

```bash
git add package.json pnpm-lock.yaml vitest.config.ts types/webmcp.d.ts lib/webmcp/model-context.ts lib/webmcp/model-context.test.ts
git commit -m "feat: add native WebMCP registration adapter"
```

Expected: dependency, adapter, and tests land together.

---

### Task 3: Register the Feature-Gated Debug Tool

**Files:**
- Create: `lib/webmcp/flags.ts`
- Create: `lib/webmcp/tools/debug.ts`
- Create: `components/WebMcpProvider.tsx`
- Create: `components/WebMcpProvider.test.tsx`
- Modify: `app/[locale]/layout.tsx`

**Interfaces:**
- Consumes: `registerWebMcpTool(tool): () => void` from Task 2 and `Locale` from `i18n/request.ts`
- Produces: `isWebMcpEnabled(nodeEnv, configured)`, `isWebMcpDebugEnabled(nodeEnv, configured)`, `createWebMcpDebugTool(locale, document)`, and the default `WebMcpProvider` component

- [ ] **Step 1: Write the failing provider and debug-tool tests**

Create `components/WebMcpProvider.test.tsx`:

```tsx
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import WebMcpProvider from '@/components/WebMcpProvider';
import { isWebMcpDebugEnabled, isWebMcpEnabled } from '@/lib/webmcp/flags';
import { createWebMcpDebugTool } from '@/lib/webmcp/tools/debug';
import { registerWebMcpTool } from '@/lib/webmcp/model-context';

const unregister = vi.hoisted(() => vi.fn());

vi.mock('@/lib/webmcp/model-context', () => ({
  registerWebMcpTool: vi.fn(() => unregister),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.unstubAllEnvs();
  document.title = '';
  window.history.replaceState(null, '', '/');
});

describe('WebMCP feature gates', () => {
  it('enables both gates during local development', () => {
    expect(isWebMcpEnabled('development', undefined)).toBe(true);
    expect(isWebMcpDebugEnabled('development', undefined)).toBe(true);
  });

  it('requires exact public flags outside development', () => {
    expect(isWebMcpEnabled('production', 'true')).toBe(true);
    expect(isWebMcpEnabled('production', 'false')).toBe(false);
    expect(isWebMcpDebugEnabled('production', 'true')).toBe(true);
    expect(isWebMcpDebugEnabled('production', undefined)).toBe(false);
  });
});

describe('kool_webmcp_debug', () => {
  it('has narrow read-only metadata and returns current public page state', async () => {
    document.title = 'kool studio';
    window.history.replaceState(null, '', '/pl/projekty');
    const tool = createWebMcpDebugTool('pl', document);
    const signal = new AbortController().signal;

    expect(tool.name).toBe('kool_webmcp_debug');
    expect(tool.annotations).toEqual({ readOnlyHint: true });
    expect(tool.inputSchema).toEqual({
      type: 'object',
      properties: {},
      additionalProperties: false,
    });
    await expect(tool.execute({}, { signal })).resolves.toEqual({
      supported: true,
      locale: 'pl',
      pathname: '/pl/projekty',
      title: 'kool studio',
    });
  });

  it('honors execution cancellation', async () => {
    const tool = createWebMcpDebugTool('en', document);
    const controller = new AbortController();
    controller.abort(new DOMException('Cancelled', 'AbortError'));

    await expect(tool.execute({}, { signal: controller.signal })).rejects.toMatchObject({
      name: 'AbortError',
    });
  });
});

describe('WebMcpProvider', () => {
  it('registers nothing when disabled', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_WEBMCP_ENABLED', 'false');
    render(<WebMcpProvider locale="pl" />);
    expect(registerWebMcpTool).not.toHaveBeenCalled();
  });

  it('registers the debug tool in development and unregisters on cleanup', () => {
    vi.stubEnv('NODE_ENV', 'development');
    const view = render(<WebMcpProvider locale="en" />);

    expect(registerWebMcpTool).toHaveBeenCalledOnce();
    expect(vi.mocked(registerWebMcpTool).mock.calls[0][0].name).toBe('kool_webmcp_debug');
    view.unmount();
    expect(unregister).toHaveBeenCalledOnce();
  });

  it('keeps the debug tool absent when only the production base gate is enabled', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_WEBMCP_ENABLED', 'true');
    vi.stubEnv('NEXT_PUBLIC_WEBMCP_DEBUG', 'false');
    render(<WebMcpProvider locale="pl" />);
    expect(registerWebMcpTool).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the provider test and verify it fails**

Run:

```bash
pnpm vitest run components/WebMcpProvider.test.tsx
```

Expected: FAIL because the provider, flags, and debug tool do not exist.

- [ ] **Step 3: Implement the pure feature gates**

Create `lib/webmcp/flags.ts`:

```ts
export function isWebMcpEnabled(
  nodeEnv: string | undefined,
  configured: string | undefined,
): boolean {
  return nodeEnv === 'development' || configured === 'true';
}

export function isWebMcpDebugEnabled(
  nodeEnv: string | undefined,
  configured: string | undefined,
): boolean {
  return nodeEnv === 'development' || configured === 'true';
}
```

- [ ] **Step 4: Implement the debug tool definition**

Create `lib/webmcp/tools/debug.ts`:

```ts
import type { Locale } from '@/i18n/request';
import type { WebMcpTool } from '@/lib/webmcp/model-context';

export function createWebMcpDebugTool(
  locale: Locale,
  currentDocument: Document,
): WebMcpTool {
  return {
    name: 'kool_webmcp_debug',
    title: 'kool studio WebMCP diagnostics',
    description: 'Read public diagnostic state for the current kool studio page.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
    async execute(_input, { signal }) {
      signal.throwIfAborted();
      return {
        supported: true,
        locale,
        pathname: currentDocument.location?.pathname ?? '',
        title: currentDocument.title,
      };
    },
  };
}
```

- [ ] **Step 5: Implement the renderless provider**

Create `components/WebMcpProvider.tsx`:

```tsx
'use client';

import { useEffect } from 'react';
import type { Locale } from '@/i18n/request';
import { isWebMcpDebugEnabled, isWebMcpEnabled } from '@/lib/webmcp/flags';
import { registerWebMcpTool } from '@/lib/webmcp/model-context';
import { createWebMcpDebugTool } from '@/lib/webmcp/tools/debug';

export default function WebMcpProvider({ locale }: { locale: Locale }) {
  const enabled = isWebMcpEnabled(
    process.env.NODE_ENV,
    process.env.NEXT_PUBLIC_WEBMCP_ENABLED,
  );
  const debugEnabled = isWebMcpDebugEnabled(
    process.env.NODE_ENV,
    process.env.NEXT_PUBLIC_WEBMCP_DEBUG,
  );

  useEffect(() => {
    if (!enabled || !debugEnabled) return;

    return registerWebMcpTool(createWebMcpDebugTool(locale, document), {
      onError: process.env.NODE_ENV === 'development'
        ? (error) => console.warn('WebMCP registration failed', error)
        : undefined,
    });
  }, [debugEnabled, enabled, locale]);

  return null;
}
```

- [ ] **Step 6: Mount the provider in the shared locale layout**

In `app/[locale]/layout.tsx`, add:

```ts
import WebMcpProvider from '@/components/WebMcpProvider';
```

Then mount it as the first child of `NextIntlClientProvider`:

```tsx
<NextIntlClientProvider locale={locale} messages={messages}>
  <WebMcpProvider locale={locale as Locale} />
  <PageTransition>{children}</PageTransition>
</NextIntlClientProvider>
```

The earlier locale guard guarantees the cast.

- [ ] **Step 7: Run targeted tests, typecheck, and lint**

Run:

```bash
pnpm vitest run components/WebMcpProvider.test.tsx lib/webmcp/model-context.test.ts
pnpm typecheck
pnpm lint
```

Expected: all commands exit 0; tests report no console errors.

- [ ] **Step 8: Commit the provider and debug tool**

```bash
git add components/WebMcpProvider.tsx components/WebMcpProvider.test.tsx lib/webmcp/flags.ts lib/webmcp/tools/debug.ts app/'[locale]'/layout.tsx
git commit -m "feat: expose WebMCP debug site tool"
```

Expected: the renderless provider and one read-only debug tool land together.

---

### Task 4: Require Origin-Keyed Agent Clustering

**Files:**
- Modify: `next.config.mjs`
- Create: `tests/webmcp-config.test.ts`

**Interfaces:**
- Consumes: Next.js `headers()` configuration contract
- Produces: `Origin-Agent-Cluster: ?1` on every matched application response

- [ ] **Step 1: Write the failing configuration test**

Create `tests/webmcp-config.test.ts`:

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import nextConfig from '../next.config.mjs';

test('all application responses request an origin-keyed agent cluster', async () => {
  assert.equal(typeof nextConfig.headers, 'function');
  const rules = await nextConfig.headers();
  const catchAll = rules.find((rule) => rule.source === '/:path*');

  assert.ok(catchAll, 'missing catch-all response-header rule');
  assert.deepEqual(catchAll.headers, [
    { key: 'Origin-Agent-Cluster', value: '?1' },
  ]);
});
```

- [ ] **Step 2: Run the configuration test and verify it fails**

Run:

```bash
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --experimental-strip-types --test tests/webmcp-config.test.ts
```

Expected: FAIL because `nextConfig.headers` is not defined.

- [ ] **Step 3: Add the global header rule**

Add this property to the `nextConfig` object in `next.config.mjs`, before `rewrites()`:

```js
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        { key: 'Origin-Agent-Cluster', value: '?1' },
      ],
    },
  ];
},
```

- [ ] **Step 4: Run the configuration test and build**

Run:

```bash
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --experimental-strip-types --test tests/webmcp-config.test.ts
pnpm build
```

Expected: the test passes and the production build exits 0.

- [ ] **Step 5: Commit the header configuration**

```bash
git add next.config.mjs tests/webmcp-config.test.ts
git commit -m "feat: enable origin isolation for WebMCP"
```

Expected: header configuration and its regression test land together.

---

### Task 5: Verify the Complete Phase 0–1 Slice

**Files:**
- Verify only; modify files only to fix a discovered defect within this plan's scope

**Interfaces:**
- Consumes: all Phase 0–1 deliverables
- Produces: test evidence, commit SHA, changed-file summary, tool manifest, and manual evaluation instructions

- [ ] **Step 1: Run the complete repository gate**

Run:

```bash
pnpm check
```

Expected: tests, typecheck, lint, i18n parity, and build all exit 0. Do not claim success from partial output.

- [ ] **Step 2: Inspect the branch diff**

Run:

```bash
git diff --check origin/main...
git diff --stat origin/main...
git status --short
git log --oneline origin/main..HEAD
```

Expected: no whitespace errors, no unintended files, clean worktree, and only the design plus Phase 0–1 commits.

- [ ] **Step 3: Start a production server with the experimental gates**

Run the build and server through the existing workspace scripts:

```bash
NEXT_PUBLIC_WEBMCP_ENABLED=true NEXT_PUBLIC_WEBMCP_DEBUG=true pnpm build
PORT=${CONDUCTOR_PORT:-8080} pnpm start
```

Keep the server in a background exec session so verification can continue.

Expected: Next.js reports a ready URL on the isolated workspace port.

- [ ] **Step 4: Verify the response header**

Run in another shell:

```bash
curl -sSI "http://localhost:${CONDUCTOR_PORT:-8080}/pl" | rg -i '^origin-agent-cluster: \?1$'
curl -sSI "http://localhost:${CONDUCTOR_PORT:-8080}/pl/does-not-exist" | rg -i '^origin-agent-cluster: \?1$'
```

Expected: both commands print `origin-agent-cluster: ?1`.

- [ ] **Step 5: Verify native discovery in a supported browser**

Open the local or preview URL in a fresh Chrome context with `chrome://flags/#enable-webmcp-testing` enabled, or in the ChatGPT desktop app's built-in browser using GPT-5.6 Sol or Terra. Verify:

```text
Tool name: kool_webmcp_debug
Classification: read-only
Input schema: object with no properties and additionalProperties=false
Result on /pl: supported=true, locale="pl", pathname="/pl", and title equal to the visible document title
Result on /en: supported=true, locale="en", pathname="/en", and title equal to the visible document title
Browser isolation: window.originAgentCluster is true in a fresh browsing context
```

Expected: the tool is discoverable only when both production preview gates are enabled, and invocation matches visible page state.

- [ ] **Step 6: Prepare the checkpoint report**

Run:

```bash
git rev-parse HEAD
git diff --name-status origin/main...
```

Report the literal command output and evidence under these headings:

```text
Commit SHA
Tool manifest: kool_webmcp_debug — read-only — no inputs
Automated verification: pnpm check (exit 0)
Changed files
Known limitations: native WebMCP support and account rollout are required; no production tools are enabled by default
Evaluation prompts:
- "Read this kool page's WebMCP diagnostic state."
- "What WebMCP tools does this page expose?"
- "Find residential projects near 80 m²." (must not call a portfolio tool in Phase 1)
```

Do not create a pull request or deploy externally until the manual debug checkpoint has been reviewed.
