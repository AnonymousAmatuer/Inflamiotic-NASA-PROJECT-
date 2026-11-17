# Flame Intelligence

A Next.js dashboard for NASA space-combustion research. Investigation records and the selected NASA source files are stored locally in the project; the site does not need PostgreSQL or a `DATABASE_URL`.

## Run locally

1. Install Node.js if it is not already installed.
2. From this folder, run `npm install`.
3. Run `npm run dev` and open the local address shown in the terminal.

The **New evidence** tab contains selected measurements and links to download the supplied CSV files. Investigation summaries live in `src/lib/seed-data.ts`.
