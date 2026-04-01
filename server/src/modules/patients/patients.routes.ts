import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import { rbacMiddleware } from '../../middleware/rbac';
import { dataScopeMiddleware } from '../../middleware/dataScope';
import * as ctrl from './patients.controller';

const router = Router();
router.use(authMiddleware);
router.use(dataScopeMiddleware);

router.get('/', ctrl.list);
router.get('/discharge-list', ctrl.dischargeList);
router.get('/waiting-queue', ctrl.waitingQueue);
router.get('/:id', ctrl.getById);
router.post('/', rbacMiddleware(['admin', 'doctor', 'nurse']), ctrl.create);
router.put('/:id', rbacMiddleware(['admin', 'doctor', 'nurse']), ctrl.update);
router.post('/:id/discharge', rbacMiddleware(['admin', 'doctor']), ctrl.discharge);
router.get('/:id/checklists', ctrl.getChecklists);
router.post('/:id/checklists/toggle', ctrl.toggleChecklist);

export default router;
