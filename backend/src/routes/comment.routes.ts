import { Router } from 'express';
import { commentController } from '../controllers/comment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createCommentSchema } from '../schemas/comment.schema';

// Merged router — parent must use mergeParams: true or pass /:id explicitly
const router = Router({ mergeParams: true });

router.use(authenticate);

router.post('/', validate(createCommentSchema), commentController.add);
router.get('/', commentController.getAll);

export default router;
