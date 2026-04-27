import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UserContext, useUser } from "@/context/user-context";

function UserConsumer() {
  const user = useUser();

  return (
    <div>
      <span>{user.name}</span>
      <span>{user.email}</span>
      <span>{user.initials}</span>
    </div>
  );
}

describe("useUser", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("throws when used outside the provider", () => {
    expect(() => render(<UserConsumer />)).toThrow(
      "useUser must be used inside Dashboard"
    );
  });

  it("returns the correct value inside the provider", () => {
    render(
      <UserContext value={{ name: "Jane Doe", email: "jane@example.com", initials: "JD" }}>
        <UserConsumer />
      </UserContext>
    );

    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    expect(screen.getByText("JD")).toBeInTheDocument();
  });
});
