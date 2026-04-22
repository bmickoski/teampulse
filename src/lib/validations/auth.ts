import { z } from "zod";

export const signUpFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }).trim(),
  email: z.email({ message: "Please enter a valid email." }).trim(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .trim(),
});

export type SignUpActionState = {
  form?: {
    name?: string;
    email?: string;
    password?: string;
  };
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
  };
};
