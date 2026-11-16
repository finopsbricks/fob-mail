/**
 * `fob-mail mailboxes <action>` — the client mailboxes this key may use. Connecting a mailbox
 * takes the client's sign-in, so it happens in Mail (Settings → Mailboxes), not here.
 */

import { Command, Option } from 'commander';

import { safe, idJsonCommand, examples } from '../_helpers.js';
import { listMailboxesHandler } from './list.js';
import { showMailboxHandler } from './show.js';

export function buildMailboxesCommand() {
  const mailboxes = new Command('mailboxes').description('Client mailboxes this key may use, and their status');

  examples(
    mailboxes
      .command('list')
      .description('List mailboxes with status, whether they can send, and open threads')
      .option('--fields <list>', 'Columns, comma-separated (default: id,name,status,can_send,open)')
      .addOption(new Option('--format <format>', 'Output format').choices(['table', 'csv', 'json']))
      .option('--json', 'Output raw JSON')
      .action(safe(listMailboxesHandler)),
    ['fob-mail mailboxes list', 'fob-mail mailboxes list --json'],
  );

  idJsonCommand(mailboxes, 'show', 'Show one mailbox', 'Mailbox ID', showMailboxHandler);

  return mailboxes;
}
