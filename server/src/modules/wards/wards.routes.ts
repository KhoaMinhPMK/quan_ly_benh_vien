import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import { rbacMiddleware } from '../../middleware/rbac';
import * as ctrl from './wards.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.post('/', rbacMiddleware(['admin']), ctrl.create);
router.put('/:id', rbacMiddleware(['admin']), ctrl.update);
router.delete('/:id', rbacMiddleware(['admin']), ctrl.remove);

export default router;
