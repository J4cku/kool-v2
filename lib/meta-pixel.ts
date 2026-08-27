/* Browser-side Meta Pixel, same shape as lib/analytics.ts: a plain module
   (no 'use client') whose every export is a no-op until the loader has run,
   so callers never have to know whether the pixel exists. Loading is driven
   by components/MetaPixel.tsx, which owns the consent gate — nothing here
   decides whether the pixel may run.

   Design: docs/superpowers/specs/2026-08-27-meta-pixel-capi-design.md */

const FBEVENTS_SRC = 'https://connect.facebook.net/en_US/fbevents.js';

/* Meta's global. The stub below is both the callable queue and the object
   fbevents.js later reads its buffered calls out of, hence the properties
   hanging off a function type. Typed precisely rather than as `any` so a
   wrong argument shape is caught here and not in Events Manager. */
type FbqArgs = unknown[];

interface Fbq {
  (...args: FbqArgs): void;
  /* Installed by fbevents.js once it loads; its presence is what switches
     the stub from buffering to dispatching. */
  callMethod?: (...args: FbqArgs) => void;
  queue: FbqArgs[];
  push: (...args: FbqArgs) => void;
  loaded: boolean;
  version: string;
}

declare global {
  interface Window {
    fbq?: Fbq;
    /* Meta's own alias for the same stub. fbevents.js looks for it, so it
       has to be set even though nothing in this codebase reads it. */
    _fbq?: Fbq;
  }
}

function fbqInstance(): Fbq | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return typeof window.fbq === 'function' ? window.fbq : null;
}

/* True once loadMetaPixel has installed the global in this document. Derived
   from window rather than a module-level flag so it cannot go stale relative
   to what the page actually has. */
export function isMetaPixelLoaded(): boolean {
  return fbqInstance() !== null;
}

/* Meta's official base snippet, transcribed from its minified one-liner into
   readable TypeScript, minus its trailing fbq('track','PageView') — in an
   App Router app every in-site navigation is client-side, so PageView is
   driven from one pathname effect instead (MetaPixel.tsx). Keeping the
   snippet's own PageView as well would double-count the landing page.

   Idempotent: the early return is the snippet's own `if(f.fbq)return`, so a
   re-render or a second consent grant cannot install a second copy. */
export function loadMetaPixel(pixelId: string): void {
  if (typeof window === 'undefined' || isMetaPixelLoaded() || !pixelId) {
    return;
  }

  const fbq: Fbq = function fbqStub(...args: FbqArgs) {
    if (fbq.callMethod) {
      /* Meta's snippet writes callMethod.apply(n, arguments); a method call
         binds `this` to the same object, and eslint prefers the spread. */
      fbq.callMethod(...args);
    } else {
      /* fbevents.js has not arrived yet — buffer the call, it replays the
         queue on load. Callers therefore never need to wait for the script. */
      fbq.queue.push(args);
    }
  } as Fbq;

  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = '2.0';
  fbq.queue = [];

  window.fbq = fbq;
  window._fbq ??= fbq;

  const script = document.createElement('script');
  script.async = true;
  script.src = FBEVENTS_SRC;

  /* The original snippet inserts before the first <script> on the page and
     would throw on a document that has none — possible here, since this runs
     from a React effect rather than from inline markup. */
  const firstScript = document.getElementsByTagName('script')[0];
  if (firstScript?.parentNode) {
    firstScript.parentNode.insertBefore(script, firstScript);
  } else {
    document.head.appendChild(script);
  }

  fbq('init', pixelId);
}

/* Standard-event send. eventId is Meta's dedup key: the same string reaches
   the Conversions API as event_id, so the browser event and the server event
   collapse into one conversion (see lib/meta-capi.ts). */
export function metaTrack(
  event: string,
  params?: Record<string, unknown>,
  eventId?: string
): void {
  const fbq = fbqInstance();
  if (!fbq) {
    return;
  }
  /* Built up positionally rather than passing trailing undefineds: fbevents.js
     validates on arguments.length in places, and a bare fbq('track','PageView')
     is what Meta documents. */
  const args: FbqArgs = ['track', event];
  if (params || eventId) {
    args.push(params ?? {});
  }
  if (eventId) {
    args.push({ eventID: eventId });
  }
  fbq(...args);
}

/* Consent withdrawal after a grant: the pixel is already in the document and
   cannot be un-loaded, so tell it to stop sending. A no-op before the pixel
   exists, which is the ordinary case — a visitor who never accepted never
   got one. */
export function setMetaConsent(granted: boolean): void {
  fbqInstance()?.('consent', granted ? 'grant' : 'revoke');
}
