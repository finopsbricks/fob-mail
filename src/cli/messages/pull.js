import { writeFileSync } from 'node:fs';
import { clientFor } from '../_helpers.js';

export async function pullMessageHandler(argv) {
  const file = await clientFor().messages.raw(argv.id);
  if (argv.output === '-') {
    process.stdout.write(file.buffer);
    return;
  }
  const path = argv.output || `${argv.id}.eml`;
  writeFileSync(path, file.buffer);
  if (argv.json) console.log(JSON.stringify({ path, filename: file.filename, content_type: file.content_type, size: file.buffer.length }, null, 2));
  console.error(`Wrote ${path}`);
}
