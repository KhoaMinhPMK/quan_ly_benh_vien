import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, getMe } from './auth.controller';
import { authMiddleware } from '../../middleware/authMiddleware';
import * as sessionService from './session.service';

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

// Session management (#76)
router.get('/sessions', authMiddleware, async (req, res, next) => {
  try {
    const sessions = await sessionService.getUserSessions(req.user!.id);
    res.json({ success: true, data: sessions });
  } catch (e) { next(e); }
});

router.delete('/sessions/:id', authMiddleware, async (req, res, next) => {
  try {
    await sessionService.revokeSession(Number(req.params.id), req.user!.id);
    res.json({ success: true, message: 'Đã thu hồi phiên' });
  } catch (e) { next(e); }
});

router.post('/sessions/revoke-all', authMiddleware, async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    await sessionService.revokeAllSessions(req.user!.id, token);
    res.json({ success: true, message: 'Đã thu hồi tất cả phiên khác' });
  } catch (e) { next(e); }
});

export default router;
