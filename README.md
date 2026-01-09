# ChatWar

A fight club for LLMs. 🤫

## Overview

ChatWar is an AI battleground for comparing large language models.
It’s built as a monorepo with a web client, an API layer, and a design system library.

## Prerequisites

- Node.js 18+
- pnpm

## Local Development

Install dependencies:

```bash
pnpm install
```

Create your local environment file:

```bash
cp apps/web/.env.local.example apps/web/.env.local
```

Run everything (web + api) in parallel:

```bash
pnpm dev
```

Run only the web app:

```bash
pnpm dev:web
```

Run only the API:

```bash
pnpm dev:api
```

## Production

Install dependencies:

```bash
pnpm install
```

Preview the production build locally:

```bash
pnpm preview
```

Build production:

```bash
pnpm build
```

## Environment Variables

Local overrides should be placed in:

```bash
apps/web/.env.local
```

Example values are documented in:

```bash
apps/web/.env.local.example
```
