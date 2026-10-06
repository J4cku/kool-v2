import { afterEach, describe, expect, it, vi } from 'vitest';
import { getWebMcpRegistrationDiagnostics, registerWebMcpTool, type WebMcpTool } from '@/lib/webmcp/model-context';

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

const bigIntResultTool: WebMcpTool = {
  ...tool('bigint_result_tool'),
  // @ts-expect-error BigInt is not a JSON-serializable tool result.
  execute: async () => BigInt(1),
};
void bigIntResultTool;

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

  it('does nothing when the model context has no callable registerTool', () => {
    const cleanup = registerWebMcpTool(tool('partial_context_tool'), {
      context: {} as WebMCP.ModelContext,
    });

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
    await vi.waitFor(() => expect(onError).toHaveBeenCalledWith({ name: 'test_tool', state: 'failed', errorCode: 'registration_failed' }));

    const cleanup = registerWebMcpTool(tool(), { context: modelContext, onError });
    cleanups.push(cleanup);
    expect(registerTool).toHaveBeenCalledTimes(2);
  });

  it('isolates synchronous failure, sanitizes diagnostics and releases the name', () => {
    const registerTool = vi.fn()
      .mockImplementationOnce(() => { throw new Error('private@example.com'); })
      .mockResolvedValueOnce(undefined);
    const modelContext = context(registerTool);
    const onError = vi.fn(() => { throw new Error('diagnostic consumer failed'); });

    expect(() => registerWebMcpTool(tool(), { context: modelContext, onError })).not.toThrow();
    expect(getWebMcpRegistrationDiagnostics(modelContext)).toEqual([
      { name: 'test_tool', state: 'failed', errorCode: 'registration_failed' },
    ]);
    expect(JSON.stringify(onError.mock.calls)).not.toContain('private@example.com');
    expect(registerTool.mock.calls[0][1].signal.aborted).toBe(true);
    cleanups.push(registerWebMcpTool(tool(), { context: modelContext }));
    expect(registerTool).toHaveBeenCalledTimes(2);
  });

  it('isolates an asynchronous error callback that throws', async () => {
    const modelContext = context(vi.fn().mockRejectedValue(new Error('secret')));
    const onError = vi.fn(() => { throw new Error('consumer failure'); });
    registerWebMcpTool(tool('async_callback_failure'), { context: modelContext, onError });
    await vi.waitFor(() => expect(onError).toHaveBeenCalledOnce());
    expect(getWebMcpRegistrationDiagnostics(modelContext)).toEqual([
      { name: 'async_callback_failure', state: 'failed', errorCode: 'registration_failed' },
    ]);
  });

  it('keeps a replacement live when old registration rejects and cleanup runs again', async () => {
    let rejectOld!: (error: Error) => void;
    const registerTool = vi.fn()
      .mockReturnValueOnce(new Promise<void>((_resolve, reject) => { rejectOld = reject; }))
      .mockResolvedValueOnce(undefined);
    const modelContext = context(registerTool);
    const onError = vi.fn();
    const oldCleanup = registerWebMcpTool(tool(), { context: modelContext, onError });
    oldCleanup();
    const newCleanup = registerWebMcpTool(tool(), { context: modelContext, onError });
    cleanups.push(newCleanup);
    oldCleanup();
    rejectOld(new Error('obsolete failure'));
    await vi.waitFor(() => expect(getWebMcpRegistrationDiagnostics(modelContext)).toEqual([
      { name: 'test_tool', state: 'registered' },
    ]));
    expect(registerTool.mock.calls[1][1].signal.aborted).toBe(false);
    expect(onError).not.toHaveBeenCalled();
  });

  it('does not mark a cleaned-up pending registration registered after it resolves', async () => {
    let resolveRegistration!: () => void;
    const modelContext = context(vi.fn().mockReturnValue(new Promise<void>((resolve) => {
      resolveRegistration = resolve;
    })));
    registerWebMcpTool(tool(), { context: modelContext })();
    resolveRegistration();
    await Promise.resolve();
    expect(getWebMcpRegistrationDiagnostics(modelContext)).toEqual([
      { name: 'test_tool', state: 'unregistered' },
    ]);
  });

  it('isolates contexts and returns detached diagnostics', () => {
    const first = context();
    const second = context();
    cleanups.push(registerWebMcpTool(tool(), { context: first }));
    cleanups.push(registerWebMcpTool(tool(), { context: second }));
    expect(first.registerTool).toHaveBeenCalledOnce();
    expect(second.registerTool).toHaveBeenCalledOnce();
    getWebMcpRegistrationDiagnostics(first)[0].state = 'failed';
    expect(getWebMcpRegistrationDiagnostics(first)[0].state).toBe('registering');
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
