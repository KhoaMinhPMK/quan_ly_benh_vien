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

export async function trends(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const days = req.query.days ? Number(req.query.days) : 30;
    const departmentId = req.query.department_id ? Number(req.query.department_id) : undefined;
    res.json({ success: true, data: await svc.getTrendData(days, departmentId) });
  } catch (e) { next(e); }
}

export async function dischargeHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await svc.getDischargeHistory({
      from: req.query.from as string,
      to: req.query.to as string,
      doctor_name: req.query.doctor_name as string,
      department_id: req.query.department_id ? Number(req.query.department_id) : undefined,
      room_id: req.query.room_id ? Number(req.query.room_id) : undefined,
      search: req.query.search as string,
    });
    res.json({ success: true, data });
  } catch (e) { next(e); }
}

export async function exportCSV(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const type = req.params.type;
    let csv: string;
    let filename: string;

    switch (type) {
      case 'occupancy':
        csv = await svc.exportOccupancyCSV();
        filename = 'bao-cao-cong-suat.csv';
        break;
      case 'discharge':
        csv = await svc.exportDischargeCSV(req.query.from as string, req.query.to as string);
        filename = 'bao-cao-ra-vien.csv';
        break;
      case 'missing-records':
        csv = await svc.exportMissingRecordsCSV();
        filename = 'bao-cao-ho-so-thieu.csv';
        break;
      case 'department':
        csv = await svc.exportDepartmentCSV();
        filename = 'bao-cao-theo-khoa.csv';
        break;
      default:
        res.status(400).json({ success: false, error: { code: 'INVALID_TYPE', message: 'Loại báo cáo không hợp lệ' } });
        return;
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (e) { next(e); }
}

export async function snapshotDaily(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await svc.snapshotDailyStats();
    res.json({ success: true, message: 'Snapshot saved' });
  } catch (e) { next(e); }
}
