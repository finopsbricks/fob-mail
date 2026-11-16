import { createHash } from 'node:crypto';
import { clientFor } from '../_helpers.js';
import { readBody } from '../threads/reply.js';

/**
 * The default idempotency key: mailbox, recipients, subject and text, so running the same command
 * again returns the first message instead of sending a second.
 */
export function defaultSendKey({ mailbox, to, cc, subject, body_text }) {
  const parts = ['send', mailbox, [...to].sort().join(','), [...(cc || [])].sort().join(','), subject, body_text];
  return `fob-mail:${createHash('sha256').update(parts.join('\n')).digest('hex').slice(0, 32)}`;
}

export async function sendMessageHandler(argv) {
  const body_text = readBody(argv);
  const message = { mailbox: argv.mailbox, to: argv.to, cc: argv.cc || [], subject: argv.subject, body_text };
  const idempotency_key = argv.idempotencyKey || defaultSendKey(message);
  const sent = await clientFor().messages.send({ ...message, idempotency_key });

  if (argv.json) {
    console.log(JSON.stringify({ ...sent, idempotency_key }, null, 2));
  } else {
    console.log(`Message ${sent.id} (thread ${sent.thread}) to ${(sent.to_addresses || []).map((a) => a.email).join(', ')}: ${sent.send_status}`);
  }
  console.error(`(idempotency key: ${idempotency_key})`);
  if (sent.send_status === 'pending') {
    console.error(
      "(Gmail's answer was lost, so it may or may not have gone out. Check the client's Sent folder before sending it again with a new --idempotency-key.)",
    );
  }
}
