import { logger } from '../lib/logger'
import { Job, Pipeline } from '../types'
import { runAction } from './actions'
import { updateJobStatus } from '../services/jobs.service'
import { deliverToAll } from '../services/delivery.service'

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

    if (status === 'done' && pipeline.subscribers && pipeline.subscribers.length > 0) {
      try {
        await deliverToAll(job.id, pipeline.subscribers, result)
      } catch (deliveryErr) {
        logger.error(`Critical error during delivery loop for job ${job.id}`, {
          error: deliveryErr instanceof Error ? deliveryErr.message : String(deliveryErr)
        })
        // Do NOT change job status on delivery failure
      }
    }
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
