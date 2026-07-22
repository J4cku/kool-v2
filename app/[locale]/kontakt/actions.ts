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
