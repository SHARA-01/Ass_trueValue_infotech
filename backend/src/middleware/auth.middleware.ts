import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/errors';
import { UserRole } from '../types';

interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication required', 401));
  }

  const token = authHeader.split(' ')[1];
  try {
    const secret = process.env.JWT_SECRET || 'dev_secret';
    const payload = jwt.verify(token, secret) as JwtPayload;
    req.user = { id: payload.id, email: payload.email, role: payload.role };
    next();
  } catch {
    next(new AppError('Invalid or expired token', 401));
  }
}
