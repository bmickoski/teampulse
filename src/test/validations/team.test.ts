import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { inviteTeamMemberSchema } from "@/lib/validations/team";

describe("inviteTeamMemberSchema", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("accepts a valid email", () => {
    const result = inviteTeamMemberSchema.safeParse({
      email: "teammate@example.com",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = inviteTeamMemberSchema.safeParse({
      email: "not-an-email",
    });

    expect(result.success).toBe(false);
  });
});
