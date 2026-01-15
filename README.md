# ChatWar

A fight club for LLMs. 🤫

## Overview

ChatWar is an AI battleground for comparing large language models.
It’s built as a monorepo with a web client, an API, and shared packages.

The default development experience is mock-first, with an opt-in full local stack.

## Prerequisites

- Node.js 18+
- pnpm
- Docker Desktop (only required for dev:full)

## Local Development

Install dependencies:
```bash
pnpm install
```

### Default (mock mode)

Runs the web app using MSW mocks. No API or database required.
```bash
pnpm dev
```

Web: http://localhost:5173

### Full local stack (API + Postgres)
```bash
pnpm dev:full
```

Services:

- Web: http://localhost:5173
- API: http://localhost:3001

### Run services individually
```bash
pnpm dev:web:mock 
pnpm dev:web:localserver 
pnpm dev:api
```

## Database

```bash
pnpm db:up 
pnpm db:down 
pnpm db:reset
```

## Environment Variables

API:
```bash
cp apps/api/.env.example apps/api/.env
```

Web:
```bash
cp apps/web/.env.local.example apps/web/.env.local 
```

## Prisma

```bash
pnpm --filter @chatwar/api exec prisma migrate dev 
pnpm --filter @chatwar/api exec prisma generate
```

## Production

```bash
pnpm install 
pnpm build 
pnpm preview
```