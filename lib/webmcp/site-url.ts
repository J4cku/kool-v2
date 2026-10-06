import { BASE_URL } from '@/lib/site';

export function webMcpSiteUrl(path: string): string {
  const origin = typeof document === 'undefined' ? BASE_URL : document.location.origin;
  return new URL(path, origin).href;
}
