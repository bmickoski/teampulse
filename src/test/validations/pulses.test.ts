import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { pulsesFormSchema } from "@/lib/validations/pulses";

describe("pulsesFormSchema", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("accepts a valid title and status", () => {
    const result = pulsesFormSchema.safeParse({
      title: "Weekly check-in",
      description: "How is the team doing this week?",
      status: "active",
    });

    expect(result.success).toBe(true);
  });

  it("rejects a missing title", () => {
    const result = pulsesFormSchema.safeParse({
      description: "How is the team doing this week?",
      status: "active",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an invalid status value", () => {
    const result = pulsesFormSchema.safeParse({
      title: "Weekly check-in",
      description: "How is the team doing this week?",
      status: "draft",
    });

    expect(result.success).toBe(false);
  });
});
