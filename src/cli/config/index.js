/**
 * `fob-mail config profiles <action>`. A profile is a named API key + secret; each belongs to
 * one firm, so `orgs` is an alias.
 */

import { Command } from 'commander';

import { safe, jsonOption, examples } from '../_helpers.js';
import { DEFAULT_API_URL } from '../../http.js';
import { addConfigHandler } from './add.js';
import { listConfigHandler } from './list.js';
import { useConfigHandler } from './use.js';
import { removeConfigHandler } from './remove.js';
import { refreshConfigHandler } from './refresh.js';
import { currentConfigHandler } from './current.js';

function buildProfilesCommand() {
  const profiles = new Command('profiles')
    .alias('orgs')
    .description('Manage credential profiles, one per firm (alias: orgs)');

  jsonOption(profiles.command('list').description('List profiles (current marked with *)')).action(
    safe(listConfigHandler),
  );

  jsonOption(
    profiles
      .command('current')
      .alias('whoami')
      .description('Show the active profile and its firm'),
  ).action(safe(currentConfigHandler));

  examples(
    profiles
      .command('add')
      .description("Add or update a profile with a firm's Mail API key")
      .argument('<name>', 'Profile name, e.g. the firm')
      .option('--api-url <url>', `API base URL (origin only). Optional; defaults to ${DEFAULT_API_URL}`, DEFAULT_API_URL)
      .requiredOption('--api-key <key>', 'API key (starts with fob_mail_)')
      .requiredOption('--api-secret <secret>', 'API secret')
      .action(safe(addConfigHandler)),
    ['fob-mail config profiles add kumar-co --api-key fob_mail_xxxx --api-secret yyyy'],
  );

  profiles
    .command('use')
    .description('Set the current profile')
    .argument('<name>', 'Profile name')
    .action(safe(useConfigHandler));

  profiles
    .command('remove')
    .alias('rm')
    .description('Remove a profile')
    .argument('<name>', 'Profile name')
    .action(safe(removeConfigHandler));

  profiles
    .command('refresh')
    .description("Refresh a profile's firm from the server (--all for every profile)")
    .argument('[name]', 'Profile name (omit with --all)')
    .option('--all', 'Refresh every profile')
    .action(safe(refreshConfigHandler));

  return profiles;
}

export function buildConfigCommand() {
  return new Command('config')
    .description('Manage credential profiles (alias: orgs)')
    .addCommand(buildProfilesCommand());
}
