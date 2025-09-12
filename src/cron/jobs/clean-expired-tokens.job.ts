import { CronJob } from 'cron';

import logger from '@/winston.logger';

import { TokenModel } from '@/models/Token';

const job = CronJob.from({
  cronTime: '0 0 * * *', // Every day at midnight
  // do not use arrow function here to preserve `this`
  onTick: async function () {
    logger.info('Running daily cleanup of expired tokens...', { service: 'cron' });
    TokenModel.deleteMany({ expiresAt: { $lt: new Date() } })
      .then((result) => {
        logger.info(`Deleted ${result.deletedCount} expired tokens.`, { service: 'cron' });
      })
      .catch((err) => {
        logger.error('Error during cleanup of expired tokens:', { service: 'cron' }, err);
      });
  },
  timeZone: 'Europe/Athens',
});

export default job;
