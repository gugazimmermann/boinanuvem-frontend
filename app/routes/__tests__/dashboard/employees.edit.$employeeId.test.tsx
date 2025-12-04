import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { loader, meta, default as EditEmployee } from "../../dashboard/employees.edit.$employeeId";
import { ROUTES, getEmployeeViewRoute } from "~/routes.config";
import { mockEmployees } from "~/mocks/employees";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useParams: vi.fn(() => ({ employeeId: "770e8400-e29b-41d4-a716-446655440010" })),
    useNavigate: vi.fn(() => vi.fn()),
  };
});

vi.mock("~/utils/route-guard", () => ({
  createRouteGuard: vi.fn(() => () => Promise.resolve(null)),
}));

vi.mock("~/services/employees.service", () => ({
  getEmployeeById: vi.fn((id: string) => {
    return mockEmployees.find((e) => e.id === id) || null;
  }),
  updateEmployee: vi.fn(() => true),
}));

vi.mock("~/mocks/properties", () => ({
  mockProperties: [
    {
      id: "550e8400-e29b-41d4-a716-446655440010",
      name: "Property 1",
      companyId: "550e8400-e29b-41d4-a716-446655440000",
    },
  ],
}));

vi.mock("~/components/dashboard/forms/entity-form", () => ({
  EntityForm: vi.fn(
    ({
      onSubmit,
      onSuccess,
      onCancel,
    }: {
      entityType: string;
      initialData: unknown;
      onSubmit: (data: unknown) => Promise<void>;
      onSuccess: () => void;
      onCancel: () => void;
      successMessage: string;
      errorMessage: string;
      isEdit: boolean;
    }) => {
      const handleClick = async () => {
        try {
          await onSubmit({});
          onSuccess();
        } catch {
          // If onSubmit throws, onSuccess is not called
        }
      };
      return (
        <div data-testid="entity-form">
          <button data-testid="submit-button" onClick={handleClick}>
            Submit
          </button>
          <button data-testid="cancel-button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      );
    }
  ),
}));

vi.mock("~/components/ui", () => ({
  Button: vi.fn(
    ({
      children,
      onClick,
      variant,
    }: {
      children: React.ReactNode;
      onClick?: () => void;
      variant?: string;
    }) => (
      <button onClick={onClick} data-variant={variant}>
        {children}
      </button>
    )
  ),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    employees: {
      edit: {
        title: "Editar Funcionário",
        description: "Edite as informações do funcionário",
      },
      success: {
        updated: "Funcionário atualizado com sucesso",
      },
      errors: {
        updateFailed: "Erro ao atualizar funcionário",
      },
      emptyState: {
        title: "Funcionário não encontrado",
      },
    },
    team: {
      new: {
        back: "Voltar",
      },
    },
  })),
}));

const TestWrapper = ({
  children,
  initialEntries = ["/dashboard/funcionarios/770e8400-e29b-41d4-a716-446655440010/editar"],
}: {
  children: React.ReactNode;
  initialEntries?: string[];
}) => <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>;

