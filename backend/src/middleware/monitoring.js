import winston from 'winston';
import { performance } from 'perf_hooks';

// Create a custom format for monitoring logs
const monitoringFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

// Create a separate logger for monitoring
const monitoringLogger = winston.createLogger({
  level: 'info',
  format: monitoringFormat,
  transports: [
    new winston.transports.File({ filename: 'logs/monitoring.log' }),
    new winston.transports.File({ filename: 'logs/errors.log', level: 'error' })
  ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  monitoringLogger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Performance monitoring middleware
export const performanceMonitor = (req, res, next) => {
  const start = performance.now();
  const requestId = Math.random().toString(36).substring(7);

  // Log request start
  monitoringLogger.info({
    type: 'request_start',
    requestId,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  // Capture response
  const originalSend = res.send;
  res.send = function (body) {
    const duration = performance.now() - start;

    // Log request completion
    monitoringLogger.info({
      type: 'request_end',
      requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration.toFixed(2)}ms`
    });

    // Log slow requests
    if (duration > 1000) {
      monitoringLogger.warn({
        type: 'slow_request',
        requestId,
        method: req.method,
        url: req.url,
        duration: `${duration.toFixed(2)}ms`
      });
    }

    return originalSend.call(this, body);
  };

  next();
};

// Error monitoring middleware
export const errorMonitor = (err, req, res, next) => {
  const requestId = Math.random().toString(36).substring(7);

  monitoringLogger.error({
    type: 'error',
    requestId,
    method: req.method,
    url: req.url,
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name
    },
    user: req.user ? req.user._id : null
  });

  next(err);
};

// Database monitoring
export const monitorDatabase = (mongoose) => {
  mongoose.connection.on('connected', () => {
    monitoringLogger.info({
      type: 'database',
      event: 'connected'
    });
  });

  mongoose.connection.on('error', (err) => {
    monitoringLogger.error({
      type: 'database',
      event: 'error',
      error: err.message
    });
  });

  mongoose.connection.on('disconnected', () => {
    monitoringLogger.warn({
      type: 'database',
      event: 'disconnected'
    });
  });
};

// Memory monitoring
export const monitorMemory = () => {
  setInterval(() => {
    const memoryUsage = process.memoryUsage();
    monitoringLogger.info({
      type: 'memory',
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`
    });
  }, 300000); // Log every 5 minutes
};

// Export monitoring logger for direct use
export { monitoringLogger }; 