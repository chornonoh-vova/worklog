# worklog

A Bun CLI that generates a daily work report from GitHub activity by shelling out to the `claude` CLI for summarization. Summaries are cached per date in a local SQLite DB.

## Layout

- `src/index.ts` — entry point; validates inputs, checks cache, orchestrates fetch → transform → summarize → store
- `src/github.ts` — GraphQL call against `api.github.com`, typed response
- `src/transform.ts` — shapes the raw response into `{ repo: { prs, reviews } }`
- `src/claude.ts` — spawns `claude -p`, pipes prompt via stdin, returns stdout
- `src/cache.ts` — `bun:sqlite` DB at `$HOME/.worklog.db` (or `$WORKLOG_DB`); `worklogs(date PK, summary)`
- `src/prompt.ts` — `confirm()` via `node:readline/promises`, writes to stderr
- `src/spinner.ts` — stderr-only TTY spinner

## Conventions

- Use Bun APIs (`Bun.spawn`, `Bun.$`, `Bun.file`, `bun:sqlite`) over Node equivalents where available.
- No external runtime dependencies — the project builds to a single-file binary via `bun build --compile`.
- The tool writes the report to stdout; all progress, prompts, and errors go to stderr so piping stays clean.
- Cache writes happen only after `summarize` succeeds — pipeline failures must not poison the cache.

## Scripts

- `bun run start <YYYY-MM-DD>` — run from source
- `bun run build` — compile `./worklog` binary
- `bun run typecheck` — `tsc --noEmit`
