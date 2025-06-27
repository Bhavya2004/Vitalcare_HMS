import { z } from 'zod';

export const workingDaySchema = z.object({
  day: z.string(),
  start_time: z.string(),
  close_time: z.string(),
});

export const createDoctorSchema = z.object({
  type: z.enum(['FULL', 'PART']),
  name: z.string().min(1),
  specialization: z.string().min(1),
  department: z.string().min(1),
  license_number: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(7),
  address: z.string().min(1),
  password: z.string().min(6),
  working_days: z.array(workingDaySchema),
}); 