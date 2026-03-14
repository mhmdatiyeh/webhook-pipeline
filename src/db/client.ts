import 'dotenv/config'
import { Pool } from 'pg'
import { logger } from '../lib/logger'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set')
}

const pool = new Pool({ connectionString })

pool.on('connect', () => {
  logger.info('Connected to PostgreSQL')
})

pool.on('error', (err) => {
  logger.error('PostgreSQL pool error', { message: err.message })
})

export const db = {
  query: (text: string, params?: unknown[]) => {
    return pool.query(text, params)
  },
}
