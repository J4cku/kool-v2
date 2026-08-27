'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import type { Locale } from '@/i18n/request';
import type { ProjectIndexEntry } from '@/lib/projects/project-search-types';
import { isWebMcpDebugEnabled } from '@/lib/webmcp/flags';
import { registerWebMcpTool } from '@/lib/webmcp/model-context';
import { createWebMcpDebugTool } from '@/lib/webmcp/tools/debug';
import {
  createFindProjectsTool,
  type FindProjectsToolCopy,
} from '@/lib/webmcp/tools/find-projects';
import {
  createPrepareProjectInquiryTool,
  type PrepareProjectInquiryToolCopy,
} from '@/lib/webmcp/tools/prepare-project-inquiry';

type WebMcpProviderProps = {
  locale: Locale;
  projectIndex: readonly ProjectIndexEntry[];
};

export default function WebMcpProvider({ locale, projectIndex }: WebMcpProviderProps) {
  const t = useTranslations('webmcp');
  const debugEnabled = isWebMcpDebugEnabled(
    process.env.NODE_ENV,
    process.env.NEXT_PUBLIC_WEBMCP_DEBUG,
  );

  useEffect(() => {
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
      registerWebMcpTool(
        createPrepareProjectInquiryTool(
          locale,
          t.raw('projectInquiry') as PrepareProjectInquiryToolCopy,
        ),
        { onError },
      ),
    ];

    if (debugEnabled) {
      cleanups.push(registerWebMcpTool(createWebMcpDebugTool(locale, document), { onError }));
    }

    return () => cleanups.forEach((cleanup) => cleanup());
  }, [debugEnabled, locale, projectIndex, t]);

  return null;
}
