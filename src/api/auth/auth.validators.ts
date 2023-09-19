import { z } from 'zod';

export const createUserRequestBodySchema = z.object({
    body: z.object({
        username: z
            .string({
                required_error: 'Username is required',
            })
            .min(1)
            .max(255),

        email: z
            .string({
                required_error:
                    'Email is required and must be a valid email address',
            })
            .email(),

        password: z
            .string({
                required_error:
                    'Password is required and must be at least 6 characters',
            })
            .min(6),

        role: z.enum(['university', 'department', 'teacher'], {
            required_error:
                'Role is required and must be one of university, department, or teacher',
        }),
    }),
});

export const loginBodySchema = z.object({
    body: z.object({
        email: z
            .string({
                required_error: 'Please provide a valid email',
            })
            .email(),

        password: z
            .string({
                required_error: 'Please provide a valid password',
            })
            .min(6),
    }),
});

export type CreateUserRequestBody = z.infer<typeof createUserRequestBodySchema>;
export type LoginBodyRequest = z.infer<typeof loginBodySchema>;
