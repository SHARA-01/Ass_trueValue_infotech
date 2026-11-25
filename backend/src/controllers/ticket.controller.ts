import { Request, Response, NextFunction } from 'express';
import { ticketService } from '../services/ticket.service';
import { parseTicketFilters } from '../utils/parseFilters';

export const ticketController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ticket = await ticketService.createTicket(req.body, req.user!.id);
      res.status(201).json({ success: true, data: ticket });
    } catch (err) {
      next(err);
    }
  },

  async getOwn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = parseTicketFilters(req.query);
      const result = await ticketService.getOwnTickets(req.user!.id, filters);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ticket = await ticketService.getTicketById(req.params.id, req.user!.id, req.user!.role);
      res.status(200).json({ success: true, data: ticket });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ticket = await ticketService.updateTicket(req.params.id, req.body, req.user!.id);
      res.status(200).json({ success: true, data: ticket });
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await ticketService.deleteTicket(req.params.id, req.user!.id);
      res.status(200).json({ success: true, message: 'Ticket deleted' });
    } catch (err) {
      next(err);
    }
  },

  async getActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const logs = await ticketService.getTicketActivity(req.params.id, req.user!.id, req.user!.role);
      res.status(200).json({ success: true, data: logs });
    } catch (err) {
      next(err);
    }
  },
};
