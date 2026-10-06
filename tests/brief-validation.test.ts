import assert from 'node:assert/strict';
import test from 'node:test';
import {
  LIMITS,
  BRIEF_CONTACT_EMAIL,
  buildBriefSubject,
  buildBriefText,
  buildMailtoHref,
  isBriefValid,
  validateBrief,
  type BriefRawInput,
  type InquiryField,
} from '../lib/brief.ts';

const NOW = 1_800_000_000_000;
const FULL_RAW: BriefRawInput = {
  name: ' Ola Testowa ', email: ' ola@example.com ', phone: ' +48 600 700 800 ',
  projectType: 'mieszkanie', location: ' Wrocław ', propertyStage: 'po-odbiorze',
  area: ' ok. 85 m² ',
  desiredScope: ['nadzor-autorski', 'uklad-funkcjonalny', 'nadzor-autorski'],
  designStart: ' Q4 2026 ', constructionStart: ' Q2 2027 ',
  budget: ' 180–220 tys. zł ', requirements: ' Ciche miejsce do pracy. ',
  plansUrl: ' https://drive.example.com/folder ', language: 'pl',
  company: '', ts: String(NOW - 10_000),
};

test('normalizes and formats a complete canonical enquiry', () => {
  const result = validateBrief(FULL_RAW, NOW);
  assert.equal(isBriefValid(result), true);
  assert.equal(buildBriefSubject(result.values), 'Brief projektowy — mieszkanie');
  assert.equal(buildBriefText(result.values), [
    'Brief projektowy — mieszkanie', '',
    'Imię: Ola Testowa', 'E-mail: ola@example.com', 'Telefon: +48 600 700 800',
    'Typ projektu: mieszkanie', 'Lokalizacja: Wrocław',
    'Etap nieruchomości: po odbiorze kluczy',
    'Przybliżona powierzchnia (m²): ok. 85 m²',
    'Oczekiwany zakres: układ funkcjonalny, nadzór autorski',
    'Pożądany start projektu: Q4 2026',
    'Planowany start realizacji: Q2 2027',
    'Przybliżony budżet realizacji: 180–220 tys. zł',
    'Wymagania i priorytety: Ciche miejsce do pracy.',
    'Link do rzutów / zdjęć: https://drive.example.com/folder',
    'Język korespondencji: polski', '',
  ].join('\n'));
});

test('enforces required, option, URL, phone, and timing boundaries', () => {
  assert.equal(validateBrief({ ...FULL_RAW, name: ' ' }, NOW).errors.name, 'required');
  assert.equal(validateBrief({ ...FULL_RAW, email: ' ' }, NOW).errors.email, 'required');
  assert.equal(validateBrief({ ...FULL_RAW, email: 'bad' }, NOW).errors.email, 'email');
  assert.equal(validateBrief({ ...FULL_RAW, projectType: '' }, NOW).errors.projectType, 'required');
  assert.equal(validateBrief({ ...FULL_RAW, projectType: 'bad' }, NOW).errors.projectType, 'option');
  assert.equal(validateBrief({ ...FULL_RAW, propertyStage: 'bad' }, NOW).errors.propertyStage, 'option');
  assert.equal(validateBrief({ ...FULL_RAW, desiredScope: ['bad'] }, NOW).errors.desiredScope, 'option');
  assert.equal(validateBrief({ ...FULL_RAW, language: 'de' }, NOW).errors.language, 'option');
  assert.equal(validateBrief({ ...FULL_RAW, plansUrl: 'ftp://example.com' }, NOW).errors.plansUrl, 'url');
  assert.equal(validateBrief({ ...FULL_RAW, phone: '+44 (0)20 1234-5678' }, NOW).errors.phone, undefined);
  assert.equal(validateBrief({ ...FULL_RAW, company: 'bot' }, NOW).spam, true);
  assert.equal(validateBrief({ ...FULL_RAW, ts: String(NOW - 100) }, NOW).spam, true);
});

test('enforces every canonical string limit and keeps both start facts distinct', () => {
  const cases: Array<[keyof typeof LIMITS, keyof BriefRawInput]> = [
    ['name', 'name'], ['email', 'email'], ['phone', 'phone'], ['location', 'location'],
    ['area', 'area'], ['designStart', 'designStart'],
    ['constructionStart', 'constructionStart'], ['budget', 'budget'],
    ['requirements', 'requirements'], ['plansUrl', 'plansUrl'],
  ];
  for (const [limit, field] of cases) {
    const checked = validateBrief({
      ...FULL_RAW,
      [field]: 'x'.repeat(LIMITS[limit] + 1),
    }, NOW);
    assert.equal(checked.errors[field as InquiryField], 'tooLong', field);
  }
  const checked = validateBrief({
    ...FULL_RAW, designStart: 'Q4 2026', constructionStart: 'Q2 2027',
  }, NOW);
  assert.equal(checked.values.designStart, 'Q4 2026');
  assert.equal(checked.values.constructionStart, 'Q2 2027');
  assert.deepEqual(checked.values.desiredScope, ['uklad-funkcjonalny', 'nadzor-autorski']);
  assert.equal(validateBrief({ ...FULL_RAW, language: undefined }, NOW).values.language, 'pl');
});

test('accepts a sparse enquiry with only the three required fields', () => {
  const result = validateBrief({
    name: 'A', email: 'a@b.co', projectType: 'inne', language: 'en',
    company: '', ts: String(NOW - 10_000),
  }, NOW);
  assert.equal(isBriefValid(result), true);
  assert.equal(result.spam, false);
  assert.deepEqual(result.errors, {});
  assert.equal(result.values.phone, '');
  assert.deepEqual(result.values.desiredScope, []);
  assert.equal(result.values.designStart, '');
  assert.equal(result.values.constructionStart, '');
  assert.equal(result.values.language, 'en');
});

test('fully encodes a sparse mailto with empty fields and language', () => {
  const values = validateBrief({
    name: 'A', email: 'a@b.co', projectType: 'inne', language: 'en',
    ts: String(NOW - 10_000),
  }, NOW).values;
  const subject = buildBriefSubject(values);
  const body = buildBriefText(values);
  const href = buildMailtoHref(subject, body);
  assert.ok(href.startsWith(`mailto:${BRIEF_CONTACT_EMAIL}?`));
  assert.doesNotMatch(href, /\s/);
  const query = new URLSearchParams(href.slice(href.indexOf('?') + 1));
  assert.equal(query.get('subject'), 'Brief projektowy — inne');
  assert.match(query.get('body') ?? '', /Telefon: —/);
  assert.match(query.get('body') ?? '', /Pożądany start projektu: —/);
  assert.match(query.get('body') ?? '', /Planowany start realizacji: —/);
  assert.match(query.get('body') ?? '', /Język korespondencji: angielski/);
});
