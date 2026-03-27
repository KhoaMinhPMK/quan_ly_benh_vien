import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import { rbacMiddleware } from '../../middleware/rbac';
import * as ctrl from './beds.controller';

const router = Router();
router.use(authMiddleware);

router.get('/available', ctrl.listAvailable);
router.get('/room/:roomId', ctrl.listByRoom);
router.get('/:id', ctrl.getById);
router.get('/:id/history', ctrl.getHistory);
router.post('/', rbacMiddleware(['admin']), ctrl.create);
router.patch('/:id/status', rbacMiddleware(['admin', 'doctor']), ctrl.updateStatus);
router.post('/:id/assign', ctrl.assign);
router.post('/:id/release', rbacMiddleware(['admin', 'doctor']), ctrl.release);
router.post('/:id/transfer', ctrl.transfer);

export default router;
