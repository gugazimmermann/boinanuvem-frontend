import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResponsibleSelectionSection } from "../responsible-selection-section";
import { useTranslation } from "~/i18n";
import type { Employee, ServiceProvider } from "~/types";

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(),
}));

describe("ResponsibleSelectionSection", () => {
  const mockUseTranslation = vi.mocked(useTranslation);
  const mockEmployees: Employee[] = [
    { id: "1", name: "Employee 1" } as Employee,
    { id: "2", name: "Employee 2" } as Employee,
  ];
  const mockServiceProviders: ServiceProvider[] = [
    { id: "1", name: "Provider 1" } as ServiceProvider,
    { id: "2", name: "Provider 2" } as ServiceProvider,
  ];

  const defaultProps = {
    employees: mockEmployees,
    serviceProviders: mockServiceProviders,
    selectedEmployeeIds: [],
    selectedServiceProviderIds: [],
    onToggleEmployee: vi.fn(),
    onToggleServiceProvider: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTranslation.mockReturnValue({
      breedings: {
        new: {
          employeesLabel: "Employees",
          serviceProvidersLabel: "Service Providers",
          noEmployees: "No employees",
          noServiceProviders: "No service providers",
        },
      },
    } as unknown as ReturnType<typeof useTranslation>);
  });

  it("should render employees and service providers labels", () => {
    render(<ResponsibleSelectionSection {...defaultProps} />);
    expect(screen.getByText("Employees")).toBeInTheDocument();
    expect(screen.getByText("Service Providers")).toBeInTheDocument();
  });

  it("should render all employees", () => {
    render(<ResponsibleSelectionSection {...defaultProps} />);
    expect(screen.getByText("Employee 1")).toBeInTheDocument();
    expect(screen.getByText("Employee 2")).toBeInTheDocument();
  });

  it("should render all service providers", () => {
    render(<ResponsibleSelectionSection {...defaultProps} />);
    expect(screen.getByText("Provider 1")).toBeInTheDocument();
    expect(screen.getByText("Provider 2")).toBeInTheDocument();
  });

  it("should show checked state for selected employees", () => {
    render(<ResponsibleSelectionSection {...defaultProps} selectedEmployeeIds={["1"]} />);

    const checkbox = screen
      .getByText("Employee 1")
      .closest("label")
      ?.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(checkbox).toBeChecked();
  });

  it("should show unchecked state for unselected employees", () => {
    render(<ResponsibleSelectionSection {...defaultProps} />);

    const checkbox = screen
      .getByText("Employee 1")
      .closest("label")
      ?.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(checkbox).not.toBeChecked();
  });

  it("should call onToggleEmployee when employee checkbox is clicked", async () => {
    const user = userEvent.setup();
    const onToggleEmployee = vi.fn();
    render(<ResponsibleSelectionSection {...defaultProps} onToggleEmployee={onToggleEmployee} />);

    const label = screen.getByLabelText("Employee 1");
    await user.click(label);

    expect(onToggleEmployee).toHaveBeenCalledWith("1");
  });

  it("should call onToggleServiceProvider when provider checkbox is clicked", async () => {
    const user = userEvent.setup();
    const onToggleServiceProvider = vi.fn();
    render(
      <ResponsibleSelectionSection
        {...defaultProps}
        onToggleServiceProvider={onToggleServiceProvider}
      />
    );

    const label = screen.getByLabelText("Provider 1");
    await user.click(label);

    expect(onToggleServiceProvider).toHaveBeenCalledWith("1");
  });

  it("should show empty message when no employees", () => {
    render(<ResponsibleSelectionSection {...defaultProps} employees={[]} />);

    expect(screen.getByText("No employees")).toBeInTheDocument();
  });

  it("should show empty message when no service providers", () => {
    render(<ResponsibleSelectionSection {...defaultProps} serviceProviders={[]} />);

    expect(screen.getByText("No service providers")).toBeInTheDocument();
  });

  it("should disable checkboxes when disabled is true", () => {
    render(<ResponsibleSelectionSection {...defaultProps} disabled={true} />);

    const employeeCheckbox = screen
      .getByText("Employee 1")
      .closest("label")
      ?.querySelector('input[type="checkbox"]') as HTMLInputElement;
    const providerCheckbox = screen
      .getByText("Provider 1")
      .closest("label")
      ?.querySelector('input[type="checkbox"]') as HTMLInputElement;

    expect(employeeCheckbox).toBeDisabled();
    expect(providerCheckbox).toBeDisabled();
  });

  it("should render error message when error is provided", () => {
    render(<ResponsibleSelectionSection {...defaultProps} error="Selection required" />);
    expect(screen.getByText("Selection required")).toBeInTheDocument();
  });

  it("should use custom translation keys when provided", () => {
    render(
      <ResponsibleSelectionSection
        {...defaultProps}
        translationKeys={{
          employeesLabel: "Custom Employees",
          serviceProvidersLabel: "Custom Providers",
        }}
      />
    );

    expect(screen.getByText("Custom Employees")).toBeInTheDocument();
    expect(screen.getByText("Custom Providers")).toBeInTheDocument();
  });
});
