import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import * as ctrl from './rooms.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', ctrl.list);
router.get('/departments', ctrl.departments);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);

export default router;
