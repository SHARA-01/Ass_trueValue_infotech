import { Request, Response, NextFunction } from 'express';
import { commentService } from '../services/comment.service';

export const commentController = {
  async add(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const comment = await commentService.addComment(
        req.params.id,
        req.body.body,
        req.user!.id,
        req.user!.role
      );
      res.status(201).json({ success: true, data: comment });
    } catch (err) {
      next(err);
    }
  },

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const comments = await commentService.getComments(
        req.params.id,
        req.user!.id,
        req.user!.role
      );
      res.status(200).json({ success: true, data: comments });
    } catch (err) {
      next(err);
    }
  },
};
