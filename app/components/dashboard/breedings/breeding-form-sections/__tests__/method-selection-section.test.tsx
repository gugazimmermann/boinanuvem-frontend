import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MethodSelectionSection } from "../method-selection-section";
import { useTranslation } from "~/i18n";
import type { BreedingMethod } from "~/types";

vi.mock("~/i18n");

describe("MethodSelectionSection", () => {
  const mockUseTranslation = vi.mocked(useTranslation);
  const defaultProps = {
    selectedMethod: "" as BreedingMethod | "",
    onMethodChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTranslation.mockReturnValue({
      breedings: {
        new: {
          methodTitle: "Breeding Method",
          methodLabel: "Select Method",
          methodNatural: "Natural",
          methodAI: "Artificial Insemination",
        },
      },
    } as unknown as ReturnType<typeof useTranslation>);
  });

  it("should render method selection title", () => {
    render(<MethodSelectionSection {...defaultProps} />);
    expect(screen.getByText("Breeding Method")).toBeInTheDocument();
  });

  it("should render natural method option", () => {
    render(<MethodSelectionSection {...defaultProps} />);
    expect(screen.getByText("Natural")).toBeInTheDocument();
  });

  it("should render AI method option", () => {
    render(<MethodSelectionSection {...defaultProps} />);
    expect(screen.getByText("Artificial Insemination")).toBeInTheDocument();
  });

  it("should call onMethodChange when natural is selected", async () => {
    const user = userEvent.setup();
    const onMethodChange = vi.fn();
    render(<MethodSelectionSection {...defaultProps} onMethodChange={onMethodChange} />);

    const naturalRadio = screen.getByLabelText("Natural");
    await user.click(naturalRadio);

    expect(onMethodChange).toHaveBeenCalledWith("natural");
  });

  it("should call onMethodChange when AI is selected", async () => {
    const user = userEvent.setup();
    const onMethodChange = vi.fn();
    render(<MethodSelectionSection {...defaultProps} onMethodChange={onMethodChange} />);

    const aiRadio = screen.getByLabelText("Artificial Insemination");
    await user.click(aiRadio);

    expect(onMethodChange).toHaveBeenCalledWith("artificial_insemination");
  });

  it("should show natural as checked when selected", () => {
    render(<MethodSelectionSection {...defaultProps} selectedMethod="natural" />);
    const naturalRadio = screen.getByLabelText("Natural") as HTMLInputElement;
    expect(naturalRadio).toBeChecked();
  });

  it("should show AI as checked when selected", () => {
    render(<MethodSelectionSection {...defaultProps} selectedMethod="artificial_insemination" />);
    const aiRadio = screen.getByLabelText("Artificial Insemination") as HTMLInputElement;
    expect(aiRadio).toBeChecked();
  });

  it("should display error message when error is provided", () => {
    render(<MethodSelectionSection {...defaultProps} error="Method is required" />);
    expect(screen.getByText("Method is required")).toBeInTheDocument();
  });

  it("should disable radio buttons when disabled is true", () => {
    render(<MethodSelectionSection {...defaultProps} disabled={true} />);
    const naturalRadio = screen.getByLabelText("Natural") as HTMLInputElement;
    const aiRadio = screen.getByLabelText("Artificial Insemination") as HTMLInputElement;
    expect(naturalRadio).toBeDisabled();
    expect(aiRadio).toBeDisabled();
  });
});
