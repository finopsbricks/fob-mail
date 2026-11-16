// @ts-check
/**
 * @typedef {import('../types/general/index.js').Transport} Transport
 * @typedef {import('../types/api/Mail.types.js').ThreadRow} ThreadRow
 * @typedef {import('../types/api/Mail.types.js').Thread} Thread
 * @typedef {import('../types/api/Mail.types.js').Message} Message
 */

/**
 * Filters for `threads.list` / `threads.getAll` (see /docs/api/endpoints/threads/list).
 * @typedef {Object} ThreadFilters
 * @property {string} [mailbox]
 * @property {'open'|'waiting'|'done'} [status]
 * @property {string} [assignee] - A user id, `api_key:<id>`, `me` or `none`
 * @property {string|string[]} [label] - Name(s) or id(s); all must match
 * @property {string} [q] - Subject or sender contains
 * @property {string} [from] - A message is from an address containing this
 * @property {string} [date_from]
 * @property {string} [date_to]
 * @property {string} [updated_since]
 * @property {'ASC'|'DESC'} [sort_order]
 * @property {number} [page]
 * @property {number} [limit]
 */

/**
 * @typedef {Object} ThreadUpdate
 * @property {'open'|'waiting'|'done'} [status]
 * @property {string|null} [assignee] - A user id, `api_key:<id>`, `me`, or null to unassign
 * @property {string[]} [add_labels]
 * @property {string[]} [remove_labels]
 */

/**
 * @typedef {Object} ThreadsApi
 * @property {(filters?: ThreadFilters) => Promise<import('../types/api/Mail.types.js').ListEnvelope<ThreadRow>>} list
 * @property {(filters?: ThreadFilters) => Promise<ThreadRow[]>} getAll - Every matching thread (capped at MAX_ALL_ROWS)
 * @property {(id: string) => Promise<Thread|null>} get
 * @property {(id: string, update: ThreadUpdate) => Promise<Thread>} update
 * @property {(id: string, reply: { body_text: string, idempotency_key: string }) => Promise<Message>} reply - Never sends twice for one key
 */

/**
 * Arrays go up comma-joined; the API splits them.
 * @param {ThreadFilters} [filters] */
function params(filters = {}) {
  const out = { ...filters };
  if (Array.isArray(out.label)) out.label = out.label.join(',');
  return out;
}

/**
 * @param {Transport} ctx
 * @returns {ThreadsApi}
 */
export function buildThreads(ctx) {
  return {
    list: (filters) => ctx.get('/api/v1/threads', { searchParams: params(filters) }),
    getAll: (filters) => ctx.getAll('/api/v1/threads', { searchParams: params(filters) }).then((r) => r.data),
    get: (id) => ctx.get(`/api/v1/threads/${encodeURIComponent(id)}`).then((r) => r?.data ?? null),
    update: (id, update) => ctx.patch(`/api/v1/threads/${encodeURIComponent(id)}`, update).then((r) => r?.data),
    reply: (id, { body_text, idempotency_key }) => {
      if (!idempotency_key) throw new Error('reply needs an idempotency_key: pick one per composed reply and reuse it on retry');
      return ctx.post(`/api/v1/threads/${encodeURIComponent(id)}/reply`, { body_text, idempotency_key }).then((r) => r?.data);
    },
  };
}
