import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { z, ZodError } from 'zod';

export function validateBody(schema: z.ZodObject<any, any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((issue) => ({
          key: issue.path.join('.'),
          message: issue.message,
        }));
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'invalid_body', details: errorMessages });
      } else {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'internal_server_error' });
      }
    }
  };
}
