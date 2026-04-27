import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { updatePasswordSchema } from "@/lib/validations/password";

describe("updatePasswordSchema", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("accepts valid passwords", () => {
    const result = updatePasswordSchema.safeParse({
      currentPassword: "current-password",
      password: "password123",
      confirmPassword: "password123",
    });

    expect(result.success).toBe(true);
  });

  it("rejects passwords that are too short", () => {
    const result = updatePasswordSchema.safeParse({
      currentPassword: "current-password",
      password: "short",
      confirmPassword: "short",
    });

    expect(result.success).toBe(false);
  });

  it("rejects mismatched password confirmation", () => {
    const result = updatePasswordSchema.safeParse({
      currentPassword: "current-password",
      password: "password123",
      confirmPassword: "password124",
    });

    expect(result.success).toBe(false);
  });
});
