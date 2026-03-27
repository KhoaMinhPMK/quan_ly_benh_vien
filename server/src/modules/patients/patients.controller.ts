import { Request, Response, NextFunction } from 'express';
import * as patientsService from './patients.service';
import { logAudit } from '../../middleware/auditLogger';

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userDept = req.user?.role !== 'admin' ? req.user?.departmentId : undefined;
    const patients = await patientsService.getAllPatients({
      status: req.query.status as string | undefined,
      search: req.query.search as string | undefined,
      room_id: req.query.room_id ? Number(req.query.room_id) : undefined,
      doctor_name: req.query.doctor_name as string | undefined,
      department_id: userDept ?? undefined,
    });
    res.json({ success: true, data: patients });
  } catch (error) { next(error); }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const patient = await patientsService.getPatientById(Number(req.params.id));
    if (!patient) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Bệnh nhân không tồn tại' } }); return; }
    res.json({ success: true, data: patient });
  } catch (error) { next(error); }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { full_name } = req.body;
    if (!full_name) { res.status(422).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Họ tên bệnh nhân bắt buộc' } }); return; }
    const patient = await patientsService.createPatient(req.body);
    logAudit(req, 'CREATE', 'patient', patient.id, { patient_code: patient.patient_code, full_name: patient.full_name });
    res.status(201).json({ success: true, data: patient });
  } catch (error) { next(error); }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const patient = await patientsService.updatePatient(Number(req.params.id), req.body);
    logAudit(req, 'UPDATE', 'patient', Number(req.params.id), { fields: Object.keys(req.body) });
    res.json({ success: true, data: patient });
  } catch (error) { next(error); }
}

export async function discharge(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const patient = await patientsService.dischargePatient(Number(req.params.id), req.user?.id);
    logAudit(req, 'DISCHARGE', 'patient', Number(req.params.id), { performed_by: req.user?.fullName });
    res.json({ success: true, data: patient, message: 'Bệnh nhân đã ra viện' });
  } catch (error) { next(error); }
}

export async function dischargeList(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userDept = req.user?.role !== 'admin' ? req.user?.departmentId : undefined;
    const patients = await patientsService.getDischargeList({
      date: req.query.date as string | undefined,
      department_id: userDept ?? undefined,
    });
    res.json({ success: true, data: patients });
  } catch (error) { next(error); }
}

export async function getChecklists(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const checklists = await patientsService.getPatientChecklists(Number(req.params.id));
    res.json({ success: true, data: checklists });
  } catch (error) { next(error); }
}

export async function toggleChecklist(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { template_id, completed } = req.body;
    const checklists = await patientsService.toggleChecklist(
      Number(req.params.id), template_id, completed, req.user?.id
    );
    res.json({ success: true, data: checklists });
  } catch (error) { next(error); }
}
