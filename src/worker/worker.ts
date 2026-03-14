import { logger } from '../lib/logger';
import { getPendingJob, updateJobStatus } from '../services/jobs.service';
import { getPipelineById } from '../services/pipelines.service';
import { processJob } from './processor';

const POLL_INTERVAL_MS = 5000;

async function poll(): Promise<void> {
  try {
    const job = await getPendingJob();

    if (!job) {
      setTimeout(poll, POLL_INTERVAL_MS);
      return;
    }

    const pipeline = await getPipelineById(job.pipeline_id);

    if (!pipeline) {
      await updateJobStatus(job.id, 'failed', null, 'Pipeline not found');
      logger.error(`Job ${job.id} failed - Pipeline not found`, {
        pipeline_id: job.pipeline_id,
        job_id: job.id,
      });
      setTimeout(poll, POLL_INTERVAL_MS);
      return;
    }

    await processJob(job, pipeline);

    // Poll immediately, we keep draining until the queue responds empty
    setTimeout(poll, 0);
  } catch (err) {
    logger.error('Worker loop error', {
      message: err instanceof Error ? err.message : String(err),
    });
    // Recover natively, avoiding crash loop
    setTimeout(poll, POLL_INTERVAL_MS);
  }
}

logger.info('Worker started, polling for jobs...');
poll();
