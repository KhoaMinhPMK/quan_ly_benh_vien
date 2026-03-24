import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import * as ctrl from './dashboard.controller';

const router = Router();
router.use(authMiddleware);

router.get('/stats', ctrl.getStats);

export default router;
