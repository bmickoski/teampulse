import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters long" })
  .trim();

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string(),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type updatePasswordActionState = {
  form?: {
    currentPassword?: string;
    password?: string;
    confirmPassword?: string;
  };
  errors?: {
    password?: string[];
    confirmPassword?: string[];
    currentPassword?: string[];
  };
  error?: string;
  success?: boolean;
};
