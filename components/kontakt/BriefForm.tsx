'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Link } from '@/i18n/navigation';
import type { BriefFormState } from '@/app/[locale]/kontakt/brief-state';
import {
  PROJECT_TYPES,
  STAGES,
  SCOPE_ITEMS,
  INQUIRY_VISIBLE_FIELD_ORDER,
  INQUIRY_SUBMISSION_FIELD_ORDER,
  LIMITS,
  type InquiryDraft,
  type InquiryDraftPatch,
  type InquiryField,
  type NormalizedBrief,
  type VisibleInquiryField,
} from '@/lib/brief';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Shared control styling: half-white fields on the beige panel — enough
// figure-ground contrast without going full paper-white; coral only as the
// focus accent.
const CONTROL =
  'w-full min-h-[48px] bg-white/50 border border-dark/15 rounded-none px-4 py-3 text-dark text-[16px] leading-normal ' +
  'placeholder:text-muted focus:outline-none focus:border-coral focus:ring-1 focus:ring-coral transition-colors';

export interface BriefFormProps {
  draft: InquiryDraft;
  renderedAt: number | null;
  onDraftPatch: (patch: InquiryDraftPatch) => void;
  onStarted: () => void;
  state: BriefFormState;
  formAction: (payload: FormData) => void;
  isPending: boolean;
}

