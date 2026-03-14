import express from 'express'
import { errorHandler } from './middleware/errorHandler'
import { logger } from '../lib/logger'
import { db } from '../db/client'
import pipelinesRouter from './routes/pipelines.routes'
import webhooksRouter from './routes/webhooks.routes'

// Verify DB connection at startup
void db
  .query('SELECT 1')
  .then(() => logger.info('Database connection verified'))
  .catch((err: Error) =>
    logger.error('Database connection failed', { message: err.message })
  )

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

// health check -- endpoint to check if the server is running :
app.get('/health', async (req, res, next) => {
  try {
    await db.query('SELECT 1')
    res.json({ status: 'ok', database: 'connected' })
  } catch (err) {
    next(err)
  }
})

// Pipelines CRUD API
app.use('/pipelines', pipelinesRouter)

// Webhook ingestion
app.use('/webhooks', webhooksRouter)

// error handler — دايما آخر شي
app.use(errorHandler)

// start the server running:
app.listen(PORT, () => {
  logger.info(`API server running on port ${PORT}`)
})

export default app
