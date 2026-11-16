import { describe, it, expect } from '@jest/globals';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const bin = join(dirname(fileURLToPath(import.meta.url)), '..', 'bin', 'cli.js');
const help = (args) => execFileSync('node', [bin, ...args.split(' '), '--help'], { encoding: 'utf8' });

/** Heading lines in the order shown. */
const headings = (args) => help(args).split('\n').filter((l) => /^(Arguments:|Options:|Global Options:|Examples:)$/.test(l));

describe('help', () => {
  it("shows a command's own options above the global ones, then examples", () => {
    expect(headings('threads reply')).toEqual(['Arguments:', 'Options:', 'Global Options:', 'Examples:']);
    expect(headings('threads list')).toEqual(['Options:', 'Global Options:', 'Examples:']);
  });

  it('every read command mentions --json', () => {
    for (const cmd of ['mailboxes list', 'mailboxes show', 'threads list', 'threads show', 'messages list', 'messages show', 'labels list']) {
      expect(help(cmd)).toMatch(/--json/);
    }
  });

  it('the top level points newcomers to getting-started and the docs, and names fob-email', () => {
    const out = help('').trim() || execFileSync('node', [bin, '--help'], { encoding: 'utf8' });
    expect(out).toMatch(/getting-started/);
    expect(out).toMatch(/mail\.finopsbricks\.com\/docs/);
    expect(out).toMatch(/fob-email/);
  });

  it('surfaces aliases', () => {
    expect(help('config profiles')).toMatch(/remove\|rm <name>/);
    expect(execFileSync('node', [bin, 'config', '--help'], { encoding: 'utf8' })).toMatch(/profiles\|orgs/);
  });

  it('prints the package version', () => {
    const { version } = JSON.parse(execFileSync('node', ['-e', "process.stdout.write(require('fs').readFileSync('package.json','utf8'))"], { encoding: 'utf8', cwd: join(dirname(bin), '..') }));
    expect(execFileSync('node', [bin, '--version'], { encoding: 'utf8' }).trim()).toBe(version);
  });
});
