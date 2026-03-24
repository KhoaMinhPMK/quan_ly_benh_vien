import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorHandler(err: AppError, _req: Request, res: Response, _next: NextFunction): void {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';

  console.error(`❌ [${code}] ${err.message}`, err.stack);

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message: statusCode === 500 ? 'Lỗi hệ thống, vui lòng thử lại sau' : err.message,
    },
  });
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint không tồn tại',
    },
  });
}
