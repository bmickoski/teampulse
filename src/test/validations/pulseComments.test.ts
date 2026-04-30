import { describe, expect, it } from "vitest";
import { pulseCommentSchema } from "@/lib/validations/pulseComments";

const pulseId = "00000000-0000-4000-8000-000000000001";
const userId = "00000000-0000-4000-8000-000000000002";

describe("pulseCommentSchema", () => {
  it("accepts selected mention ids from form data", () => {
    const result = pulseCommentSchema.safeParse({
      content: `Can you check this?`,
      pulseId,
      mentionedUserIds: JSON.stringify([userId]),
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.mentionedUserIds).toEqual([userId]);
    }
  });

  it("defaults missing mention ids to an empty list", () => {
    const result = pulseCommentSchema.safeParse({
      content: `No mention here`,
      pulseId,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.mentionedUserIds).toEqual([]);
    }
  });

  it("rejects invalid mention ids", () => {
    const result = pulseCommentSchema.safeParse({
      content: `Bad mention payload`,
      pulseId,
      mentionedUserIds: JSON.stringify(["not-a-user-id"]),
    });

    expect(result.success).toBe(false);
  });
});
