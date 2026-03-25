import { Request, Response, NextFunction } from 'express';
import * as dashboardService from './dashboard.service';

export async function getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userDept = req.user?.role !== 'admin' ? req.user?.departmentId : undefined;
    const stats = await dashboardService.getDashboardStats(userDept ?? undefined);
    res.json({ success: true, data: stats });
  } catch (error) { next(error); }
}
