import type { Locale } from '@/i18n/request';
import { getWebMcpRegistrationDiagnostics, type WebMcpTool } from '@/lib/webmcp/model-context';

export function createWebMcpDebugTool(
  locale: Locale,
  currentDocument: Document,
): WebMcpTool {
  const annotations: WebMCP.ToolAnnotations & { debugging: boolean } = {
    readOnlyHint: true,
    debugging: true,
  };

  return {
    name: 'kool_webmcp_debug',
    title: 'kool studio WebMCP diagnostics',
    description: 'Read public diagnostic state for the current kool studio page.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    annotations,
    async execute(_input, { signal }) {
      signal.throwIfAborted();
      return {
        supported: typeof currentDocument.modelContext?.registerTool === 'function',
        locale,
        registrations: getWebMcpRegistrationDiagnostics(currentDocument.modelContext),
      };
    },
  };
}
