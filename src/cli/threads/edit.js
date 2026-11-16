import { clientFor } from '../_helpers.js';
import { printRecord } from '../utils/output.js';

export async function editThreadHandler(argv) {
  const update = {};
  if (argv.status) update.status = argv.status;
  if (argv.assignee !== undefined) update.assignee = argv.assignee === 'none' ? null : argv.assignee;
  if (argv.addLabel?.length) update.add_labels = argv.addLabel;
  if (argv.removeLabel?.length) update.remove_labels = argv.removeLabel;
  if (!Object.keys(update).length) {
    throw new Error('Nothing to change: pass --status, --assignee, --add-label or --remove-label.');
  }

  const thread = await clientFor().threads.update(argv.id, update);
  printRecord(argv, thread, (t) =>
    `Updated ${t.id}: status ${t.status}, assignee ${t.assignee || 'none'}, labels ${(t.labels || []).map((l) => l.name).join(', ') || 'none'}`,
  );
}
