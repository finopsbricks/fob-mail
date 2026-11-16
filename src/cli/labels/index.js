/**
 * `fob-mail labels <action>` — the firm's label catalog. Label a thread with
 * `fob-mail threads edit <id> --add-label <name>`.
 */

import { Command, Option } from 'commander';

import { safe, jsonOption, examples } from '../_helpers.js';
import { listLabelsHandler } from './list.js';
import { createLabelHandler } from './create.js';

export function buildLabelsCommand() {
  const labels = new Command('labels').description("List and create the firm's labels (label a thread with threads edit)");

  examples(
    labels
      .command('list')
      .description("List the firm's labels")
      .addOption(new Option('--format <format>', 'Output format').choices(['table', 'csv', 'json']))
      .option('--json', 'Output raw JSON')
      .action(safe(listLabelsHandler)),
    ['fob-mail labels list', 'fob-mail labels list --json'],
  );

  examples(
    jsonOption(
      labels
        .command('create')
        .description('Create a label (returns the existing one if the name is taken)')
        .argument('<name>', 'Label name')
        .option('--color <hex>', 'Hex color, e.g. #0075ca'),
    ).action(safe(createLabelHandler)),
    ['fob-mail labels create bill --color "#0075ca"'],
  );

  return labels;
}
