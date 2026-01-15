import z from 'zod';

export const categoriesQueryValidator = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  name: z.array(z.string()).optional(),
  tag: z.array(z.string()).optional(),
  id: z.union([z.coerce.number().int().positive(), z.array(z.coerce.number().int().positive())]).optional(),
});

export type CategoriesQuerySchema = z.infer<typeof categoriesQueryValidator>;
