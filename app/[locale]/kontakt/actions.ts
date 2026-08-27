'use server';

import { after } from 'next/server';
import { cookies, headers } from 'next/headers';
import { sendMetaLeadEvent } from '@/lib/meta-capi';
import { BASE_URL, META_PIXEL_ID } from '@/lib/site';
import {
  validateBrief,
  isBriefValid,
  buildBriefSubject,
  buildBriefText,
  buildMailtoHref,
  BRIEF_CONTACT_EMAIL,
  type BriefRawInput,
  type NormalizedBrief,
} from '@/lib/brief';
import type { BriefEchoValues, BriefFormState } from './brief-state';

function readForm(formData: FormData): BriefRawInput {
  const one = (key: string) => {
    const v = formData.get(key);
    return typeof v === 'string' ? v : undefined;
  };
  const many = (key: string) =>
    formData.getAll(key).filter((v): v is string => typeof v === 'string');

  return {
    name: one('name'),
    email: one('email'),
    projectType: one('projectType'),
    location: one('location'),
    stage: one('stage'),
    area: one('area'),
    startDate: one('startDate'),
    completionDate: one('completionDate'),
    scope: many('scope'),
    budget: one('budget'),
    priorities: one('priorities'),
    plansUrl: one('plansUrl'),
    company: one('company'),
    ts: one('ts'),
  };
}

function echo(raw: BriefRawInput): BriefEchoValues {
  return {
    name: raw.name ?? '',
    email: raw.email ?? '',
    projectType: raw.projectType ?? '',
    location: raw.location ?? '',
    stage: raw.stage ?? '',
    area: raw.area ?? '',
    startDate: raw.startDate ?? '',
    completionDate: raw.completionDate ?? '',
    scope: raw.scope ?? [],
    budget: raw.budget ?? '',
    priorities: raw.priorities ?? '',
    plansUrl: raw.plansUrl ?? '',
  };
}

async function deliverViaResend(
  apiKey: string,
  values: NormalizedBrief,
  subject: string,
  body: string
): Promise<boolean> {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.BRIEF_FROM_EMAIL || 'onboarding@resend.dev',
        to: [process.env.BRIEF_TO_EMAIL || BRIEF_CONTACT_EMAIL],
        reply_to: values.email,
        subject,
        text: body,
      }),
      // Never let a slow provider hang the request indefinitely.
      signal: AbortSignal.timeout(10_000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/* Confirmation receipt to the sender ("we got your brief"). Best-effort:
   a failure here must never fail the submission — the lead has already
   been delivered to the studio inbox. */
async function sendReceipt(
  apiKey: string,
  values: NormalizedBrief,
  locale: 'pl' | 'en'
): Promise<void> {
  const firstName = values.name.trim().split(/\s+/)[0] || values.name;
  const subject =
    locale === 'en'
      ? 'Kool Studio — we received your brief'
      : 'Kool Studio — otrzymaliśmy Twój brief';
  const body =
    locale === 'en'
      ? `Hi ${firstName},\n\nthank you for sending your project brief — it has reached us and we will get back to you within 2 business days.\n\nIf you would like to add anything, just reply to this email.\n\nKool Studio\nZaporoska 83/15, Wrocław\nhello@koolstudio.pl · koolstudio.pl`
      : `Cześć ${firstName},\n\ndziękujemy za przesłanie briefu — dotarł do nas i odezwiemy się w ciągu 2 dni roboczych.\n\nJeśli chcesz coś dodać, po prostu odpowiedz na tę wiadomość.\n\nKool Studio\nZaporoska 83/15, Wrocław\nhello@koolstudio.pl · koolstudio.pl`;

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.BRIEF_FROM_EMAIL || 'onboarding@resend.dev',
        to: [values.email],
        reply_to: process.env.BRIEF_TO_EMAIL || BRIEF_CONTACT_EMAIL,
        subject,
        text: body,
      }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    // Swallowed by design — see the doc comment.
  }
}

/* Server half of the Meta Lead event (lib/meta-capi.ts), gated on the very
   same "akceptuję" as the browser Pixel: privacy.adsBody promises that ad
   tooling is not run without consent, and shipping a hashed e-mail, IP and
   user agent to Meta is ad tooling too — that the transport is server-side
   changes neither the purpose nor the legal basis. The consent state travels
   through the form POST (the marketingConsent hidden input), which is why an
   ad blocker costs the browser event but not this one.

   The request context is read here, up front, and only plain values are
   closed over: headers() and cookies() belong to a request that is already
   finished by the time after() runs its callback. */
