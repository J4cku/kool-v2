'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import type { Locale } from '@/i18n/request';
import type { ProjectIndexEntry } from '@/lib/projects/project-search-types';
import { isWebMcpDebugEnabled, isWebMcpEnabled } from '@/lib/webmcp/flags';
import { registerWebMcpTool } from '@/lib/webmcp/model-context';
import { createWebMcpDebugTool } from '@/lib/webmcp/tools/debug';
import {
  createFindProjectsTool,
  type FindProjectsToolCopy,
} from '@/lib/webmcp/tools/find-projects';

type WebMcpProviderProps = {
  locale: Locale;
  projectIndex: readonly ProjectIndexEntry[];
};

export default function WebMcpProvider({ locale, projectIndex }: WebMcpProviderProps) {
  const t = useTranslations('webmcp');
  const enabled = isWebMcpEnabled(
    process.env.NODE_ENV,
    process.env.NEXT_PUBLIC_WEBMCP_ENABLED,
  );
  const debugEnabled = isWebMcpDebugEnabled(
    process.env.NODE_ENV,
    process.env.NEXT_PUBLIC_WEBMCP_DEBUG,
  );

  useEffect(() => {
    if (!enabled) return;

    const onError = process.env.NODE_ENV === 'development'
      ? (error: unknown) => console.warn('WebMCP registration failed', error)
      : undefined;
    const cleanups = [
      registerWebMcpTool(
        createFindProjectsTool(
          locale,
          projectIndex,
          t.raw('projectSearch') as FindProjectsToolCopy,
        ),
        { onError },
      ),
    ];

    if (debugEnabled) {
      cleanups.push(registerWebMcpTool(createWebMcpDebugTool(locale, document), { onError }));
    }

    return () => cleanups.forEach((cleanup) => cleanup());
  }, [debugEnabled, enabled, locale, projectIndex, t]);

  return null;
}
