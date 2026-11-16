import { jest } from '@jest/globals';
import { fobMail, ApiError } from '../src/index.js';

/** Replace fetch; return the calls made. */
function mockFetch(handler) {
  const calls = [];
  global.fetch = jest.fn(async (url, init) => {
    calls.push({ url: new URL(url), init });
    const { status = 200, body = {}, headers = {}, raw } = handler(new URL(url), init) || {};
    return new Response(raw ?? JSON.stringify(body), { status, headers });
  });
  return calls;
}

const creds = { api_key: 'fob_mail_k', api_secret: 's', api_url: 'https://mail.test' };

describe('fobMail client', () => {
  it('sends the key headers and the filters, labels comma-joined', async () => {
    const calls = mockFetch(() => ({ body: { data: [], page_context: { has_more: false } } }));
    await fobMail(creds).threads.list({ status: 'open', label: ['bill', 'urgent'], assignee: 'me', q: undefined });
    const { url, init } = calls[0];
    expect(url.pathname).toBe('/api/v1/threads');
    expect(url.searchParams.get('label')).toBe('bill,urgent');
    expect(url.searchParams.get('assignee')).toBe('me');
    expect(url.searchParams.has('q')).toBe(false);
    expect(init.headers).toMatchObject({ 'api-key': 'fob_mail_k', 'api-secret': 's' });
  });

  it('getAll follows has_more', async () => {
    mockFetch((url) => {
      const page = Number(url.searchParams.get('page'));
      return { body: { data: [{ id: `t${page}` }], page_context: { has_more: page < 3 } } };
    });
    expect(await fobMail(creds).messages.getAll({ updated_since: '2026-11-17' })).toEqual([{ id: 't1' }, { id: 't2' }, { id: 't3' }]);
  });

  it('PATCHes thread updates and unwraps data', async () => {
    const calls = mockFetch(() => ({ body: { data: { id: 't1', status: 'waiting' } } }));
    const t = await fobMail(creds).threads.update('t1', { status: 'waiting', add_labels: ['bill'] });
    expect(t.status).toBe('waiting');
    expect(calls[0].init.method).toBe('PATCH');
    expect(JSON.parse(calls[0].init.body)).toEqual({ status: 'waiting', add_labels: ['bill'] });
  });

  it('reply requires an idempotency key and posts it', async () => {
    const calls = mockFetch(() => ({ status: 201, body: { data: { id: 'm9', send_status: 'sent' } } }));
    const mail = fobMail(creds);
    expect(() => mail.threads.reply('t1', { body_text: 'hi' })).toThrow(/idempotency_key/);
    await mail.threads.reply('t1', { body_text: 'hi', idempotency_key: 'k1' });
    expect(calls[0].url.pathname).toBe('/api/v1/threads/t1/reply');
    expect(JSON.parse(calls[0].init.body)).toEqual({ body_text: 'hi', idempotency_key: 'k1' });
  });

  it('downloads attachments with their name and declared type', async () => {
    mockFetch(() => ({
      raw: 'PDFDATA',
      headers: { 'content-type': 'application/octet-stream', 'content-disposition': "attachment; filename*=UTF-8''INV%202291.pdf", 'x-attachment-content-type': 'application/pdf' },
    }));
    const file = await fobMail(creds).attachments.content('a1');
    expect(file).toMatchObject({ filename: 'INV 2291.pdf', content_type: 'application/pdf' });
    expect(file.buffer.toString()).toBe('PDFDATA');
  });

  it('throws ApiError with the server’s code', async () => {
    mockFetch(() => ({ status: 409, body: { error: { code: 'MAILBOX_NEEDS_RECONNECT', message: 'Reconnect it' } } }));
    await expect(fobMail(creds).threads.reply('t1', { body_text: 'x', idempotency_key: 'k' })).rejects.toMatchObject({
      name: 'ApiError', code: 'MAILBOX_NEEDS_RECONNECT', status: 409,
    });
  });

  it('needs credentials', () => {
    mockFetch(() => ({}));
    return expect(fobMail({}).labels.list()).rejects.toBeInstanceOf(ApiError);
  });
});
