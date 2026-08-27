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

const unregisters = vi.hoisted(() => [] as Array<ReturnType<typeof vi.fn>>);
const SAFETY_SENTENCE =
  'Populate the visible project-enquiry form without submitting or contacting kool studio.';

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
  registerWebMcpTool: vi.fn(() => {
    const unregister = vi.fn();
    unregisters.push(unregister);
    return unregister;
  }),
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

function registeredTool(name: string) {
  const call = vi.mocked(registerWebMcpTool).mock.calls.find(([tool]) => tool.name === name);
  if (!call) throw new Error(`${name} was not registered`);
  return call[0];
}

function leafKeys(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return [prefix];
  return Object.entries(value).flatMap(([key, child]) => (
    leafKeys(child, prefix ? `${prefix}.${key}` : key)
  ));
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  unregisters.length = 0;
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
  it('registers both production tools without requiring the base flag', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_WEBMCP_ENABLED', 'false');
    vi.stubEnv('NEXT_PUBLIC_WEBMCP_DEBUG', 'false');
    renderProvider('pl');
    expect(registeredNames()).toEqual([
      'kool_find_projects',
      'kool_prepare_project_inquiry',
    ]);
  });

  it('registers both production tools and debug in development', () => {
    vi.stubEnv('NODE_ENV', 'development');
    renderProvider('pl');

    expect(registeredNames()).toEqual([
      'kool_find_projects',
      'kool_prepare_project_inquiry',
      'kool_webmcp_debug',
    ]);
  });

  it('keeps production debug registration behind its own flag', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_WEBMCP_DEBUG', 'true');
    renderProvider('pl');
    expect(registeredNames()).toEqual([
      'kool_find_projects',
      'kool_prepare_project_inquiry',
      'kool_webmcp_debug',
    ]);
  });

  it('replaces both localized production tools and cleans each registration once', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_WEBMCP_DEBUG', 'false');

    const first = renderProvider('pl');
    expect(registeredTool('kool_find_projects').title).toBe('Znajdź projekty kool studio');
    expect(registeredTool('kool_prepare_project_inquiry').title)
      .toBe('Przygotuj zapytanie projektowe');
    expect(registeredTool('kool_prepare_project_inquiry').description)
      .toContain(SAFETY_SENTENCE);
    first.unmount();
    expect(unregisters).toHaveLength(2);
    expect(unregisters.every((unregister) => unregister.mock.calls.length === 1)).toBe(true);

    renderProvider('en');
    const secondRegistrations = vi.mocked(registerWebMcpTool).mock.calls.slice(2);
    expect(secondRegistrations.map(([tool]) => [tool.name, tool.title])).toEqual([
      ['kool_find_projects', 'Find kool studio projects'],
      ['kool_prepare_project_inquiry', 'Prepare a project inquiry'],
    ]);
    expect(secondRegistrations[1][0].description).toContain(SAFETY_SENTENCE);

    cleanup();
    expect(unregisters).toHaveLength(4);
    expect(unregisters.every((unregister) => unregister.mock.calls.length === 1)).toBe(true);
  });

  it('keeps project-inquiry copy aligned across locales and with visible form choices', () => {
    expect(leafKeys(plMessages.webmcp.projectInquiry).sort())
      .toEqual(leafKeys(enMessages.webmcp.projectInquiry).sort());
    expect(plMessages.webmcp.projectInquiry.description).toContain(SAFETY_SENTENCE);
    expect(enMessages.webmcp.projectInquiry.description).toContain(SAFETY_SENTENCE);

    for (const messages of [plMessages, enMessages]) {
      expect(messages.webmcp.projectInquiry.projectTypes)
        .toEqual(messages.brief.projectTypeOptions);
      expect(messages.webmcp.projectInquiry.stages).toEqual(messages.brief.stageOptions);
      expect(messages.webmcp.projectInquiry.scopeItems).toEqual(messages.brief.scopeOptions);
      expect(messages.webmcp.projectInquiry.languages).toEqual(messages.brief.languageOptions);
    }
  });
});
