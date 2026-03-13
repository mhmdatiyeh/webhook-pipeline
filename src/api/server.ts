import express from 'express'
import { errorHandler } from './middleware/errorHandler'
import { logger } from '../lib/logger'

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

// health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// error handler — دايماً آخر شي
app.use(errorHandler)

app.listen(PORT, () => {
  logger.info(`API server running on port ${PORT}`)
})

export default app