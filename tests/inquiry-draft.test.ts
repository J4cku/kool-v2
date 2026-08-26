import assert from 'node:assert/strict';
import test from 'node:test';
import {
  LIMITS,
  applyInquiryDraftPatch,
  createInquiryDraft,
  getMissingRecommendedInquiryFields,
  parseInquiryDraftPatch,
  type InquiryDraft,
  type InquiryLanguage,
  type ProjectType,
} from '../lib/brief.ts';

test('creates an empty draft in the requested language', () => {
  assert.deepEqual(createInquiryDraft('en'), {
    name: '', email: '', phone: '', projectType: '', location: '',
    propertyStage: '', area: '', desiredScope: [], designStart: '',
    constructionStart: '', budget: '', requirements: '', plansUrl: '', language: 'en',
  });
});

test('applies typed patches atomically with replace, clear, omission, and canonical scope order', () => {
  const current: InquiryDraft = {
    ...createInquiryDraft('pl'),
    name: 'Ola',
    location: 'Wrocław',
    desiredScope: ['nadzor-autorski'],
  };
  const changed = applyInquiryDraftPatch(current, {
    name: undefined,
    location: '',
    desiredScope: ['nadzor-autorski', 'uklad-funkcjonalny', 'nadzor-autorski'],
  });
  assert.equal(changed.ok, true);
  if (!changed.ok) return;
  assert.equal(changed.draft.name, 'Ola');
  assert.equal(changed.draft.location, '');
  assert.deepEqual(changed.draft.desiredScope, ['uklad-funkcjonalny', 'nadzor-autorski']);
  const cleared = applyInquiryDraftPatch(changed.draft, { desiredScope: [] });
  assert.equal(cleared.ok, true);
  if (cleared.ok) assert.deepEqual(cleared.draft.desiredScope, []);
});

test('reports every typed option/length error and leaves the source unchanged', () => {
  const current = createInquiryDraft('pl');
  const result = applyInquiryDraftPatch(current, {
    name: 'x'.repeat(LIMITS.name + 1),
    projectType: 'spoofed' as ProjectType,
    language: 'de' as InquiryLanguage,
  });
  assert.deepEqual(result, {
    ok: false,
    errors: { name: 'tooLong', projectType: 'option', language: 'option' },
  });
  assert.deepEqual(current, createInquiryDraft('pl'));
});

test('runtime parsing accepts only plain objects and reports all structural failures', () => {
  for (const input of [null, [], new Date(0)]) {
    assert.deepEqual(parseInquiryDraftPatch(input), {
      ok: false, rootError: 'type', errors: {}, unknownKeys: [],
    });
  }
  assert.deepEqual(parseInquiryDraftPatch({
    name: undefined,
    phone: null,
    desiredScope: 'bad',
    company: '',
    ts: '123',
  }), {
    ok: false,
    errors: { name: 'type', phone: 'type', desiredScope: 'type' },
    unknownKeys: ['company', 'ts'],
  });
});

test('composes parsing and application without partial mutation', () => {
  const current = createInquiryDraft('en');
  const parsed = parseInquiryDraftPatch({
    phone: '+44 (0)20 1234 5678',
    propertyStage: 'remont',
    desiredScope: ['nadzor-autorski', 'uklad-funkcjonalny'],
  });
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  const applied = applyInquiryDraftPatch(current, parsed.patch);
  assert.equal(applied.ok, true);
  if (applied.ok) {
    assert.equal(applied.draft.phone, '+44 (0)20 1234 5678');
    assert.equal(applied.draft.propertyStage, 'remont');
    assert.deepEqual(applied.draft.desiredScope, ['uklad-funkcjonalny', 'nadzor-autorski']);
  }
});

test('reports recommended fields in stable order and ignores phone/plansUrl', () => {
  const draft = {
    ...createInquiryDraft('pl'),
    name: '   ',
    phone: '+48 600 700 800',
    plansUrl: 'https://drive.example.com/folder',
  };
  assert.deepEqual(getMissingRecommendedInquiryFields(draft), [
    'name', 'email', 'projectType', 'location', 'propertyStage', 'area',
    'desiredScope', 'designStart', 'constructionStart', 'budget', 'requirements',
  ]);
});
