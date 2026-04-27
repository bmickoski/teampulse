import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { profileFormSchema } from "@/lib/validations/profile";

describe("profileFormSchema", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("accepts a valid name", () => {
    const result = profileFormSchema.safeParse({
      name: "Jane Doe",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an empty name", () => {
    const result = profileFormSchema.safeParse({
      name: "",
    });

    expect(result.success).toBe(false);
  });
});
