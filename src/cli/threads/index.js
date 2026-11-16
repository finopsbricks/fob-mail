/**
 * `fob-mail threads <action>` — conversations in the key's mailboxes, and the state Mail keeps on
 * them: status, assignee and labels.
 */

import { Command, Option } from 'commander';

import { safe, listOptions, jsonOption, idJsonCommand, collect, examples } from '../_helpers.js';
import { listThreadsHandler } from './list.js';
import { showThreadHandler } from './show.js';
import { editThreadHandler } from './edit.js';
import { replyThreadHandler } from './reply.js';

const STATUSES = ['open', 'waiting', 'done'];

export function buildThreadsCommand() {
  const threads = new Command('threads').description('Read threads; set status, assignee and labels; reply');

  examples(
    listOptions(threads.command('list').description('List threads, newest activity first'))
      .option('--mailbox <id>', 'Only this mailbox')
      .addOption(new Option('--status <status>', 'Only this status').choices(STATUSES))
      .option('--assignee <who>', 'A user id, api_key:<id>, me (this key) or none')
      .option('--label <name>', 'Has this label (name or id); repeat to require several', collect)
      .option('--search <text>', 'Subject or sender contains')
      .option('--from <address>', 'A message is from an address containing this')
      .option('--since <date>', 'Last message on or after (YYYY-MM-DD or ISO time)')
      .option('--until <date>', 'Last message on or before')
      .option('--updated-since <time>', 'Changed after (new message, status, assignee or labels)')
      .addOption(new Option('--sort <order>', 'By last message').choices(['asc', 'desc']).default('desc'))
      .option('--fields <list>', 'Columns, comma-separated (default: id,status,from,subject,last,labels)')
      .addOption(new Option('--format <format>', 'Output format').choices(['table', 'csv', 'json']))
      .option('--output <path>', 'Write output to a file instead of stdout')
      .action(safe(listThreadsHandler)),
    [
      'fob-mail threads list --status open --mailbox mb4k2x9q1z7c',
      'fob-mail threads list --label bill --assignee none --json',
      'fob-mail threads list --updated-since 2026-11-17T09:00:00Z --sort asc --all --json',
    ],
  );

  examples(
    idJsonCommand(threads, 'show', 'Show a thread with its messages, attachments and labels', 'Thread ID', showThreadHandler),
    ['fob-mail threads show th9a8b7c6d5e', 'fob-mail threads show th9a8b7c6d5e --json'],
  );

  examples(
    jsonOption(
      threads
        .command('edit')
        .description("Set a thread's status or assignee, add or remove labels")
        .argument('<id>', 'Thread ID')
        .addOption(new Option('--status <status>', 'New status').choices(STATUSES))
        .option('--assignee <who>', 'A user id, api_key:<id>, me (this key) or none (unassign)')
        .option('--add-label <name>', 'Add a label (name or id; must exist); repeatable', collect)
        .option('--remove-label <name>', 'Remove a label; repeatable', collect),
    ).action(safe(editThreadHandler)),
    [
      'fob-mail threads edit th9a8b7c6d5e --status waiting --assignee me',
      'fob-mail threads edit th9a8b7c6d5e --add-label bill --remove-label inbox-triage',
    ],
  );

  examples(
    jsonOption(
      threads
        .command('reply')
        .description("Reply from the client's mailbox (plain text, Google mailboxes); never sends twice")
        .argument('<id>', 'Thread ID')
        .option('--body <text>', 'The reply')
        .option('--body-file <path>', 'Read the reply from a file (- for stdin)')
        .option(
          '--idempotency-key <key>',
          'Your id for this reply (default: derived from the thread and the text, so re-running the same command sends nothing)',
        ),
    ).action(safe(replyThreadHandler)),
    [
      'fob-mail threads reply th9a8b7c6d5e --body "Received, thank you."',
      'fob-mail threads reply th9a8b7c6d5e --body-file reply.txt --idempotency-key bills:th9a8b7c6d5e:ack',
    ],
  );

  return threads;
}
