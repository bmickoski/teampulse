import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { relativeTime } from "@/lib/utils/time";

describe("relativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 'just now' for recent dates", () => {
    expect(relativeTime("2026-01-01T11:59:50Z")).toBe("just now");
  });

  it("returns minutes for dates within the hour", () => {
    expect(relativeTime("2026-01-01T11:30:00Z")).toBe("30 minutes ago");
  });

  it("returns hours for dates within the day", () => {
    expect(relativeTime("2026-01-01T10:00:00Z")).toBe("2 hours ago");
  });

  it("returns days for older dates", () => {
    expect(relativeTime("2025-12-31T12:00:00Z")).toBe("yesterday");
  });
});
