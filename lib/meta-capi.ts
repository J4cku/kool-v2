/* Meta Conversions API — the server half of the Lead event.

   Framework-free on purpose: no 'use server', no next/headers, no React, and
   node:crypto as the only import. The server action reads the request context
   and hands plain values in; this module just hashes, shapes and POSTs. That
   is what lets tests/meta-capi.test.ts import it directly under
   `node --experimental-strip-types`, the same arrangement lib/brief.ts has
   with tests/brief-validation.test.ts.

   Design: docs/superpowers/specs/2026-08-27-meta-pixel-capi-design.md */
import { createHash } from 'node:crypto';

/* Newest live Graph version as of 2026-08-27. Meta keeps a version usable for
   about two years, so this is a periodic bump, not a moving target. */
export const META_GRAPH_VERSION = 'v26.0';

/* Mirrored verbatim in components/kontakt/BriefForm.tsx's browser Lead —
   Meta matches the two events on (event_name, event_id), but a matching
   content_name is what makes them legible as one thing in Events Manager. */
const CONTENT_NAME = 'project-brief';

/* Meta's advanced-matching normalisation: trim, lowercase, sha256 hex. An
   empty field must be omitted from user_data entirely rather than sent as
   the hash of "" — hence null instead of a digest. */
export function hashUserField(value: string): string | null {
  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return null;
  }
  return createHash('sha256').update(normalized, 'utf8').digest('hex');
}

/* Everything that is not a letter in any script. Built from a string rather
   than written as a /…/gu literal because tsconfig targets es5, where tsc
   rejects the unicode flag outright (TS1501) — the runtime, Node and every
   browser we ship to, has supported property escapes for years. */
const NON_LETTER = new RegExp('[^\\p{L}]', 'gu');

/* Meta expects `fn` to be a bare given name: first token, letters only.
   \p{L} keeps Polish diacritics intact — "Łukasz" hashes as "łukasz", not as
   "ukasz", which would never match anything in Meta's graph. */
export function normalizeFirstName(fullName: string): string {
  const [first = ''] = fullName.trim().split(/\s+/);
  return first.toLowerCase().replace(NON_LETTER, '');
}

export interface MetaLeadInput {
  /* Shared with the browser Pixel's eventID — the dedup key. */
  eventId: string;
  /* Unix seconds, not milliseconds. */
  eventTime: number;
  eventSourceUrl: string;
  email: string;
  name: string;
  /* Raw brief projectType key ('mieszkanie', 'dom', …). */
  projectType: string;
  clientIp?: string | null;
  userAgent?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  testEventCode?: string | null;
}

interface MetaUserData {
  em?: string[];
  fn?: string[];
  client_ip_address?: string;
  client_user_agent?: string;
  fbp?: string;
  fbc?: string;
}

interface MetaCustomData {
  content_name: string;
  content_category?: string;
}

interface MetaLeadEvent {
  event_name: 'Lead';
  event_time: number;
  event_id: string;
  event_source_url: string;
  action_source: 'website';
  user_data: MetaUserData;
  custom_data: MetaCustomData;
}

export interface MetaLeadPayload {
  data: [MetaLeadEvent];
  test_event_code?: string;
}

function present(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/* Everything Meta gets about a lead, and nothing else: a hashed e-mail, a
   hashed first name, the request's IP/user-agent/Meta cookies for matching,
   and the project type as a category. Location, budget, priorities and plan
   links stay on our side.

   Keys whose value is missing are omitted rather than sent empty — Meta
   rejects empty strings in user_data instead of ignoring them. */
export function buildMetaLeadPayload(input: MetaLeadInput): MetaLeadPayload {
  const userData: MetaUserData = {};

  const email = hashUserField(input.email);
  if (email) {
    userData.em = [email];
  }

  const firstName = hashUserField(normalizeFirstName(input.name));
  if (firstName) {
    userData.fn = [firstName];
  }

  const clientIp = present(input.clientIp);
  if (clientIp) {
    userData.client_ip_address = clientIp;
  }

  const userAgent = present(input.userAgent);
  if (userAgent) {
    userData.client_user_agent = userAgent;
  }

  const fbp = present(input.fbp);
  if (fbp) {
    userData.fbp = fbp;
  }

  const fbc = present(input.fbc);
  if (fbc) {
    userData.fbc = fbc;
  }

  const customData: MetaCustomData = { content_name: CONTENT_NAME };
  const category = present(input.projectType);
  if (category) {
    customData.content_category = category;
  }

  const payload: MetaLeadPayload = {
    data: [
      {
        event_name: 'Lead',
        event_time: input.eventTime,
        event_id: input.eventId,
        event_source_url: input.eventSourceUrl,
        action_source: 'website',
        user_data: userData,
        custom_data: customData,
      },
    ],
  };

  const testEventCode = present(input.testEventCode);
  if (testEventCode) {
    payload.test_event_code = testEventCode;
  }

  return payload;
}

/* Meta answers errors with { error: { message, code, … } }; surface just the
   message, falling back to the raw body when it is not the expected shape. */
function describeError(body: string): string {
  try {
    const parsed: unknown = JSON.parse(body);
    if (parsed && typeof parsed === 'object' && 'error' in parsed) {
      const error = (parsed as { error?: { message?: unknown } }).error;
      if (typeof error?.message === 'string') {
        return error.message;
      }
    }
  } catch {
    // Not JSON — fall through to the raw body.
  }
  return body.slice(0, 300);
}

/* Best-effort by contract: called from after(), so the visitor already has
   the success screen. Every failure path returns false and logs one line —
   a dead access token is otherwise completely silent, and the Vercel log is
   the only place anyone would notice it. */
export async function sendMetaLeadEvent(
  input: MetaLeadInput,
  accessToken: string,
  pixelId: string
): Promise<boolean> {
  const endpoint = `https://graph.facebook.com/${META_GRAPH_VERSION}/${pixelId}/events`;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...buildMetaLeadPayload(input),
        access_token: accessToken,
      }),
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error(`[meta-capi] Lead rejected (${res.status}): ${describeError(body)}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error(
      `[meta-capi] Lead send failed: ${error instanceof Error ? error.message : String(error)}`
    );
    return false;
  }
}
