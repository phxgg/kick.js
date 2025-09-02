import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const transports: winston.transport[] = [];

// Add console transport for non-production environments
const isProduction = process.env.NODE_ENV === 'production';
if (!isProduction) {
  transports.push(
    new winston.transports.Console({
      level: 'debug',
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(
          (info) => `${info.timestamp} [${info.level}]${info.label ? ' [' + info.label + ']' : ''} ${info.message}`,
        ),
      ),
    }),
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
    winston.format((info) => (info.label === 'HTTP' ? info : false))(), // Only log HTTP requests
  ),
});

// Rotating application logs
transports.push(
  //
  // - Write all logs with importance level of `error` or higher to `error.log`
  //   (i.e., error, fatal, but not other levels)
  //
  new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
  //
  // - Write all logs with importance level of `info` or higher to `combined.log`
  //   (i.e., fatal, error, warn, and info, but not trace)
  //
  new winston.transports.File({
    filename: 'logs/combined.log',
    format: winston.format.combine(
      winston.format((info) => (info.label !== 'HTTP' ? info : false))(), // Exclude HTTP logs
    ),
  }),
  accessLogTransport,
);

export const winstonInstance = winston.createLogger({
  level: isProduction ? 'info' : 'debug',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  defaultMeta: { service: 'kick-api' },
  transports: transports,
});

export default winstonInstance;
