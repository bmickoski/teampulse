import { z } from "zod";
import { Priority } from "../types";

const statusEnum = z.enum(["active", "completed", "archived"]);

export const pulsesFormSchema = z.object({
  title: z
    .string()
    .min(2, { message: "Pulse title must be at least 2 characters long" })
    .trim(),
  description: z.string().optional(),
  status: statusEnum.optional(),
  dueDate: z.string().optional(),
  assigneeIds: z.array(z.string()).optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
});

export type PulsesFormValues = z.input<typeof pulsesFormSchema>;

export type PulsesActionState = {
  form?: {
    title?: string;
    description?: string;
    status?: string;
    dueDate?: string;
    assigneeIds?: string[];
    priority?: Priority;
  };
  errors?: {
    title?: string[];
    description?: string[];
    status?: string[];
  };
  error?: string;
  success?: boolean;
};
