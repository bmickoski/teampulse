import { z } from "zod";

export const organizationsFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Organization Name must be at least 2 characters long" })
    .trim(),
  slug: z
    .string()
    .min(2, { message: "Slug must be at least 2 characters long" })
    .regex(/^[a-z0-9-]+$/, {
      message: "Slug can only contain lowercase letters, numbers, and hyphens.",
    })
    .trim(),
});

export type OrganizationsActionState = {
  form?: {
    name?: string;
    slug?: string;
  };
  errors?: {
    name?: string[];
    slug?: string[];
  };
  error?: string;
};
