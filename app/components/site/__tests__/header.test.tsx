import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Header } from "../header";

describe("Header", () => {
  it("should render header", () => {
    render(<Header />);
    expect(screen.getByText("Boi na Nuvem")).toBeInTheDocument();
  });

  it("should render navigation links", () => {
    render(<Header />);
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);
  });

  it("should render CTA button", () => {
    render(<Header />);
    expect(screen.getByText("Começar")).toBeInTheDocument();
  });

  it("should render mobile menu button", () => {
    render(<Header />);
    const menuButton = screen.getByLabelText("Toggle menu");
    expect(menuButton).toBeInTheDocument();
  });
});
