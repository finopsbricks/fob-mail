import { clientFor } from '../_helpers.js';
import { formatBytes, formatDate, formatField } from '../utils/format.js';
import { address, printRecord } from '../utils/output.js';

export async function showMessageHandler(argv) {
  const m = await clientFor().messages.get(argv.id);
  if (argv.html && !argv.json) {
    console.log(m.body_html || '');
    if (!m.body_html) console.error('(this message has no HTML body)');
    return;
  }
  printRecord(argv, m, () => {
    const w = 11;
    const lines = [
      formatField('ID', m.id, w),
      formatField('Thread', m.thread, w),
      formatField('Message-ID', m.message_id, w),
      formatField('From', address({ email: m.from_email, name: m.from_name }), w),
      formatField('To', (m.to_addresses || []).map(address).join(', '), w),
    ];
    if ((m.cc_addresses || []).length) lines.push(formatField('Cc', m.cc_addresses.map(address).join(', '), w));
    lines.push(formatField('Subject', m.subject || '(no subject)', w), formatField('Sent', formatDate(m.sent_at), w));
    if (m.send_status) lines.push(formatField('Send', m.send_status, w));
    lines.push('', (m.body_text || '').trim() || '(no text body — try --html)');
    const files = (m.attachments || []).filter((a) => !a.is_inline);
    if (files.length) {
      lines.push('', 'Attachments (fob-mail attachments pull <id>):');
      for (const a of files) lines.push(`  ${a.id}  ${a.filename || '(unnamed)'}  ${formatBytes(a.size_bytes)}`);
    }
    return lines.join('\n');
  });
}
