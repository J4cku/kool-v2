import posthog from 'posthog-js';

/* Client-side event capture. posthog is only initialized when
   NEXT_PUBLIC_POSTHOG_KEY is set (instrumentation-client.ts), so guard to
   keep local dev and preview builds silent. */
export function track(event: string, properties?: Record<string, unknown>) {
  if (posthog.__loaded) {
    posthog.capture(event, properties);
  }
}
