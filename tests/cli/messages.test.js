import { jest } from '@jest/globals';
import { captureOutput } from '../helpers.js';

const messages = { send: jest.fn() };
jest.unstable_mockModule('../../src/cli/_helpers.js', () => ({ clientFor: jest.fn(() => ({ messages })) }));

const { sendMessageHandler, defaultSendKey } = await import('../../src/cli/messages/send.js');

let out;
beforeEach(() => { jest.clearAllMocks(); out = captureOutput(); });
afterEach(() => out.restore());

describe('messages send', () => {
  const argv = { mailbox: 'mb1', to: ['b@v.in', 'a@v.in'], subject: 'Statement', body: 'Please send it.' };

  it('sends with a key derived from the message; order of recipients does not matter', async () => {
    messages.send.mockResolvedValue({ id: 'm1', thread: 't1', send_status: 'sent', to_addresses: [{ email: 'a@v.in' }] });
    await sendMessageHandler(argv);
    await sendMessageHandler({ ...argv, to: ['a@v.in', 'b@v.in'] });
    const [k1, k2] = messages.send.mock.calls.map((c) => c[0].idempotency_key);
    expect(k1).toBe(k2);
    expect(messages.send.mock.calls[0][0]).toMatchObject({ mailbox: 'mb1', subject: 'Statement', body_text: 'Please send it.', cc: [] });
    expect(defaultSendKey({ mailbox: 'mb1', to: ['a@v.in'], subject: 'Statement', body_text: 'Other' })).not.toBe(k1);
    expect(out.stdout).toContain('thread t1');
  });

  it('refuses an empty message', async () => {
    await expect(sendMessageHandler({ ...argv, body: ' ' })).rejects.toThrow(/empty/);
  });
});
