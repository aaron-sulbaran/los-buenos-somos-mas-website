# Los Buenos Somos Más

A bilingual (ES/EN) transparency website for a citizen-led Venezuela earthquake relief fund. The fund is closed to new donations; this site is a living document of radical financial transparency: every dollar received and every dollar distributed, with receipts.

A Google Sheet maintained by the organizers is the single source of truth. The site reads it (read-only) and renders it. It is not a donation platform.

## Stack

Next.js (App Router) with TypeScript strict, Tailwind CSS 4, Google Sheets API via a read-only service account, hosted on Vercel.

## Development

```bash
pnpm install
cp .env.example .env.local   # then fill in values, or keep DATA_SOURCE=fixture
pnpm dev
```

With `DATA_SOURCE=fixture` the site runs on built-in sample data and needs no Google credentials.

| Task | Command |
|---|---|
| Dev server | `pnpm dev` |
| Build | `pnpm build` |
| Lint | `pnpm lint` |
| Typecheck | `pnpm typecheck` |
| Tests | `pnpm test` |

Agent conventions for this repo are documented in `AGENTS.template.md`.
