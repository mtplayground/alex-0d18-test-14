# alex-0d18-test-14

## What This Project Is

`alex-0d18-test-14` is a full-stack todo application. It provides a React
frontend for managing todos and a Node.js/Express API backed by PostgreSQL via
Prisma.

## Current Capabilities

- Create todos with client-side and API-side validation.
- List todos newest-first.
- Toggle a todo between open and complete.
- Delete todos.
- Show frontend loading, empty, validation, and error states.
- Serve the production frontend build from the API for same-origin self-hosting.

## Architecture

- Monorepo with npm workspaces under `apps/api` and `apps/web`.
- Backend: Express, TypeScript, Prisma, PostgreSQL.
- Frontend: Vite, React, TypeScript, TanStack React Query.
- Shared contract is implicit through typed frontend API helpers and backend Zod
  validation schemas.
- Persistent state must use PostgreSQL through `DATABASE_URL`; no SQLite,
  in-memory, or file-backed persistence.
- The API binds to `0.0.0.0:8080` by default and exposes `/health` plus `/todos`.
- In production/self-hosted mode, the API serves `apps/web/dist` and falls back
  non-API routes to `index.html`.

## Quality Gates

- Backend unit and route tests use Vitest and Supertest.
- Frontend component tests use Vitest, jsdom, and Testing Library.
- End-to-end coverage uses Playwright for the full create, list, toggle, delete
  flow.
- Repository validation includes formatting, linting, typechecking, builds,
  tests, audit, Prisma migration status, and E2E tests.

## Operational Conventions

- Configure with environment variables; `.env.example` is the checked-in
  reference.
- Run `npm run db:migrate:deploy` for deployed database migrations.
- Run `npm run self-host:build` before `npm run start:prod` for self-hosting.
- Leave `VITE_API_BASE_URL` unset for same-origin production builds served by
  the API.
