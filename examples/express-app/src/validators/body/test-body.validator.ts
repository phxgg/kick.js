import z from 'zod';

export const testBodyValidator = z.object({
  name: z.string().min(2).max(100),
  age: z.number().min(18).max(120),
});

export type TestBodySchema = z.infer<typeof testBodyValidator>;
