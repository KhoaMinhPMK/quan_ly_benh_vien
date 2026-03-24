import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import * as ctrl from './beds.controller';

const router = Router();
router.use(authMiddleware);

router.get('/room/:roomId', ctrl.listByRoom);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.patch('/:id/status', ctrl.updateStatus);
router.post('/:id/assign', ctrl.assign);
router.post('/:id/release', ctrl.release);

export default router;
