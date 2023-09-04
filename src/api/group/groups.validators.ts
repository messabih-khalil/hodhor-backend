import { z } from 'zod';

export const createGroupRequestBodySchema = z.object({
    body: z.object({
        group_key: z
            .string({
                required_error: 'Group key is required',
            })
            .min(1)
            .max(255),
    }),
});

export const updateGroupRequestBodySchema = z.object({
    body: z.object({
        group_key: z.string().min(1).max(255).optional(),
    }),
});

export type CreateGroupBodyRequest = z.infer<
    typeof createGroupRequestBodySchema
>;
export type UpdateGroupBodyRequest = z.infer<
    typeof updateGroupRequestBodySchema
>;
