/**
 * CLI entry point:
 *
 *   fob-mail <resource> <action> [target] [options]
 *
 * Credentials come from ~/.fob/fob-mail/config.yml; `config profiles` manages it. Every command
 * calls the same client workers import (src/index.js).
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { Command } from 'commander';

import { setOrgOverride } from './config-store.js';
import { safe, configureTreeHelp } from './_helpers.js';
import { handleCompletion } from './_completion.js';
import { gettingStartedHandler } from './getting-started.js';
import { buildConfigCommand } from './config/index.js';
import { buildMailboxesCommand } from './mailboxes/index.js';
import { buildThreadsCommand } from './threads/index.js';
import { buildMessagesCommand } from './messages/index.js';
import { buildAttachmentsCommand } from './attachments/index.js';
import { buildLabelsCommand } from './labels/index.js';

const DOCS_URL = 'https://mail.finopsbricks.com/docs';

function packageVersion() {
  const here = dirname(fileURLToPath(import.meta.url));
  return JSON.parse(readFileSync(join(here, '..', '..', 'package.json'), 'utf8')).version;
}

export function run(argv) {
  const program = new Command();

  program
    .name('fob-mail')
    .description(
      "Read, label, assign and reply to the client mailboxes an accounting firm has connected in Mail " +
        '(mail.finopsbricks.com), from the terminal or an AI agent. For your own mailbox over IMAP, use fob-email.',
    )
    .usage('<resource> <action> [target] [options]')
    .version(packageVersion(), '-v, --version', 'Show version number')
    .option('--profile, --org <name>', 'Use credentials from a specific configured profile (overrides current)')
    .hook('preAction', (thisCommand) => {
      // Commander stores the option under its last flag, so `--profile` lands in `org` too.
      const { org } = thisCommand.opts();
      if (org) setOrgOverride(org);
    })
    .addHelpText(
      'after',
      `\nNew here? Run \`fob-mail getting-started\`.\nEvery read command takes --json. Sending (threads reply, messages send) can't be undone.\nDocs:   ${DOCS_URL}/cli\nAgents: ${DOCS_URL}/cli/ai-agents\nAPI:    ${DOCS_URL}/api/authentication`,
    );

  program
    .command('getting-started')
    .description('Print setup steps for a person or an agent (says so if a profile already exists)')
    .action(safe(gettingStartedHandler));

  program
    .addCommand(buildConfigCommand())
    .addCommand(buildMailboxesCommand())
    .addCommand(buildThreadsCommand())
    .addCommand(buildMessagesCommand())
    .addCommand(buildAttachmentsCommand())
    .addCommand(buildLabelsCommand())
    .allowUnknownOption(false)
    .showHelpAfterError();

  // configureHelp() is not inherited through addCommand(), so apply it tree-wide.
  configureTreeHelp(program);

  if (handleCompletion(program, argv, 'fob-mail')) return;

  program.parse(argv, { from: 'user' });
}
