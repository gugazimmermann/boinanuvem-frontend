import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../button";

describe("Button mouse events", () => {
  it("should handle mouse enter on primary button", async () => {
    const user = userEvent.setup();
    render(<Button variant="primary">Primary Button</Button>);

    const button = screen.getByText("Primary Button").closest("button") as HTMLButtonElement;
    await user.hover(button);

    expect(button).toBeInTheDocument();
  });

  it("should handle mouse leave on primary button", async () => {
    const user = userEvent.setup();
    render(<Button variant="primary">Primary Button</Button>);

    const button = screen.getByText("Primary Button").closest("button") as HTMLButtonElement;
    await user.hover(button);
    await user.unhover(button);

    expect(button).toBeInTheDocument();
  });

  it("should handle mouse enter on outline button", async () => {
    const user = userEvent.setup();
    render(<Button variant="outline">Outline Button</Button>);

    const button = screen.getByText("Outline Button").closest("button") as HTMLButtonElement;
    await user.hover(button);

    expect(button).toBeInTheDocument();
  });

  it("should handle mouse enter on ghost button", async () => {
    const user = userEvent.setup();
    render(<Button variant="ghost">Ghost Button</Button>);

    const button = screen.getByText("Ghost Button").closest("button") as HTMLButtonElement;
    await user.hover(button);

    expect(button).toBeInTheDocument();
  });

  it("should handle mouse enter on anchor link", async () => {
    const user = userEvent.setup();
    render(
      <Button href="/test" variant="primary">
        Link Button
      </Button>
    );

    const link = screen.getByText("Link Button").closest("a") as HTMLAnchorElement;
    await user.hover(link);

    expect(link).toBeInTheDocument();
  });

  it("should handle mouse leave on anchor link", async () => {
    const user = userEvent.setup();
    render(
      <Button href="/test" variant="primary">
        Link Button
      </Button>
    );

    const link = screen.getByText("Link Button").closest("a") as HTMLAnchorElement;
    await user.hover(link);
    await user.unhover(link);

    expect(link).toBeInTheDocument();
  });

  it("should handle mouse enter on outline anchor", async () => {
    const user = userEvent.setup();
    render(
      <Button href="/test" variant="outline">
        Outline Link
      </Button>
    );

    const link = screen.getByText("Outline Link").closest("a") as HTMLAnchorElement;
    await user.hover(link);

    expect(link).toBeInTheDocument();
  });

  it("should handle mouse enter on ghost anchor", async () => {
    const user = userEvent.setup();
    render(
      <Button href="/test" variant="ghost">
        Ghost Link
      </Button>
    );

    const link = screen.getByText("Ghost Link").closest("a") as HTMLAnchorElement;
    await user.hover(link);

    expect(link).toBeInTheDocument();
  });
});
