import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { execFile } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const run = promisify(execFile);
const bin = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'bin', 'cli.js');

/** A stand-in Mail API: whoami works, /threads is forbidden for this key, the rest 404. */
let server;
let base;
beforeAll(async () => {
  server = createServer((req, res) => {
    const send = (status, body) => { res.writeHead(status, { 'content-type': 'application/json' }); res.end(JSON.stringify(body)); };
    if (req.headers['api-key'] !== 'fob_mail_k') return send(401, { error: { code: 'UNAUTHORIZED', message: 'Invalid API credentials' } });
    if (req.url.startsWith('/api/v1/whoami')) return send(200, { data: { org: { id: 'o1', name: 'Kumar & Co', slug: 'kumar-co' }, actor: 'api_key:7', mailboxes: [] } });
    if (req.url.startsWith('/api/v1/threads')) return send(403, { error: { code: 'FORBIDDEN', message: 'API key lacks threads:read permission' } });
    return send(404, { error: { code: 'NOT_FOUND', message: 'Mailbox not found' } });
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${server.address().port}`;
});
afterAll(() => server.close());

function cli(args, env) {
  return run('node', [bin, ...args], { env: { ...process.env, ...env } }).then(
    (r) => ({ code: 0, ...r }),
    (e) => ({ code: e.code, stdout: e.stdout, stderr: e.stderr }),
  );
}

describe('fob-mail end to end', () => {
  const env = { FOB_MAIL_CONFIG_DIR: join(mkdtempSync(join(tmpdir(), 'fob-mail-')), 'cfg') };

  it('with no profile, says how to set one up', async () => {
    const r = await cli(['threads', 'list'], env);
    expect(r.code).toBe(1);
    expect(r.stderr).toMatch(/No Mail profile selected/);
    expect((await cli(['getting-started'], env)).stdout).toMatch(/never invent them/);
  });

  it('adds a profile and resolves the firm', async () => {
    const r = await cli(['config', 'profiles', 'add', 'kumar', '--api-url', base, '--api-key', 'fob_mail_k', '--api-secret', 's'], env);
    expect(r.stdout).toMatch(/Resolved the firm for 'kumar'/);
    const current = JSON.parse((await cli(['config', 'profiles', 'current', '--json'], env)).stdout);
    expect(current).toMatchObject({ name: 'kumar', org_id: 'o1', org_name: 'Kumar & Co' });
  });

  it('prints the error and the next step, and exits 1', async () => {
    const forbidden = await cli(['threads', 'list'], env);
    expect(forbidden.code).toBe(1);
    expect(forbidden.stderr).toMatch(/Error: API key lacks threads:read permission/);
    expect(forbidden.stderr).toMatch(/Settings → API keys/);

    const missing = await cli(['mailboxes', 'show', 'nope'], env);
    expect(missing.stderr).toMatch(/fob-mail mailboxes list/);
  });

  it('rejects an unknown flag', async () => {
    const r = await cli(['threads', 'list', '--colour', 'red'], env);
    expect(r.code).not.toBe(0);
    expect(r.stderr).toMatch(/unknown option/);
  });
});
