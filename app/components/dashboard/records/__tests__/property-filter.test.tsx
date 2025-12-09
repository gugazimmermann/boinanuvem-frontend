import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PropertyFilter } from "../property-filter";
import { useTranslation } from "~/i18n";
import type { Property } from "~/types";

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(),
}));

describe("PropertyFilter", () => {
  const mockUseTranslation = vi.mocked(useTranslation);
  const mockProperties: Property[] = [
    { id: "1", name: "Property 1" } as Property,
    { id: "2", name: "Property 2" } as Property,
  ];

  const defaultProps = {
    value: "all",
    onChange: vi.fn(),
    properties: mockProperties,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTranslation.mockReturnValue({
      reproductiveIndexes: {
        propertyLabel: "Property",
        allProperties: "All Properties",
      },
    } as unknown as ReturnType<typeof useTranslation>);
  });

  it("should render select element", () => {
    render(<PropertyFilter {...defaultProps} />);
    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();
  });

  it("should render all properties option", () => {
    render(<PropertyFilter {...defaultProps} />);
    expect(screen.getByText("All Properties")).toBeInTheDocument();
  });

  it("should render all properties in select", () => {
    render(<PropertyFilter {...defaultProps} />);
    expect(screen.getByText("Property 1")).toBeInTheDocument();
    expect(screen.getByText("Property 2")).toBeInTheDocument();
  });

  it("should call onChange when selection changes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PropertyFilter {...defaultProps} onChange={onChange} />);

    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "1");

    expect(onChange).toHaveBeenCalled();
  });

  it("should display selected value", () => {
    render(<PropertyFilter {...defaultProps} value="1" />);
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("1");
  });

  it("should use default label from translation", () => {
    render(<PropertyFilter {...defaultProps} />);
    expect(screen.getByText("Property:")).toBeInTheDocument();
  });

  it("should use custom label when provided", () => {
    render(<PropertyFilter {...defaultProps} label="Custom Label" />);
    expect(screen.getByText("Custom Label:")).toBeInTheDocument();
  });

  it("should use custom all properties label when provided", () => {
    render(<PropertyFilter {...defaultProps} allPropertiesLabel="All Custom Properties" />);
    expect(screen.getByText("All Custom Properties")).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(<PropertyFilter {...defaultProps} className="custom-class" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("custom-class");
  });
});
