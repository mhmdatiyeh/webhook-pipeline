export function enrich(
  payload: Record<string, unknown>,
  actionConfig: Record<string, unknown>,
  pipelineId: string
): Record<string, unknown> {
  const extra = actionConfig['extra'] as Record<string, unknown> | undefined

  const result: Record<string, unknown> = {
    ...payload,
    processed_at: new Date().toISOString(),
    pipeline_id: pipelineId,
  }

  if (extra && typeof extra === 'object') {
    Object.assign(result, extra)
  }

  return result
}
