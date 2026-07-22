import { afterEach, describe, expect, it } from 'vitest';
import {
  denyAnalyticsConsent,
  grantAnalyticsConsent,
  pageTypeFromPath,
  trackBriefMailtoFallback,
  trackBriefStart,
  trackBriefSubmit,
  trackCaseEngaged,
  trackCtaClick,
  trackEmailClick,
} from '@/lib/analytics';

type GtagCall = unknown[];
type WindowWithGtag = { gtag?: (...args: unknown[]) => void };

function installGtag(): GtagCall[] {
  const calls: GtagCall[] = [];
  (window as unknown as WindowWithGtag).gtag = (...args: unknown[]) => {
    calls.push(args);
  };
  return calls;
}

function removeGtag(): void {
  delete (window as unknown as WindowWithGtag).gtag;
}

// The params object of the last dispatched event/consent call.
function lastParams(calls: GtagCall[]): Record<string, unknown> {
  const call = calls[calls.length - 1];
  return call[2] as Record<string, unknown>;
}

afterEach(removeGtag);

describe('analytics wrapper — inert when gtag is absent', () => {
  it('no-ops and never throws with no gtag loaded', () => {
    removeGtag();
    expect(() => {
      trackCtaClick({ page_type: 'service', cta_text: 'x', position: 'service-cta' });
      trackBriefStart({ page_path: '/pl/kontakt' });
      trackEmailClick({ page_type: 'contact', position: 'footer' });
      trackCaseEngaged({ case_id: 'walecznych' });
      grantAnalyticsConsent();
      denyAnalyticsConsent();
    }).not.toThrow();
  });

  it('brief helpers still return an event id when gtag is absent', () => {
    removeGtag();
    expect(typeof trackBriefSubmit()).toBe('string');
    expect(trackBriefSubmit().length).toBeGreaterThan(7);
    expect(typeof trackBriefMailtoFallback()).toBe('string');
  });

  it('never throws even if gtag itself throws', () => {
    (window as unknown as WindowWithGtag).gtag = () => {
      throw new Error('boom');
    };
    expect(() =>
      trackCtaClick({ page_type: 'home', cta_text: 'x', position: 'hub' })
    ).not.toThrow();
    expect(() => grantAnalyticsConsent()).not.toThrow();
  });
});

describe('analytics wrapper — event name + param shaping', () => {
  it('cta_click sends exactly the allowed params, including service', () => {
    const calls = installGtag();
    trackCtaClick({
      page_type: 'service',
      service: 'projekt-mieszkania',
      cta_text: 'Umów spotkanie',
      position: 'service-cta',
    });
    expect(calls).toHaveLength(1);
    expect(calls[0][0]).toBe('event');
    expect(calls[0][1]).toBe('cta_click');
    expect(lastParams(calls)).toEqual({
      page_type: 'service',
      service: 'projekt-mieszkania',
      cta_text: 'Umów spotkanie',
      position: 'service-cta',
    });
  });

  it('omits an absent optional service param entirely', () => {
    const calls = installGtag();
    trackCtaClick({ page_type: 'home', cta_text: 'x', position: 'hub' });
    expect(Object.keys(lastParams(calls))).not.toContain('service');
    expect(lastParams(calls)).toEqual({ page_type: 'home', cta_text: 'x', position: 'hub' });
  });

  it('email_click carries only page_type + position — never an address', () => {
    const calls = installGtag();
    trackEmailClick({ page_type: 'contact', position: 'footer' });
    expect(calls[0][1]).toBe('email_click');
    expect(Object.keys(lastParams(calls)).sort()).toEqual(['page_type', 'position']);
    expect(JSON.stringify(lastParams(calls))).not.toContain('@');
  });

  it('case_engaged sends case_id and optional service', () => {
    const calls = installGtag();
    trackCaseEngaged({ case_id: 'walecznych', service: 'projekt-mieszkania' });
    expect(calls[0][1]).toBe('case_engaged');
    expect(lastParams(calls)).toEqual({
      case_id: 'walecznych',
      service: 'projekt-mieszkania',
    });
  });

  it('brief_start carries a bare page_path only', () => {
    const calls = installGtag();
    trackBriefStart({ page_path: '/pl/kontakt' });
    expect(calls[0][1]).toBe('brief_start');
    expect(lastParams(calls)).toEqual({ page_path: '/pl/kontakt' });
  });
});

describe('analytics wrapper — brief_submit event_id', () => {
  it('generates a fresh, non-empty id per call', () => {
    const calls = installGtag();
    const first = trackBriefSubmit();
    const second = trackBriefSubmit();

    expect(first).not.toEqual(second);
    expect(first.length).toBeGreaterThan(7);

    // The returned id is exactly the one dispatched, and it is the only param
    // when no service is supplied.
    expect(calls[0][1]).toBe('brief_submit');
    expect(lastParams([calls[0]])).toEqual({ event_id: first });
    expect((calls[1][2] as Record<string, unknown>).event_id).toBe(second);
  });

  it('brief_mailto_fallback carries only a fresh event_id', () => {
    const calls = installGtag();
    const id = trackBriefMailtoFallback();
    expect(calls[0][1]).toBe('brief_mailto_fallback');
    expect(lastParams(calls)).toEqual({ event_id: id });
  });
});

describe('analytics wrapper — consent + page_type', () => {
  it('grant/deny push a Consent Mode v2 update for analytics_storage only', () => {
    const calls = installGtag();
    grantAnalyticsConsent();
    expect(calls[0]).toEqual(['consent', 'update', { analytics_storage: 'granted' }]);
    denyAnalyticsConsent();
    expect(calls[1]).toEqual(['consent', 'update', { analytics_storage: 'denied' }]);
  });

  it('maps routes to coarse, non-PII page types', () => {
    expect(pageTypeFromPath('/')).toBe('home');
    expect(pageTypeFromPath('/kontakt')).toBe('contact');
    expect(pageTypeFromPath('/studio')).toBe('studio');
    expect(pageTypeFromPath('/oferta')).toBe('services');
    expect(pageTypeFromPath('/oferta/projekt-mieszkania')).toBe('service');
    expect(pageTypeFromPath('/projekty')).toBe('projects');
    expect(pageTypeFromPath('/projekty/walecznych')).toBe('project');
    // tolerant of a leading locale segment
    expect(pageTypeFromPath('/en/projekty/walecznych')).toBe('project');
    expect(pageTypeFromPath('/nieznane')).toBe('other');
  });
});
