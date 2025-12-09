import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { UserInfo } from "../user-info";

describe("UserInfo", () => {
  it("should render name and email", () => {
    render(<UserInfo name="John Doe" email="john@example.com" />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
  });

  it("should display default initial", () => {
    render(<UserInfo name="John Doe" email="john@example.com" />);
    expect(screen.getByText("U")).toBeInTheDocument();
  });

  it("should display custom initial", () => {
    render(<UserInfo name="John Doe" email="john@example.com" initial="J" />);
    expect(screen.getByText("J")).toBeInTheDocument();
  });

  it("should render name in correct element", () => {
    render(<UserInfo name="John Doe" email="john@example.com" />);
    const nameElement = screen.getByText("John Doe");
    expect(nameElement.tagName).toBe("H1");
  });

  it("should render email in correct element", () => {
    render(<UserInfo name="John Doe" email="john@example.com" />);
    const emailElement = screen.getByText("john@example.com");
    expect(emailElement.tagName).toBe("P");
  });
});
