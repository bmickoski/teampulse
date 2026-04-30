import z from "zod";

function parseMentionedUserIds(value: unknown) {
  if (typeof value !== "string" || value.length === 0) return [];

  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}

export const pulseCommentSchema = z.object({
  content: z.string().min(1, "Comment content cannot be empty").max(100),
  pulseId: z.uuid(),
  mentionedUserIds: z.preprocess(
    parseMentionedUserIds,
    z.array(z.uuid()).max(20),
  ),
});

export type PulseCommentActionState = {
  errors?: { content?: string[]; mentionedUserIds?: string[] };
  error?: string;
  success?: boolean;
};
