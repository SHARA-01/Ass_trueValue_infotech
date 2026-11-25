import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { updateStatusSchema, updatePrioritySchema } from '../schemas/ticket.schema';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/tickets', adminController.getAllTickets);
router.patch('/tickets/:id/status', validate(updateStatusSchema), adminController.changeStatus);
router.patch('/tickets/:id/priority', validate(updatePrioritySchema), adminController.changePriority);
router.get('/stats', adminController.getStats);

export default router;
