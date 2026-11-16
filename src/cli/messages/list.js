import { clientFor } from '../_helpers.js';
import { formatDate } from '../utils/format.js';
import { buildColumnSelector, resolveListScope } from '../utils/list.js';
import { clip, printList } from '../utils/output.js';

const COLUMNS = {
  id:         { header: 'ID',         align: 'left', render: (m) => m.id,                                  raw: (m) => m.id },
  mailbox:    { header: 'MAILBOX',    align: 'left', render: (m) => m.mailbox_connection,                  raw: (m) => m.mailbox_connection },
  thread:     { header: 'THREAD',     align: 'left', render: (m) => m.thread,                              raw: (m) => m.thread },
  direction:  { header: 'DIR',        align: 'left', render: (m) => (m.direction === 'outbound' ? 'out' : 'in'), raw: (m) => m.direction },
  from:       { header: 'FROM',       align: 'left', render: (m) => clip(m.from_email || '', 30),          raw: (m) => m.from_email },
  to:         { header: 'TO',         align: 'left', render: (m) => clip((m.to_addresses || []).map((a) => a.email).join(','), 30), raw: (m) => (m.to_addresses || []).map((a) => a.email).join(',') },
  subject:    { header: 'SUBJECT',    align: 'left', render: (m) => clip(m.subject || '(no subject)', 44), raw: (m) => m.subject },
  sent:       { header: 'SENT',       align: 'left', render: (m) => formatDate(m.sent_at).slice(0, 16),    raw: (m) => m.sent_at },
  message_id: { header: 'MESSAGE-ID', align: 'left', render: (m) => m.message_id,                          raw: (m) => m.message_id },
  status:     { header: 'SEND',       align: 'left', render: (m) => m.send_status || '',                   raw: (m) => m.send_status },
  updated:    { header: 'UPDATED',    align: 'left', render: (m) => formatDate(m.updated_at),              raw: (m) => m.updated_at },
  body:       { header: 'BODY',       align: 'left', render: (m) => clip((m.body_text || '').replace(/\s+/g, ' '), 60), raw: (m) => m.body_text },
};

const selector = buildColumnSelector({ columns: COLUMNS, defaultFields: ['id', 'thread', 'direction', 'from', 'subject', 'sent'] });

export async function listMessagesHandler(argv) {
  const fields = selector.parseFields(argv.fields);
  const mail = clientFor();
  const with_body = argv.withBody || fields.includes('body');
  const scope = await resolveListScope(argv, {
    list: (params) => mail.messages.list(params),
    getAll: (params) => mail.messages.getAll(params),
    searchParams: {
      mailbox: argv.mailbox,
      thread: argv.thread,
      direction: argv.direction,
      message_id: argv.messageId,
      date_from: argv.since,
      date_to: argv.until,
      updated_since: argv.updatedSince,
      sort_order: argv.sort ? argv.sort.toUpperCase() : undefined,
      fields: with_body
        ? 'id,mailbox_connection,thread,message_id,in_reply_to,direction,from_email,from_name,to_addresses,cc_addresses,subject,sent_at,folders,created_at,updated_at,body_text'
        : undefined,
    },
  });
  printList(argv, scope, selector);
}
