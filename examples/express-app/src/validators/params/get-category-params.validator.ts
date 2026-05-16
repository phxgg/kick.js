import z from 'zod';

export const getCategoryParamsValidator = z.object({
  id: z.coerce.number<number>().int().positive(),
});

export type GetCategoryParams = z.infer<typeof getCategoryParamsValidator>;
