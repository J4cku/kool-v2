'use client';

import { useActionState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { submitBrief } from '@/app/[locale]/kontakt/actions';
import {
  initialBriefState,
  type BriefFormState,
} from '@/app/[locale]/kontakt/brief-state';
import {
  PROJECT_TYPES,
  STAGES,
  SCOPE_ITEMS,
  BRIEF_FIELD_ORDER,
  LIMITS,
  type BriefField,
  type NormalizedBrief,
} from '@/lib/brief';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Shared control styling: dark/muted borders, coral only as the focus accent.
const CONTROL =
  'w-full min-h-[48px] bg-transparent border border-dark/25 rounded-none px-4 py-3 text-dark text-[16px] leading-normal ' +
  'placeholder:text-muted focus:outline-none focus:border-coral focus:ring-1 focus:ring-coral transition-colors';

// Fields that carry a per-field error code (scope has no error path).
const ERRORABLE_ORDER: BriefField[] = BRIEF_FIELD_ORDER.filter((f) => f !== 'scope');

export default function BriefForm() {
  const t = useTranslations('brief');
  const reduceMotion = useReducedMotion();
  const [state, formAction, isPending] = useActionState<BriefFormState, FormData>(
    submitBrief,
    initialBriefState
  );

  const tsRef = useRef<HTMLInputElement>(null);
  const mountTime = useRef<number | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const formErrorRef = useRef<HTMLParagraphElement>(null);

  const values = state.values;
  const errors = state.status === 'invalid' ? state.errors : undefined;

  // Keep the anti-spam timestamp populated on the client (empty during SSR so
  // there is no hydration mismatch; Date.now() runs in the effect, not during
  // render). Re-apply after each submit if React's form auto-reset cleared it;
  // the original mount time is reused so elapsed only ever grows and never
  // falsely blocks a genuine user.
  useEffect(() => {
    if (mountTime.current === null) mountTime.current = Date.now();
    if (tsRef.current && !tsRef.current.value) {
      tsRef.current.value = String(mountTime.current);
    }
  }, [state.submittedAt]);

  // Post-submit side effects: move focus, open the mailto fallback.
  useEffect(() => {
    if (state.status === 'idle') return;

    if (state.status === 'invalid' && state.errors) {
      const first = ERRORABLE_ORDER.find((f) => state.errors?.[f]);
      if (first) {
        document.getElementById(`brief-${first}`)?.focus();
        return;
      }
    }

    if (state.status === 'error') {
      formErrorRef.current?.focus();
      return;
    }

    if (state.status === 'success' || state.status === 'fallback') {
      resultRef.current?.focus();
    }

    if (state.status === 'fallback' && state.fallback) {
      // Open the user's mail client with the prefilled brief. The manual
      // button below is the reliable path if the browser blocks this.
      window.location.href = state.fallback.mailtoHref;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.submittedAt]);

  const describedBy = (field: BriefField, hasHelp: boolean): string | undefined => {
    const ids: string[] = [];
    if (hasHelp) ids.push(`brief-${field}-help`);
    if (errors?.[field]) ids.push(`brief-${field}-error`);
    return ids.length ? ids.join(' ') : undefined;
  };

  const errorText = (field: BriefField) => {
    const code = errors?.[field];
    return code ? t(`errors.${code}`) : null;
  };

  // --- Result panels (replace the form) ---------------------------------

  if (state.status === 'success') {
    return (
      <ResultPanel refEl={resultRef}>
        <ResultHeading>{t('status.successTitle')}</ResultHeading>
        <p className="text-dark/80 mt-3 mb-8 text-[clamp(15px,1.4vw,18px)] leading-[1.55]">
          {t('status.successNote')}
        </p>
        {state.submitted && <SubmittedSummary submitted={state.submitted} t={t} />}
      </ResultPanel>
    );
  }

  if (state.status === 'fallback') {
    return (
      <ResultPanel refEl={resultRef}>
        <ResultHeading>{t('status.fallbackNote')}</ResultHeading>
        {state.fallback && (
          <a
            href={state.fallback.mailtoHref}
            className="inline-flex items-center gap-2 mt-5 mb-8 border border-dark px-6 py-3 min-h-[48px] font-[600] uppercase tracking-[0.06em] text-dark hover:bg-coral hover:border-coral hover:text-white transition-colors"
          >
            {t('status.fallbackButton')} <span aria-hidden="true">→</span>
          </a>
        )}
        {state.submitted && <SubmittedSummary submitted={state.submitted} t={t} />}
      </ResultPanel>
    );
  }

  // --- The form ---------------------------------------------------------

  const heading = (
    <h2
      className="text-dark font-[700] uppercase leading-tight"
      style={{ fontSize: 'clamp(26px, 3.6vw, 44px)' }}
    >
      {t('heading')}
    </h2>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: reduceMotion ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.8, ease: EASE }}
    >
      {heading}
      <p className="text-muted mt-4 max-w-[640px] text-[clamp(15px,1.4vw,18px)] leading-[1.55]">
        {t('intro')}
      </p>
      <p className="text-muted mt-2 text-[14px]">{t('requiredHint')}</p>

      <form
        id="brief-form"
        action={formAction}
        noValidate
        className="mt-10 md:mt-12"
      >
        {/* Honeypot: off-screen, hidden from assistive tech, out of tab order. */}
        <div
          aria-hidden="true"
          className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden"
        >
          <label htmlFor="brief-company">{t('honeypotLabel')}</label>
          <input
            id="brief-company"
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            defaultValue=""
          />
        </div>
        {/* Anti-spam render timestamp (populated on the client). */}
        <input type="hidden" name="ts" ref={tsRef} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* name */}
          <Field
            field="name"
            label={t('fields.name.label')}
            help={t('fields.name.help')}
            required
            error={errorText('name')}
          >
            <input
              id="brief-name"
              name="name"
              type="text"
              required
              aria-required="true"
              maxLength={LIMITS.name}
              autoComplete="given-name"
              defaultValue={values?.name ?? ''}
              aria-invalid={errors?.name ? true : undefined}
              aria-describedby={describedBy('name', true)}
              className={CONTROL}
            />
          </Field>

          {/* email */}
          <Field
            field="email"
            label={t('fields.email.label')}
            help={t('fields.email.help')}
            required
            error={errorText('email')}
          >
            <input
              id="brief-email"
              name="email"
              type="email"
              required
              aria-required="true"
              inputMode="email"
              maxLength={LIMITS.email}
              autoComplete="email"
              defaultValue={values?.email ?? ''}
              aria-invalid={errors?.email ? true : undefined}
              aria-describedby={describedBy('email', true)}
              className={CONTROL}
            />
          </Field>

          {/* projectType */}
          <Field
            field="projectType"
            label={t('fields.projectType.label')}
            required
            error={errorText('projectType')}
          >
            <select
              id="brief-projectType"
              name="projectType"
              required
              aria-required="true"
              defaultValue={values?.projectType ?? ''}
              aria-invalid={errors?.projectType ? true : undefined}
              aria-describedby={describedBy('projectType', false)}
              className={CONTROL}
            >
              <option value="">{t('fields.projectType.placeholder')}</option>
              {PROJECT_TYPES.map((key) => (
                <option key={key} value={key}>
                  {t(`projectTypeOptions.${key}`)}
                </option>
              ))}
            </select>
          </Field>

          {/* location */}
          <Field
            field="location"
            label={t('fields.location.label')}
            help={t('fields.location.help')}
            error={errorText('location')}
          >
            <input
              id="brief-location"
              name="location"
              type="text"
              maxLength={LIMITS.location}
              placeholder={t('fields.location.placeholder')}
              defaultValue={values?.location ?? ''}
              aria-invalid={errors?.location ? true : undefined}
              aria-describedby={describedBy('location', true)}
              className={CONTROL}
            />
          </Field>

          {/* stage */}
          <Field
            field="stage"
            label={t('fields.stage.label')}
            error={errorText('stage')}
          >
            <select
              id="brief-stage"
              name="stage"
              defaultValue={values?.stage ?? ''}
              aria-invalid={errors?.stage ? true : undefined}
              aria-describedby={describedBy('stage', false)}
              className={CONTROL}
            >
              <option value="">{t('fields.stage.placeholder')}</option>
              {STAGES.map((key) => (
                <option key={key} value={key}>
                  {t(`stageOptions.${key}`)}
                </option>
              ))}
            </select>
          </Field>

          {/* area */}
          <Field
            field="area"
            label={t('fields.area.label')}
            error={errorText('area')}
          >
            <input
              id="brief-area"
              name="area"
              type="text"
              inputMode="numeric"
              maxLength={LIMITS.area}
              placeholder={t('fields.area.placeholder')}
              defaultValue={values?.area ?? ''}
              aria-invalid={errors?.area ? true : undefined}
              aria-describedby={describedBy('area', false)}
              className={CONTROL}
            />
          </Field>

          {/* startDate */}
          <Field
            field="startDate"
            label={t('fields.startDate.label')}
            error={errorText('startDate')}
          >
            <input
              id="brief-startDate"
              name="startDate"
              type="text"
              maxLength={LIMITS.startDate}
              placeholder={t('fields.startDate.placeholder')}
              defaultValue={values?.startDate ?? ''}
              aria-invalid={errors?.startDate ? true : undefined}
              aria-describedby={describedBy('startDate', false)}
              className={CONTROL}
            />
          </Field>

          {/* completionDate */}
          <Field
            field="completionDate"
            label={t('fields.completionDate.label')}
            error={errorText('completionDate')}
          >
            <input
              id="brief-completionDate"
              name="completionDate"
              type="text"
              maxLength={LIMITS.completionDate}
              placeholder={t('fields.completionDate.placeholder')}
              defaultValue={values?.completionDate ?? ''}
              aria-invalid={errors?.completionDate ? true : undefined}
              aria-describedby={describedBy('completionDate', false)}
              className={CONTROL}
            />
          </Field>

          {/* scope — checkbox group */}
          <fieldset
            className="md:col-span-2 border-0 p-0 m-0"
            aria-describedby="brief-scope-help"
          >
            <legend className="block text-dark font-[500] text-[13px] uppercase tracking-[0.08em] mb-1">
              {t('fields.scope.label')}
            </legend>
            <p id="brief-scope-help" className="text-muted text-[13px] mb-3">
              {t('fields.scope.help')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              {SCOPE_ITEMS.map((key) => (
                <label
                  key={key}
                  htmlFor={`brief-scope-${key}`}
                  className="flex items-center gap-3 min-h-[44px] cursor-pointer text-dark text-[15px]"
                >
                  <input
                    id={`brief-scope-${key}`}
                    type="checkbox"
                    name="scope"
                    value={key}
                    defaultChecked={values?.scope?.includes(key) ?? false}
                    className="h-5 w-5 shrink-0 accent-coral"
                  />
                  <span>{t(`scopeOptions.${key}`)}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* budget */}
          <Field
            field="budget"
            className="md:col-span-2"
            label={t('fields.budget.label')}
            help={t('fields.budget.help')}
            error={errorText('budget')}
          >
            <input
              id="brief-budget"
              name="budget"
              type="text"
              maxLength={LIMITS.budget}
              defaultValue={values?.budget ?? ''}
              aria-invalid={errors?.budget ? true : undefined}
              aria-describedby={describedBy('budget', true)}
              className={CONTROL}
            />
          </Field>

          {/* priorities */}
          <Field
            field="priorities"
            className="md:col-span-2"
            label={t('fields.priorities.label')}
            help={t('fields.priorities.help')}
            error={errorText('priorities')}
          >
            <textarea
              id="brief-priorities"
              name="priorities"
              rows={4}
              maxLength={LIMITS.priorities}
              defaultValue={values?.priorities ?? ''}
              aria-invalid={errors?.priorities ? true : undefined}
              aria-describedby={describedBy('priorities', true)}
              className={`${CONTROL} resize-y`}
            />
          </Field>

          {/* plansUrl */}
          <Field
            field="plansUrl"
            className="md:col-span-2"
            label={t('fields.plansUrl.label')}
            help={t('fields.plansUrl.help')}
            error={errorText('plansUrl')}
          >
            <input
              id="brief-plansUrl"
              name="plansUrl"
              type="url"
              inputMode="url"
              maxLength={LIMITS.plansUrl}
              placeholder={t('fields.plansUrl.placeholder')}
              defaultValue={values?.plansUrl ?? ''}
              aria-invalid={errors?.plansUrl ? true : undefined}
              aria-describedby={describedBy('plansUrl', true)}
              className={CONTROL}
            />
          </Field>
        </div>

        {/* Live status region: pending / invalid summary / generic error. */}
        <div aria-live="polite" aria-atomic="true" className="mt-8">
          {isPending && <p className="text-muted text-[15px]">{t('status.sending')}</p>}
          {!isPending && state.status === 'invalid' && (
            <p className="text-coral text-[15px] font-[500]">{t('errors.summary')}</p>
          )}
          {!isPending && state.status === 'error' && (
            <p
              ref={formErrorRef}
              tabIndex={-1}
              className="text-coral text-[15px] font-[500] outline-none"
            >
              {t('status.generic')}
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-col items-start gap-4">
          <button
            id="brief-submit"
            type="submit"
            disabled={isPending}
            data-brief-submit
            className="inline-flex items-center gap-2 border border-dark px-8 py-3 min-h-[48px] font-[600] uppercase tracking-[0.06em] text-dark hover:bg-coral hover:border-coral hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? t('sending') : t('submit')}
            {!isPending && <span aria-hidden="true">→</span>}
          </button>
          <p className="text-muted text-[13px] leading-[1.5] max-w-[560px]">
            {t('privacy')}
          </p>
        </div>
      </form>
    </motion.div>
  );
}

// --- Internal presentational helpers -----------------------------------

interface FieldProps {
  field: BriefField;
  label: string;
  help?: string;
  required?: boolean;
  className?: string;
  error?: string | null;
  children: React.ReactNode;
}

// Label above control, help + error programmatically associated. The control
// itself (passed as children) carries id / aria-describedby / aria-invalid.
function Field({
  field,
  label,
  help,
  required = false,
  className = '',
  error,
  children,
}: FieldProps) {
  return (
    <div className={className}>
      <label
        htmlFor={`brief-${field}`}
        className="block text-dark font-[500] text-[13px] uppercase tracking-[0.08em] mb-1"
      >
        {label}
        {required && (
          <>
            <span className="text-coral" aria-hidden="true">
              {' '}
              *
            </span>
            <span className="sr-only"> (wymagane)</span>
          </>
        )}
      </label>
      {help && (
        <p id={`brief-${field}-help`} className="text-muted text-[13px] mb-2">
          {help}
        </p>
      )}
      {children}
      {error && (
        <p id={`brief-${field}-error`} className="text-coral text-[13px] mt-1 font-[500]">
          {error}
        </p>
      )}
    </div>
  );
}

function ResultPanel({
  refEl,
  children,
}: {
  refEl: React.RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
}) {
  return (
    <div
      ref={refEl}
      tabIndex={-1}
      role="status"
      aria-live="polite"
      className="outline-none"
    >
      {children}
    </div>
  );
}

function ResultHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-dark font-[700] uppercase leading-tight"
      style={{ fontSize: 'clamp(22px, 3vw, 36px)' }}
    >
      {children}
    </h2>
  );
}

// Read-back of the submitted brief (success + fallback). Localises option keys
// and skips empty fields.
function SubmittedSummary({
  submitted,
  t,
}: {
  submitted: NormalizedBrief;
  t: ReturnType<typeof useTranslations>;
}) {
  const rows = BRIEF_FIELD_ORDER.map((field) => {
    let value = '';
    if (field === 'projectType') {
      value = submitted.projectType ? t(`projectTypeOptions.${submitted.projectType}`) : '';
    } else if (field === 'stage') {
      value = submitted.stage ? t(`stageOptions.${submitted.stage}`) : '';
    } else if (field === 'scope') {
      value = submitted.scope.map((k) => t(`scopeOptions.${k}`)).join(', ');
    } else {
      value = submitted[field] as string;
    }
    return { field, value };
  }).filter((row) => row.value.length > 0);

  if (rows.length === 0) return null;

  return (
    <div className="border-t border-dark/15 pt-6">
      <h3 className="text-dark font-[600] text-[13px] uppercase tracking-[0.08em] mb-4">
        {t('status.submittedHeading')}
      </h3>
      <dl className="grid grid-cols-1 sm:grid-cols-[minmax(0,220px)_1fr] gap-x-6 gap-y-3">
        {rows.map(({ field, value }) => (
          <div key={field} className="contents">
            <dt className="text-muted text-[14px]">{t(`fields.${field}.label`)}</dt>
            <dd className="text-dark text-[15px] break-words">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
