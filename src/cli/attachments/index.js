/**
 * `fob-mail attachments pull <id>` — attachment ids come from `threads show` or `messages show`.
 */

import { Command } from 'commander';

import { safe, jsonOption, examples } from '../_helpers.js';
import { pullAttachmentHandler } from './pull.js';

export function buildAttachmentsCommand() {
  const attachments = new Command('attachments').description('Download attachments');

  examples(
    jsonOption(
      attachments
        .command('pull')
        .description('Download an attachment (ids are listed by `threads show` and `messages show`)')
        .argument('<id>', 'Attachment ID')
        .option('-o, --output <path>', 'File or folder to write to (default: its filename in the current folder; - for stdout)'),
    ).action(safe(pullAttachmentHandler)),
    ['fob-mail attachments pull at0p9o8i7u6y', 'fob-mail attachments pull at0p9o8i7u6y -o ./bills/'],
  );

  return attachments;
}
