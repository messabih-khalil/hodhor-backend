import { z } from 'zod';

// Define the schema for the request body
export const universityBodySchema = z.object({
    body: z.object({
        name: z.string({
            required_error: 'Please provide university name',
        }),
        location: z.string({
            required_error: 'Please Provide a location',
        }),
        root: z.string().min(6).max(20),
        password: z.string().min(20),
    }),
});

export const loginBodySchema = z.object({
    body: z.object({
        root: z
            .string({
                required_error: 'Please provide root name',
            })
            .min(6)
            .max(20),
        password: z
            .string({
                required_error: 'Please provide a password',
            })
            .min(20),
    }),
});

export type loginBodyRequest = z.infer<typeof loginBodySchema>;
