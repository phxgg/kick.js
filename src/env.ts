import dotenv from 'dotenv';
dotenv.config();

import { envValidator } from './validators/env.validator';

// validate env file
const validate = envValidator.safeParse(process.env);
if (!validate.success) {
  console.error(validate.error.issues);
  throw new Error('Invalid .env file configuration');
}
