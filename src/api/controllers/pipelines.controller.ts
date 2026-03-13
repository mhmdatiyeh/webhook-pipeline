import { Request, Response, NextFunction } from 'express'
import { logger } from '../../lib/logger'
import {
  getAllPipelines,
  getPipelineById,
  createPipeline,
  updatePipeline,
  deletePipeline,
} from '../../services/pipelines.service'
import { CreatePipelineInput, UpdatePipelineInput } from '../../types'

export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const pipelines = await getAllPipelines()
    res.json(pipelines)
  } catch (err) {
    next(err)
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params['id'] as string
    const pipeline = await getPipelineById(id)
    if (!pipeline) {
      res.status(404).json({ error: 'Pipeline not found' })
      return
    }
    res.json(pipeline)
  } catch (err) {
    next(err)
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, action_type, subscribers, action_config } = req.body as CreatePipelineInput

    if (!name || !action_type || !subscribers) {
      res.status(400).json({ error: 'Missing required fields: name, action_type, subscribers' })
      return
    }

    if (!['transform', 'filter', 'enrich'].includes(action_type)) {
      res.status(400).json({ error: 'action_type must be one of: transform, filter, enrich' })
      return
    }

    if (!Array.isArray(subscribers)) {
      res.status(400).json({ error: 'subscribers must be an array' })
      return
    }

    const pipeline = await createPipeline({ name, action_type, subscribers, action_config })
    logger.info('Pipeline created', { id: pipeline.id, name: pipeline.name })
    res.status(201).json(pipeline)
  } catch (err) {
    next(err)
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params['id'] as string
    const input = req.body as UpdatePipelineInput

    if (
      input.action_type !== undefined &&
      !['transform', 'filter', 'enrich'].includes(input.action_type)
    ) {
      res.status(400).json({ error: 'action_type must be one of: transform, filter, enrich' })
      return
    }

    const pipeline = await updatePipeline(id, input)
    if (!pipeline) {
      res.status(404).json({ error: 'Pipeline not found' })
      return
    }
    logger.info('Pipeline updated', { id: pipeline.id })
    res.json(pipeline)
  } catch (err) {
    next(err)
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params['id'] as string
    const deleted = await deletePipeline(id)
    if (!deleted) {
      res.status(404).json({ error: 'Pipeline not found' })
      return
    }
    logger.info('Pipeline deleted', { id })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}
