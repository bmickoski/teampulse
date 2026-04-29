import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { relativeTime, isOverdue } from "@/lib/utils/time";

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

describe("isOverdue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns false when dueDate is null", () => {
    expect(isOverdue(null, "active")).toBe(false);
  });

  it("returns false when due date is in the future", () => {
    expect(isOverdue(new Date("2026-06-01"), "active")).toBe(false);
  });

  it("returns true when due date is in the past and status is active", () => {
    expect(isOverdue(new Date("2025-12-01"), "active")).toBe(true);
  });

  it("returns false when overdue but status is completed", () => {
    expect(isOverdue(new Date("2025-12-01"), "completed")).toBe(false);
  });

  it("returns false when overdue but status is archived", () => {
    expect(isOverdue(new Date("2025-12-01"), "archived")).toBe(false);
  });
});
