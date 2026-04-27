import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getGreeting } from "@/lib/utils/greeting";

describe("getGreeting", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 'Good morning' before noon", () => {
    vi.setSystemTime(new Date("2026-01-01T11:00:00"));

    expect(getGreeting()).toBe("Good morning");
  });

  it("returns 'Good afternoon' from noon until 6 PM", () => {
    vi.setSystemTime(new Date("2026-01-01T12:00:00"));

    expect(getGreeting()).toBe("Good afternoon");
  });

  it("returns 'Good evening' at 6 PM and later", () => {
    vi.setSystemTime(new Date("2026-01-01T18:00:00"));

    expect(getGreeting()).toBe("Good evening");
  });
});
