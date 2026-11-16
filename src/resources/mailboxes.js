// @ts-check
/**
 * @typedef {import('../types/general/index.js').Transport} Transport
 * @typedef {import('../types/api/Mail.types.js').Mailbox} Mailbox
 */

/**
 * @typedef {Object} MailboxesApi
 * @property {() => Promise<import('../types/api/Mail.types.js').ListEnvelope<Mailbox>>} list - The mailboxes this key may use
 * @property {(id: string) => Promise<Mailbox|null>} get
 */

/**
 * @param {Transport} ctx
 * @returns {MailboxesApi}
 */
export function buildMailboxes(ctx) {
  return {
    list: () => ctx.get('/api/v1/mailboxes'),
    get: (id) => ctx.get(`/api/v1/mailboxes/${encodeURIComponent(id)}`).then((r) => r?.data ?? null),
  };
}
