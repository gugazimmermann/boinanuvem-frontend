import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResponsibleSelectionSection } from "../responsible-selection-section";
import { LanguageProvider } from "~/contexts/language-context";
import { mockEmployees } from "~/mocks/employees";
import { mockServiceProviders } from "~/mocks/service-providers";

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

describe("ResponsibleSelectionSection", () => {
  const testEmployees = [mockEmployees[0], mockEmployees[1]];
  const testServiceProviders = [mockServiceProviders[0], mockServiceProviders[1]];

  const defaultProps = {
    employees: [],
    serviceProviders: [],
    selectedEmployeeIds: [],
    selectedServiceProviderIds: [],
    onToggleEmployee: vi.fn(),
    onToggleServiceProvider: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render employees label", () => {
    render(
      <TestWrapper>
        <ResponsibleSelectionSection {...defaultProps} />
      </TestWrapper>
    );
    // Check for label element
    const labels = screen.getAllByText(/employee/i);
    expect(labels.length).toBeGreaterThan(0);
  });

  it("should render service providers label", () => {
    render(
      <TestWrapper>
        <ResponsibleSelectionSection {...defaultProps} />
      </TestWrapper>
    );
    // Check for label element
    const labels = screen.getAllByText(/service provider/i);
    expect(labels.length).toBeGreaterThan(0);
  });

  it("should display no employees message when employees array is empty", () => {
    const { container } = render(
      <TestWrapper>
        <ResponsibleSelectionSection {...defaultProps} employees={[]} />
      </TestWrapper>
    );
    const message = container.querySelector(".text-sm.text-gray-500");
    expect(message).toBeInTheDocument();
  });

  it("should display no service providers message when service providers array is empty", () => {
    const { container } = render(
      <TestWrapper>
        <ResponsibleSelectionSection {...defaultProps} serviceProviders={[]} />
      </TestWrapper>
    );
    const messages = container.querySelectorAll(".text-sm.text-gray-500");
    expect(messages.length).toBeGreaterThan(0);
  });

  it("should render employee checkboxes when employees are provided", () => {
    render(
      <TestWrapper>
        <ResponsibleSelectionSection {...defaultProps} employees={testEmployees} />
      </TestWrapper>
    );
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBe(2);
  });

  it("should render service provider checkboxes when service providers are provided", () => {
    render(
      <TestWrapper>
        <ResponsibleSelectionSection {...defaultProps} serviceProviders={testServiceProviders} />
      </TestWrapper>
    );
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBe(2);
  });

  it("should display employee names", () => {
    render(
      <TestWrapper>
        <ResponsibleSelectionSection {...defaultProps} employees={testEmployees} />
      </TestWrapper>
    );
    expect(screen.getByText(testEmployees[0].name)).toBeInTheDocument();
    expect(screen.getByText(testEmployees[1].name)).toBeInTheDocument();
  });

  it("should display service provider names", () => {
    render(
      <TestWrapper>
        <ResponsibleSelectionSection {...defaultProps} serviceProviders={testServiceProviders} />
      </TestWrapper>
    );
    expect(screen.getByText(testServiceProviders[0].name)).toBeInTheDocument();
    expect(screen.getByText(testServiceProviders[1].name)).toBeInTheDocument();
  });

  it("should check employee checkbox when employee is selected", () => {
    render(
      <TestWrapper>
        <ResponsibleSelectionSection
          {...defaultProps}
          employees={testEmployees}
          selectedEmployeeIds={[testEmployees[0].id]}
        />
      </TestWrapper>
    );
    const checkboxes = screen.getAllByRole("checkbox");
    const employeeCheckbox = checkboxes.find((cb) => (cb as HTMLInputElement).checked);
    expect(employeeCheckbox).toBeChecked();
  });

  it("should check service provider checkbox when service provider is selected", () => {
    render(
      <TestWrapper>
        <ResponsibleSelectionSection
          {...defaultProps}
          serviceProviders={testServiceProviders}
          selectedServiceProviderIds={[testServiceProviders[0].id]}
        />
      </TestWrapper>
    );
    const checkboxes = screen.getAllByRole("checkbox");
    const providerCheckbox = checkboxes.find((cb) => (cb as HTMLInputElement).checked);
    expect(providerCheckbox).toBeChecked();
  });

  it("should call onToggleEmployee when employee checkbox is clicked", async () => {
    const onToggleEmployee = vi.fn();
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <ResponsibleSelectionSection
          {...defaultProps}
          employees={testEmployees}
          onToggleEmployee={onToggleEmployee}
        />
      </TestWrapper>
    );
    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[0]);
    expect(onToggleEmployee).toHaveBeenCalledWith(testEmployees[0].id);
  });

  it("should call onToggleServiceProvider when service provider checkbox is clicked", async () => {
    const onToggleServiceProvider = vi.fn();
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <ResponsibleSelectionSection
          {...defaultProps}
          serviceProviders={testServiceProviders}
          onToggleServiceProvider={onToggleServiceProvider}
        />
      </TestWrapper>
    );
    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[0]);
    expect(onToggleServiceProvider).toHaveBeenCalledWith(testServiceProviders[0].id);
  });

  it("should display error message when error is provided", () => {
    render(
      <TestWrapper>
        <ResponsibleSelectionSection {...defaultProps} error="Responsible selection is required" />
      </TestWrapper>
    );
    expect(screen.getByText("Responsible selection is required")).toBeInTheDocument();
  });

  it("should disable checkboxes when disabled prop is true", () => {
    render(
      <TestWrapper>
        <ResponsibleSelectionSection
          {...defaultProps}
          employees={testEmployees}
          serviceProviders={testServiceProviders}
          disabled={true}
        />
      </TestWrapper>
    );
    const checkboxes = screen.getAllByRole("checkbox");
    checkboxes.forEach((checkbox) => {
      expect(checkbox).toBeDisabled();
    });
  });

  it("should apply custom className", () => {
    const { container } = render(
      <TestWrapper>
        <ResponsibleSelectionSection {...defaultProps} className="custom-class" />
      </TestWrapper>
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("custom-class");
  });

  it("should use custom translation keys when provided", () => {
    render(
      <TestWrapper>
        <ResponsibleSelectionSection
          {...defaultProps}
          translationKeys={{
            employeesLabel: "Custom Employees",
            serviceProvidersLabel: "Custom Providers",
            noEmployees: "No custom employees",
            noServiceProviders: "No custom providers",
          }}
        />
      </TestWrapper>
    );
    expect(screen.getByText("Custom Employees")).toBeInTheDocument();
    expect(screen.getByText("Custom Providers")).toBeInTheDocument();
  });

  it("should render both employees and service providers", () => {
    render(
      <TestWrapper>
        <ResponsibleSelectionSection
          {...defaultProps}
          employees={testEmployees}
          serviceProviders={testServiceProviders}
        />
      </TestWrapper>
    );
    expect(screen.getByText(testEmployees[0].name)).toBeInTheDocument();
    expect(screen.getByText(testServiceProviders[0].name)).toBeInTheDocument();
  });
});
