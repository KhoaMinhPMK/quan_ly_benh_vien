import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import * as ctrl from './patients.controller';

const router = Router();
router.use(authMiddleware);

router.get('/', ctrl.list);
router.get('/discharge-list', ctrl.dischargeList);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.post('/:id/discharge', ctrl.discharge);
router.get('/:id/checklists', ctrl.getChecklists);
router.post('/:id/checklists/toggle', ctrl.toggleChecklist);

export default router;
