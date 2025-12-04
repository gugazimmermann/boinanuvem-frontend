import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PropertyFilter } from "../property-filter";
import { LanguageProvider } from "~/contexts/language-context";
import { mockProperties } from "~/mocks/properties";

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    reproductiveIndexes: {
      propertyLabel: "Property",
      allProperties: "All Properties",
    },
  })),
}));

describe("PropertyFilter", () => {
  const defaultProps = {
    value: "all",
    onChange: vi.fn(),
    properties: mockProperties.slice(0, 2),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render property filter", () => {
    render(
      <TestWrapper>
        <PropertyFilter {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Property:")).toBeInTheDocument();
  });

  it("should render all properties option", () => {
    render(
      <TestWrapper>
        <PropertyFilter {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("All Properties")).toBeInTheDocument();
  });

  it("should render property options", () => {
    render(
      <TestWrapper>
        <PropertyFilter {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText(mockProperties[0].name)).toBeInTheDocument();
    expect(screen.getByText(mockProperties[1].name)).toBeInTheDocument();
  });

  it("should call onChange when property is selected", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <PropertyFilter {...defaultProps} onChange={onChange} />
      </TestWrapper>
    );
    const select = screen.getByRole("combobox");
    await user.selectOptions(select, mockProperties[0].id);
    expect(onChange).toHaveBeenCalledWith(mockProperties[0].id);
  });

  it("should use custom labels when provided", () => {
    render(
      <TestWrapper>
        <PropertyFilter {...defaultProps} label="Custom Property" allPropertiesLabel="All Custom" />
      </TestWrapper>
    );
    expect(screen.getByText("Custom Property:")).toBeInTheDocument();
    expect(screen.getByText("All Custom")).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(
      <TestWrapper>
        <PropertyFilter {...defaultProps} className="custom-class" />
      </TestWrapper>
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
