import { clientFor } from '../_helpers.js';
import { formatDate, formatField } from '../utils/format.js';
import { printRecord } from '../utils/output.js';

const STATUS_NOTE = {
  created: 'connected, first sync pending',
  auth_failed: 'sign-in stopped working — a firm admin reconnects it in Settings → Mailboxes',
  connection_failed: 'provider unreachable at the last sync (usually brief)',
  disconnected: 'disconnected — no new mail',
};

export async function showMailboxHandler(argv) {
  const m = await clientFor().mailboxes.get(argv.id);
  printRecord(argv, m, () => {
    const w = 12;
    return [
      formatField('ID', m.id, w),
      formatField('Name', m.label || '—', w),
      formatField('Address', m.email_address, w),
      formatField('Provider', m.provider, w),
      formatField('Status', STATUS_NOTE[m.status] ? `${m.status} (${STATUS_NOTE[m.status]})` : m.status, w),
      formatField('Can send', m.can_send ? 'yes' : 'no', w),
      formatField('Open', m.open_threads, w),
      formatField('Last sync', formatDate(m.last_polled_at), w),
    ].join('\n');
  });
}
