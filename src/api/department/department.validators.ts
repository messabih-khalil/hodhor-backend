import { z } from 'zod';

// Define a schema for the request body with custom error messages for required fields
export const createDepartmentRequestBodySchema = z.object({
    body: z.object({
        name: z
            .string({
                required_error: 'Name is required',
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

export const loginBodySchema = z.object({
    body: z.object({
        email: z
            .string({
                required_error: 'Please provide root name',
            })
            .email(),

        password: z
            .string({
                required_error: 'Please provide a password',
            })
            .min(20),
    }),
});

export type loginBodyRequest = z.infer<typeof loginBodySchema>;

export type DepartmentBodyRequest = z.infer<
    typeof createDepartmentRequestBodySchema
>;
