import { Request, Response, NextFunction } from 'express';
import { ticketService } from '../services/ticket.service';
import { parseTicketFilters } from '../utils/parseFilters';

export const adminController = {
  async getAllTickets(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = parseTicketFilters(req.query);
      const result = await ticketService.getAllTickets(filters);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async changeStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ticket = await ticketService.changeStatus(req.params.id, req.body.status, req.user!.id);
      res.status(200).json({ success: true, data: ticket });
    } catch (err) {
      next(err);
    }
  },

  async changePriority(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ticket = await ticketService.changePriority(req.params.id, req.body.priority, req.user!.id);
      res.status(200).json({ success: true, data: ticket });
    } catch (err) {
      next(err);
    }
  },

  async getStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await ticketService.getStats();
      res.status(200).json({ success: true, data: stats });
    } catch (err) {
      next(err);
    }
  },
};
