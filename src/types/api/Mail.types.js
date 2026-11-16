/**
 * Shapes returned by Mail's API (https://mail.finopsbricks.com/docs/api). Ids are 12 characters.
 */

/**
 * @typedef {Object} Mailbox
 * @property {string} id
 * @property {string} email_address
 * @property {string|null} label - The firm's name for it; null shows the address
 * @property {'google'|'microsoft'|'imap'} provider
 * @property {'created'|'connected'|'auth_failed'|'connection_failed'|'disconnected'} status
 * @property {string|null} last_polled_at
 * @property {boolean} can_send
 * @property {number} open_threads
 */

/**
 * @typedef {Object} Label
 * @property {string} id
 * @property {string} name
 * @property {string} color
 */

/**
 * @typedef {Object} Address
 * @property {string} email
 * @property {string|null} name
 */

/**
 * @typedef {Object} Attachment
 * @property {string} id
 * @property {string|null} filename
 * @property {string|null} content_type
 * @property {number|null} size_bytes
 * @property {boolean} is_inline
 */

/**
 * @typedef {Object} Message
 * @property {string} id
 * @property {string} mailbox_connection
 * @property {string} thread
 * @property {string} message_id - RFC Message-ID
 * @property {string|null} in_reply_to
 * @property {'inbound'|'outbound'} direction
 * @property {string|null} from_email
 * @property {string|null} from_name
 * @property {Address[]} to_addresses
 * @property {Address[]} cc_addresses
 * @property {string|null} subject
 * @property {string} sent_at
 * @property {string} [body_text]
 * @property {string|null} [body_html] - Verbatim sender HTML: render only sandboxed
 * @property {'sent'|'pending'|null} send_status - For replies sent from Mail
 * @property {Attachment[]} [attachments]
 * @property {string} updated_at
 */

/**
 * @typedef {Object} ThreadRow
 * @property {string} id
 * @property {string} mailbox_connection
 * @property {string|null} subject
 * @property {'open'|'waiting'|'done'} status
 * @property {string|null} assignee - A user id or `api_key:<id>`
 * @property {string} last_message_at
 * @property {string} updated_at
 * @property {number} message_count
 * @property {boolean} has_attachments
 * @property {string|null} last_from_email
 * @property {string|null} last_from_name
 * @property {'inbound'|'outbound'} last_direction
 * @property {string} snippet
 * @property {Label[]} labels
 */

/**
 * @typedef {Object} Thread
 * @property {string} id
 * @property {string} mailbox_connection
 * @property {string|null} subject
 * @property {'open'|'waiting'|'done'} status
 * @property {string|null} assignee
 * @property {string} last_message_at
 * @property {{ id: string, email_address: string, label: string|null, provider: string, status: string }} mailbox
 * @property {Label[]} labels
 * @property {boolean} can_reply
 * @property {Message[]} messages
 */

/**
 * @typedef {Object} Whoami
 * @property {{ id: string, name?: string, slug?: string }} org
 * @property {{ id: number, name: string, expires_at: string|null, preset: string, permissions: Object }} api_key
 * @property {string} actor - `api_key:<id>`, how this key appears as an assignee and in activity
 * @property {'all'|'selected'} mailbox_scope
 * @property {Array<{ id: string, email_address: string, label: string|null, status: string, can_send: boolean }>} mailboxes
 */

/**
 * @template T
 * @typedef {Object} ListEnvelope
 * @property {T[]} data
 * @property {{ count: number, page: number, per_page: number, total: number, has_more: boolean }} page_context
 */

/**
 * A downloaded file (raw message or attachment).
 * @typedef {Object} DownloadedFile
 * @property {string|null} filename
 * @property {string} content_type
 * @property {Buffer} buffer
 */

export {};
