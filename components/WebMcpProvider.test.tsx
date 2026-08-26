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

  it('registers the debug tool in production when both public gates are enabled', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_WEBMCP_ENABLED', 'true');
    vi.stubEnv('NEXT_PUBLIC_WEBMCP_DEBUG', 'true');
    const view = render(<WebMcpProvider locale="pl" />);

    expect(registerWebMcpTool).toHaveBeenCalledOnce();
    expect(vi.mocked(registerWebMcpTool).mock.calls[0][0].name).toBe('kool_webmcp_debug');
    view.unmount();
    expect(unregister).toHaveBeenCalledOnce();
  });
});
