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
