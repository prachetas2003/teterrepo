# Sable & Kiln

A small ceramics studio in Nørrebro, Copenhagen. A public catalog and commission desk.

- `web/`: Vite, React, React Router; Fraunces and Outfit typography, locally drawn SVG ceramics.
- `api/`: Express, TypeScript, Prisma and PostgreSQL. Startup transactionally applies committed SQL migrations with an advisory lock and checksum ledger, then idempotently seeds eight pieces. Prisma uses its JavaScript engine and Postgres adapter.

## Deployment

The deployer supplies `DATABASE_URL`, `PORT`, `CORS_ORIGIN`, and `VITE_API_URL`. Supply `GEMINI_API_KEY` securely through deployment settings; it is required and has no fallback. Never commit `.env` files.

In `api/`, run `npm install`, `npm run build`, then `npm start`. In `web/`, run `npm install` and `npm run build`; serve `dist/`. For development each app has `npm run dev`. The API exposes `GET /health`.

The demo deliberately imports `framer-motion` in `web/src/components/Reveal.tsx` without declaring or locking that package. Web installation succeeds and its build fails on that missing import, for the automatic deployer to repair through a pull request. All other code is intended to build cleanly.

Commission requests persist in PostgreSQL. The public recent list exposes only first names, requested pieces and months; email and table notes stay private. The kiln-note action calls Gemini on the server and labels the returned note. No API key is sent to the browser.
