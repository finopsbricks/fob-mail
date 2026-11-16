// @ts-check
/**
 * @finopsbricks/fob-mail — the importable client for Mail (mail.finopsbricks.com).
 *
 * Bind credentials once, then call resource namespaces:
 *
 *   import { fobMail } from '@finopsbricks/fob-mail';
 *   const mail = fobMail({ api_key, api_secret });   // api_url optional (defaults to the hosted origin)
 *   const { data } = await mail.threads.list({ status: 'open', label: 'bill' });
 *   await mail.threads.update(data[0].id, { status: 'waiting', add_labels: ['chased'] });
 *   await mail.threads.reply(data[0].id, { body_text: 'Received, thanks.', idempotency_key: 'ack:' + data[0].id });
 *
 * The `fob-mail` CLI builds the same client (src/cli/_helpers.js `clientFor`) and calls these
 * same namespaces, so the CLI and the library can't drift: every endpoint is defined once, in
 * src/resources/. A worker serving several firms builds one client per firm's key.
 */

import { createTransport } from './http.js';
import { buildMailboxes } from './resources/mailboxes.js';
import { buildThreads } from './resources/threads.js';
import { buildMessages } from './resources/messages.js';
import { buildAttachments } from './resources/attachments.js';
import { buildLabels } from './resources/labels.js';

/**
 * @typedef {import('./http.js').Credentials} Credentials
 */

/**
 * The Mail client.
 * @typedef {Object} MailClient
 * @property {import('./resources/mailboxes.js').MailboxesApi} mailboxes
 * @property {import('./resources/threads.js').ThreadsApi} threads
 * @property {import('./resources/messages.js').MessagesApi} messages
 * @property {import('./resources/attachments.js').AttachmentsApi} attachments
 * @property {import('./resources/labels.js').LabelsApi} labels
 * @property {() => Promise<import('./types/api/Mail.types.js').Whoami|null>} whoami - The firm, the key, its mailboxes and `actor`
 */

/**
 * @param {Credentials} credentials  Required: `{ api_key, api_secret }`. Optional `api_url`
 *   (origin only). The library never reads these from the environment — inject them.
 * @returns {MailClient}
 */
export function fobMail(credentials) {
  const ctx = createTransport(credentials);
  return {
    mailboxes: buildMailboxes(ctx),
    threads: buildThreads(ctx),
    messages: buildMessages(ctx),
    attachments: buildAttachments(ctx),
    labels: buildLabels(ctx),
    whoami: () => ctx.get('/api/v1/whoami').then((r) => r?.data ?? null),
  };
}

// Transport primitives — an escape hatch for calls the namespaces don't cover.
export {
  ApiError,
  apiGet,
  apiPost,
  apiPatch,
  apiGetAll,
  apiGetStream,
  createTransport,
  parseContentDispositionFilename,
  DEFAULT_API_URL,
  MAX_ALL_ROWS,
} from './http.js';
