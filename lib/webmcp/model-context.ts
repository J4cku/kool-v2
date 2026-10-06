export type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue };

export type WebMcpTool = Omit<WebMCP.ModelContextTool, 'execute'> & {
  execute: (
    ...args: Parameters<WebMCP.ToolExecuteCallback>
  ) => WebMCP.MaybePromise<JsonValue>;
};

export type WebMcpRegistrationDiagnostic = {
  name: string;
  state: 'registering' | 'registered' | 'failed' | 'unregistered';
  errorCode?: 'registration_failed';
};

export interface RegisterWebMcpToolOptions {
  context?: WebMCP.ModelContext;
  onError?: (diagnostic: WebMcpRegistrationDiagnostic) => void;
}

const activeRegistrations = new WeakMap<WebMCP.ModelContext, Map<string, AbortController>>();
const registrationDiagnostics = new WeakMap<WebMCP.ModelContext, Map<string, WebMcpRegistrationDiagnostic>>();

function currentModelContext(): WebMCP.ModelContext | undefined {
  return typeof document === 'undefined' ? undefined : document.modelContext;
}

export function getWebMcpRegistrationDiagnostics(
  context = currentModelContext(),
): WebMcpRegistrationDiagnostic[] {
  return Array.from(context ? registrationDiagnostics.get(context)?.values() ?? [] : [])
    .map((diagnostic) => ({ ...diagnostic }));
}

export function registerWebMcpTool(
  tool: WebMcpTool,
  options: RegisterWebMcpToolOptions = {},
): () => void {
  const modelContext = options.context ?? currentModelContext();
  if (!modelContext || typeof modelContext.registerTool !== 'function') return () => {};

  let registrations = activeRegistrations.get(modelContext);
  if (!registrations) {
    registrations = new Map();
    activeRegistrations.set(modelContext, registrations);
  }
  if (registrations.has(tool.name)) return () => {};

  let diagnostics = registrationDiagnostics.get(modelContext);
  if (!diagnostics) {
    diagnostics = new Map();
    registrationDiagnostics.set(modelContext, diagnostics);
  }
  const controller = new AbortController();
  const currentRegistrations = registrations;
  const currentDiagnostics = diagnostics;
  currentRegistrations.set(tool.name, controller);
  currentDiagnostics.set(tool.name, { name: tool.name, state: 'registering' });

  const onFailure = () => {
    if (currentRegistrations.get(tool.name) !== controller || controller.signal.aborted) return;
    currentRegistrations.delete(tool.name);
    controller.abort();
    const diagnostic: WebMcpRegistrationDiagnostic = {
      name: tool.name,
      state: 'failed',
      errorCode: 'registration_failed',
    };
    currentDiagnostics.set(tool.name, diagnostic);
    try {
      options.onError?.({ ...diagnostic });
    } catch {
      return;
    }
  };

  try {
    void Promise.resolve(modelContext.registerTool(tool, { signal: controller.signal }))
      .then(() => {
        if (currentRegistrations.get(tool.name) === controller && !controller.signal.aborted) {
          currentDiagnostics.set(tool.name, { name: tool.name, state: 'registered' });
        }
      }, onFailure);
  } catch {
    onFailure();
  }

  return () => {
    if (currentRegistrations.get(tool.name) !== controller) return;
    currentRegistrations.delete(tool.name);
    currentDiagnostics.set(tool.name, { name: tool.name, state: 'unregistered' });
    controller.abort();
  };
}
