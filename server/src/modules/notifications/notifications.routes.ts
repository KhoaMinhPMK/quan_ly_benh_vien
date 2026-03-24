import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import * as ctrl from './notifications.controller';

const router = Router();
router.use(authMiddleware);

router.get('/', ctrl.list);
router.get('/unread-count', ctrl.unreadCount);
router.post('/:id/read', ctrl.markRead);
router.post('/read-all', ctrl.markAllRead);

export default router;
