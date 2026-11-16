import { writeFileSync } from 'node:fs';
import { MAX_ALL_ROWS } from '../../http.js';
import { formatCsv, formatTable } from './format.js';
import { formatScopeHint, scopePagination } from './list.js';

/**
 * Print a resolveListScope() result as a table (default), CSV or JSON (`--json` or
 * `--format json`), to stdout or `--output <path>`. "There's more" hints go to stderr.
 * JSON is `{ data, count, truncated, total, page, has_more }`, as in fob-stm.
 */
export function printList(argv, scope, selector) {
  const fields = selector.parseFields(argv.fields);
  const format = argv.json ? 'json' : argv.format || 'table';

  let text;
  if (format === 'json') {
    text = JSON.stringify({ data: scope.rows, count: scope.rows.length, truncated: scope.truncated, ...scopePagination(argv, scope) }, null, 2);
  } else if (format === 'csv') {
    text = formatCsv(fields, selector.rawRows(scope.rows, fields));
  } else {
    text = formatTable(selector.headersFor(fields), selector.renderRows(scope.rows, fields), { align: selector.alignFor(fields) });
  }

  if (argv.output) {
    writeFileSync(argv.output, text);
    console.error(`Wrote ${argv.output}`);
  } else {
    console.log(text);
  }

  const hint = formatScopeHint(argv, scope);
  if (hint) console.error(hint);
  if (scope.truncated) console.error(`(truncated to first ${MAX_ALL_ROWS} rows — refine filters to narrow the result set)`);
}

/** Print one record: JSON with `--json`, otherwise the handler's text. */
export function printRecord(argv, record, renderText) {
  if (argv.json) {
    console.log(JSON.stringify(record, null, 2));
    return;
  }
  console.log(renderText(record));
}

/** "Kumar & Co accounts <accounts@citara.org>", or just the address. */
export function mailboxName(m) {
  if (!m) return '';
  return m.label ? `${m.label} <${m.email_address}>` : m.email_address;
}

/** "Name <email>" or "email". */
export function address(a) {
  if (!a) return '';
  return a.name ? `${a.name} <${a.email}>` : a.email;
}

/** Shorten to `n` characters with an ellipsis. */
export function clip(text, n) {
  const s = String(text ?? '');
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}
