import { z } from 'zod';

export const createRoomSchema = z.object({
  room_code: z.string().min(1, 'Mã phòng bắt buộc'),
  name: z.string().min(1, 'Tên phòng bắt buộc'),
  department_id: z.number().int().positive(),
  room_type: z.enum(['normal', 'vip', 'icu', 'isolation']).optional(),
  max_beds: z.number().int().min(1).max(20).optional(),
  floor: z.number().int().min(0).optional(),
  notes: z.string().optional(),
});

export const updateRoomSchema = z.object({
  name: z.string().min(1).optional(),
  room_type: z.enum(['normal', 'vip', 'icu', 'isolation']).optional(),
  max_beds: z.number().int().min(1).max(20).optional(),
  status: z.enum(['active', 'maintenance', 'closed']).optional(),
  floor: z.number().int().min(0).optional(),
  notes: z.string().optional(),
});
