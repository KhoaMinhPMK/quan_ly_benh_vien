import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import { dataScopeMiddleware } from '../../middleware/dataScope';
import * as ctrl from './dashboard.controller';

const router = Router();
router.use(authMiddleware);
router.use(dataScopeMiddleware);

router.get('/stats', ctrl.getStats);

export default router;
