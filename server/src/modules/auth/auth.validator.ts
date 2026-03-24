import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email là bắt buộc' })
    .email('Email không đúng định dạng')
    .max(255, 'Email tối đa 255 ký tự'),
  password: z
    .string({ required_error: 'Mật khẩu là bắt buộc' })
    .min(1, 'Mật khẩu là bắt buộc')
    .max(128, 'Mật khẩu tối đa 128 ký tự'),
});

export type LoginInput = z.infer<typeof loginSchema>;
