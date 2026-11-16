import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { clientFor } from '../_helpers.js';

/**
 * The default idempotency key: the thread and the text, so running the same command again (after
 * a timeout, say) returns the first reply instead of sending a second. To send the same text
 * again on purpose, pass a new --idempotency-key.
 */
export function defaultReplyKey(thread_id, body_text) {
  return `fob-mail:${createHash('sha256').update(`reply\n${thread_id}\n${body_text}`).digest('hex').slice(0, 32)}`;
}

function readBody(argv) {
  if (argv.body !== undefined && argv.bodyFile) throw new Error('Pass --body or --body-file, not both.');
  const text = argv.bodyFile ? readFileSync(argv.bodyFile === '-' ? 0 : argv.bodyFile, 'utf8') : argv.body;
  if (!text || !text.trim()) throw new Error('The reply is empty: pass --body <text> or --body-file <path>.');
  return text.trim();
}

export async function replyThreadHandler(argv) {
  const body_text = readBody(argv);
  const idempotency_key = argv.idempotencyKey || defaultReplyKey(argv.id, body_text);
  const message = await clientFor().threads.reply(argv.id, { body_text, idempotency_key });

  if (argv.json) {
    console.log(JSON.stringify({ ...message, idempotency_key }, null, 2));
  } else {
    console.log(`Reply ${message.id} to ${(message.to_addresses || []).map((a) => a.email).join(', ')}: ${message.send_status}`);
  }
  console.error(`(idempotency key: ${idempotency_key})`);
  if (message.send_status === 'pending') {
    console.error(
      "(Gmail's answer was lost, so it may or may not have gone out. Check the client's Sent folder before sending it again with a new --idempotency-key.)",
    );
  }
}
