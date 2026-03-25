import { Request, Response, NextFunction } from 'express';
import * as bedsService from './beds.service';
import * as transferService from './beds.transfer';

export async function listByRoom(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const beds = await bedsService.getBedsByRoom(Number(req.params.roomId));
    res.json({ success: true, data: beds });
  } catch (error) { next(error); }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const bed = await bedsService.getBedById(Number(req.params.id));
    if (!bed) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Giường không tồn tại' } }); return; }
    res.json({ success: true, data: bed });
  } catch (error) { next(error); }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { bed_code, room_id, notes } = req.body;
    if (!bed_code || !room_id) { res.status(422).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Mã giường và phòng bắt buộc' } }); return; }
    const bed = await bedsService.createBed({ bed_code, room_id, notes });
    res.status(201).json({ success: true, data: bed });
  } catch (error) { next(error); }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, notes } = req.body;
    const bed = await bedsService.updateBedStatus(Number(req.params.id), status, notes);
    res.json({ success: true, data: bed });
  } catch (error) { next(error); }
}

export async function assign(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { patient_id } = req.body;
    if (!patient_id) { res.status(422).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'patient_id bắt buộc' } }); return; }
    // Conflict check: verify bed is empty
    const bed = await bedsService.getBedById(Number(req.params.id));
    if (!bed) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Giường không tồn tại' } }); return; }
    if (bed.status !== 'empty') { res.status(409).json({ success: false, error: { code: 'BED_OCCUPIED', message: 'Giường đang sử dụng hoặc bị khoá' } }); return; }
    const result = await bedsService.assignBed(Number(req.params.id), patient_id, req.user?.id);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
}

export async function release(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const bed = await bedsService.releaseBed(Number(req.params.id), req.user?.id);
    res.json({ success: true, data: bed });
  } catch (error) { next(error); }
}

export async function transfer(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { patient_id, target_bed_id, reason, notes } = req.body;
    if (!patient_id) { res.status(422).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'patient_id bắt buộc' } }); return; }
    const targetBed = target_bed_id || Number(req.params.id);
    const result = await transferService.transferBed(patient_id, targetBed, req.user?.id, reason || notes);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
}

export async function listAvailable(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const beds = await transferService.getAvailableBeds({
      department_id: req.query.department_id ? Number(req.query.department_id) : undefined,
      room_id: req.query.room_id ? Number(req.query.room_id) : undefined,
    });
    res.json({ success: true, data: beds });
  } catch (error) { next(error); }
}

export async function getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const history = await transferService.getBedHistory(Number(req.params.id));
    res.json({ success: true, data: history });
  } catch (error) { next(error); }
}
