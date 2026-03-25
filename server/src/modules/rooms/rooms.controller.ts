import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { createRoomSchema, updateRoomSchema } from './rooms.validator';
import * as roomsService from './rooms.service';

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userDept = req.user?.role !== 'admin' ? req.user?.departmentId : undefined;
    const rooms = await roomsService.getAllRooms({
      department_id: req.query.department_id ? Number(req.query.department_id) : (userDept ?? undefined),
      status: req.query.status as string | undefined,
      search: req.query.search as string | undefined,
    });
    res.json({ success: true, data: rooms });
  } catch (error) { next(error); }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const room = await roomsService.getRoomById(Number(req.params.id));
    if (!room) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Phòng không tồn tại' } });
      return;
    }
    res.json({ success: true, data: room });
  } catch (error) { next(error); }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createRoomSchema.parse(req.body);
    const room = await roomsService.createRoom(data);
    res.status(201).json({ success: true, data: room });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(422).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Dữ liệu không hợp lệ', details: error.errors.map(e => ({ field: e.path.join('.'), message: e.message })) } });
      return;
    }
    next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = updateRoomSchema.parse(req.body);
    const room = await roomsService.updateRoom(Number(req.params.id), data);
    if (!room) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Phòng không tồn tại' } });
      return;
    }
    res.json({ success: true, data: room });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(422).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Dữ liệu không hợp lệ', details: error.errors.map(e => ({ field: e.path.join('.'), message: e.message })) } });
      return;
    }
    next(error);
  }
}

export async function departments(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const deps = await roomsService.getDepartments();
    res.json({ success: true, data: deps });
  } catch (error) { next(error); }
}
