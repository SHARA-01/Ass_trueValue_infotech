import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'admin') {
    return next(new AppError('Admin access required', 403));
  }
  next();
}
