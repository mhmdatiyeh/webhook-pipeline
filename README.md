# Webhook Pipeline

A webhook-driven task processing pipeline — a simplified Zapier. Incoming webhooks trigger background jobs that process data and deliver results to registered subscribers.

## Architecture

```
Webhook → API Server → Job Queue (PostgreSQL) → Worker → Subscribers
```

The system has three main components:

**API Server** — receives webhooks, manages pipelines, and exposes job status endpoints.

**Worker** — a separate process that polls for pending jobs, runs processing actions, and delivers results to subscribers with retry logic.

**PostgreSQL** — serves as both the database and the job queue using `FOR UPDATE SKIP LOCKED` for safe concurrent access.

## Tech Stack

- TypeScript, Node.js, Express
- PostgreSQL
- Docker + Docker Compose
- GitHub Actions CI/CD

## Setup

### Prerequisites

- Docker and Docker Compose installed

### Run with Docker Compose

```bash
docker compose up --build
```

This starts three services: PostgreSQL, API server (port 3000), and Worker.

### Run locally for development

```bash
# Start PostgreSQL only
docker compose up postgres -d

# Copy environment variables
cp .env.example .env

# Install dependencies
npm install

# Terminal 1 — API server
npm run dev

# Terminal 2 — Worker
npm run worker
```

## Environment Variables

| Variable       | Description                  | Default                                                          |
| -------------- | ---------------------------- | ---------------------------------------------------------------- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5433/webhook_pipeline` |
| `PORT`         | API server port              | `3000`                                                           |

## API Documentation

### Pipelines

#### Create a pipeline

```
POST /pipelines
```

Body:

```json
{
  "name": "My Pipeline",
  "action_type": "enrich",
  "action_config": {},
  "subscribers": ["https://your-service.com/webhook"]
}
```

Response:

```json
{
  "id": "uuid",
  "name": "My Pipeline",
  "source_token": "uuid",
  "action_type": "enrich",
  "action_config": {},
  "subscribers": ["https://your-service.com/webhook"],
  "is_active": true,
  "created_at": "2026-03-14T00:00:00.000Z",
  "updated_at": "2026-03-14T00:00:00.000Z"
}
```

#### Get all pipelines

```
GET /pipelines
```

#### Get a pipeline

```
GET /pipelines/:id
```

#### Update a pipeline

```
PUT /pipelines/:id
```

Body: any subset of pipeline fields.

#### Delete a pipeline

```
DELETE /pipelines/:id
```

---

### Webhooks

#### Send a webhook

```
POST /webhooks/:source_token
```

Body: any JSON payload.

Response:

```json
{
  "job_id": "uuid",
  "status": "queued"
}
```

---

### Jobs

#### Get all jobs

```
GET /jobs
```

#### Get a job

```
GET /jobs/:id
```

#### Get delivery attempts for a job

```
GET /jobs/:id/deliveries
```

---

## Processing Actions

### `enrich`

Adds metadata to the payload.

Config:

```json
{
  "extra": { "environment": "production" }
}
```

Input → Output:

```json
// input
{ "event": "new_order", "amount": 150 }

// output
{ "event": "new_order", "amount": 150, "processed_at": "...", "pipeline_id": "..." }
```

---

### `transform`

Remaps keys according to a mapping config.

Config:

```json
{
  "mapping": { "fullName": "name", "userEmail": "email" }
}
```

Input → Output:

```json
// input
{ "name": "Ahmad", "email": "ahmad@test.com" }

// output
{ "fullName": "Ahmad", "userEmail": "ahmad@test.com" }
```

---

### `filter`

Passes or stops the job based on a condition.

Config:

```json
{
  "field": "amount",
  "operator": "gt",
  "value": 100
}
```

Operators: `eq`, `gt`, `lt`, `contains`

If condition not met → job status becomes `skipped`, no delivery sent.

---

## Design Decisions

**PostgreSQL as a job queue** — instead of a dedicated queue like Redis or RabbitMQ, I used PostgreSQL with `FOR UPDATE SKIP LOCKED`. This keeps the stack simple with one less dependency, and PostgreSQL handles the concurrency safely.

**Separate Worker process** — the worker runs as a separate Docker service. This means the API server stays responsive even when processing heavy jobs, and both can be scaled independently.

**JSONB for action_config and subscribers** — action configs vary per action type, so JSONB gives flexibility without needing separate tables. Subscribers are simple URL arrays, so storing them as JSONB in the pipeline row avoids an unnecessary join.

**Synchronous webhook ingestion** — the API responds immediately with `200 OK` and a job_id without waiting for processing. This is important because webhook senders often have short timeout windows.

**Exponential backoff for retries** — delivery retries wait 10s then 30s between attempts. This avoids hammering a temporarily unavailable service and gives it time to recover.

## CI/CD

**CI** — runs on every pull request to main:

- TypeScript type check
- Build
- ESLint
- Prettier format check

**CD** — runs on every push to main:

- Build
- Docker image build for API and Worker

## Project Structure

```
src/
├── api/
│   ├── server.ts
│   ├── routes/
│   ├── controllers/
│   └── middleware/
├── services/
│   ├── pipelines.service.ts
│   ├── jobs.service.ts
│   └── delivery.service.ts
├── worker/
│   ├── worker.ts
│   ├── processor.ts
│   └── actions/
│       ├── index.ts
│       ├── transform.ts
│       ├── filter.ts
│       └── enrich.ts
├── db/
│   ├── client.ts
│   └── schema.sql
├── types/
│   └── index.ts
└── lib/
    └── logger.ts
```
