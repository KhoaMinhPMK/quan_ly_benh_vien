import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import * as ctrl from './reports.controller';

const router = Router();
router.use(authMiddleware);

router.get('/occupancy', ctrl.occupancy);
router.get('/discharge', ctrl.discharge);
router.get('/discharge-history', ctrl.dischargeHistory);
router.get('/missing-records', ctrl.missingRecords);
router.get('/department', ctrl.department);
router.get('/doctor', ctrl.doctorReport);
router.get('/trends', ctrl.trends);
router.get('/export/:type', ctrl.exportCSV);
router.post('/snapshot', ctrl.snapshotDaily);

export default router;
