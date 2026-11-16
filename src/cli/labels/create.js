import { clientFor } from '../_helpers.js';
import { printRecord } from '../utils/output.js';

export async function createLabelHandler(argv) {
  const label = await clientFor().labels.create({ name: argv.name, color: argv.color });
  printRecord(argv, label, (l) => `Label ${l.name} (${l.id})`);
}
