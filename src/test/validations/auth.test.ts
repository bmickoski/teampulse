import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  signInFormSchema,
  signUpFormSchema,
} from "@/lib/validations/auth";

describe("signInFormSchema", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("accepts a valid email and password", () => {
    const result = signInFormSchema.safeParse({
      email: "jane@example.com",
      password: "password123",
    });

    expect(result.success).toBe(true);
  });

  it("rejects missing fields", () => {
    const result = signInFormSchema.safeParse({});

    expect(result.success).toBe(false);
  });

  it("rejects an invalid email format", () => {
    const result = signInFormSchema.safeParse({
      email: "not-an-email",
      password: "password123",
    });

    expect(result.success).toBe(false);
  });
});

describe("signUpFormSchema", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("accepts a valid name, email, and password", () => {
    const result = signUpFormSchema.safeParse({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "password123",
    });

    expect(result.success).toBe(true);
  });

  it("rejects missing fields", () => {
    const result = signUpFormSchema.safeParse({});

    expect(result.success).toBe(false);
  });

  it("rejects an invalid email format", () => {
    const result = signUpFormSchema.safeParse({
      name: "Jane Doe",
      email: "not-an-email",
      password: "password123",
    });

    expect(result.success).toBe(false);
  });
});
