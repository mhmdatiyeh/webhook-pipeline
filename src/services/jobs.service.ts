import { QueryResult } from 'pg'
import { db } from '../db/client'
import { Job } from '../types'

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
