// student.validators.ts
import { z } from 'zod';

export const createStudentRequestBodySchema = z.object({
  body: z.object({
    full_name: z.string().min(1).max(255),
    email: z.string().email(),
    group_id: z.string(), // Assuming group_id is a string
  }),
});

export const updateStudentRequestBodySchema = z.object({
  body: z.object({
    full_name: z.string().min(1).max(255).optional(),
    email: z.string().email().optional(),
    group_id: z.string().optional(),
  }),
});

export type   CreateStudentBodyRequest = z.infer<typeof createStudentRequestBodySchema>;
export type UpdateStudentBodyRequest = z.infer<typeof updateStudentRequestBodySchema>;
