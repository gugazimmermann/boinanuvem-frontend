import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Cta } from "../Cta";

vi.mock("../ui", () => ({
  Section: vi.fn(({ children, className }: { children?: React.ReactNode; className?: string }) => (
    <section className={className}>{children}</section>
  )),
  Heading: vi.fn(
    ({
      children,
      className,
    }: {
      children?: React.ReactNode;
      level?: number;
      color?: string;
      className?: string;
    }) => <h2 className={className}>{children}</h2>
  ),
  Button: vi.fn(
    ({
      children,
      href,
      size,
      variant,
    }: {
      children?: React.ReactNode;
      href?: string;
      size?: string;
      variant?: string;
    }) => (
      <a href={href} data-size={size} data-variant={variant}>
        {children}
      </a>
    )
  ),
  Badge: vi.fn(
    ({
      children,
      color,
      className,
    }: {
      children?: React.ReactNode;
      color?: string;
      className?: string;
    }) => (
      <span className={className} data-color={color}>
        {children}
      </span>
    )
  ),
}));

vi.mock("../constants", () => ({
  COLORS: {
    secondary: "secondary-color",
  },
}));

vi.mock("../../routes.config", () => ({
  ROUTES: {
    REGISTER: "/register",
  },
}));

describe("Cta", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render badge with company name", () => {
    render(<Cta />);
    expect(screen.getByText("Boi na Nuvem")).toBeInTheDocument();
  });

  it("should render heading", () => {
    render(<Cta />);
    expect(screen.getByText(/Transforme a gestão da sua fazenda/i)).toBeInTheDocument();
  });

  it("should render description text", () => {
    render(<Cta />);
    expect(screen.getByText(/Experimente a melhor solução/i)).toBeInTheDocument();
  });

  it("should render call-to-action button", () => {
    render(<Cta />);
    const button = screen.getByText("Começar Agora");
    expect(button).toBeInTheDocument();
    const link = button.closest("a");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href");
  });

  it("should apply correct classes to Section", async () => {
    const { Section } = await import("../ui");
    render(<Cta />);
    const calls = vi.mocked(Section).mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    const firstCall = calls[0];
    expect(firstCall[0]).toHaveProperty("className");
    expect(firstCall[0].className).toContain("bg-gradient-to-br");
  });

  it("should apply correct props to Badge", async () => {
    const { Badge } = await import("../ui");
    render(<Cta />);
    const calls = vi.mocked(Badge).mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    const firstCall = calls[0];
    expect(firstCall[0]).toHaveProperty("color", "secondary-color");
    expect(firstCall[0]).toHaveProperty("className");
    expect(firstCall[0].className).toContain("mb-4");
  });

  it("should apply correct props to Button", async () => {
    const { Button } = await import("../ui");
    render(<Cta />);
    const calls = vi.mocked(Button).mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    const firstCall = calls[0];
    expect(firstCall[0]).toHaveProperty("href");
    expect(firstCall[0]).toHaveProperty("size", "lg");
    expect(firstCall[0]).toHaveProperty("variant", "primary");
  });
});
