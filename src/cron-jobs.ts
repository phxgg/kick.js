import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

export async function initCronJobs() {
  // import and initialize all cron jobs from the jobs directory
  const jobsDir = path.join(__dirname, 'jobs');
  // Dynamically import all '*.job.js' files in the jobs directory
  const files = fs.readdirSync(jobsDir);

  for (const file of files) {
    if (file.endsWith('.job.js') || file.endsWith('.job.ts')) {
      const filePath = path.join(jobsDir, file);
      const module = await import(pathToFileURL(filePath).href);
      // for each imported module, if it has a default export and that export has a 'start' method, call it
      if (module.default && typeof module.default.start === 'function') {
        module.default.start();
      }
    }
  }
}
