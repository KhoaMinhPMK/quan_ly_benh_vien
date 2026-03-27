import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import { rbacMiddleware } from '../../middleware/rbac';
import * as ctrl from './rooms.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', ctrl.list);
router.get('/departments', ctrl.departments);
router.get('/:id', ctrl.getById);
router.post('/', rbacMiddleware(['admin']), ctrl.create);
router.put('/:id', rbacMiddleware(['admin']), ctrl.update);

export default router;
