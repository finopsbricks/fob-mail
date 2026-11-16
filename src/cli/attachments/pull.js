import { existsSync, statSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { clientFor } from '../_helpers.js';

/** A filename from the sender, reduced to its last path segment so it can't write elsewhere. */
function safeName(name, id) {
  const base = basename(String(name || '').replace(/\\/g, '/')).replace(/^\.+/, '');
  return base || `${id}.bin`;
}

export async function pullAttachmentHandler(argv) {
  const file = await clientFor().attachments.content(argv.id);
  if (argv.output === '-') {
    process.stdout.write(file.buffer);
    return;
  }
  const name = safeName(file.filename, argv.id);
  const out = argv.output;
  const path = !out ? name : out.endsWith('/') || (existsSync(out) && statSync(out).isDirectory()) ? join(out, name) : out;
  writeFileSync(path, file.buffer);
  if (argv.json) console.log(JSON.stringify({ path, filename: file.filename, content_type: file.content_type, size: file.buffer.length }, null, 2));
  console.error(`Wrote ${path}`);
}
