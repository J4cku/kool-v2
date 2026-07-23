import assert from 'node:assert/strict';
import test from 'node:test';
import {
  validateBrief,
  isBriefValid,
  buildBriefSubject,
  buildBriefText,
  buildMailtoHref,
  MIN_SUBMIT_MS,
  BRIEF_CONTACT_EMAIL,
  type BriefRawInput,
} from '../lib/brief.ts';

// A fixed clock so the timing heuristic is deterministic.
const NOW = 1_800_000_000_000;

// A complete, well-formed submission that passes every rule. ts is old enough
// to clear the minimum-time check.
function validInput(overrides: Partial<BriefRawInput> = {}): BriefRawInput {
  return {
    name: 'Ola',
    email: 'ola@example.com',
    projectType: 'mieszkanie',
    location: 'Wrocław',
    stage: 'po-odbiorze',
    area: '85',
    startDate: 'wrzesień 2026',
    completionDate: 'wiosna 2027',
    scope: ['uklad-funkcjonalny', 'nadzor-autorski'],
    budget: '200 000 zł',
    priorities: 'Więcej światła; cichsza sypialnia; miejsce do pracy.',
    plansUrl: 'https://drive.example.com/folder',
    company: '',
    ts: String(NOW - 10_000),
    ...overrides,
  };
}

test('valid input passes with no errors and no spam flag', () => {
  const result = validateBrief(validInput(), NOW);
  assert.equal(result.spam, false);
  assert.deepEqual(result.errors, {});
  assert.equal(isBriefValid(result), true);
  // scope preserved
  assert.deepEqual(result.values.scope, ['uklad-funkcjonalny', 'nadzor-autorski']);
});

test('missing email is a required error', () => {
  const result = validateBrief(validInput({ email: '' }), NOW);
  assert.equal(result.errors.email, 'required');
  assert.equal(isBriefValid(result), false);
});

test('malformed email is an email-shape error', () => {
  const result = validateBrief(validInput({ email: 'not-an-email' }), NOW);
  assert.equal(result.errors.email, 'email');
  assert.equal(isBriefValid(result), false);
});

test('missing name is a required error', () => {
  const result = validateBrief(validInput({ name: '   ' }), NOW);
  assert.equal(result.errors.name, 'required');
});

test('missing project type is a required error', () => {
  const result = validateBrief(validInput({ projectType: '' }), NOW);
  assert.equal(result.errors.projectType, 'required');
});

test('unknown project type is an option error', () => {
  const result = validateBrief(validInput({ projectType: 'hacked' }), NOW);
  assert.equal(result.errors.projectType, 'option');
});

test('honeypot field filled flags spam (and blocks validity)', () => {
  const result = validateBrief(validInput({ company: 'http://spam.example' }), NOW);
  assert.equal(result.spam, true);
  assert.equal(isBriefValid(result), false);
});

test('too-fast submit (under the minimum) flags spam', () => {
  const result = validateBrief(validInput({ ts: String(NOW - (MIN_SUBMIT_MS - 500)) }), NOW);
  assert.equal(result.spam, true);
  assert.equal(isBriefValid(result), false);
});

test('a slow-enough submit is not spam', () => {
  const result = validateBrief(validInput({ ts: String(NOW - (MIN_SUBMIT_MS + 500)) }), NOW);
  assert.equal(result.spam, false);
});

test('missing/negative timestamp is not treated as too-fast (no false block)', () => {
  assert.equal(validateBrief(validInput({ ts: '' }), NOW).spam, false);
  // clock skew: client ahead of server -> negative elapsed -> allowed through
  assert.equal(validateBrief(validInput({ ts: String(NOW + 5000) }), NOW).spam, false);
});

test('malformed plans URL is a url error; a valid http(s) URL passes', () => {
  assert.equal(validateBrief(validInput({ plansUrl: 'drive.example.com' }), NOW).errors.plansUrl, 'url');
  assert.equal(validateBrief(validInput({ plansUrl: 'javascript:alert(1)' }), NOW).errors.plansUrl, 'url');
  assert.equal(validateBrief(validInput({ plansUrl: 'http://ok.example' }), NOW).errors.plansUrl, undefined);
  assert.equal(validateBrief(validInput({ plansUrl: '' }), NOW).errors.plansUrl, undefined);
});

test('over-long values are tooLong errors', () => {
  const result = validateBrief(validInput({ name: 'x'.repeat(200) }), NOW);
  assert.equal(result.errors.name, 'tooLong');
});

test('unknown scope keys are dropped, known ones kept', () => {
  const result = validateBrief(
    validInput({ scope: ['uklad-funkcjonalny', 'tampered', 'zestawienia-wyceny'] }),
    NOW
  );
  assert.deepEqual(result.values.scope, ['uklad-funkcjonalny', 'zestawienia-wyceny']);
});

test('subject and body are structured and use canonical Polish labels', () => {
  const { values } = validateBrief(validInput(), NOW);
  assert.equal(buildBriefSubject(values), 'Brief projektowy — mieszkanie');
  const body = buildBriefText(values);
  assert.match(body, /^Brief projektowy — mieszkanie/);
  assert.match(body, /Imię: Ola/);
  assert.match(body, /E-mail: ola@example\.com/);
  assert.match(body, /Etap projektu: po odbiorze kluczy/);
  assert.match(body, /Oczekiwany zakres: układ funkcjonalny, nadzór autorski/);
  // empty optional fields render as em dash
  const sparse = validateBrief(
    { name: 'A', email: 'a@b.co', projectType: 'inne', ts: String(NOW - 10_000) },
    NOW
  ).values;
  assert.match(buildBriefText(sparse), /Lokalizacja: —/);
});

test('mailto href targets the studio inbox with encoded subject and body', () => {
  const { values } = validateBrief(validInput(), NOW);
  const href = buildMailtoHref(buildBriefSubject(values), buildBriefText(values));
  assert.ok(href.startsWith(`mailto:${BRIEF_CONTACT_EMAIL}?`));
  assert.match(href, /subject=Brief%20projektowy/);
  assert.doesNotMatch(href, /\s/); // fully encoded, no raw whitespace
});
