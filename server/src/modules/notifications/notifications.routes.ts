import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import * as ctrl from './notifications.controller';

const router = Router();
router.use(authMiddleware);

router.get('/', ctrl.list);
router.get('/unread-count', ctrl.unreadCount);
router.get('/vapid-public-key', ctrl.getVapidPublicKey);
router.post('/:id/read', ctrl.markRead);
router.post('/read-all', ctrl.markAllRead);
router.post('/subscribe', ctrl.subscribe);
router.post('/unsubscribe', ctrl.unsubscribe);

export default router;
