import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FAQs } from "../faqs";

describe("FAQs", () => {
  it("should render FAQs section", () => {
    render(<FAQs />);
    const faqTexts = screen.getAllByText((content, element) => {
      return element?.textContent?.toLowerCase().includes("perguntas") || false;
    });
    expect(faqTexts.length).toBeGreaterThan(0);
  });

  it("should render heading", () => {
    render(<FAQs />);
    const faqTexts = screen.getAllByText((content, element) => {
      return element?.textContent?.toLowerCase().includes("perguntas") || false;
    });
    expect(faqTexts.length).toBeGreaterThan(0);
  });

  it("should render description", () => {
    render(<FAQs />);
    expect(screen.getByText(/Tire suas dúvidas sobre o Boi na Nuvem/i)).toBeInTheDocument();
  });

  it("should render FAQ items", () => {
    render(<FAQs />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("should toggle FAQ on click", async () => {
    const user = userEvent.setup();
    render(<FAQs />);
    const buttons = screen.getAllByRole("button");
    const firstButton = buttons[0];

    expect(firstButton.textContent).toContain("+");

    await user.click(firstButton);
    expect(firstButton.textContent).toContain("−");

    await user.click(firstButton);
    expect(firstButton.textContent).toContain("+");
  });

  it("should show answer when FAQ is open", async () => {
    const user = userEvent.setup();
    render(<FAQs />);
    const buttons = screen.getAllByRole("button");
    const firstButton = buttons[0];

    await user.click(firstButton);
    const answer = firstButton.parentElement?.nextElementSibling;
    expect(answer).toBeInTheDocument();
  });

  it("should close other FAQs when opening a new one", async () => {
    const user = userEvent.setup();
    render(<FAQs />);
    const buttons = screen.getAllByRole("button");

    await user.click(buttons[0]);
    expect(buttons[0].textContent).toContain("−");

    await user.click(buttons[1]);
    expect(buttons[0].textContent).toContain("+");
    expect(buttons[1].textContent).toContain("−");
  });
});
