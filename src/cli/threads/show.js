import { clientFor } from '../_helpers.js';
import { formatDate, formatField, formatBytes } from '../utils/format.js';
import { address, mailboxName, printRecord } from '../utils/output.js';

/** The thread as text: header, then each message with its attachments. Bodies are plain text. */
export function renderThread(t) {
  const w = 10;
  const lines = [
    formatField('Thread', t.id, w),
    formatField('Subject', t.subject || '(no subject)', w),
    formatField('Mailbox', `${mailboxName(t.mailbox)}  [${t.mailbox?.id}]`, w),
    formatField('Status', t.status, w),
    formatField('Assignee', t.assignee || '—', w),
    formatField('Labels', (t.labels || []).map((l) => l.name).join(', ') || '—', w),
    formatField('Can reply', t.can_reply ? 'yes' : 'no', w),
  ];
  for (const m of t.messages || []) {
    lines.push('', `--- ${m.direction === 'outbound' ? 'Sent' : 'Received'} ${formatDate(m.sent_at)}  [${m.id}] ---`);
    lines.push(formatField('From', address({ email: m.from_email, name: m.from_name }), w));
    lines.push(formatField('To', (m.to_addresses || []).map(address).join(', '), w));
    if ((m.cc_addresses || []).length) lines.push(formatField('Cc', m.cc_addresses.map(address).join(', '), w));
    if (m.send_status) lines.push(formatField('Send', m.send_status, w));
    lines.push('', (m.body_text || '').trim() || '(no text body)');
    const files = (m.attachments || []).filter((a) => !a.is_inline);
    if (files.length) {
      lines.push('', 'Attachments:');
      for (const a of files) lines.push(`  ${a.id}  ${a.filename || '(unnamed)'}  ${formatBytes(a.size_bytes)}`);
    }
  }
  return lines.join('\n');
}

export async function showThreadHandler(argv) {
  const thread = await clientFor().threads.get(argv.id);
  printRecord(argv, thread, renderThread);
}
