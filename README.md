# worklog

Generate a concise daily work report from your GitHub activity on a given date. Fetches authored PRs and PR reviews via the GitHub GraphQL API, then summarizes them with the `claude` CLI. Summaries are cached per date in a local SQLite DB so re-runs are instant.

## Requirements

- [Bun](https://bun.com)
- [GitHub CLI](https://cli.github.com) (`gh`) authenticated — used to source the API token
- [Claude Code](https://claude.com/claude-code) CLI on `PATH` — used for summarization

## Usage

Run against a source checkout:

```sh
GITHUB_TOKEN=$(gh auth token) bun run start 2026-04-01
```

Or build a standalone binary and run it from anywhere:

```sh
bun run build
GITHUB_TOKEN=$(gh auth token) ./worklog 2026-04-01
```

The date argument must be `YYYY-MM-DD`.

## Caching

Summaries are stored in SQLite at `~/.worklog.db` (override with `WORKLOG_DB`).

- **Cache hit, interactive terminal** — prints the cached summary and asks `Regenerate? [y/N]`. Press Enter to keep it; press `y` to re-fetch and re-summarize (overwrites the row).
- **Cache hit, piped/redirected** — prints the cached summary and exits. No prompt.
- **Cache miss** — runs the full pipeline and stores the result.

Pipeline failures never overwrite the cache.

## Scripts

- `bun run start <date>` — run directly from `src/` for fast iteration
- `bun run build` — compile a single-file binary to `./worklog`
- `bun run typecheck` — run `tsc --noEmit`
