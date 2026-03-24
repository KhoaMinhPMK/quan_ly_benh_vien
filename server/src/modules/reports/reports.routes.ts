import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import * as ctrl from './reports.controller';

const router = Router();
router.use(authMiddleware);

router.get('/occupancy', ctrl.occupancy);
router.get('/discharge', ctrl.discharge);
router.get('/missing-records', ctrl.missingRecords);
router.get('/department', ctrl.department);

export default router;
