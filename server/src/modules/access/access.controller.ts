import { Request, Response, NextFunction } from 'express';
import * as svc from './access.service';
import { getEffectiveAccess, previewAccess, invalidateAccessCache } from './access.resolver';
import { logAccessAudit } from './access.service';

// ── Catalog ──
export async function catalog(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await svc.getModuleCatalog();
    res.json({ success: true, data });
  } catch (e) { next(e); }
}

// ── Module Entitlements ──
export async function getModules(req: Request, res: Response, next: NextFunction) {
  try {
    const type = req.params.type as string;
    const id = Number(req.params.id);
    const rows = await svc.getModuleEntitlements(type, id);
    res.json({ success: true, data: rows });
  } catch (e) { next(e); }
}

export async function setModule(req: Request, res: Response, next: NextFunction) {
  try {
    const type = req.params.type as string;
    const id = Number(req.params.id);
    const { module_key, effect, reason } = req.body;
    if (!module_key || !effect) {
      res.status(422).json({ success: false, error: { code: 'VALIDATION', message: 'module_key và effect bắt buộc' } });
      return;
    }
    const before = await svc.getModuleEntitlements(type, id);
    await svc.setModuleEntitlement(type, id, module_key, effect, reason || null, req.user?.id || null);
    await logAccessAudit(req.user?.id || null, req.user?.fullName || null, 'module_change', type, id, module_key, before, { effect, reason }, reason, (req.ip as string) || null);
    res.json({ success: true, message: 'Đã cập nhật module entitlement' });
  } catch (e) { next(e); }
}

// ── Policy Assignments (Capabilities) ──
export async function getPolicies(req: Request, res: Response, next: NextFunction) {
  try {
    const type = req.params.type as string;
    const id = Number(req.params.id);
    const rows = await svc.getPolicies(type, id);
    res.json({ success: true, data: rows });
  } catch (e) { next(e); }
}

export async function setPolicies(req: Request, res: Response, next: NextFunction) {
  try {
    const type = req.params.type as string;
    const id = Number(req.params.id);
    const { policies } = req.body;
    if (!Array.isArray(policies)) {
      res.status(422).json({ success: false, error: { code: 'VALIDATION', message: 'policies phải là mảng' } });
      return;
    }
    const before = await svc.getPolicies(type, id);
    await svc.bulkSetPolicies(type, id, policies, 'admin_manual', req.user?.id || null);
    await logAccessAudit(req.user?.id || null, req.user?.fullName || null, 'capability_change', type, id, null, before, policies, null, (req.ip as string) || null);
    res.json({ success: true, message: 'Đã cập nhật policies' });
  } catch (e) { next(e); }
}

// ── Groups ──
export async function listGroups(req: Request, res: Response, next: NextFunction) {
  try {
    const rows = await svc.getGroups(req.query.tenant_id ? Number(req.query.tenant_id) : undefined);
    res.json({ success: true, data: rows });
  } catch (e) { next(e); }
}

export async function createGroup(req: Request, res: Response, next: NextFunction) {
  try {
    const { code, name, description, group_type, priority } = req.body;
    if (!code || !name) {
      res.status(422).json({ success: false, error: { code: 'VALIDATION', message: 'code và name bắt buộc' } });
      return;
    }
    const group = await svc.createGroup({ code, name, description, group_type, priority });
    res.status(201).json({ success: true, data: group });
  } catch (e) { next(e); }
}

export async function updateGroup(req: Request, res: Response, next: NextFunction) {
  try {
    await svc.updateGroup(Number(req.params.id), req.body);
    res.json({ success: true, message: 'Đã cập nhật group' });
  } catch (e) { next(e); }
}

export async function getGroupMembers(req: Request, res: Response, next: NextFunction) {
  try {
    const rows = await svc.getGroupMembers(Number(req.params.id));
    res.json({ success: true, data: rows });
  } catch (e) { next(e); }
}

export async function addGroupMember(req: Request, res: Response, next: NextFunction) {
  try {
    const { user_id } = req.body;
    if (!user_id) { res.status(422).json({ success: false, error: { code: 'VALIDATION', message: 'user_id bắt buộc' } }); return; }
    await svc.addGroupMember(Number(req.params.id), Number(user_id));
    res.json({ success: true, message: 'Đã thêm thành viên' });
  } catch (e) { next(e); }
}

export async function removeGroupMember(req: Request, res: Response, next: NextFunction) {
  try {
    await svc.removeGroupMember(Number(req.params.id), Number(req.params.userId));
    res.json({ success: true, message: 'Đã xoá thành viên' });
  } catch (e) { next(e); }
}

// ── Effective Access / Preview ──
export async function getMyAccess(req: Request, res: Response, next: NextFunction) {
  try {
    const access = await getEffectiveAccess(req.user!.id);
    res.json({ success: true, data: access });
  } catch (e) { next(e); }
}

export async function previewUserAccess(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = Number(req.params.userId);
    const access = await previewAccess(userId);
    res.json({ success: true, data: access });
  } catch (e) { next(e); }
}

// ── Audit ──
export async function getAuditLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const rows = await svc.getAccessAuditLogs({
      subject_type: req.query.subject_type as string | undefined,
      subject_id: req.query.subject_id ? Number(req.query.subject_id) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : 100,
    });
    res.json({ success: true, data: rows });
  } catch (e) { next(e); }
}
