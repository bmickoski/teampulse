import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { organizationsFormSchema } from "@/lib/validations/organizations";

describe("organizationsFormSchema", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("accepts a valid name and slug", () => {
    const result = organizationsFormSchema.safeParse({
      name: "Team Pulse",
      slug: "team-pulse",
    });

    expect(result.success).toBe(true);
  });

  it("rejects a slug with spaces", () => {
    const result = organizationsFormSchema.safeParse({
      name: "Team Pulse",
      slug: "team pulse",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a slug with invalid characters", () => {
    const result = organizationsFormSchema.safeParse({
      name: "Team Pulse",
      slug: "team_pulse",
    });

    expect(result.success).toBe(false);
  });
});
