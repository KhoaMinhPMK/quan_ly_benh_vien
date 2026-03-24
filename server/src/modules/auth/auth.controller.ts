import { Request, Response, NextFunction } from 'express';
import { loginSchema } from './auth.validator';
import { loginUser } from './auth.service';
import { ZodError } from 'zod';

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Validate input
    const input = loginSchema.parse(req.body);

    // Call service
    const result = await loginUser(input.email, input.password);

    res.json({
      success: true,
      data: result,
      message: 'Đăng nhập thành công',
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Dữ liệu không hợp lệ',
          details: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
      });
      return;
    }
    next(error);
  }
}

export async function getMe(req: Request, res: Response): Promise<void> {
  res.json({
    success: true,
    data: req.user,
    message: 'Thông tin người dùng',
  });
}
