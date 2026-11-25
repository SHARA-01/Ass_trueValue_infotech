import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';

import eventBus from './events/eventBus';
import { registerActivityLogHandler } from './events/handlers/activityLog.handler';

// Register activity log handler immediately after importing eventBus
registerActivityLogHandler();

import authRoutes from './routes/auth.routes';
import ticketRoutes from './routes/ticket.routes';
import adminRoutes from './routes/admin.routes';
import commentRoutes from './routes/comment.routes';
import { AppError } from './utils/errors';

const app = express();

// CORS (strip trailing slashes and support comma-separated origins)
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim().replace(/\/+$/, ''))
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
    credentials: true,
  })
);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/tickets/:id/comments', commentRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(new AppError('Route not found', 404));
});

// Global error handler
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Handle invalid MongoDB ObjectId (CastError)
  if (err && typeof err === 'object' && 'name' in err && (err as { name: string }).name === 'CastError') {
    res.status(400).json({
      success: false,
      message: 'Invalid resource ID',
    });
    return;
  }

  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

// Suppress unused import warning for eventBus
void eventBus;

export default app;
