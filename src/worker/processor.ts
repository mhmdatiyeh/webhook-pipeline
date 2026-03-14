import { logger } from '../lib/logger'
import { Job, Pipeline } from '../types'
import { runAction } from './actions'
import { updateJobStatus } from '../services/jobs.service'

export async function processJob(job: Job, pipeline: Pipeline): Promise<void> {
  try {
    const { status, result } = runAction(
      pipeline.action_type,
      job.payload,
      pipeline.action_config,
      pipeline.id
    )

    await updateJobStatus(job.id, status, result)

    logger.info(`Job ${job.id} processed`, {
      pipeline_id: pipeline.id,
      job_id: job.id,
      status,
    })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    await updateJobStatus(job.id, 'failed', null, errorMsg)
    
    logger.error(`Job ${job.id} failed`, {
      pipeline_id: pipeline.id,
      job_id: job.id,
      error: errorMsg,
    })
  }
}
