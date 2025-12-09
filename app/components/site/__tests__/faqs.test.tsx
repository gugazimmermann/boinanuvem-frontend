import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FAQs } from "../faqs";

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
    expect(screen.getByText("Como funciona o sistema Boi na Nuvem?")).toBeInTheDocument();
    expect(
      screen.getByText("Quais funcionalidades de gestão financeira estão disponíveis?")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Como funciona o sistema de análises e relatórios?")
    ).toBeInTheDocument();
  });

  it("should not show answers initially", () => {
    render(<FAQs />);
    const firstAnswer = screen.queryByText(
      /O Boi na Nuvem é um sistema completo de gestão para fazendas de gado de corte/
    );
    expect(firstAnswer).not.toBeInTheDocument();
  });

  it("should show answer when question is clicked", async () => {
    const user = userEvent.setup();
    render(<FAQs />);
    const firstQuestion = screen.getByText("Como funciona o sistema Boi na Nuvem?");

    await user.click(firstQuestion);

    expect(
      screen.getByText(
        /O Boi na Nuvem é um sistema completo de gestão para fazendas de gado de corte/
      )
    ).toBeInTheDocument();
  });

  it("should hide answer when question is clicked again", async () => {
    const user = userEvent.setup();
    render(<FAQs />);
    const firstQuestion = screen.getByText("Como funciona o sistema Boi na Nuvem?");

    await user.click(firstQuestion);
    await user.click(firstQuestion);

    const answer = screen.queryByText(
      /O Boi na Nuvem é um sistema completo de gestão para fazendas de gado de corte/
    );
    expect(answer).not.toBeInTheDocument();
  });

  it("should show plus icon when closed", () => {
    render(<FAQs />);
    const buttons = screen.getAllByText("+");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("should show minus icon when open", async () => {
    const user = userEvent.setup();
    render(<FAQs />);
    const firstQuestion = screen.getByText("Como funciona o sistema Boi na Nuvem?");

    await user.click(firstQuestion);

    const minusIcon = screen.getByText("−");
    expect(minusIcon).toBeInTheDocument();
  });

  it("should only show one answer at a time", async () => {
    const user = userEvent.setup();
    render(<FAQs />);
    const firstQuestion = screen.getByText("Como funciona o sistema Boi na Nuvem?");
    const secondQuestion = screen.getByText(
      "Quais funcionalidades de gestão financeira estão disponíveis?"
    );

    await user.click(firstQuestion);
    await user.click(secondQuestion);

    const firstAnswer = screen.queryByText(
      /O Boi na Nuvem é um sistema completo de gestão para fazendas de gado de corte/
    );
    const secondAnswer = screen.getByText(/O sistema oferece gestão financeira completa/);

    expect(firstAnswer).not.toBeInTheDocument();
    expect(secondAnswer).toBeInTheDocument();
  });

  it("should render dividers between FAQs", () => {
    render(<FAQs />);
    const dividers = screen
      .getAllByRole("generic")
      .filter(
        (el) => el.className.includes("border-t") && el.className.includes("border-gray-200")
      );
    expect(dividers.length).toBeGreaterThan(0);
  });
});
