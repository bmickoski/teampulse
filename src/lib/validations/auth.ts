import { z } from "zod";

export const signInFormSchema = z.object({
  email: z.email({ message: "Please enter a valid email" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export type SignInFormValues = z.infer<typeof signInFormSchema>;

export const signUpFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }).trim(),
  email: z.email({ message: "Please enter a valid email." }).trim(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .trim(),
});

export type SignUpFormValues = z.infer<typeof signUpFormSchema>;

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
