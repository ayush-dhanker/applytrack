import { z } from 'zod';


const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email('Please enter a valid email address'));

export const registerSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: emailSchema,
  password: z.string().min(8).max(200),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;

export type PublicUser = {
  id: string;
  name: string;
  email: string;
};
export type RegisterFormValues = z.input<typeof registerSchema>;
export type LoginFormValues = z.input<typeof loginSchema>;