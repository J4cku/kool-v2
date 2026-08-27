// Brief-form action state — shared between the server action (actions.ts) and
// the client form (BriefForm.tsx). Kept out of the 'use server' module because
// that file may only export async functions at runtime; a plain const like
// initialBriefState must live in an ordinary module.
import type {
  BriefErrorCode,
  InquiryField,
  NormalizedBrief,
} from '@/lib/brief';

export type BriefStatus = 'idle' | 'success' | 'invalid' | 'error' | 'fallback';

export interface BriefFormState {
  status: BriefStatus;
  // field -> error code (client localises)
  errors?: Partial<Record<InquiryField, BriefErrorCode>>;
  // generic, non-field error code for the status live region
  formError?: 'generic';
  // client opens this mailto when server delivery isn't available
  fallback?: { reason: 'unconfigured' | 'delivery-failed'; mailtoHref: string };
  // rendered back on success / fallback so the user sees what was sent
  submitted?: NormalizedBrief;
  // new identity per response so the client effect re-runs on repeat submits
  submittedAt?: number;
}

export const initialBriefState: BriefFormState = { status: 'idle' };
