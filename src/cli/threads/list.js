import { clientFor } from '../_helpers.js';
import { formatDate } from '../utils/format.js';
import { buildColumnSelector, resolveListScope } from '../utils/list.js';
import { clip, printList } from '../utils/output.js';

const COLUMNS = {
  id:       { header: 'ID',       align: 'left',  render: (t) => t.id,                                   raw: (t) => t.id },
  mailbox:  { header: 'MAILBOX',  align: 'left',  render: (t) => t.mailbox_connection,                   raw: (t) => t.mailbox_connection },
  status:   { header: 'STATUS',   align: 'left',  render: (t) => t.status,                               raw: (t) => t.status },
  assignee: { header: 'ASSIGNEE', align: 'left',  render: (t) => t.assignee || '',                       raw: (t) => t.assignee },
  from:     { header: 'FROM',     align: 'left',  render: (t) => clip(t.last_from_name || t.last_from_email || '', 24), raw: (t) => t.last_from_email },
  subject:  { header: 'SUBJECT',  align: 'left',  render: (t) => clip(t.subject || '(no subject)', 48),  raw: (t) => t.subject },
  last:     { header: 'LAST',     align: 'left',  render: (t) => formatDate(t.last_message_at).slice(0, 16), raw: (t) => t.last_message_at },
  messages: { header: 'MSGS',     align: 'right', render: (t) => String(t.message_count ?? ''),          raw: (t) => t.message_count },
  attach:   { header: 'ATT',      align: 'left',  render: (t) => (t.has_attachments ? 'yes' : ''),        raw: (t) => t.has_attachments },
  labels:   { header: 'LABELS',   align: 'left',  render: (t) => (t.labels || []).map((l) => l.name).join(','), raw: (t) => (t.labels || []).map((l) => l.name).join(',') },
  snippet:  { header: 'SNIPPET',  align: 'left',  render: (t) => clip(t.snippet, 60),                    raw: (t) => t.snippet },
  updated:  { header: 'UPDATED',  align: 'left',  render: (t) => formatDate(t.updated_at),               raw: (t) => t.updated_at },
};

const selector = buildColumnSelector({ columns: COLUMNS, defaultFields: ['id', 'status', 'from', 'subject', 'last', 'labels'] });

export function threadFilters(argv) {
  return {
    mailbox: argv.mailbox,
    status: argv.status,
    assignee: argv.assignee,
    label: argv.label,
    q: argv.search,
    from: argv.from,
    date_from: argv.since,
    date_to: argv.until,
    updated_since: argv.updatedSince,
    sort_order: argv.sort ? argv.sort.toUpperCase() : undefined,
  };
}

export async function listThreadsHandler(argv) {
  selector.parseFields(argv.fields);
  const mail = clientFor();
  const scope = await resolveListScope(argv, {
    list: (params) => mail.threads.list(params),
    getAll: (params) => mail.threads.getAll(params),
    searchParams: threadFilters(argv),
  });
  printList(argv, scope, selector);
}
