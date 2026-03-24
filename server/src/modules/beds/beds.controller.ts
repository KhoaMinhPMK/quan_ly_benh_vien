import { Request, Response, NextFunction } from 'express';
import * as bedsService from './beds.service';

export async function listByRoom(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const beds = await bedsService.getBedsByRoom(Number(req.params.roomId));
    res.json({ success: true, data: beds });
  } catch (error) { next(error); }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const bed = await bedsService.getBedById(Number(req.params.id));
    if (!bed) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Giuong khong ton tai' } }); return; }
    res.json({ success: true, data: bed });
  } catch (error) { next(error); }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { bed_code, room_id, notes } = req.body;
    if (!bed_code || !room_id) { res.status(422).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Ma giuong va phong bat buoc' } }); return; }
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
    if (!patient_id) { res.status(422).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'patient_id bat buoc' } }); return; }
    const bed = await bedsService.assignBed(Number(req.params.id), patient_id, req.user?.id);
    res.json({ success: true, data: bed });
  } catch (error) { next(error); }
}

export async function release(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const bed = await bedsService.releaseBed(Number(req.params.id), req.user?.id);
    res.json({ success: true, data: bed });
  } catch (error) { next(error); }
}
