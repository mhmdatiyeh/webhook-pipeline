import { Router } from 'express';
import { ingest } from '../controllers/webhooks.controller';

const router = Router();

router.post('/:sourceToken', ingest);

export default router;
