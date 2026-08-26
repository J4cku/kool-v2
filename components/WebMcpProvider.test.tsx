import { cleanup, render } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, describe, expect, it, vi } from 'vitest';
import WebMcpProvider from '@/components/WebMcpProvider';
import { isWebMcpDebugEnabled, isWebMcpEnabled } from '@/lib/webmcp/flags';
import { createWebMcpDebugTool } from '@/lib/webmcp/tools/debug';
import { registerWebMcpTool } from '@/lib/webmcp/model-context';
import type { ProjectIndexEntry } from '@/lib/projects/project-search-types';
import enMessages from '@/messages/en.json';
import plMessages from '@/messages/pl.json';

const unregister = vi.hoisted(() => vi.fn());

const projectIndex: ProjectIndexEntry[] = [{
  catalogOrder: 0,
  slug: 'mieszkanie-walecznych',
  title: 'apartment',
  location: 'Wrocław',
  category: 'residential',
  projectType: 'apartment',
  areaM2: 84,
  objectiveFeatures: ['pre_war_building', 'furniture_design'],
  url: 'https://koolstudio.pl/en/projekty/mieszkanie-walecznych',
}];

vi.mock('@/lib/webmcp/model-context', () => ({
  registerWebMcpTool: vi.fn(() => unregister),
}));

function renderProvider(locale: 'pl' | 'en' = 'pl') {
  return render(
    <NextIntlClientProvider
      locale={locale}
      messages={locale === 'pl' ? plMessages : enMessages}
    >
      <WebMcpProvider locale={locale} projectIndex={projectIndex} />
    </NextIntlClientProvider>,
  );
}

function registeredNames() {
  return vi.mocked(registerWebMcpTool).mock.calls.map(([tool]) => tool.name);
}

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
    expect(tool.description).toBe(
      'Read public diagnostic state for the current kool studio page.',
    );
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
  it('registers neither tool when the production base gate is disabled', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_WEBMCP_ENABLED', 'false');
    renderProvider('pl');
    expect(registerWebMcpTool).not.toHaveBeenCalled();
  });

  it('registers search but not debug when only the production base gate is enabled', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_WEBMCP_ENABLED', 'true');
    vi.stubEnv('NEXT_PUBLIC_WEBMCP_DEBUG', 'false');
    renderProvider('en');
    expect(registeredNames()).toEqual(['kool_find_projects']);
  });

  it('registers search and debug in development and unregisters each exactly once', () => {
    vi.stubEnv('NODE_ENV', 'development');
    const view = renderProvider('pl');

    expect(registeredNames()).toEqual(['kool_find_projects', 'kool_webmcp_debug']);
    view.unmount();
    expect(unregister).toHaveBeenCalledTimes(2);
  });

  it('registers search and debug in production only when both public gates are enabled', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_WEBMCP_ENABLED', 'true');
    vi.stubEnv('NEXT_PUBLIC_WEBMCP_DEBUG', 'true');
    renderProvider('pl');
    expect(registeredNames()).toEqual(['kool_find_projects', 'kool_webmcp_debug']);
  });

  it('re-registers localized search metadata after a locale change', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_WEBMCP_ENABLED', 'true');

    const first = renderProvider('pl');
    expect(vi.mocked(registerWebMcpTool).mock.calls[0][0].title)
      .toBe('Znajdź projekty kool studio');
    first.unmount();

    renderProvider('en');
    expect(vi.mocked(registerWebMcpTool).mock.calls[1][0].title)
      .toBe('Find kool studio projects');
    expect(unregister).toHaveBeenCalledOnce();
  });
});
