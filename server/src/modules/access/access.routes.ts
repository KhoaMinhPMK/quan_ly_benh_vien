import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import { rbacMiddleware } from '../../middleware/rbac';
import * as ctrl from './access.controller';

const router = Router();
router.use(authMiddleware);

// ── Catalog (any authenticated user can view module list) ──
router.get('/catalog', ctrl.catalog);

// ── My effective access ──
router.get('/me', ctrl.getMyAccess);

// ── Admin-only routes ──
router.get('/subjects/:type/:id/modules', rbacMiddleware(['admin']), ctrl.getModules);
router.put('/subjects/:type/:id/modules', rbacMiddleware(['admin']), ctrl.setModule);
router.get('/subjects/:type/:id/capabilities', rbacMiddleware(['admin']), ctrl.getPolicies);
router.put('/subjects/:type/:id/capabilities', rbacMiddleware(['admin']), ctrl.setPolicies);

// ── Groups ──
router.get('/groups', rbacMiddleware(['admin']), ctrl.listGroups);
router.post('/groups', rbacMiddleware(['admin']), ctrl.createGroup);
router.put('/groups/:id', rbacMiddleware(['admin']), ctrl.updateGroup);
router.get('/groups/:id/members', rbacMiddleware(['admin']), ctrl.getGroupMembers);
router.post('/groups/:id/members', rbacMiddleware(['admin']), ctrl.addGroupMember);
router.delete('/groups/:id/members/:userId', rbacMiddleware(['admin']), ctrl.removeGroupMember);

// ── Preview ──
router.get('/preview/:userId', rbacMiddleware(['admin']), ctrl.previewUserAccess);

// ── Audit ──
router.get('/audit', rbacMiddleware(['admin']), ctrl.getAuditLogs);

export default router;
