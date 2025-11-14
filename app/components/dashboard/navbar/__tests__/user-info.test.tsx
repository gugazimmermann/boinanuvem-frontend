import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { UserInfo } from "../user-info";

describe("UserInfo", () => {
  it("should render name and email", () => {
    render(<UserInfo name="John Doe" email="john@example.com" />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
  });

  it("should render with default initial", () => {
    render(<UserInfo name="John Doe" email="john@example.com" />);
    expect(screen.getByText("U")).toBeInTheDocument();
  });

  it("should render with custom initial", () => {
    render(<UserInfo name="John Doe" email="john@example.com" initial="JD" />);
    expect(screen.getByText("JD")).toBeInTheDocument();
  });
});
