import { Request, Response, NextFunction } from 'express';
import { logger } from '../../lib/logger';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error('Unhandled error', {
    message: err.message,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
}
