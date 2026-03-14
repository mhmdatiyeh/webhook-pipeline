import { Request, Response, NextFunction } from 'express'
import { logger } from '../../lib/logger'
import { getPipelineBySourceToken } from '../../services/pipelines.service'
import { createJob } from '../../services/jobs.service'

export async function ingest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sourceToken = req.params['sourceToken'] as string

    const pipeline = await getPipelineBySourceToken(sourceToken)
    if (!pipeline) {
      res.status(404).json({ error: 'Pipeline not found' })
      return
    }

    if (!pipeline.is_active) {
      res.status(400).json({ error: 'Pipeline is not active' })
      return
    }

    const job = await createJob(pipeline.id, req.body as Record<string, unknown>)

    logger.info('Webhook received, job queued', {
      pipeline_id: pipeline.id,
      job_id: job.id,
    })

    res.status(200).json({ job_id: job.id, status: 'queued' })
  } catch (err) {
    next(err)
  }
}
