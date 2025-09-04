import z from 'zod';

export const testValidator = z.object({
  name: z.string().min(2).max(100),
  age: z.number().min(18).max(120),
});
