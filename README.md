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
