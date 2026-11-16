// @ts-check
import { download } from './_download.js';

/**
 * @typedef {import('../types/general/index.js').Transport} Transport
 * @typedef {import('../types/api/Mail.types.js').Message} Message
 */

/**
 * Filters for `messages.list` / `messages.getAll` (see /docs/api/endpoints/messages/list).
 * Oldest first unless `sort_order: 'DESC'`.
 * @typedef {Object} MessageFilters
 * @property {string} [mailbox]
 * @property {string} [thread]
 * @property {'inbound'|'outbound'} [direction]
 * @property {string} [message_id] - RFC Message-ID
 * @property {string} [date_from]
 * @property {string} [date_to]
 * @property {string} [updated_since]
 * @property {string|string[]} [fields] - Add `body_text`, `body_html` for bodies
 * @property {'ASC'|'DESC'} [sort_order]
 * @property {number} [page]
 * @property {number} [limit]
 */

/**
 * @typedef {Object} MessagesApi
 * @property {(filters?: MessageFilters) => Promise<import('../types/api/Mail.types.js').ListEnvelope<Message>>} list
 * @property {(filters?: MessageFilters) => Promise<Message[]>} getAll - Every matching message (capped at MAX_ALL_ROWS)
 * @property {(id: string) => Promise<Message|null>} get
 * @property {(id: string) => Promise<import('../types/api/Mail.types.js').DownloadedFile>} raw - The stored RFC 822 source
 */

/** @param {MessageFilters} [filters] */
function params(filters = {}) {
  const out = { ...filters };
  if (Array.isArray(out.fields)) out.fields = out.fields.join(',');
  return out;
}

/**
 * @param {Transport} ctx
 * @returns {MessagesApi}
 */
export function buildMessages(ctx) {
  return {
    list: (filters) => ctx.get('/api/v1/messages', { searchParams: params(filters) }),
    getAll: (filters) => ctx.getAll('/api/v1/messages', { searchParams: params(filters) }).then((r) => r.data),
    get: (id) => ctx.get(`/api/v1/messages/${encodeURIComponent(id)}`).then((r) => r?.data ?? null),
    raw: (id) => download(ctx, `/api/v1/messages/${encodeURIComponent(id)}/raw`),
  };
}