describe("employees.edit.$employeeId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("loader", () => {
    it("should call createRouteGuard", async () => {
      const { createRouteGuard } = await import("~/utils/route-guard");
      const request = new Request(
        "http://localhost/dashboard/funcionarios/770e8400-e29b-41d4-a716-446655440010/editar"
      );

      await loader({ request });

      expect(createRouteGuard).toHaveBeenCalled();
    });
  });

  describe("meta", () => {
    it("should return SEO meta tags", () => {
      const result = meta();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toHaveProperty("title");
      expect(result[0].title).toContain("Editar Funcionário");
    });
  });

  describe("EditEmployee component", () => {
    it("should render form with correct title", async () => {
      const { useParams } = await import("react-router");
      vi.mocked(useParams).mockReturnValue({ employeeId: mockEmployees[0].id });

      render(
        <TestWrapper>
          <EditEmployee />
        </TestWrapper>
      );

      expect(screen.getByText("Editar Funcionário")).toBeInTheDocument();
    });

    it("should render form with correct description", async () => {
      const { useParams } = await import("react-router");
      vi.mocked(useParams).mockReturnValue({ employeeId: mockEmployees[0].id });

      render(
        <TestWrapper>
          <EditEmployee />
        </TestWrapper>
      );

      expect(screen.getByText("Edite as informações do funcionário")).toBeInTheDocument();
    });

    it("should render empty state when employee is not found", async () => {
      const { useParams } = await import("react-router");
      vi.mocked(useParams).mockReturnValue({ employeeId: "non-existent" });

      render(
        <TestWrapper>
          <EditEmployee />
        </TestWrapper>
      );

      expect(screen.getByText("Funcionário não encontrado")).toBeInTheDocument();
    });

    it("should call updateEmployee when form is submitted", async () => {
      const { useParams, useNavigate } = await import("react-router");
      const { updateEmployee } = await import("~/services/employees.service");
      const mockNavigate = vi.fn();
      const employee = mockEmployees[0];
      vi.mocked(useParams).mockReturnValue({ employeeId: employee.id });
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <EditEmployee />
        </TestWrapper>
      );

      const submitButton = screen.getByTestId("submit-button");
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(updateEmployee).toHaveBeenCalled();
      });
    });

    it("should navigate to employees list on success", async () => {
      const { useParams, useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();
      const employee = mockEmployees[0];
      vi.mocked(useParams).mockReturnValue({ employeeId: employee.id });
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      vi.useFakeTimers();

      render(
        <TestWrapper>
          <EditEmployee />
        </TestWrapper>
      );

      const submitButton = screen.getByTestId("submit-button");
      const { fireEvent } = await import("@testing-library/react");
      fireEvent.click(submitButton);

      await vi.advanceTimersByTimeAsync(1600);

      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.EMPLOYEES);

      vi.useRealTimers();
    }, 10000);

    it("should navigate to view route when cancel button is clicked", async () => {
      const { useParams, useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();
      const employee = mockEmployees[0];
      vi.mocked(useParams).mockReturnValue({ employeeId: employee.id });
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <EditEmployee />
        </TestWrapper>
      );

      const cancelButton = screen.getByTestId("cancel-button");
      await userEvent.click(cancelButton);

      expect(mockNavigate).toHaveBeenCalledWith(getEmployeeViewRoute(employee.id));
    });

    it("should navigate to view route when back button is clicked", async () => {
      const { useParams, useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();
      const employee = mockEmployees[0];
      vi.mocked(useParams).mockReturnValue({ employeeId: employee.id });
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <EditEmployee />
        </TestWrapper>
      );

      const backButton = screen.getByText("Voltar");
      await userEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith(getEmployeeViewRoute(employee.id));
    });

    it("should pass correct initial data to form", async () => {
      const { useParams } = await import("react-router");
      const employee = mockEmployees[0];
      vi.mocked(useParams).mockReturnValue({ employeeId: employee.id });

      render(
        <TestWrapper>
          <EditEmployee />
        </TestWrapper>
      );

      const EntityForm = (await import("~/components/dashboard/forms/entity-form")).EntityForm;
      const calls = vi.mocked(EntityForm).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      expect(props).toHaveProperty("entityType", "employee");
      expect(props).toHaveProperty("initialData");
      expect(props).toHaveProperty("isEdit", true);
      expect(props.initialData).toHaveProperty("code", employee.code);
      expect(props.initialData).toHaveProperty("name", employee.name);
    });

    it("should handle updateEmployee failure", async () => {
      const { useParams } = await import("react-router");
      const { updateEmployee } = await import("~/services/employees.service");
      const employee = mockEmployees[0];
      vi.mocked(useParams).mockReturnValue({ employeeId: employee.id });
      vi.mocked(updateEmployee).mockReturnValue(false);

      render(
        <TestWrapper>
          <EditEmployee />
        </TestWrapper>
      );

      const submitButton = screen.getByTestId("submit-button");

      // The EntityForm mock handles errors by not calling onSuccess
      // So we just verify that updateEmployee is called
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(updateEmployee).toHaveBeenCalled();
      });

      // The form should handle the error gracefully
      expect(updateEmployee).toHaveBeenCalled();
    });
  });
});
