import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthCard } from "../auth-card";

describe("AuthCard", () => {
  it("should render children", () => {
    render(
      <AuthCard>
        <div>Test Content</div>
      </AuthCard>
    );
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("should render logo", () => {
    render(<AuthCard>Content</AuthCard>);
    expect(screen.getByText("Boi na Nuvem")).toBeInTheDocument();
  });

  it("should render title when provided", () => {
    render(<AuthCard title="Sign In">Content</AuthCard>);
    expect(screen.getByText("Sign In")).toBeInTheDocument();
  });

  it("should not render title when not provided", () => {
    render(<AuthCard>Content</AuthCard>);
    expect(screen.queryByRole("heading", { level: 3 })).not.toBeInTheDocument();
  });

  it("should render subtitle when provided", () => {
    render(<AuthCard subtitle="Enter your credentials">Content</AuthCard>);
    expect(screen.getByText("Enter your credentials")).toBeInTheDocument();
  });

  it("should not render subtitle when not provided", () => {
    render(<AuthCard>Content</AuthCard>);
    const paragraphs = screen.queryAllByText(/Enter your credentials/);
    expect(paragraphs.length).toBe(0);
  });

  it("should render footer when provided", () => {
    render(<AuthCard footer={<div>Footer Content</div>}>Content</AuthCard>);
    expect(screen.getByText("Footer Content")).toBeInTheDocument();
  });

  it("should apply default maxWidth (sm)", () => {
    const { container } = render(<AuthCard>Content</AuthCard>);
    const card = container.querySelector(".max-w-sm");
    expect(card).toBeInTheDocument();
  });

  it("should apply md maxWidth", () => {
    const { container } = render(<AuthCard maxWidth="md">Content</AuthCard>);
    const card = container.querySelector(".max-w-md");
    expect(card).toBeInTheDocument();
  });

  it("should apply lg maxWidth", () => {
    const { container } = render(<AuthCard maxWidth="lg">Content</AuthCard>);
    const card = container.querySelector(".max-w-lg");
    expect(card).toBeInTheDocument();
  });

  it("should apply xl maxWidth", () => {
    const { container } = render(<AuthCard maxWidth="xl">Content</AuthCard>);
    const card = container.querySelector(".max-w-xl");
    expect(card).toBeInTheDocument();
  });

  it("should apply 2xl maxWidth", () => {
    const { container } = render(<AuthCard maxWidth="2xl">Content</AuthCard>);
    const card = container.querySelector(".max-w-2xl");
    expect(card).toBeInTheDocument();
  });

  it("should apply correct base classes", () => {
    const { container } = render(<AuthCard>Content</AuthCard>);
    const card = container.querySelector(".max-w-sm");
    expect(card).toHaveClass(
      "w-full",
      "mx-auto",
      "overflow-hidden",
      "bg-white",
      "dark:bg-gray-800",
      "rounded-lg",
      "shadow-md"
    );
  });
});
