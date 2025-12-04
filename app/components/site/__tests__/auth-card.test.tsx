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

  it("should render with default maxWidth sm", () => {
    const { container } = render(<AuthCard>Test</AuthCard>);
    const card = container.querySelector("div");
    expect(card).toHaveClass("max-w-sm");
  });

  it("should render with md maxWidth", () => {
    const { container } = render(<AuthCard maxWidth="md">Test</AuthCard>);
    const card = container.querySelector("div");
    expect(card).toHaveClass("max-w-md");
  });

  it("should render with lg maxWidth", () => {
    const { container } = render(<AuthCard maxWidth="lg">Test</AuthCard>);
    const card = container.querySelector("div");
    expect(card).toHaveClass("max-w-lg");
  });

  it("should render with xl maxWidth", () => {
    const { container } = render(<AuthCard maxWidth="xl">Test</AuthCard>);
    const card = container.querySelector("div");
    expect(card).toHaveClass("max-w-xl");
  });

  it("should render with 2xl maxWidth", () => {
    const { container } = render(<AuthCard maxWidth="2xl">Test</AuthCard>);
    const card = container.querySelector("div");
    expect(card).toHaveClass("max-w-2xl");
  });

  it("should render title when provided", () => {
    render(<AuthCard title="Test Title">Content</AuthCard>);
    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  it("should not render title when not provided", () => {
    render(<AuthCard>Content</AuthCard>);
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("should render subtitle when provided", () => {
    render(<AuthCard subtitle="Test Subtitle">Content</AuthCard>);
    expect(screen.getByText("Test Subtitle")).toBeInTheDocument();
  });

  it("should not render subtitle when not provided", () => {
    const { container } = render(<AuthCard>Content</AuthCard>);
    const subtitle = container.querySelector("p.text-gray-500");
    expect(subtitle).not.toBeInTheDocument();
  });

  it("should render footer when provided", () => {
    render(<AuthCard footer={<div>Footer Content</div>}>Content</AuthCard>);
    expect(screen.getByText("Footer Content")).toBeInTheDocument();
  });

  it("should not render footer when not provided", () => {
    const { container } = render(<AuthCard>Content</AuthCard>);
    // Footer would be in the card structure, but we can check it's not rendered
    expect(container.textContent).not.toContain("Footer");
  });

  it("should render brand name", () => {
    render(<AuthCard>Content</AuthCard>);
    expect(screen.getByText("Boi na Nuvem")).toBeInTheDocument();
  });

  it("should apply correct base classes", () => {
    const { container } = render(<AuthCard>Test</AuthCard>);
    const card = container.querySelector("div");
    expect(card).toHaveClass("w-full");
    expect(card).toHaveClass("mx-auto");
    expect(card).toHaveClass("overflow-hidden");
    expect(card).toHaveClass("bg-white");
    expect(card).toHaveClass("rounded-lg");
    expect(card).toHaveClass("shadow-md");
  });

  it("should render title and subtitle together", () => {
    render(
      <AuthCard title="Title" subtitle="Subtitle">
        Content
      </AuthCard>
    );
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Subtitle")).toBeInTheDocument();
  });

  it("should render complex children", () => {
    render(
      <AuthCard>
        <div>Child 1</div>
        <div>Child 2</div>
      </AuthCard>
    );
    expect(screen.getByText("Child 1")).toBeInTheDocument();
    expect(screen.getByText("Child 2")).toBeInTheDocument();
  });
});
