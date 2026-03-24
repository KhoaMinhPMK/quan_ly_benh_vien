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
    if (!user) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User khong ton tai' } }); return; }
    res.json({ success: true, data: user });
  } catch (error) { next(error); }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, full_name, role, department_id } = req.body;
    if (!email || !password || !full_name || !role) {
      res.status(422).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Email, mat khau, ho ten va vai tro bat buoc' } });
      return;
    }
    const user = await usersService.createUser({ email, password, full_name, role, department_id });
    res.status(201).json({ success: true, data: user });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ success: false, error: { code: 'DUPLICATE', message: 'Email da ton tai' } });
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
    res.json({ success: true, message: 'Da vo hieu hoa tai khoan' });
  } catch (error) { next(error); }
}

export async function resetPw(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { new_password } = req.body;
    if (!new_password || new_password.length < 6) {
      res.status(422).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Mat khau moi phai it nhat 6 ky tu' } });
      return;
    }
    await usersService.resetPassword(Number(req.params.id), new_password);
    res.json({ success: true, message: 'Da doi mat khau' });
  } catch (error) { next(error); }
}

export async function changePw(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password || new_password.length < 6) {
      res.status(422).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Mat khau hien tai va mat khau moi bat buoc (>=6 ky tu)' } });
      return;
    }
    await usersService.changePassword(req.user!.id, current_password, new_password);
    res.json({ success: true, message: 'Da doi mat khau' });
  } catch (error) { next(error); }
}
