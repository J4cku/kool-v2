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
    name: one('name'), email: one('email'), phone: one('phone'),
    projectType: one('projectType'), location: one('location'),
    propertyStage: one('propertyStage'), area: one('area'),
    desiredScope: many('desiredScope'), designStart: one('designStart'),
    constructionStart: one('constructionStart'), budget: one('budget'),
    requirements: one('requirements'), plansUrl: one('plansUrl'),
    language: one('language'), company: one('company'), ts: one('ts'),
  };
}

function echo(raw: BriefRawInput): BriefEchoValues {
  return {
    name: raw.name ?? '', email: raw.email ?? '', phone: raw.phone ?? '',
    projectType: raw.projectType ?? '', location: raw.location ?? '',
    propertyStage: raw.propertyStage ?? '', area: raw.area ?? '',
    desiredScope: raw.desiredScope ?? [], designStart: raw.designStart ?? '',
    constructionStart: raw.constructionStart ?? '', budget: raw.budget ?? '',
    requirements: raw.requirements ?? '', plansUrl: raw.plansUrl ?? '',
    language: raw.language === 'en' ? 'en' : 'pl',
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
  _previous: BriefFormState,
  formData: FormData,
): Promise<BriefFormState> {
  const raw = readForm(formData);
  const result = validateBrief(raw);
  const values = echo(raw);
  const submittedAt = Date.now();
  if (result.spam) {
    return { status: 'error', formError: 'generic', values, submittedAt };
  }
  if (!isBriefValid(result)) {
    return { status: 'invalid', errors: result.errors, values, submittedAt };
  }
  const clean = result.values;
  const subject = buildBriefSubject(clean);
  const body = buildBriefText(clean);
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return {
      status: 'fallback',
      fallback: { reason: 'unconfigured', mailtoHref: buildMailtoHref(subject, body) },
      submitted: clean,
      values,
      submittedAt,
    };
  }
  const delivered = await deliverViaResend(apiKey, clean, subject, body);
  if (!delivered) {
    return {
      status: 'fallback',
      fallback: { reason: 'delivery-failed', mailtoHref: buildMailtoHref(subject, body) },
      submitted: clean,
      values,
      submittedAt,
    };
  }
  await sendReceipt(apiKey, clean, clean.language);
  return { status: 'success', submitted: clean, submittedAt };
}
