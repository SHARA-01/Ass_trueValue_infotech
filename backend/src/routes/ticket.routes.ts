import { Router } from 'express';
import { ticketController } from '../controllers/ticket.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createTicketSchema, updateTicketSchema } from '../schemas/ticket.schema';

const router = Router();

router.use(authenticate);

router.post('/', validate(createTicketSchema), ticketController.create);
router.get('/', ticketController.getOwn);
router.get('/:id', ticketController.getById);
router.get('/:id/activity', ticketController.getActivity);
router.patch('/:id', validate(updateTicketSchema), ticketController.update);
router.delete('/:id', ticketController.remove);

export default router;
