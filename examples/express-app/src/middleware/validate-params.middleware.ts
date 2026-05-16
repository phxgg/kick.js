import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import z, { ZodError } from 'zod';

/**
 * Validate request URL parameters against a Zod schema.
 * @param schema Zod schema to validate against
 * @returns Express middleware function
 */
export function validateParams(schema: z.ZodObject<any, any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.params);
      req.params = validated as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((issue) => ({
          key: issue.path.join('.'),
          message: issue.message,
        }));
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'invalid_params', details: errorMessages });
      } else {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'internal_server_error' });
      }
    }
  };
}
