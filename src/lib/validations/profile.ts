import { z } from "zod";

export const profileFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Profile name must be at least 2 characters long" })
    .trim(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export type ProfileActionState = {
  form?: {
    name?: string;
  };
  errors?: {
    name?: string[];
  };
  error?: string;
  success?: boolean;
};
