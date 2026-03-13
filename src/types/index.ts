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
