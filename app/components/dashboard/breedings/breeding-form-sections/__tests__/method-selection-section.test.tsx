import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MethodSelectionSection } from "../method-selection-section";
import { LanguageProvider } from "~/contexts/language-context";

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

describe("MethodSelectionSection", () => {
  const defaultProps = {
    selectedMethod: "" as const,
    onMethodChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render title", () => {
    render(
      <TestWrapper>
        <MethodSelectionSection {...defaultProps} />
      </TestWrapper>
    );
    // Check for heading element with method title
    const headings = screen.getAllByRole("heading");
    expect(headings.some((h) => h.textContent?.toLowerCase().includes("method"))).toBe(true);
  });

  it("should render natural method radio option", () => {
    render(
      <TestWrapper>
        <MethodSelectionSection {...defaultProps} />
      </TestWrapper>
    );
    const naturalRadio = screen.getByRole("radio", { name: /natural/i });
    expect(naturalRadio).toBeInTheDocument();
  });

  it("should render artificial insemination method radio option", () => {
    render(
      <TestWrapper>
        <MethodSelectionSection {...defaultProps} />
      </TestWrapper>
    );
    const aiRadio = screen.getByRole("radio", { name: /artificial insemination/i });
    expect(aiRadio).toBeInTheDocument();
  });

  it("should check natural radio when selectedMethod is natural", () => {
    render(
      <TestWrapper>
        <MethodSelectionSection {...defaultProps} selectedMethod="natural" />
      </TestWrapper>
    );
    const naturalRadio = screen.getByRole("radio", { name: /natural/i });
    expect(naturalRadio).toBeChecked();
  });

  it("should check artificial insemination radio when selectedMethod is artificial_insemination", () => {
    render(
      <TestWrapper>
        <MethodSelectionSection {...defaultProps} selectedMethod="artificial_insemination" />
      </TestWrapper>
    );
    const aiRadio = screen.getByRole("radio", { name: /artificial insemination/i });
    expect(aiRadio).toBeChecked();
  });

  it("should call onMethodChange when natural radio is clicked", async () => {
    const onMethodChange = vi.fn();
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <MethodSelectionSection {...defaultProps} onMethodChange={onMethodChange} />
      </TestWrapper>
    );
    const naturalRadio = screen.getByRole("radio", { name: /natural/i });
    await user.click(naturalRadio);
    expect(onMethodChange).toHaveBeenCalledWith("natural");
  });

  it("should call onMethodChange when artificial insemination radio is clicked", async () => {
    const onMethodChange = vi.fn();
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <MethodSelectionSection {...defaultProps} onMethodChange={onMethodChange} />
      </TestWrapper>
    );
    const aiRadio = screen.getByRole("radio", { name: /artificial insemination/i });
    await user.click(aiRadio);
    expect(onMethodChange).toHaveBeenCalledWith("artificial_insemination");
  });

  it("should display error message when error is provided", () => {
    render(
      <TestWrapper>
        <MethodSelectionSection {...defaultProps} error="Method selection is required" />
      </TestWrapper>
    );
    expect(screen.getByText("Method selection is required")).toBeInTheDocument();
  });

  it("should disable radio buttons when disabled prop is true", () => {
    render(
      <TestWrapper>
        <MethodSelectionSection {...defaultProps} disabled={true} />
      </TestWrapper>
    );
    const radios = screen.getAllByRole("radio");
    radios.forEach((radio) => {
      expect(radio).toBeDisabled();
    });
  });

  it("should not check any radio when selectedMethod is empty", () => {
    render(
      <TestWrapper>
        <MethodSelectionSection {...defaultProps} selectedMethod="" />
      </TestWrapper>
    );
    const radios = screen.getAllByRole("radio");
    radios.forEach((radio) => {
      expect(radio).not.toBeChecked();
    });
  });
});