async function scheduleMetaLead(options: {
  values: NormalizedBrief;
  locale: 'pl' | 'en';
  eventId: string;
  eventTime: number;
  consentGranted: boolean;
}): Promise<void> {
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!options.consentGranted || !accessToken) {
    return;
  }

  const headerList = await headers();
  const cookieStore = await cookies();

  // x-forwarded-for is a chain (client, proxy, …); Meta wants the first hop.
  const forwarded = headerList.get('x-forwarded-for')?.split(',')[0]?.trim();
  const clientIp = forwarded || headerList.get('x-real-ip') || null;
  const userAgent = headerList.get('user-agent');
  // Only trust the referer when it is one of our own pages; otherwise state
  // the page the form lives on rather than echo an arbitrary URL to Meta.
  const referer = headerList.get('referer');
  const eventSourceUrl = referer?.startsWith(BASE_URL)
    ? referer
    : `${BASE_URL}/${options.locale}/kontakt`;
  const fbp = cookieStore.get('_fbp')?.value ?? null;
  const fbc = cookieStore.get('_fbc')?.value ?? null;

  after(async () => {
    try {
      await sendMetaLeadEvent(
        {
          eventId: options.eventId,
          eventTime: options.eventTime,
          eventSourceUrl,
          email: options.values.email,
          name: options.values.name,
          projectType: options.values.projectType,
          clientIp,
          userAgent,
          fbp,
          fbc,
          testEventCode: process.env.META_TEST_EVENT_CODE ?? null,
        },
        accessToken,
        META_PIXEL_ID
      );
    } catch {
      /* sendMetaLeadEvent already swallows and logs its own failures; this
         is the outer guarantee that nothing about CAPI can ever surface to
         the visitor, whose success screen is long since rendered. */
    }
  });
}

/**
 * Server action wired to the form via useActionState. Validates, screens for
 * spam, then either delivers through Resend (when configured) or returns a
 * mailto fallback the client opens. Never throws — always returns a state.
 */
export async function submitBrief(
  _prev: BriefFormState,
  formData: FormData
): Promise<BriefFormState> {
  const raw = readForm(formData);
  const result = validateBrief(raw);
  const values = echo(raw);
  const now = Date.now();

  // Spam (honeypot / too-fast): reject with a generic message, no detail.
  if (result.spam) {
    return { status: 'error', formError: 'generic', values, submittedAt: now };
  }

  // Field errors: return per-field codes and preserve input.
  if (!isBriefValid(result)) {
    return { status: 'invalid', errors: result.errors, values, submittedAt: now };
  }

  const clean = result.values;
  const subject = buildBriefSubject(clean);
  const body = buildBriefText(clean);

  const apiKey = process.env.RESEND_API_KEY;

  if (apiKey) {
    const ok = await deliverViaResend(apiKey, clean, subject, body);
    if (ok) {
      const locale = formData.get('locale') === 'en' ? 'en' : 'pl';
      await sendReceipt(apiKey, clean, locale);
      /* One uuid per confirmed delivery, minted server-side and returned in
         the state so the browser Lead and the CAPI Lead are provably the
         same string — no hidden field to forge, no client/server drift.
         Only this branch produces a Lead: invalid, spam, mailto fallback and
         delivery failures are not conversions. */
      const metaEventId = crypto.randomUUID();
      await scheduleMetaLead({
        values: clean,
        locale,
        eventId: metaEventId,
        eventTime: Math.floor(now / 1000),
        consentGranted: formData.get('marketingConsent') === 'granted',
      });
      return { status: 'success', submitted: clean, submittedAt: now, metaEventId };
    }
    // Configured but the send failed: fall back to the user's mail client so
    // the brief is not lost.
    return {
      status: 'fallback',
      fallback: { reason: 'delivery-failed', mailtoHref: buildMailtoHref(subject, body) },
      submitted: clean,
      values,
      submittedAt: now,
    };
  }

  // No delivery configured (current state): the client opens a prefilled
  // mailto to hello@koolstudio.pl with the same structured body.
  return {
    status: 'fallback',
    fallback: { reason: 'unconfigured', mailtoHref: buildMailtoHref(subject, body) },
    submitted: clean,
    values,
    submittedAt: now,
  };
}
