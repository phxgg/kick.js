import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { z, ZodError } from 'zod';

// `req.query` is read-only in express.js 5, so we need to use Object.defineProperty to update it
function patchQuery(req: Request, validated: any) {
  Object.defineProperty(req, 'query', {
    ...Object.getOwnPropertyDescriptor(req, 'query'),
    value: validated,
    writable: false,
  });
}

/**
 * Validate request query parameters against a Zod schema.
 * @param schema Zod schema to validate against
 * @returns Express middleware function
 */
export function validateQuery(schema: z.ZodObject<any, any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.query);
      patchQuery(req, validated);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((issue) => ({
          key: issue.path.join('.'),
          message: issue.message,
        }));
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'invalid_query', details: errorMessages });
      } else {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'internal_server_error' });
      }
    }
  };
}
