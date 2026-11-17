# fob-mail: Mail API client and CLI for accounting firms

`fob-mail` reads, labels, assigns and replies to the client mailboxes an accounting firm has
connected in [Mail](https://mail.finopsbricks.com), from the terminal, an AI agent or Node.js code.
**For your own mailbox over IMAP, use [`fob-email`](https://www.npmjs.com/package/@finopsbricks/fob-email) instead.**

```bash
npm install -g @finopsbricks/fob-mail
fob-mail getting-started
```

```console
$ fob-mail threads list --status open
ID            STATUS  FROM            SUBJECT                       LAST              LABELS
--------------------------------------------------------------------------------------------
th9a8b7c6d5e  open    Vendor Billing  Invoice INV-2291 for October  2026-11-17 08:12  bill
th2b3c4d5e6f  open    Bank Alerts     Bank statement, October       2026-11-16 11:02  —
```

Docs: [CLI](https://mail.finopsbricks.com/docs/cli) ·
[Use with AI agents](https://mail.finopsbricks.com/docs/cli/ai-agents) ·
[API reference](https://mail.finopsbricks.com/docs/api/authentication) ·
[every docs page as Markdown](https://mail.finopsbricks.com/llms.txt). Beta.

<sub>Output above is from a stand-in API with sample data.</sub>

## What it is

Mail is an email client for accounting firms: a firm connects the mailboxes its clients share
with it, once, and staff and automations work them without holding the client's password.
`fob-mail` uses Mail's API with an API key. One package, two ways in:

- **The CLI** (`fob-mail`): list mailboxes and threads, read messages, download attachments and
  raw `.eml`, set a thread's status, assignee and labels, and reply or send new mail from the
  client's mailbox. `--json` on every read command.
- **The library** (`import { fobMail }`): the same calls for Assembly Lines and scripts. The CLI
  calls the same code, so the two never drift.

Requires Node.js 18 or later. With the [`fob` dispatcher](https://www.npmjs.com/package/@finopsbricks/fob-cli),
`fob mail …` and `fob-mail …` are the same command.

## Set up

A firm admin creates an API key in Mail: **Settings → API keys**. Pick a preset and the mailboxes
it may use:

| Preset | Can |
| --- | --- |
| Read only | List mailboxes, read threads and messages, download attachments |
| Read and label | Also set status, assignee and labels, create labels |
| Read, label and send | Also reply and send new mail from the client's mailbox |

```bash
fob-mail config profiles add acme --api-key fob_mail_xxxxxxxxxxxx --api-secret yyyyyyyy
fob-mail config profiles current
```

One profile per firm; switch with `fob-mail config profiles use <name>` or `--profile <name>`.
Profiles live in `~/.fob/fob-mail/config.yml` (mode 0600).

## Use

```bash
fob-mail mailboxes list
fob-mail threads list --status open --label bill
fob-mail threads show th9a8b7c6d5e
fob-mail threads edit th9a8b7c6d5e --status waiting --assignee me --add-label chased
fob-mail threads reply th9a8b7c6d5e --body "Received, thank you."
fob-mail messages send --mailbox mb4k2x9q1z7c --to billing@vendor.example --subject "Statement for October" --body "Could you send it?"
fob-mail messages list --direction inbound --updated-since 2026-11-17T09:00:00Z --all --json
fob-mail attachments pull at0p9o8i7u6y -o ./bills/
fob-mail messages pull ms1a2s3d4f5g -o invoice.eml
fob-mail labels create bill
```

| Resource | Actions |
| --- | --- |
| `mailboxes` | `list`, `show` |
| `threads` | `list`, `show`, `edit` (status, assignee, add/remove labels), `reply` |
| `messages` | `list`, `show` (`--html`), `pull` (raw `.eml`), `send` |
| `attachments` | `pull` |
| `labels` | `list`, `create` |
| `config profiles` (alias `orgs`) | `list`, `current`, `add`, `use`, `remove`, `refresh` |

Every command has `--help` with examples. Lists take `--page`, `--limit`, `--all`, `--fields`,
`--format table|csv|json` and `--output <file>`; hints go to stderr, data to stdout. A list's
`--json` is one page (`{ data, count, truncated, total, page, has_more }`) unless you add `--all`.

### Nothing is sent twice

A reply or a new message carries an idempotency key. Without `--idempotency-key`, `fob-mail`
derives one from the thread (or mailbox, recipients and subject) and the text, so running the
same command again after a timeout returns the first reply and sends nothing. To send the same
text again on purpose, pass a new key. A send whose outcome Gmail didn't confirm is `pending`:
check the client's Sent folder before sending it again.

### What it doesn't do

Mail keeps a copy of each mailbox plus a thread's status, assignee and labels. So `fob-mail` doesn't
move, delete or mark mail in the client's mailbox, and has no drafts or folders. Connecting a
mailbox takes the client's sign-in and happens in Mail. Mail is sent as plain text from Google
mailboxes only; replies go to the last sender. No attachments on send yet.

## As a library

```js
import { fobMail } from '@finopsbricks/fob-mail';

const mail = fobMail({
  api_key: process.env.FOB_MAIL_API_KEY,
  api_secret: process.env.FOB_MAIL_API_SECRET,
  // api_url: 'https://mail.finopsbricks.com' (default)
});

const fresh = await mail.messages.getAll({ direction: 'inbound', updated_since: last_run, fields: ['id', 'thread', 'subject', 'body_text', 'updated_at'] });
for (const m of fresh) {
  await mail.threads.update(m.thread, { add_labels: ['bill'], assignee: 'me' });
  await mail.threads.reply(m.thread, { body_text: 'Received, thank you.', idempotency_key: `ack:${m.thread}` });
}
```

The library never reads the environment or the CLI's config: pass credentials in. Errors are
`ApiError` with the API's `code` (`FORBIDDEN`, `NOT_FOUND`, `MAILBOX_NEEDS_RECONNECT`,
`SEND_REFUSED`, …) and `status`. See the [API reference](https://mail.finopsbricks.com/docs/api/authentication).

## License

Apache-2.0. See [LICENSE](./LICENSE) and [NOTICE](./NOTICE).
