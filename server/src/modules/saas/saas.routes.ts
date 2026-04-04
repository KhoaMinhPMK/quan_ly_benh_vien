import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import { rbacMiddleware } from '../../middleware/rbac';
import * as saasService from './saas.service';

const router = Router();
router.use(authMiddleware);
router.use(rbacMiddleware(['admin']));

// ── Service Plans ──
router.get('/plans', async (_req, res, next) => {
  try { res.json({ success: true, data: await saasService.getPlans() }); } catch (e) { next(e); }
});

router.post('/plans', async (req, res, next) => {
  try {
    const plan = await saasService.createPlan(req.body);
    res.status(201).json({ success: true, data: plan });
  } catch (e) { next(e); }
});

router.put('/plans/:id', async (req, res, next) => {
  try {
    const plan = await saasService.updatePlan(Number(req.params.id), req.body);
    res.json({ success: true, data: plan });
  } catch (e) { next(e); }
});

// ── Tenants ──
router.get('/tenants', async (_req, res, next) => {
  try { res.json({ success: true, data: await saasService.getTenants() }); } catch (e) { next(e); }
});

router.get('/tenants/:id', async (req, res, next) => {
  try { res.json({ success: true, data: await saasService.getTenantById(Number(req.params.id)) }); } catch (e) { next(e); }
});

router.put('/tenants/:id', async (req, res, next) => {
  try {
    const tenant = await saasService.updateTenant(Number(req.params.id), req.body);
    res.json({ success: true, data: tenant });
  } catch (e) { next(e); }
});

router.get('/tenants/:id/limits', async (req, res, next) => {
  try {
    const limits = await saasService.checkResourceLimits(Number(req.params.id));
    res.json({ success: true, data: limits });
  } catch (e) { next(e); }
});

// ── HIS/EMR Integrations ──
router.get('/integrations', async (req, res, next) => {
  try {
    const tenantId = Number(req.query.tenant_id) || 1;
    res.json({ success: true, data: await saasService.getIntegrations(tenantId) });
  } catch (e) { next(e); }
});

router.get('/integrations/:id', async (req, res, next) => {
  try { res.json({ success: true, data: await saasService.getIntegrationById(Number(req.params.id)) }); } catch (e) { next(e); }
});

router.post('/integrations', async (req, res, next) => {
  try {
    const integration = await saasService.createIntegration(req.body);
    res.status(201).json({ success: true, data: integration });
  } catch (e) { next(e); }
});

router.put('/integrations/:id', async (req, res, next) => {
  try {
    const integration = await saasService.updateIntegration(Number(req.params.id), req.body);
    res.json({ success: true, data: integration });
  } catch (e) { next(e); }
});

router.delete('/integrations/:id', async (req, res, next) => {
  try {
    await saasService.deleteIntegration(Number(req.params.id));
    res.json({ success: true, message: 'Đã xoá' });
  } catch (e) { next(e); }
});

router.get('/integrations/:id/logs', async (req, res, next) => {
  try {
    const logs = await saasService.getIntegrationLogs(Number(req.params.id));
    res.json({ success: true, data: logs });
  } catch (e) { next(e); }
});

export default router;
