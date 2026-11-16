import { clientFor } from '../_helpers.js';
import { formatDate } from '../utils/format.js';
import { buildColumnSelector } from '../utils/list.js';
import { printList } from '../utils/output.js';

const COLUMNS = {
  id:        { header: 'ID',        align: 'left',  render: (m) => m.id,                      raw: (m) => m.id },
  name:      { header: 'NAME',      align: 'left',  render: (m) => m.label || '',             raw: (m) => m.label },
  address:   { header: 'ADDRESS',   align: 'left',  render: (m) => m.email_address,           raw: (m) => m.email_address },
  provider:  { header: 'PROVIDER',  align: 'left',  render: (m) => m.provider,                raw: (m) => m.provider },
  status:    { header: 'STATUS',    align: 'left',  render: (m) => m.status,                  raw: (m) => m.status },
  can_send:  { header: 'SEND',      align: 'left',  render: (m) => (m.can_send ? 'yes' : 'no'), raw: (m) => m.can_send },
  open:      { header: 'OPEN',      align: 'right', render: (m) => String(m.open_threads ?? ''), raw: (m) => m.open_threads },
  polled:    { header: 'LAST SYNC', align: 'left',  render: (m) => formatDate(m.last_polled_at), raw: (m) => m.last_polled_at },
};

const selector = buildColumnSelector({ columns: COLUMNS, defaultFields: ['id', 'name', 'address', 'status', 'can_send', 'open'] });

export async function listMailboxesHandler(argv) {
  const result = await clientFor().mailboxes.list();
  printList(argv, { rows: result?.data ?? [], allRows: null, truncated: false, pageContext: result?.page_context ?? null }, selector);
}
