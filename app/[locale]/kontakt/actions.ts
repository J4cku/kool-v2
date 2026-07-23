'use server';

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
      return { status: 'success', submitted: clean, submittedAt: now };
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