export default function BriefForm({
  draft,
  renderedAt,
  onDraftPatch,
  onStarted,
  state,
  formAction,
  isPending,
}: BriefFormProps) {
  const t = useTranslations('brief');
  const reduceMotion = useReducedMotion();

  const resultRef = useRef<HTMLDivElement>(null);
  const formErrorRef = useRef<HTMLParagraphElement>(null);
  const invalidSummaryRef = useRef<HTMLParagraphElement>(null);
  const focusedResponseRef = useRef<number | null>(null);

  const handleMeaningfulInteraction = (event: React.SyntheticEvent) => {
    const name = (event.target as HTMLElement & { name?: string }).name;
    if (name === 'company' || name === 'ts') return;
    onStarted();
  };

  const errors = state.status === 'invalid' ? state.errors : undefined;

  useEffect(() => {
    if (state.submittedAt === undefined || focusedResponseRef.current === state.submittedAt) return;
    focusedResponseRef.current = state.submittedAt;
    if (state.status === 'invalid' && state.errors) {
      const firstVisible = INQUIRY_VISIBLE_FIELD_ORDER.find((field) => state.errors?.[field]);
      const target = firstVisible ? document.getElementById(`brief-${firstVisible}`) : null;
      if (target) target.focus();
      else invalidSummaryRef.current?.focus();
      return;
    }
    if (state.status === 'error') {
      formErrorRef.current?.focus();
      return;
    }
    if (state.status === 'success' || state.status === 'fallback') {
      resultRef.current?.focus();
    }
  }, [state]);

  const describedBy = (field: InquiryField, hasHelp: boolean): string | undefined => {
    const ids: string[] = [];
    if (hasHelp) ids.push(`brief-${field}-help`);
    if (errors?.[field]) ids.push(`brief-${field}-error`);
    return ids.length ? ids.join(' ') : undefined;
  };

  const errorText = (field: InquiryField) => {
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
            data-analytics-skip
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
        onFocusCapture={handleMeaningfulInteraction}
        onInput={handleMeaningfulInteraction}
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
        <input type="hidden" name="ts" value={renderedAt === null ? '' : String(renderedAt)} />

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
              autoComplete="name"
              value={draft.name}
              onChange={(event) => onDraftPatch({ name: event.target.value })}
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
              value={draft.email}
              onChange={(event) => onDraftPatch({ email: event.target.value })}
              aria-invalid={errors?.email ? true : undefined}
              aria-describedby={describedBy('email', true)}
              className={CONTROL}
            />
          </Field>

          {/* phone */}
          <Field
            field="phone"
            label={t('fields.phone.label')}
            help={t('fields.phone.help')}
            error={errorText('phone')}
          >
            <input
              id="brief-phone"
              name="phone"
              type="tel"
              maxLength={LIMITS.phone}
              autoComplete="tel"
              value={draft.phone}
              onChange={(event) => onDraftPatch({ phone: event.target.value })}
              aria-invalid={errors?.phone ? true : undefined}
              aria-describedby={describedBy('phone', true)}
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
              value={draft.projectType}
              onChange={(event) => onDraftPatch({
                projectType: event.target.value as InquiryDraft['projectType'],
              })}
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
              value={draft.location}
              onChange={(event) => onDraftPatch({ location: event.target.value })}
              aria-invalid={errors?.location ? true : undefined}
              aria-describedby={describedBy('location', true)}
              className={CONTROL}
            />
          </Field>

          {/* propertyStage */}
          <Field
            field="propertyStage"
            label={t('fields.propertyStage.label')}
            error={errorText('propertyStage')}
          >
            <select
              id="brief-propertyStage"
              name="propertyStage"
              value={draft.propertyStage}
              onChange={(event) => onDraftPatch({
                propertyStage: event.target.value as InquiryDraft['propertyStage'],
              })}
              aria-invalid={errors?.propertyStage ? true : undefined}
              aria-describedby={describedBy('propertyStage', false)}
              className={CONTROL}
            >
              <option value="">{t('fields.propertyStage.placeholder')}</option>
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
              inputMode="decimal"
              maxLength={LIMITS.area}
              placeholder={t('fields.area.placeholder')}
              value={draft.area}
              onChange={(event) => onDraftPatch({ area: event.target.value })}
              aria-invalid={errors?.area ? true : undefined}
              aria-describedby={describedBy('area', false)}
              className={CONTROL}
            />
          </Field>

          {/* desiredScope — checkbox group */}
          <fieldset
            id="brief-desiredScope"
            className="md:col-span-2 border-0 p-0 m-0"
            aria-invalid={errors?.desiredScope ? true : undefined}
            aria-describedby={describedBy('desiredScope', true)}
          >
            <legend className="block text-dark font-[500] text-[13px] uppercase tracking-[0.08em] mb-1">
              {t('fields.desiredScope.label')}
            </legend>
            <p id="brief-desiredScope-help" className="text-muted text-[13px] mb-3">
              {t('fields.desiredScope.help')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              {SCOPE_ITEMS.map((key) => (
                <label
                  key={key}
                  htmlFor={`brief-desiredScope-${key}`}
                  className="flex items-center gap-3 min-h-[44px] cursor-pointer text-dark text-[15px]"
                >
                  <input
                    id={`brief-desiredScope-${key}`}
                    type="checkbox"
                    name="desiredScope"
                    value={key}
                    checked={draft.desiredScope.includes(key)}
                    onChange={(event) => onDraftPatch({
                      desiredScope: event.target.checked
                        ? [...draft.desiredScope, key]
                        : draft.desiredScope.filter((item) => item !== key),
                    })}
                    className="h-5 w-5 shrink-0 cursor-pointer appearance-none border border-dark/15 bg-white/50 checked:border-coral checked:bg-coral transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
                  />
                  <span>{t(`scopeOptions.${key}`)}</span>
                </label>
              ))}
            </div>
            {errors?.desiredScope && (
              <p
                id="brief-desiredScope-error"
                className="text-coral text-[13px] mt-1 font-[500]"
              >
                {errorText('desiredScope')}
              </p>
            )}
          </fieldset>

          {/* designStart */}
          <Field
            field="designStart"
            label={t('fields.designStart.label')}
            error={errorText('designStart')}
          >
            <input
              id="brief-designStart"
              name="designStart"
              type="text"
              maxLength={LIMITS.designStart}
              placeholder={t('fields.designStart.placeholder')}
              value={draft.designStart}
              onChange={(event) => onDraftPatch({ designStart: event.target.value })}
              aria-invalid={errors?.designStart ? true : undefined}
              aria-describedby={describedBy('designStart', false)}
              className={CONTROL}
            />
          </Field>

          {/* constructionStart */}
          <Field
            field="constructionStart"
            label={t('fields.constructionStart.label')}
            error={errorText('constructionStart')}
          >
            <input
              id="brief-constructionStart"
              name="constructionStart"
              type="text"
              maxLength={LIMITS.constructionStart}
              placeholder={t('fields.constructionStart.placeholder')}
              value={draft.constructionStart}
              onChange={(event) => onDraftPatch({ constructionStart: event.target.value })}
              aria-invalid={errors?.constructionStart ? true : undefined}
              aria-describedby={describedBy('constructionStart', false)}
              className={CONTROL}
            />
          </Field>

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
              value={draft.budget}
              onChange={(event) => onDraftPatch({ budget: event.target.value })}
              aria-invalid={errors?.budget ? true : undefined}
              aria-describedby={describedBy('budget', true)}
              className={CONTROL}
            />
          </Field>

          {/* requirements */}
          <Field
            field="requirements"
            className="md:col-span-2"
            label={t('fields.requirements.label')}
            help={t('fields.requirements.help')}
            error={errorText('requirements')}
          >
            <textarea
              id="brief-requirements"
              name="requirements"
              rows={4}
              maxLength={LIMITS.requirements}
              value={draft.requirements}
              onChange={(event) => onDraftPatch({ requirements: event.target.value })}
              aria-invalid={errors?.requirements ? true : undefined}
              aria-describedby={describedBy('requirements', true)}
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
              value={draft.plansUrl}
              onChange={(event) => onDraftPatch({ plansUrl: event.target.value })}
              aria-invalid={errors?.plansUrl ? true : undefined}
              aria-describedby={describedBy('plansUrl', true)}
              className={CONTROL}
            />
          </Field>
        </div>
        <input type="hidden" name="language" value={draft.language} />

        {/* Live status region: pending / invalid summary / generic error. */}
        <div aria-live="polite" aria-atomic="true" className="mt-8">
          {isPending && <p className="text-muted text-[15px]">{t('status.sending')}</p>}
          {!isPending && state.status === 'invalid' && (
            <p
              ref={invalidSummaryRef}
              tabIndex={-1}
              className="text-coral text-[15px] font-[500] outline-none"
            >
              {t('errors.summary')}
            </p>
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
            {t('privacy.beforeLink')}
            <Link
              href="/polityka-prywatnosci"
              className="underline underline-offset-2 hover:text-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
            >
              {t('privacy.link')}
            </Link>
            {t('privacy.afterLink')}
          </p>
        </div>
      </form>
    </motion.div>
  );
}

// --- Internal presentational helpers -----------------------------------

interface FieldProps {
  field: VisibleInquiryField;
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
  const rows = INQUIRY_SUBMISSION_FIELD_ORDER.map((field) => {
    let value: string;
    if (field === 'projectType') value = submitted.projectType
      ? t(`projectTypeOptions.${submitted.projectType}`) : '';
    else if (field === 'propertyStage') value = submitted.propertyStage
      ? t(`stageOptions.${submitted.propertyStage}`) : '';
    else if (field === 'desiredScope') value = submitted.desiredScope
      .map((key) => t(`scopeOptions.${key}`)).join(', ');
    else if (field === 'language') value = t(`languageOptions.${submitted.language}`);
    else value = submitted[field];
    return { field, value };
  }).filter(({ value }) => value.length > 0);

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
