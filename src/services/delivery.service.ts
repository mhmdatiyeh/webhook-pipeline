import { db } from '../db/client';
import { logger } from '../lib/logger';

// Helper to pause execution
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function recordAttempt(
  jobId: string,
  subscriberUrl: string,
  statusCode: number | null,
  success: boolean,
  attemptNumber: number,
  errorMessage: string | null
): Promise<void> {
  await db.query(
    `INSERT INTO delivery_attempts 
     (job_id, subscriber_url, status_code, success, attempt_number, error_message)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [jobId, subscriberUrl, statusCode, success, attemptNumber, errorMessage]
  );
}

export async function deliverToSubscriber(
  jobId: string,
  subscriberUrl: string,
  result: Record<string, unknown>,
  attemptNumber: number
): Promise<boolean> {
  let statusCode: number | null = null;
  let success = false;
  let errorMessage: string | null = null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(subscriberUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(result),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    statusCode = response.status;
    success = response.ok;

    if (!success) {
      errorMessage = `HTTP Error: ${statusCode}`;
    }
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : String(err);
  }

  // Record attempt in database
  try {
    await recordAttempt(
      jobId,
      subscriberUrl,
      statusCode,
      success,
      attemptNumber,
      errorMessage
    );
    logger.info(`Delivery attempt recorded`, {
      job_id: jobId,
      subscriber_url: subscriberUrl,
      attempt: attemptNumber,
      success,
    });
  } catch (dbErr) {
    logger.error('Failed to record delivery attempt', {
      job_id: jobId,
      error: dbErr instanceof Error ? dbErr.message : String(dbErr),
    });
  }

  return success;
}

export async function deliverToAll(
  jobId: string,
  subscribers: string[],
  result: Record<string, unknown>
): Promise<void> {
  for (const subscriberUrl of subscribers) {
    let success = false;

    // Attempt 1
    success = await deliverToSubscriber(jobId, subscriberUrl, result, 1);
    if (success) continue;

    // Attempt 2 (10s backoff)
    await delay(10000);
    success = await deliverToSubscriber(jobId, subscriberUrl, result, 2);
    if (success) continue;

    // Attempt 3 (30s backoff)
    await delay(30000);
    success = await deliverToSubscriber(jobId, subscriberUrl, result, 3);

    if (!success) {
      logger.warn(`All 3 delivery attempts failed for subscriber`, {
        job_id: jobId,
        subscriber_url: subscriberUrl,
      });
    }
  }
}
