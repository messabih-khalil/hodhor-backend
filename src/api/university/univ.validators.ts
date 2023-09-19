import { z } from 'zod';

// Define the schema for the request body
export const universityBodySchema = z.object({
    body: z.object({
        username: z.string({
            required_error: 'Please provide university name (username)',
        }),
        location: z.string({
            required_error: 'Please Provide a location',
        }),
        email: z.string().email('Please provide email'),
      
    }),
});
