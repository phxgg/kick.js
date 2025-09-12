import { inspect } from 'util';
import DailyRotateFile from 'winston-daily-rotate-file';

import winston from 'winston';

const _BLUE = '\x1b[34m';
const _CYAN = '\x1b[36m';
const _RESET = '\x1b[0m';

const transports: winston.transport[] = [];

// Add console transport for non-production environments
const isProduction = process.env.NODE_ENV === 'production';
if (!isProduction) {
  const consoleFormat = winston.format.printf((info) => {
    const { timestamp, level, label, service } = info;
    let msg: string;

    // Smart stringify like console.log
    if (info instanceof Error) {
      msg = info.stack || info.message;
    } else if (typeof info.message === 'string') {
      msg = info.message;
    } else {
      msg = inspect(info.message, { colors: true, depth: null, compact: false });
    }

    // Gather extra metadata (excluding standard fields)
    const meta = (info as any).metadata;
    let metaStr = '';
    if (meta && Object.keys(meta).length) {
      metaStr = ' ' + inspect(meta, { colors: true, depth: null, compact: false });
    }
    // Colorize service name in cyan
    const serviceStr = service ? ` [${_CYAN}${service}${_RESET}]` : '';
    return `${timestamp} [${level}]${label ? ' [' + label + ']' : ''}${serviceStr} ${msg}${metaStr}`;
  });

  transports.push(
    new winston.transports.Console({
      level: 'debug',
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        // Collect arbitrary extra props into info.metadata
        winston.format.metadata({ fillExcept: ['timestamp', 'level', 'message', 'label', 'service'] }),
        consoleFormat
      ),
    })
  );
}

// Rotating access logs
const accessLogTransport: DailyRotateFile = new DailyRotateFile({
  dirname: 'logs',
  filename: 'access-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true, // Compress rotated files
  maxSize: '20m', // Maximum size of each log file
  maxFiles: '14d', // Keep files for the last 14 days
  format: winston.format.combine(
    winston.format((info) => (info.label === 'HTTP' ? info : false))() // Only log HTTP requests
  ),
});

// Rotating application logs
transports.push(
  //
  // - Write all logs with importance level of `error` or higher to `error.log`
  //   (i.e., error, fatal, but not other levels)
  //
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: winston.format.errors({ stack: true }),
  }),
  //
  // - Write all logs with importance level of `info` or higher to `combined.log`
  //   (i.e., fatal, error, warn, and info, but not trace)
  //
  new winston.transports.File({
    filename: 'logs/combined.log',
    format: winston.format.combine(
      winston.format((info) => (info.label !== 'HTTP' ? info : false))() // Exclude HTTP logs
    ),
  }),
  accessLogTransport
);

export const winstonInstance = winston.createLogger({
  level: isProduction ? 'info' : 'debug',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: transports,
});

/**
 * Returns a child logger with a specific service or label.
 * @param service The name of the service or label for the logger.
 */
export function createLogger(service: string) {
  return winstonInstance.child({ service: service });
}

export default winstonInstance;
