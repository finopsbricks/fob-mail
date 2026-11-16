/**
 * `fob-mail getting-started` — an in-band setup walkthrough aimed at agents driving the CLI on a
 * user's behalf. When a profile already exists, setup is done and it says so instead.
 */

import { listProfiles } from './config-store.js';
import { DEFAULT_API_URL } from '../http.js';

function alreadyConfigured({ current, profiles, path }) {
  const names = profiles.map((p) => p.name).join(', ');
  return [
    'Setup is already complete — no need to run through getting started.',
    '',
    `Configured profile(s): ${names}`,
    current ? `Active profile:        ${current}` : 'Active profile:        (none selected)',
    `Config file:           ${path}`,
    '',
    'You can start running commands now, for example:',
    '',
    '  fob-mail config profiles current        # the firm and key in use',
    '  fob-mail mailboxes list                 # mailboxes this key may use',
    '  fob-mail threads list --status open',
    '  fob-mail threads show <thread-id>',
    '',
    'Only re-run setup to add another firm:',
    '',
    '  fob-mail config profiles add <name> --api-key <key> --api-secret <secret>',
    '  fob-mail config profiles use <name>',
  ].join('\n');
}

function notConfigured() {
  return [
    'fob-mail works with the client mailboxes a firm has connected in Mail',
    `(${DEFAULT_API_URL}). For your own mailbox over IMAP, use fob-email instead.`,
    '',
    'No profile is configured yet. Follow these steps to get started.',
    '',
    'Note for automated agents: always check for an existing profile first with',
    '`fob-mail config profiles current`. If one is configured, setup is complete —',
    'skip the steps below and start running commands.',
    '',
    '1. A firm admin creates an API key in Mail: Settings → API keys',
    `   (${DEFAULT_API_URL}/orgs/<your-firm>/settings/apikeys).`,
    '   Pick a preset (Read only / Read and label / Read, label and send) and the',
    '   mailboxes it may use. Copy the key and secret (the secret is shown once).',
    '',
    '2. Add a profile (ask the user for the key and secret — never invent them):',
    '',
    '   fob-mail config profiles add myfirm \\',
    '     --api-key fob_mail_xxxxxxxxxxxx \\',
    '     --api-secret yyyyyyyyyyyyyyyy',
    '',
    `   --api-url is optional and defaults to ${DEFAULT_API_URL}.`,
    '',
    '3. Confirm it works:',
    '',
    '   fob-mail config profiles current',
    '   fob-mail mailboxes list',
  ].join('\n');
}

export async function gettingStartedHandler() {
  const info = listProfiles();
  console.log(info.profiles.length > 0 ? alreadyConfigured(info) : notConfigured());
}
