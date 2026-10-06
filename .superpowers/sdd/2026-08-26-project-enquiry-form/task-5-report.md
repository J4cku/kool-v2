# Task 5 Report: Localized Form and Privacy Disclosure

## Implementation

- Replaced the brief notice string in both locales with the exact approved fragments.
- Rendered the notice's internal privacy-policy link with `Link` from `@/i18n/navigation`.
- Replaced both privacy-policy contact disclosures with the exact approved field, Resend delivery/receipt, and intentional email-app fallback copy.
- Added bilingual content coverage and an observable form-link assertion.
- Added localized-navigation boundary mocks to the two form suites that render the real `BriefForm` under Vitest/jsdom.

## TDD evidence

- RED: `pnpm exec vitest run lib/brief-privacy.test.ts` — exit 1, 2 expected failures (notice was a string; policy omitted Resend/canonical field details).
- GREEN: `pnpm exec vitest run lib/brief-privacy.test.ts` — exit 0, 2/2 tests passed.
- Focused regression: `pnpm exec vitest run components/kontakt/BriefModal.pending.test.tsx components/kontakt/BriefForm.test.tsx lib/brief-privacy.test.ts` — exit 0, 5/5 tests passed.

## Verification

- `pnpm check:i18n` — exit 0; 430 keys match across `pl` and `en`.
- `pnpm typecheck` — exit 0.
- `pnpm check` — exit 0; 111 Vitest tests and 57 Node tests passed, followed by successful typecheck, lint, i18n parity, and production build.
- `git diff --check` — exit 0.

## Self-review

- Copy matches the task brief exactly and names every enquiry field, including optional phone and plans/photos URL.
- Disclosure accurately distinguishes configured Resend processing and confirmation receipt from the user-controlled email-app fallback.
- No consent checkbox, validation condition, legal exclusivity, storage region, fixed retention period, or legal basis was added.
