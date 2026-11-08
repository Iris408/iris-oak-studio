// Tests for api/enquiry.js. Resend is never contacted: fetch is replaced with a stub that records each request.
// Run: npm run test:enquiry
import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import handler from '../../api/enquiry.js';

const ENV = { RESEND_API_KEY: 'test-key', ENQUIRY_TO_EMAIL: 'studio@example.com', ENQUIRY_FROM_EMAIL: 'Iris & Oak <enquiries@example.com>' };
let sent;
let realFetch;

beforeEach(() => {
  sent = [];
  realFetch = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    sent.push({ url, body: JSON.parse(options.body) });
    return { ok: true, status: 200 };
  };
  Object.assign(process.env, ENV);
});

afterEach(() => {
  globalThis.fetch = realFetch;
  for (const key of Object.keys(ENV)) delete process.env[key];
});

// Calls the handler as Vercel would and returns the status, JSON body and emails sent
async function submit(body) {
  const res = {
    statusCode: 200, payload: undefined,
    setHeader() {},
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.payload = payload; return this; }
  };
  await handler({ method: 'POST', body }, res);
  return { status: res.statusCode, payload: res.payload, notification: sent[0]?.body, confirmation: sent[1]?.body };
}

const enquiry = (overrides = {}) => ({ name: 'Alex Morgan', email: 'alex@example.com', needs: ['Websites'], package: 'Signature (£695)', ...overrides });

test('the confirmation greets the visitor by the submitted name', async () => {
  const { status, payload, confirmation } = await submit(enquiry());
  assert.equal(status, 200);
  assert.deepEqual(payload, { ok: true, confirmationSent: true });
  assert.equal(sent.length, 2);
  assert.deepEqual(confirmation.to, ['alex@example.com']);
  // Exact keys the published template expects
  assert.deepEqual(confirmation.template.variables, { name: 'Alex Morgan', serviceName: 'Signature' });
});

test('the name is trimmed before it is used in the greeting', async () => {
  const { confirmation } = await submit(enquiry({ name: '  Alex Morgan  ' }));
  assert.equal(confirmation.template.variables.name, 'Alex Morgan');
});

test('names with accents, hyphens, apostrophes and initials are kept', async () => {
  for (const name of ['Zoë Brontë-Jones', "Siobhán O'Neill", 'Seán O’Brien', 'J. R. Hartley', 'Alex']) {
    sent = [];
    const { confirmation } = await submit(enquiry({ name }));
    assert.equal(confirmation.template.variables.name, name, name);
  }
});

test('text that is not a name falls back to "there"', async () => {
  for (const name of ['Visit https://example.com', 'win@prize.example', 'Call 0800 123 456', '<b>Alex</b>', 'Alex  Morgan', 'a'.repeat(61), 'One Two Three Four Five Six']) {
    sent = [];
    const { status, confirmation } = await submit(enquiry({ name }));
    assert.equal(status, 200, name);
    assert.equal(confirmation.template.variables.name, 'there', name);
  }
});

test('the studio notification still includes the full name', async () => {
  const { notification } = await submit(enquiry());
  assert.equal(notification.subject, 'New enquiry from Alex Morgan');
  assert.match(notification.text, /^Name: Alex Morgan$/m);
});

test('no confirmation is sent if the studio notification fails', async () => {
  globalThis.fetch = async (url, options) => { sent.push({ url, body: JSON.parse(options.body) }); return { ok: false, status: 500 }; };
  const { status, payload } = await submit(enquiry());
  assert.equal(status, 502);
  assert.equal(payload.ok, false);
  assert.equal(sent.length, 1);
});
