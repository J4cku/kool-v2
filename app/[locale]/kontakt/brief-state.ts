// Brief-form action state — shared between the server action (actions.ts) and
// the client form (BriefForm.tsx). Kept out of the 'use server' module because
// that file may only export async functions at runtime; a plain const like
// initialBriefState must live in an ordinary module.
import type {
  BriefField,
  BriefErrorCode,
  NormalizedBrief,
} from '@/lib/brief';

// Values echoed back to the form so a failed submit re-populates every field.
export interface BriefEchoValues {
  name: string;
  email: string;
  projectType: string;
  location: string;
  stage: string;
  area: string;
  startDate: string;
  completionDate: string;
  scope: string[];
  budget: string;
  priorities: string;
  plansUrl: string;
}

export type BriefStatus = 'idle' | 'success' | 'invalid' | 'error' | 'fallback';

export interface BriefFormState {
  status: BriefStatus;
  // field -> error code (client localises)
  errors?: Partial<Record<BriefField, BriefErrorCode>>;
  // generic, non-field error code for the status live region
  formError?: 'generic';
  // preserved input for re-population after invalid / error / fallback
  values?: BriefEchoValues;
  // client opens this mailto when server delivery isn't available
  fallback?: { reason: 'unconfigured' | 'delivery-failed'; mailtoHref: string };
  // rendered back on success / fallback so the user sees what was sent
  submitted?: NormalizedBrief;
  // new identity per response so the client effect re-runs on repeat submits
  submittedAt?: number;
}

export const initialBriefState: BriefFormState = { status: 'idle' };
