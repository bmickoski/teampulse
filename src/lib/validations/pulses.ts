import { z } from "zod";

const statusEnum = z.enum(["active", "completed", "archived"]);

export const pulsesFormSchema = z.object({
  title: z
    .string()
    .min(2, { message: "Pulse title must be at least 2 characters long" })
    .trim(),
  description: z.string().optional(),
  status: statusEnum.optional(),
  dueDate: z.string().optional(),
});

export type PulsesFormValues = z.infer<typeof pulsesFormSchema>;

export type PulsesActionState = {
  form?: {
    title?: string;
    description?: string;
    status?: string;
    dueDate?: string;
  };
  errors?: {
    title?: string[];
    description?: string[];
    status?: string[];
  };
  error?: string;
  success?: boolean;
};
