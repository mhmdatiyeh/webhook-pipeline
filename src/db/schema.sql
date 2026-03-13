CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- Table: pipelines
-- ================================================
CREATE TABLE IF NOT EXISTS pipelines (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  source_token  UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
  action_type   TEXT NOT NULL CHECK (action_type IN ('transform', 'filter', 'enrich')),
  action_config JSONB NOT NULL DEFAULT '{}',
  subscribers   JSONB NOT NULL DEFAULT '[]',
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ================================================
-- Table: jobs
-- ================================================
CREATE TABLE IF NOT EXISTS jobs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pipeline_id  UUID NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'done', 'failed', 'skipped')),
  payload      JSONB NOT NULL DEFAULT '{}',
  result       JSONB,
  error        TEXT,
  created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMP
);

-- ================================================
-- Table: delivery_attempts
-- ================================================
CREATE TABLE IF NOT EXISTS delivery_attempts (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id         UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  subscriber_url TEXT NOT NULL,
  status_code    INT,
  success        BOOLEAN NOT NULL DEFAULT false,
  attempt_number INT NOT NULL DEFAULT 1,
  error_message  TEXT,
  attempted_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ================================================
-- Indexes
-- ================================================
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_pipeline_id ON jobs(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_delivery_attempts_job_id ON delivery_attempts(job_id);
CREATE INDEX IF NOT EXISTS idx_pipelines_source_token ON pipelines(source_token);