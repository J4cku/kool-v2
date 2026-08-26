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
