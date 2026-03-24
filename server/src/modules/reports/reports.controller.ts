import { Request, Response, NextFunction } from 'express';
import * as svc from './reports.service';

export async function occupancy(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try { res.json({ success: true, data: await svc.getOccupancyReport() }); } catch (e) { next(e); }
}

export async function discharge(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { res.json({ success: true, data: await svc.getDischargeReport(req.query.from as string, req.query.to as string) }); } catch (e) { next(e); }
}

export async function missingRecords(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try { res.json({ success: true, data: await svc.getMissingRecordsReport() }); } catch (e) { next(e); }
}

export async function department(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try { res.json({ success: true, data: await svc.getDepartmentReport() }); } catch (e) { next(e); }
}
