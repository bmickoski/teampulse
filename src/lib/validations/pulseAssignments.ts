import z from "zod";

export type AssignmentActionState = {
  error?: string;
  success?: boolean;
};

export const assignmentActionSchema = z.object({
  pulseId: z.uuid(),
  userIds: z.array(z.uuid()).default([]),
});
