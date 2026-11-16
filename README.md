# fob-mail — client and CLI for Mail

Read, label, assign and reply to a firm's client mail in [Mail](https://mail.finopsbricks.com)
from the terminal, an AI agent, or Node code. One package, two ways in:

- **The CLI** (`fob-mail`): list mailboxes and threads, read messages, download attachments and
  raw `.eml`, set a thread's status, assignee and labels, and reply from the client's mailbox.
  `--json` on every read command.
- **The library** (`import { fobMail }`): the same calls for Assembly Lines and scripts. The CLI
  calls the same code, so the two never drift.

Mail is an email client for accounting firms: a firm connects the mailboxes its clients share
with it, once, and staff and automations work them without holding a password. `fob-mail` uses
Mail's [API](https://mail.finopsbricks.com/docs/api/authentication) with an API key.
**For your own mailbox over IMAP, use [`fob-email`](https://www.npmjs.com/package/@finopsbricks/fob-email) instead.**

Beta.

## Install

```bash
npm install -g @finopsbricks/fob-mail
fob-mail getting-started
```

Requires Node.js 18 or later. With the [`fob` dispatcher](https://www.npmjs.com/package/@finopsbricks/fob-cli),
`fob mail …` and `fob-mail …` are the same command.

## Set up

A firm admin creates an API key in Mail: **Settings → API keys**. Pick a preset and the mailboxes
it may use:

| Preset | Can |
| --- | --- |
| Read only | List mailboxes, read threads and messages, download attachments |
| Read and label | Also set status, assignee and labels, create labels |
| Read, label and send | Also reply from the client's mailbox |

```bash
fob-mail config profiles add kumar-co --api-key fob_mail_xxxxxxxxxxxx --api-secret yyyyyyyy
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
fob-mail messages list --direction inbound --updated-since 2026-11-17T09:00:00Z --all --json
fob-mail attachments pull at0p9o8i7u6y -o ./bills/
fob-mail messages pull ms1a2s3d4f5g -o invoice.eml
fob-mail labels create bill
```

| Resource | Actions |
| --- | --- |
| `mailboxes` | `list`, `show` |
| `threads` | `list`, `show`, `edit` (status, assignee, add/remove labels), `reply` |
| `messages` | `list`, `show` (`--html`), `pull` (raw `.eml`) |
| `attachments` | `pull` |
| `labels` | `list`, `create` |
| `config profiles` (alias `orgs`) | `list`, `current`, `add`, `use`, `remove`, `refresh` |

Every command has `--help` with examples. Lists take `--page`, `--limit`, `--all`, `--fields`,
`--format table|csv|json` and `--output <file>`; hints go to stderr, data to stdout.

### Replies are never sent twice

A reply carries an idempotency key. Without `--idempotency-key`, `fob-mail` derives one from the
thread and the text, so running the same command again after a timeout returns the first reply and
sends nothing. To send the same text again on purpose, pass a new key. A reply whose outcome Gmail
didn't confirm is `pending`: check the client's Sent folder before sending it again.

### What it doesn't do

Mail keeps a copy of each mailbox plus a thread's status, assignee and labels. So `fob-mail` doesn't
move, delete or mark mail in the client's mailbox, and has no drafts or folders. Connecting a
mailbox takes the client's sign-in and happens in Mail. Replies are plain text, from Google
mailboxes, to the last sender; no Cc or attachments yet.

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
