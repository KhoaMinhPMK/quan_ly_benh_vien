import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, getMe } from './auth.controller';
import { authMiddleware } from '../../middleware/authMiddleware';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    error: { code: 'TOO_MANY_REQUESTS', message: 'Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút.' },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

// Public routes
router.post('/login', loginLimiter, login);

// Protected routes
router.get('/me', authMiddleware, getMe);

export default router;
