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
