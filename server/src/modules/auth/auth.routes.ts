import { Router } from 'express';
import { login, getMe } from './auth.controller';
import { authMiddleware } from '../../middleware/authMiddleware';

const router = Router();

// Public routes
router.post('/login', login);

// Protected routes
router.get('/me', authMiddleware, getMe);

export default router;
