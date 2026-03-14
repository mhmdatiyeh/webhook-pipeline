import { Request, Response, NextFunction } from 'express';
import {
  getAllJobs,
  getJobById,
  getDeliveryAttemptsForJob,
} from '../../services/jobs.service';

export async function getAll(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const jobs = await getAllJobs();
    res.json(jobs);
  } catch (err) {
    next(err);
  }
}

export async function getOne(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params['id'] as string;
    const job = await getJobById(id);
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }
    res.json(job);
  } catch (err) {
    next(err);
  }
}

export async function getDeliveries(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params['id'] as string;

    // Check if job exists first
    const job = await getJobById(id);
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    const deliveries = await getDeliveryAttemptsForJob(id);
    res.json(deliveries);
  } catch (err) {
    next(err);
  }
}
