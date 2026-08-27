import { act, cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import MetaPixel from '@/components/MetaPixel';
import { META_PIXEL_ID } from '@/lib/site';

/* The two inputs the component reacts to, both driveable from a test: the
   stored consent decision and the raw document path. */
const consentState = vi.hoisted(() => ({
  status: null as 'granted' | 'denied' | 'pending' | null,
}));
const consentListeners = vi.hoisted(() => new Set<() => void>());
const pathnameState = vi.hoisted(() => ({ pathname: '/pl' }));

vi.mock('next/navigation', () => ({
  usePathname: () => pathnameState.pathname,
}));

vi.mock('@/lib/analytics', () => ({
  consentStatus: () => consentState.status,
  subscribeConsentStatus: (onChange: () => void) => {
    consentListeners.add(onChange);
    return () => consentListeners.delete(onChange);
  },
}));

/* fbevents.js never loads in jsdom, so fbq.callMethod is never installed and
   every call stays in the stub's queue — which is exactly the buffer the
   real pixel replays on load, and the most faithful record of what the
   component asked Meta to do. */
function fbqCalls(): unknown[][] {
  return window.fbq?.queue ?? [];
}

function trackedEvents(): unknown[] {
  return fbqCalls()
    .filter((call) => call[0] === 'track')
    .map((call) => call[1]);
}

function pixelScripts(): NodeListOf<HTMLScriptElement> {
  return document.querySelectorAll<HTMLScriptElement>(
    'script[src*="connect.facebook.net"]'
  );
}

function setConsent(status: 'granted' | 'denied' | 'pending' | null) {
  act(() => {
    consentState.status = status;
    consentListeners.forEach((listener) => listener());
  });
}

afterEach(() => {
  cleanup();
  consentListeners.clear();
  consentState.status = null;
  pathnameState.pathname = '/pl';
  delete window.fbq;
  delete window._fbq;
  pixelScripts().forEach((script) => script.remove());
});

describe('MetaPixel', () => {
  it('loads nothing while consent is pending', () => {
    consentState.status = 'pending';
    render(<MetaPixel />);

    expect(pixelScripts()).toHaveLength(0);
    expect(window.fbq).toBeUndefined();
  });

  it('loads nothing when cookies were declined', () => {
    consentState.status = 'denied';
    render(<MetaPixel />);

    expect(pixelScripts()).toHaveLength(0);
    expect(window.fbq).toBeUndefined();
  });

  it('installs the pixel once and reports one PageView after consent', () => {
    consentState.status = 'granted';
    render(<MetaPixel />);

    expect(pixelScripts()).toHaveLength(1);
    expect(fbqCalls()[0]).toEqual(['init', META_PIXEL_ID]);
    expect(trackedEvents()).toEqual(['PageView']);
  });

  it('reports a PageView on a mid-page accept, without a navigation', () => {
    consentState.status = 'pending';
    render(<MetaPixel />);
    expect(window.fbq).toBeUndefined();

    setConsent('granted');

    expect(pixelScripts()).toHaveLength(1);
    expect(trackedEvents()).toEqual(['PageView']);
  });

  it('reports exactly one more PageView per path change', () => {
    consentState.status = 'granted';
    const { rerender } = render(<MetaPixel />);

    act(() => {
      pathnameState.pathname = '/pl/projekty';
      rerender(<MetaPixel />);
    });

    expect(trackedEvents()).toEqual(['PageView', 'PageView']);
    // A locale switch is a different document path, so it counts as one.
    act(() => {
      pathnameState.pathname = '/en/projekty';
      rerender(<MetaPixel />);
    });

    expect(trackedEvents()).toEqual(['PageView', 'PageView', 'PageView']);
    expect(pixelScripts()).toHaveLength(1);
  });

  it('reports nothing on a re-render that does not change the path', () => {
    consentState.status = 'granted';
    const { rerender } = render(<MetaPixel />);

    act(() => {
      rerender(<MetaPixel />);
      rerender(<MetaPixel />);
    });

    expect(trackedEvents()).toEqual(['PageView']);
    expect(pixelScripts()).toHaveLength(1);
  });

  it('revokes consent on withdrawal and re-reports the page on a re-grant', () => {
    consentState.status = 'granted';
    render(<MetaPixel />);

    setConsent('denied');
    expect(fbqCalls().at(-1)).toEqual(['consent', 'revoke']);

    setConsent('granted');
    expect(fbqCalls().filter((call) => call[0] === 'consent')).toEqual([
      ['consent', 'revoke'],
      ['consent', 'grant'],
    ]);
    expect(trackedEvents()).toEqual(['PageView', 'PageView']);
    expect(pixelScripts()).toHaveLength(1);
  });
});
