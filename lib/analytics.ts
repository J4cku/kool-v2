/* Client-side event capture. posthog is only initialized when
   NEXT_PUBLIC_POSTHOG_KEY is set (instrumentation-client.ts), so guard to
   keep local dev and preview builds silent.

   The dynamic import keeps posthog-js out of the initial bundle (it resolves
   from the module cache once instrumentation-client has loaded it). Events
   fired before init completes are dropped, same as when the key is unset. */
export function track(event: string, properties?: Record<string, unknown>) {
  void import('posthog-js').then(({ default: posthog }) => {
    if (posthog.__loaded) {
      posthog.capture(event, properties);
    }
  });
}
