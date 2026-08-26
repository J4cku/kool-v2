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
