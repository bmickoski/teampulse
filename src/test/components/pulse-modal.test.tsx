import { render, screen, fireEvent } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PulseModal } from "@/components/dashboard/pulse-modal";
import { id } from "zod/v4/locales";

const { backMock } = vi.hoisted(() => ({
  backMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: backMock }),
  usePathname: () => "/dashboard/pulses",
}));

describe("PulseModal", () => {
  beforeEach(() => {
    backMock.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the title, status badge, creator name, date, and description", () => {
    render(
      <PulseModal
        result={{
          id: "pulse-123",
          title: "Weekly check-in",
          description: "A quick pulse for the team this week.",
          status: "active",
          createdAt: new Date("2026-01-15T12:00:00Z"),
          creatorName: "Jane Doe",
        }}
        history={[]}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Weekly check-in" }),
    ).toBeInTheDocument();
    expect(screen.getByText("active")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("January 15, 2026")).toBeInTheDocument();
    expect(
      screen.getByText("A quick pulse for the team this week."),
    ).toBeInTheDocument();
  });

  it("does not render the description section when description is null", () => {
    render(
      <PulseModal
        result={{
          id: "pulse-123",
          title: "Weekly check-in",
          description: null,
          status: "completed",
          createdAt: new Date("2026-01-15T12:00:00Z"),
          creatorName: "Jane Doe",
        }}
        history={[]}
      />,
    );

    expect(
      screen.queryByText("A quick pulse for the team this week."),
    ).not.toBeInTheDocument();
  });

  it("calls router.back when the dialog is closed", () => {
    render(
      <PulseModal
        result={{
          id: "pulse-123",
          title: "Weekly check-in",
          description: "A quick pulse for the team this week.",
          status: "archived",
          createdAt: new Date("2026-01-15T12:00:00Z"),
          creatorName: "Jane Doe",
        }}
        history={[]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(backMock).toHaveBeenCalledTimes(1);
  });
});
