import { Request, Response, NextFunction } from 'express';
import * as dashboardService from './dashboard.service';

export async function getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const stats = await dashboardService.getDashboardStats(req.dataScope?.departmentId);
    res.json({ success: true, data: stats });
  } catch (error) { next(error); }
}
