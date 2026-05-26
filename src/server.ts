import './setup';
import { createServer } from 'http';
import app from './app';
import { env } from './config/env';
import pool from './config/database';
import { logger } from './config/logger';

const server = createServer(app);
const port = env.PORT;

// ============================================
// GLOBAL ERROR HANDLERS (Critical for stability)
// ============================================

// Handle uncaught exceptions (synchronous errors)
process.on('uncaughtException', (error: Error) => {
  logger.error({
    error: error.message,
    stack: error.stack,
    type: 'uncaughtException'
  }, '💥 Uncaught Exception - Server will exit');
  
  // Log and attempt graceful shutdown
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections (async errors)
process.on('unhandledRejection', (reason: unknown, promise: Promise<any>) => {
  logger.error({
    error: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined,
    promise: String(promise),
    type: 'unhandledRejection'
  }, '💥 Unhandled Promise Rejection');
  
  // Don't exit on unhandled rejection, but log it
  // This prevents silent crashes
});

// Handle warnings
process.on('warning', (warning: Error) => {
  logger.warn({
    warning: warning.message,
    stack: warning.stack,
    name: warning.name
  }, '⚠️ Process Warning');
});

// ============================================
// SERVER ERROR HANDLERS
// ============================================

server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  switch (error.code) {
    case 'EACCES':
      logger.error({ port }, '❌ Port requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.error({ port }, '❌ Port is already in use');
      process.exit(1);
      break;
    default:
      logger.error({ error: error.message, code: error.code }, '❌ Server error');
      throw error;
  }
});

// ============================================
// GRACEFUL SHUTDOWN HANDLER
// ============================================

let isShuttingDown = false;

async function gracefulShutdown(signal: string) {
  if (isShuttingDown) {
    logger.warn('Shutdown already in progress');
    return;
  }

  isShuttingDown = true;
  logger.info({ signal }, '🛑 Graceful shutdown initiated');

  // Stop accepting new connections
  server.close(async () => {
    logger.info('✅ HTTP server closed');

    // Close database pool
    try {
      await pool.end();
      logger.info('✅ Database pool closed');
    } catch (error) {
      logger.error({ error }, '❌ Error closing database pool');
    }

    // Exit process
    process.exit(signal === 'uncaughtException' ? 1 : 0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('⚠️ Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

// Handle termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ============================================
// DATABASE CONNECTION MONITORING
// ============================================

// Monitor database pool health
setInterval(async () => {
  try {
    const [rows] = await pool.query('SELECT 1 as health_check');
    logger.debug('✅ Database health check passed');
  } catch (error) {
    logger.error({ error }, '❌ Database health check failed');
    // Don't exit, but log the issue
  }
}, 60000); // Check every minute

// ============================================
// MEMORY MONITORING
// ============================================

if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    const usage = process.memoryUsage();
    const formatMB = (bytes: number) => Math.round(bytes / 1024 / 1024 * 100) / 100;
    
    logger.debug({
      memory: {
        rss: `${formatMB(usage.rss)} MB`,
        heapTotal: `${formatMB(usage.heapTotal)} MB`,
        heapUsed: `${formatMB(usage.heapUsed)} MB`,
        external: `${formatMB(usage.external)} MB`
      }
    }, '📊 Memory usage');
  }, 300000); // Every 5 minutes
}

// ============================================
// SERVER STARTUP
// ============================================

// Test database connection on startup
async function testDatabaseConnection() {
  try {
    const [rows] = await pool.query('SELECT 1 as test');
    logger.info('✅ Database connected successfully');
    logger.debug({ result: rows }, 'Database test query result');
    return true;
  } catch (error) {
    logger.error({ error }, '❌ Database connection failed');
    return false;
  }
}

server.listen(port, async () => {
  logger.info({ port }, `🚀 Server running on port ${port}`);
  logger.info('📡 AFRISTREAM API started');
  
  // Test database connection
  logger.info('🔄 Testing database connection...');
  const dbConnected = await testDatabaseConnection();
  
  if (!dbConnected) {
    logger.error('❌ Database connection failed - server will continue but may have issues');
    // Don't exit - allow server to start and retry connections
  }
  
  logger.info('✅ Server startup completed successfully');
});

// Export server for testing
export { server };
