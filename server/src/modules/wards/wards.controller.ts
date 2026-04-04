import { Request, Response, NextFunction } from 'express';
import * as wardsService from './wards.service';

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const wards = await wardsService.getAllWards({
      is_active: req.query.is_active !== undefined ? req.query.is_active === 'true' : undefined,
      search: req.query.search as string | undefined,
    });
    res.json({ success: true, data: wards });
  } catch (error) { next(error); }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const ward = await wardsService.getWardById(Number(req.params.id));
    if (!ward) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Khu điều trị không tồn tại' } });
      return;
    }
    res.json({ success: true, data: ward });
  } catch (error) { next(error); }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, code, description, floor_start, floor_end } = req.body;
    if (!name || !code) {
      res.status(422).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Tên và mã khu là bắt buộc' } });
      return;
    }
    const ward = await wardsService.createWard({ name, code, description, floor_start, floor_end });
    res.status(201).json({ success: true, data: ward });
  } catch (error) { next(error); }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const ward = await wardsService.updateWard(Number(req.params.id), req.body);
    if (!ward) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Khu điều trị không tồn tại' } });
      return;
    }
    res.json({ success: true, data: ward });
  } catch (error) { next(error); }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await wardsService.deleteWard(Number(req.params.id));
    res.json({ success: true, message: 'Đã xoá khu điều trị' });
  } catch (error) { next(error); }
}
