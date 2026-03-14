type LogLevel = 'info' | 'warn' | 'error'

function log(level: LogLevel, message: string, data?: unknown): void {
  const timestamp = new Date().toISOString()
  const base = `[${timestamp}] [${level.toUpperCase()}] ${message}`

  if (data) {
    console[level](base, JSON.stringify(data, null, 2))
  } else {
    console[level](base)
  }
}

export const logger = {
  info: (msg: string, data?: unknown) => log('info', msg, data),
  warn: (msg: string, data?: unknown) => log('warn', msg, data),
  error: (msg: string, data?: unknown) => log('error', msg, data),
}
