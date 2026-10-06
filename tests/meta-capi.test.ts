import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import {
  buildMetaLeadPayload,
  hashUserField,
  normalizeFirstName,
  type MetaLeadInput,
} from '../lib/meta-capi.ts';

// The expected digests are computed here rather than pasted in as literals:
// a hardcoded hash proves only that someone once ran the code, while this
// re-derives Meta's rule (trim, lowercase, sha256 hex) independently.
function sha256(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

const EVENT_ID = 'b3f2b0d6-9d1e-4d3b-8f4a-6d2c1f0e5a77';
const EVENT_TIME = 1_756_282_800;
const EVENT_SOURCE_URL = 'https://koolstudio.pl/pl/kontakt';

function leadInput(overrides: Partial<MetaLeadInput> = {}): MetaLeadInput {
  return {
    eventId: EVENT_ID,
    eventTime: EVENT_TIME,
    eventSourceUrl: EVENT_SOURCE_URL,
    email: 'ola@example.com',
    name: 'Ola Kilińska',
    projectType: 'mieszkanie',
    clientIp: null,
    userAgent: null,
    fbp: null,
    fbc: null,
    testEventCode: null,
    ...overrides,
  };
}

test('hashUserField trims and lowercases before hashing', () => {
  const expected = sha256('test@example.com');
  assert.equal(hashUserField('test@example.com'), expected);
  assert.equal(hashUserField(' TEST@Example.COM '), expected);
  assert.match(expected, /^[0-9a-f]{64}$/);
});

test('hashUserField returns null for empty and whitespace-only input', () => {
  assert.equal(hashUserField(''), null);
  assert.equal(hashUserField('   \t\n '), null);
});

test('normalizeFirstName keeps the first token only', () => {
  assert.equal(normalizeFirstName('Jan Kowalski'), 'jan');
  assert.equal(normalizeFirstName('  Ola   Kilińska  '), 'ola');
});

test('normalizeFirstName preserves Polish diacritics and strips punctuation', () => {
  assert.equal(normalizeFirstName('Łukasz'), 'łukasz');
  assert.equal(normalizeFirstName('Zażółć Gęślą'), 'zażółć');
  assert.equal(normalizeFirstName("O'Brien-Smith Anna"), 'obriensmith');
  assert.equal(normalizeFirstName('Ola123!'), 'ola');
});

test('buildMetaLeadPayload shapes the event Meta expects', () => {
  const payload = buildMetaLeadPayload(leadInput());
  assert.equal(payload.data.length, 1);

  const [event] = payload.data;
  assert.equal(event.event_name, 'Lead');
  assert.equal(event.action_source, 'website');
  assert.equal(event.event_id, EVENT_ID);
  assert.equal(event.event_time, EVENT_TIME);
  assert.equal(event.event_source_url, EVENT_SOURCE_URL);
  assert.deepEqual(event.custom_data, {
    content_name: 'project-brief',
    content_category: 'mieszkanie',
  });
});

test('buildMetaLeadPayload hashes email and first name into one-element arrays', () => {
  const { data } = buildMetaLeadPayload(leadInput());
  const { user_data: userData } = data[0];

  assert.deepEqual(userData.em, [sha256('ola@example.com')]);
  assert.deepEqual(userData.fn, [sha256('ola')]);
  assert.match(userData.em?.[0] ?? '', /^[0-9a-f]{64}$/);
  assert.match(userData.fn?.[0] ?? '', /^[0-9a-f]{64}$/);
});

test('buildMetaLeadPayload omits missing matching keys instead of sending empties', () => {
  const { data } = buildMetaLeadPayload(leadInput());
  const { user_data: userData } = data[0];

  // Absent, not '' — Meta rejects empty strings in user_data.
  assert.equal('client_ip_address' in userData, false);
  assert.equal('client_user_agent' in userData, false);
  assert.equal('fbp' in userData, false);
  assert.equal('fbc' in userData, false);
});

test('buildMetaLeadPayload includes request context when it is available', () => {
  const { data } = buildMetaLeadPayload(
    leadInput({
      clientIp: '203.0.113.7',
      userAgent: 'Mozilla/5.0 (iPhone)',
      fbp: 'fb.1.1756282800.1234567890',
      fbc: 'fb.1.1756282800.IwAR0abc',
    })
  );
  const { user_data: userData } = data[0];

  assert.equal(userData.client_ip_address, '203.0.113.7');
  assert.equal(userData.client_user_agent, 'Mozilla/5.0 (iPhone)');
  assert.equal(userData.fbp, 'fb.1.1756282800.1234567890');
  assert.equal(userData.fbc, 'fb.1.1756282800.IwAR0abc');
});

test('buildMetaLeadPayload omits an empty content_category', () => {
  const { data } = buildMetaLeadPayload(leadInput({ projectType: '' }));
  assert.equal('content_category' in data[0].custom_data, false);
  assert.equal(data[0].custom_data.content_name, 'project-brief');
});

test('raw email and raw name never appear in the serialised payload', () => {
  const serialised = JSON.stringify(
    buildMetaLeadPayload(leadInput({ email: 'ola@example.com', name: 'Ola Kilińska' }))
  );

  assert.equal(serialised.includes('ola@example.com'), false);
  assert.equal(serialised.includes('example.com'), false);
  assert.equal(serialised.toLowerCase().includes('ola'), false);
  assert.equal(serialised.includes('Kilińska'), false);
});

test('test_event_code is present only when supplied', () => {
  const withoutCode = buildMetaLeadPayload(leadInput());
  assert.equal('test_event_code' in withoutCode, false);

  const emptyCode = buildMetaLeadPayload(leadInput({ testEventCode: '  ' }));
  assert.equal('test_event_code' in emptyCode, false);

  const withCode = buildMetaLeadPayload(leadInput({ testEventCode: 'TEST12345' }));
  assert.equal(withCode.test_event_code, 'TEST12345');
});
