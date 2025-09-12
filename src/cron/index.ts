import fs from 'fs';
import path from 'path';

export function initCronJobs() {
  // import and initialize all cron jobs from the jobs directory
  const jobsDir = path.join(__dirname, 'jobs');
  // Dynamically import all '*.job.js' files in the jobs directory
  fs.readdirSync(jobsDir).forEach(async (file) => {
    if (file.endsWith('.job.js') || file.endsWith('.job.ts')) {
      const module = await import(path.join(jobsDir, file));
      // for each imported module, if it has a default export and that export has a 'start' method, call it
      if (module.default && typeof module.default.start === 'function') {
        module.default.start();
      }
    }
  });
}
