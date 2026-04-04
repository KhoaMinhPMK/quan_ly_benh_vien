import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import { rbacMiddleware } from '../../middleware/rbac';
import * as rulesService from './rules.service';

const router = Router();
router.use(authMiddleware);

// ── Bed allocation rules ──
router.get('/rules', async (req, res, next) => {
  try {
    const rules = await rulesService.getAllRules({
      department_id: req.query.department_id ? Number(req.query.department_id) : undefined,
      is_active: req.query.is_active === 'true' ? true : req.query.is_active === 'false' ? false : undefined,
    });
    res.json({ success: true, data: rules });
  } catch (e) { next(e); }
});

router.post('/rules', rbacMiddleware(['admin']), async (req, res, next) => {
  try {
    const rule = await rulesService.createRule({ ...req.body, created_by: req.user?.id });
    res.status(201).json({ success: true, data: rule });
  } catch (e) { next(e); }
});

router.put('/rules/:id', rbacMiddleware(['admin']), async (req, res, next) => {
  try {
    const rule = await rulesService.updateRule(Number(req.params.id), req.body);
    res.json({ success: true, data: rule });
  } catch (e) { next(e); }
});

router.delete('/rules/:id', rbacMiddleware(['admin']), async (req, res, next) => {
  try {
    await rulesService.deleteRule(Number(req.params.id));
    res.json({ success: true, message: 'Đã xoá quy tắc' });
  } catch (e) { next(e); }
});

// ── Auto bed suggestion ──
router.post('/suggest', async (req, res, next) => {
  try {
    const suggestions = await rulesService.suggestBeds(req.body);
    res.json({ success: true, data: suggestions });
  } catch (e) { next(e); }
});

// ── SLA ──
router.get('/sla/definitions', async (_req, res, next) => {
  try {
    const defs = await rulesService.getSLADefinitions();
    res.json({ success: true, data: defs });
  } catch (e) { next(e); }
});

router.get('/sla/tracking', async (req, res, next) => {
  try {
    const items = await rulesService.getSLATracking({
      status: req.query.status as string | undefined,
      sla_type: req.query.sla_type as string | undefined,
    });
    res.json({ success: true, data: items });
  } catch (e) { next(e); }
});

router.get('/sla/summary', async (_req, res, next) => {
  try {
    await rulesService.updateSLAStatus();
    const summary = await rulesService.getSLASummary();
    res.json({ success: true, data: summary });
  } catch (e) { next(e); }
});

export default router;
