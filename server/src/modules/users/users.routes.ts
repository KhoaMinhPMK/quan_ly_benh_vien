import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import { rbacMiddleware } from '../../middleware/rbac';
import * as ctrl from './users.controller';

const router = Router();
router.use(authMiddleware);

// Change own password (any authenticated user)
router.post('/change-password', ctrl.changePw);

// Admin-only routes
router.get('/', rbacMiddleware(['admin']), ctrl.list);
router.get('/:id', rbacMiddleware(['admin']), ctrl.getById);
router.post('/', rbacMiddleware(['admin']), ctrl.create);
router.put('/:id', rbacMiddleware(['admin']), ctrl.update);
router.delete('/:id', rbacMiddleware(['admin']), ctrl.remove);
router.post('/:id/reset-password', rbacMiddleware(['admin']), ctrl.resetPw);

export default router;
