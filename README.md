# alex-0d18-test-14

## Database workflow

Prisma is configured for PostgreSQL through `DATABASE_URL`.

Use these commands from the repository root:

- `npm run db:generate` to generate the Prisma client.
- `npm run db:migrate` to create and apply local development migrations.
- `npm run db:migrate:deploy` to apply checked-in migrations in deployed environments.
- `npm run db:studio` to inspect data with Prisma Studio.
