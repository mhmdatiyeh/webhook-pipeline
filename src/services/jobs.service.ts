import { QueryResult } from 'pg'
import { db } from '../db/client'
import { Job, JobStatus } from '../types'

export async function createJob(
  pipelineId: string,
  payload: Record<string, unknown>
): Promise<Job> {
  try {
    const result = await db.query(
      `INSERT INTO jobs (pipeline_id, payload)
       VALUES ($1, $2)
       RETURNING *`,
      [pipelineId, JSON.stringify(payload)]
    ) as QueryResult<Job>
    return result.rows[0]
  } catch (err) {
    throw err
  }
}

export async function getJobById(id: string): Promise<Job | null> {
  try {
    const result = await db.query(
      'SELECT * FROM jobs WHERE id = $1',
      [id]
    ) as QueryResult<Job>
    return result.rows[0] ?? null
  } catch (err) {
    throw err
  }
}

export async function getAllJobs(): Promise<Job[]> {
  try {
    const result = await db.query(
      'SELECT * FROM jobs ORDER BY created_at DESC'
    ) as QueryResult<Job>
    return result.rows
  } catch (err) {
    throw err
  }
}

export async function getPendingJob(): Promise<Job | null> {
  try {
    const result = await db.query(
      `UPDATE jobs
       SET status = 'processing'
       WHERE id = (
         SELECT id FROM jobs
         WHERE status = 'pending'
         ORDER BY created_at ASC
         LIMIT 1
         FOR UPDATE SKIP LOCKED
       )
       RETURNING *`
    ) as QueryResult<Job>
    return result.rows[0] ?? null
  } catch (err) {
    throw err
  }
}

export async function updateJobStatus(
  id: string,
  status: JobStatus,
  resultRecord?: Record<string, unknown> | null,
  error?: string | null
): Promise<void> {
  try {
    await db.query(
      `UPDATE jobs
       SET status = $2,
           result = $3,
           error = $4,
           processed_at = NOW()
       WHERE id = $1`,
      [
        id,
        status,
        resultRecord ? JSON.stringify(resultRecord) : null,
        error ?? null,
      ]
    )
  } catch (err) {
    throw err
  }
}
