import { clientFor } from '../_helpers.js';
import { buildColumnSelector } from '../utils/list.js';
import { printList } from '../utils/output.js';

const COLUMNS = {
  id:    { header: 'ID',    align: 'left', render: (l) => l.id,    raw: (l) => l.id },
  name:  { header: 'NAME',  align: 'left', render: (l) => l.name,  raw: (l) => l.name },
  color: { header: 'COLOR', align: 'left', render: (l) => l.color, raw: (l) => l.color },
};

const selector = buildColumnSelector({ columns: COLUMNS, defaultFields: ['id', 'name', 'color'] });

export async function listLabelsHandler(argv) {
  const result = await clientFor().labels.list();
  printList(argv, { rows: result?.data ?? [], allRows: null, truncated: false, pageContext: result?.page_context ?? null }, selector);
}
