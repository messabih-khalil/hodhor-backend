import { z } from 'zod';

export const createTeacherRequestBodySchema = z.object({
    body: z.object({
        full_name: z
            .string({
                required_error: 'Full name is required',
            })
            .min(1)
            .max(255),

        email: z
            .string({
                required_error:
                    'Email is required and must be a valid email address',
            })
            .email(),
    }),
});

export const teacherLoginRequestSchema = z.object({
    body: z.object({
        email: z
            .string({
                required_error:
                    'Email is required and must be a valid email address',
            })
            .email(),

        password: z
            .string({
                required_error:
                    'Password is required and must be at least 20 characters long',
            })
            .min(20),
    }),
});

export type TeacherLoginRequest = z.infer<typeof teacherLoginRequestSchema>;

export type createTeacherBodyRequest = z.infer<
    typeof createTeacherRequestBodySchema
>;

