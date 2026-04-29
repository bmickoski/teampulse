import z from "zod";

export const pulseCommentSchema = z.object({
  content: z.string().min(1, "Comment content cannot be empty").max(100),
  pulseId: z.uuid(),
});

export type PulseCommentActionState = {
  errors?: { content?: string[] };
  error?: string;
  success?: boolean;
};
