# alex-0d18-test-14

## Environment

Configuration is read from environment variables. Use `.env.example` as the
checked-in reference for required settings.

- `DATABASE_URL` must be a PostgreSQL connection string.
- `HOST` controls the API bind address and defaults to `0.0.0.0`.
- `PORT` controls the API port and defaults to `8080`.
- `NODE_ENV` accepts `development`, `test`, or `production`.

## Database workflow

Prisma is configured for PostgreSQL through `DATABASE_URL`.

Use these commands from the repository root:

- `npm run db:generate` to generate the Prisma client.
- `npm run db:migrate` to create and apply local development migrations.
- `npm run db:migrate:deploy` to apply checked-in migrations in deployed environments.
- `npm run db:studio` to inspect data with Prisma Studio.

## Local development

Run the API and web app from separate terminals:

```bash
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres"
npm run dev:api
```

```bash
VITE_API_BASE_URL=http://localhost:8080 npm run dev:web
```

The API listens on `0.0.0.0:8080` by default. The Vite dev server listens on
`0.0.0.0:5173`.

## Self-hosting

The production API serves the built frontend from `apps/web/dist` on the same
host and port as the API. API endpoints remain available at `/todos` and
`/health`; all other frontend routes fall back to the built `index.html`.

Use these commands from the repository root:

```bash
npm ci
export DATABASE_URL="postgresql://user:password@host:5432/database"
export HOST=0.0.0.0
export PORT=8080
export NODE_ENV=production
npm run self-host:migrate
npm run self-host:build
npm run start:prod
```

For same-origin self-hosting, leave `VITE_API_BASE_URL` unset when building the
frontend. Set `WEB_DIST_DIR` only if the built frontend is moved somewhere other
than `apps/web/dist`.
