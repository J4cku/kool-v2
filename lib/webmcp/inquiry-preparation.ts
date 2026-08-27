import type { Locale } from '@/i18n/request';
import type { InquiryDraftPatch, InquiryRecommendedField } from '@/lib/brief';
import { BASE_URL } from '@/lib/site';

export type InquiryPreparationStatus =
  | 'navigate_to_contact'
  | 'prepared'
  | 'form_busy';

export type InquiryPreparationHandlerResult = {
  status: Exclude<InquiryPreparationStatus, 'navigate_to_contact'>;
  missingRecommendedFields: InquiryRecommendedField[];
  opened: boolean;
};

export type InquiryPreparationResult = {
  status: InquiryPreparationStatus;
  contactUrl: string;
  missingRecommendedFields: InquiryRecommendedField[];
  submitted: false;
  opened: boolean;
};

export type InquiryPreparationHandler = (
  patch: InquiryDraftPatch,
) => InquiryPreparationHandlerResult;

let nextRegistrationId = 0;
let currentRegistration: {
  id: number;
  handler: InquiryPreparationHandler;
} | undefined;

export function registerInquiryPreparationHandler(
  handler: InquiryPreparationHandler,
): () => void {
  const id = ++nextRegistrationId;
  currentRegistration = { id, handler };

  return () => {
    if (currentRegistration?.id === id) currentRegistration = undefined;
  };
}

export function prepareProjectInquiry(
  patch: InquiryDraftPatch,
  locale: Locale = patch.language ?? 'pl',
): InquiryPreparationResult {
  const contactUrl = `${BASE_URL}/${locale}/kontakt#brief`;
  if (!currentRegistration) {
    return {
      status: 'navigate_to_contact',
      contactUrl,
      missingRecommendedFields: [],
      submitted: false,
      opened: false,
    };
  }

  const result = currentRegistration.handler(patch);
  return {
    status: result.status,
    contactUrl,
    missingRecommendedFields: result.missingRecommendedFields,
    submitted: false,
    opened: result.opened,
  };
}
