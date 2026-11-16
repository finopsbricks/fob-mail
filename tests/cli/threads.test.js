import { jest } from '@jest/globals';
import { captureOutput, ExitError } from '../helpers.js';

const threads = { list: jest.fn(), getAll: jest.fn(), get: jest.fn(), update: jest.fn(), reply: jest.fn() };
jest.unstable_mockModule('../../src/cli/_helpers.js', () => ({ clientFor: jest.fn(() => ({ threads })) }));

const { listThreadsHandler } = await import('../../src/cli/threads/list.js');
const { editThreadHandler } = await import('../../src/cli/threads/edit.js');
const { replyThreadHandler, defaultReplyKey } = await import('../../src/cli/threads/reply.js');
const { renderThread } = await import('../../src/cli/threads/show.js');

let out;
beforeEach(() => { jest.clearAllMocks(); out = captureOutput(); });
afterEach(() => out.restore());

describe('threads list', () => {
  it('maps flags to API filters and prints a table', async () => {
    threads.list.mockResolvedValue({
      data: [{ id: 't1', status: 'open', last_from_name: 'Vendor', subject: 'Invoice', last_message_at: '2026-11-17T08:12:00Z', labels: [{ name: 'bill' }] }],
      page_context: { has_more: false, page: 1, total: 1, count: 1 },
    });
    await listThreadsHandler({ page: 1, limit: 100, status: 'open', label: ['bill'], search: 'inv', since: '2026-11-01', sort: 'desc' });
    expect(threads.list).toHaveBeenCalledWith(expect.objectContaining({ status: 'open', label: ['bill'], q: 'inv', date_from: '2026-11-01', sort_order: 'DESC', page: 1, limit: 100 }));
    expect(out.stdout).toContain('Invoice');
    expect(out.stdout).toContain('bill');
  });

  it('--json parses and carries pagination facts', async () => {
    threads.list.mockResolvedValue({ data: [{ id: 't1' }], page_context: { has_more: true, page: 1, total: 2, count: 1 } });
    await listThreadsHandler({ page: 1, limit: 1, json: true });
    const json = JSON.parse(out.stdout);
    expect(json).toMatchObject({ data: [{ id: 't1' }], count: 1, total: 2, has_more: true });
    expect(out.stderr).toContain('--page 2');
  });

  it('--all uses getAll', async () => {
    threads.getAll.mockResolvedValue([{ id: 't1' }, { id: 't2' }]);
    await listThreadsHandler({ all: true, json: true, updatedSince: '2026-11-17T09:00:00Z', sort: 'asc' });
    expect(threads.getAll).toHaveBeenCalledWith(expect.objectContaining({ updated_since: '2026-11-17T09:00:00Z', sort_order: 'ASC' }));
    expect(JSON.parse(out.stdout).count).toBe(2);
  });
});

describe('threads edit', () => {
  it('sends only what was passed; --assignee none unassigns', async () => {
    threads.update.mockResolvedValue({ id: 't1', status: 'done', assignee: null, labels: [] });
    await editThreadHandler({ id: 't1', status: 'done', assignee: 'none', addLabel: ['bill'] });
    expect(threads.update).toHaveBeenCalledWith('t1', { status: 'done', assignee: null, add_labels: ['bill'] });
    expect(out.stdout).toContain('Updated t1');
  });

  it('refuses an empty edit', async () => {
    await expect(editThreadHandler({ id: 't1' })).rejects.toThrow(/Nothing to change/);
  });
});

describe('threads reply', () => {
  it('derives a stable key from the thread and text, so a re-run sends nothing new', async () => {
    threads.reply.mockResolvedValue({ id: 'm9', send_status: 'sent', to_addresses: [{ email: 'v@x.in' }] });
    await replyThreadHandler({ id: 't1', body: ' Received. ' });
    await replyThreadHandler({ id: 't1', body: 'Received.' });
    const [first, second] = threads.reply.mock.calls.map((c) => c[1].idempotency_key);
    expect(first).toBe(second);
    expect(first).toBe(defaultReplyKey('t1', 'Received.'));
    expect(defaultReplyKey('t2', 'Received.')).not.toBe(first);
    expect(out.stdout).toContain('sent');
  });

  it('uses an explicit key and warns on pending', async () => {
    threads.reply.mockResolvedValue({ id: 'm9', send_status: 'pending', to_addresses: [] });
    await replyThreadHandler({ id: 't1', body: 'x', idempotencyKey: 'mine' });
    expect(threads.reply.mock.calls[0][1].idempotency_key).toBe('mine');
    expect(out.stderr).toMatch(/Sent folder/);
  });

  it('refuses an empty reply or both body flags', async () => {
    await expect(replyThreadHandler({ id: 't1', body: '  ' })).rejects.toThrow(/empty/);
    await expect(replyThreadHandler({ id: 't1', body: 'a', bodyFile: 'f' })).rejects.toThrow(/not both/);
  });
});

describe('threads show', () => {
  it('renders messages and attachment ids', () => {
    const text = renderThread({
      id: 't1', subject: 'Invoice', status: 'open', labels: [], can_reply: true, mailbox: { id: 'm1', email_address: 'a@c.org', label: 'Citara' },
      messages: [{ id: 'ms1', direction: 'inbound', from_email: 'v@x.in', to_addresses: [{ email: 'a@c.org' }], sent_at: '2026-11-17T08:12:00Z', body_text: 'Please pay', attachments: [{ id: 'at1', filename: 'inv.pdf', size_bytes: 2048 }] }],
    });
    expect(text).toContain('Citara <a@c.org>');
    expect(text).toContain('Please pay');
    expect(text).toContain('at1  inv.pdf  2.0 KB');
  });
});

void ExitError;
