import type { Request, Response, NextFunction } from 'express';
import { z, type ZodType } from 'zod';
import { AppError } from '../utils/AppError.js';

export function validateBody(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      next(
        new AppError(
          'VALIDATION_ERROR',
          400,
          'Invalid request body',
          z.treeifyError(result.error),
        ),
      );
      return;
    }

    req.body = result.data;
    next();
  };
}