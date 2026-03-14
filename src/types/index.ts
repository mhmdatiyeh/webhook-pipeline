export type ActionType = 'transform' | 'filter' | 'enrich'

export interface Pipeline {
  id: string
  name: string
  source_token: string
  action_type: ActionType
  action_config: Record<string, unknown>
  subscribers: string[]
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface CreatePipelineInput {
  name: string
  action_type: ActionType
  subscribers: string[]
  action_config?: Record<string, unknown>
}

export interface UpdatePipelineInput {
  name?: string
  action_type?: ActionType
  action_config?: Record<string, unknown>
  subscribers?: string[]
  is_active?: boolean
}

export type JobStatus = 'pending' | 'processing' | 'done' | 'failed' | 'skipped'

export interface Job {
  id: string
  pipeline_id: string
  status: JobStatus
  payload: Record<string, unknown>
  result: Record<string, unknown> | null
  error: string | null
  created_at: Date
  processed_at: Date | null
}
