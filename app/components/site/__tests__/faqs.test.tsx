import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FAQs } from "../faqs";
import { FAQS } from "../constants";

describe("FAQs", () => {
  it("should render heading", () => {
    render(<FAQs />);
    expect(screen.getByText(/Perguntas/)).toBeInTheDocument();
    expect(screen.getByText(/Frequentes/)).toBeInTheDocument();
  });

  it("should render description", () => {
    render(<FAQs />);
    expect(screen.getByText(/Tire suas dúvidas sobre o Boi na Nuvem/)).toBeInTheDocument();
  });

  it("should render all FAQ questions", () => {
    render(<FAQs />);
    FAQS.forEach((faq) => {
      expect(screen.getByText(faq.question)).toBeInTheDocument();
    });
  });

  it("should not show answers initially", () => {
    render(<FAQs />);
    FAQS.forEach((faq) => {
      const answer = screen.queryByText(faq.answer);
      expect(answer).not.toBeInTheDocument();
    });
  });

  it("should show answer when question is clicked", async () => {
    const user = userEvent.setup();
    render(<FAQs />);

    const firstQuestion = screen.getByText(FAQS[0].question);
    await user.click(firstQuestion);

    expect(screen.getByText(FAQS[0].answer)).toBeInTheDocument();
  });

  it("should hide answer when question is clicked again", async () => {
    const user = userEvent.setup();
    render(<FAQs />);

    const firstQuestion = screen.getByText(FAQS[0].question);
    await user.click(firstQuestion);
    expect(screen.getByText(FAQS[0].answer)).toBeInTheDocument();

    await user.click(firstQuestion);
    expect(screen.queryByText(FAQS[0].answer)).not.toBeInTheDocument();
  });

  it("should show only one answer at a time", async () => {
    const user = userEvent.setup();
    render(<FAQs />);

    const firstQuestion = screen.getByText(FAQS[0].question);
    const secondQuestion = screen.getByText(FAQS[1].question);

    await user.click(firstQuestion);
    expect(screen.getByText(FAQS[0].answer)).toBeInTheDocument();
    expect(screen.queryByText(FAQS[1].answer)).not.toBeInTheDocument();

    await user.click(secondQuestion);
    expect(screen.queryByText(FAQS[0].answer)).not.toBeInTheDocument();
    expect(screen.getByText(FAQS[1].answer)).toBeInTheDocument();
  });

  it("should render image on large screens", () => {
    const { container } = render(<FAQs />);
    const imageContainer = container.querySelector("div.hidden.lg\\:block");
    expect(imageContainer).toBeInTheDocument();
  });
});
