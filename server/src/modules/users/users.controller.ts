import { Request, Response, NextFunction } from 'express';
import * as usersService from './users.service';

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const users = await usersService.getUsers({
      role: req.query.role as string,
      is_active: req.query.is_active as string,
      search: req.query.search as string,
    });
    res.json({ success: true, data: users });
  } catch (error) { next(error); }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await usersService.getUserById(Number(req.params.id));
    if (!user) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Người dùng không tồn tại' } }); return; }
    res.json({ success: true, data: user });
  } catch (error) { next(error); }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, full_name, role, department_id } = req.body;
    if (!email || !password || !full_name || !role) {
      res.status(422).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Email, mật khẩu, họ tên và vai trò bắt buộc' } });
      return;
    }
    const user = await usersService.createUser({ email, password, full_name, role, department_id });
    res.status(201).json({ success: true, data: user });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ success: false, error: { code: 'DUPLICATE', message: 'Email đã tồn tại' } });
      return;
    }
    next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await usersService.updateUser(Number(req.params.id), req.body);
    res.json({ success: true, data: user });
  } catch (error) { next(error); }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await usersService.deleteUser(Number(req.params.id));
    res.json({ success: true, message: 'Đã vô hiệu hoá tài khoản' });
  } catch (error) { next(error); }
}

export async function resetPw(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { new_password } = req.body;
    if (!new_password || new_password.length < 6) {
      res.status(422).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Mật khẩu mới phải ít nhất 6 ký tự' } });
      return;
    }
    await usersService.resetPassword(Number(req.params.id), new_password);
    res.json({ success: true, message: 'Đã đổi mật khẩu' });
  } catch (error) { next(error); }
}

export async function changePw(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password || new_password.length < 6) {
      res.status(422).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Mật khẩu hiện tại và mật khẩu mới bắt buộc (>=6 ký tự)' } });
      return;
    }
    await usersService.changePassword(req.user!.id, current_password, new_password);
    res.json({ success: true, message: 'Đã đổi mật khẩu' });
  } catch (error) { next(error); }
}
