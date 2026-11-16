# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow
[Semantic Versioning](https://semver.org/).

## [0.1.0] - 2026-11-17

### Added

- `fobMail(credentials)` client: `mailboxes`, `threads` (list, getAll, get, update, reply),
  `messages` (list, getAll, get, raw, send), `attachments.content`, `labels` (list, create), `whoami`.
- `fob-mail` CLI over the same client: `mailboxes`, `threads`, `messages`, `attachments`, `labels`,
  `config profiles` (alias `orgs`) and `getting-started`; `--json` on every read command; a next
  step printed under each API error.
- `messages send` starts a new thread from a client's mailbox.
- Replies and sends derive an idempotency key from what is sent unless `--idempotency-key` is given.
