import { QueryResult } from 'pg'
import { db } from '../db/client'
import { Pipeline, CreatePipelineInput, UpdatePipelineInput } from '../types'

export async function getAllPipelines(): Promise<Pipeline[]> {
  const result = await db.query('SELECT * FROM pipelines ORDER BY created_at DESC') as QueryResult<Pipeline>
  return result.rows
}

export async function getPipelineById(id: string): Promise<Pipeline | null> {
  const result = await db.query(
    'SELECT * FROM pipelines WHERE id = $1',
    [id]
  ) as QueryResult<Pipeline>
  return result.rows[0] ?? null
}

export async function createPipeline(input: CreatePipelineInput): Promise<Pipeline> {
  const { name, action_type, subscribers, action_config = {} } = input
  const result = await db.query(
    `INSERT INTO pipelines (name, action_type, subscribers, action_config)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name, action_type, JSON.stringify(subscribers), JSON.stringify(action_config)]
  ) as QueryResult<Pipeline>
  return result.rows[0]
}

export async function updatePipeline(
  id: string,
  input: UpdatePipelineInput
): Promise<Pipeline | null> {
  // Build query dynamically — only set fields that were actually provided
  const fields = Object.keys(input) as (keyof UpdatePipelineInput)[]
  if (fields.length === 0) {
    // Nothing to update, just return the current record
    return getPipelineById(id)
  }

  const setClauses = fields.map((field, index) => `${field} = $${index + 1}`)
  setClauses.push(`updated_at = NOW()`)

  const values: unknown[] = fields.map((field) => {
    const value = input[field]
    // JSONB columns need to be serialized
    if (field === 'action_config' || field === 'subscribers') {
      return JSON.stringify(value)
    }
    return value
  })

  // The id goes in as the last parameter
  values.push(id)

  const query = `
    UPDATE pipelines
    SET ${setClauses.join(', ')}
    WHERE id = $${values.length}
    RETURNING *
  `

  const result = await db.query(query, values) as QueryResult<Pipeline>
  return result.rows[0] ?? null
}

export async function deletePipeline(id: string): Promise<boolean> {
  const result = await db.query(
    'DELETE FROM pipelines WHERE id = $1',
    [id]
  )
  return (result.rowCount ?? 0) > 0
}
