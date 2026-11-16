/**
 * `fob-mail messages <action>` — single messages across threads: new mail since a time, lookup by
 * Message-ID, the full text or HTML, the raw .eml, and sending a new message.
 */

import { Command, Option } from 'commander';

import { safe, listOptions, jsonOption, collect, examples } from '../_helpers.js';
import { listMessagesHandler } from './list.js';
import { showMessageHandler } from './show.js';
import { pullMessageHandler } from './pull.js';
import { sendMessageHandler } from './send.js';

export function buildMessagesCommand() {
  const messages = new Command('messages').description('Read messages across threads; download the raw .eml; send new mail');

  examples(
    listOptions(messages.command('list').description('List messages, oldest first (no bodies unless --with-body)'))
      .option('--mailbox <id>', 'Only this mailbox')
      .option('--thread <id>', 'Only this thread')
      .addOption(new Option('--direction <direction>', 'Received or sent from the mailbox').choices(['inbound', 'outbound']))
      .option('--message-id <id>', 'The RFC Message-ID (with or without <>)')
      .option('--since <date>', 'Sent on or after (YYYY-MM-DD or ISO time)')
      .option('--until <date>', 'Sent on or before')
      .option('--updated-since <time>', 'Stored or changed after: use it to read new mail without missing any')
      .option('--with-body', 'Include body_text')
      .addOption(new Option('--sort <order>', 'By sent date').choices(['asc', 'desc']).default('asc'))
      .option('--fields <list>', 'Columns, comma-separated (default: id,thread,direction,from,subject,sent)')
      .addOption(new Option('--format <format>', 'Output format').choices(['table', 'csv', 'json']))
      .option('--output <path>', 'Write output to a file instead of stdout')
      .action(safe(listMessagesHandler)),
    [
      'fob-mail messages list --direction inbound --updated-since 2026-11-17T09:00:00Z --all --json',
      "fob-mail messages list --message-id '<CAF7x9@mail.vendor.in>'",
    ],
  );

  examples(
    jsonOption(
      messages
        .command('show')
        .description('Show one message: headers, text body, attachments')
        .argument('<id>', 'Message ID')
        .option('--html', "Print the HTML body instead (the sender's HTML, verbatim)"),
    ).action(safe(showMessageHandler)),
    ['fob-mail messages show ms1a2s3d4f5g', 'fob-mail messages show ms1a2s3d4f5g --json'],
  );

  examples(
    jsonOption(
      messages
        .command('pull')
        .description('Download the stored RFC 822 message as an .eml file')
        .argument('<id>', 'Message ID')
        .option('-o, --output <path>', 'File to write (default: <id>.eml in the current folder; - for stdout)'),
    ).action(safe(pullMessageHandler)),
    ['fob-mail messages pull ms1a2s3d4f5g -o invoice.eml'],
  );

  examples(
    jsonOption(
      messages
        .command('send')
        .description("Send a new message from the client's mailbox (plain text, Google mailboxes); never sends twice")
        .requiredOption('--mailbox <id>', 'Mailbox to send from')
        .requiredOption('--to <address>', 'Recipient; repeatable', collect)
        .option('--cc <address>', 'Cc; repeatable', collect)
        .requiredOption('--subject <text>', 'Subject')
        .option('--body <text>', 'The message')
        .option('--body-file <path>', 'Read the message from a file (- for stdin)')
        .option(
          '--idempotency-key <key>',
          'Your id for this message (default: derived from mailbox, recipients, subject and text, so re-running sends nothing)',
        ),
    ).action(safe(sendMessageHandler)),
    [
      'fob-mail messages send --mailbox mb4k2x9q1z7c --to billing@vendor.in --subject "Statement for October" --body "Could you send the October statement?"',
    ],
  );

  return messages;
}
