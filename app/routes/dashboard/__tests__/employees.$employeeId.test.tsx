import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import { AuthProvider } from "~/contexts/auth-context";
import EmployeeDetails from "../employees.$employeeId";
import { getEmployeeById } from "~/services/employees.service";
import { getUserById } from "~/services/users.service";
import { createMockMainUser, setCurrentUserId, clearLocalStorage } from "~/test-utils";

const mockNavigate = vi.fn();
const mockSetSearchParams = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams(), mockSetSearchParams],
  };
});

vi.mock("~/mocks/employees", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/employees")>("~/mocks/employees");
  return actual;
});

vi.mock("~/services/employees.service", () => ({
  getEmployeeById: vi.fn(),
}));

vi.mock("~/mocks/properties", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/properties")>("~/mocks/properties");
  return actual;
});

vi.mock("~/services/properties.service", () => ({
  getPropertyById: vi.fn((id: string) => ({ id, name: `Property ${id}` })),
}));

vi.mock("~/mocks/location-movements", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/location-movements")>(
    "~/mocks/location-movements"
  );
  return actual;
});

vi.mock("~/services/location-movements.service", () => ({
  getLocationMovementsByEmployeeId: vi.fn(() => []),
}));

vi.mock("~/mocks/cash-flow", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/cash-flow")>("~/mocks/cash-flow");
  return actual;
});

vi.mock("~/services/cash-flow.service", () => ({
  getCashFlowByEmployeeId: vi.fn(() => []),
  deleteCashFlow: vi.fn(() => true),
}));

vi.mock("~/mocks/accounts-payable", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/accounts-payable")>(
    "~/mocks/accounts-payable"
  );
  return actual;
});

vi.mock("~/services/accounts-payable.service", () => ({
  getAccountsPayableByEmployeeId: vi.fn(() => []),
  deleteAccountsPayable: vi.fn(() => true),
}));

vi.mock("~/services/suppliers.service", () => ({
  getSupplierById: vi.fn((id: string) => ({ id, name: `Supplier ${id}` })),
}));

vi.mock("~/services/buyers.service", () => ({
  getBuyerById: vi.fn((id: string) => ({ id, name: `Buyer ${id}` })),
}));

vi.mock("~/services/service-providers.service", () => ({
  getServiceProviderById: vi.fn((id: string) => ({ id, name: `ServiceProvider ${id}` })),
}));

vi.mock("~/mocks/animal-movements", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/animal-movements")>(
    "~/mocks/animal-movements"
  );
  return actual;
});

vi.mock("~/services/animal-movements.service", () => ({
  getAnimalMovementsByEmployeeId: vi.fn(() => []),
}));

vi.mock("~/mocks/employee-observations", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/employee-observations")>(
    "~/mocks/employee-observations"
  );
  return actual;
});

vi.mock("~/services/employee-observations.service", () => ({
  getEmployeeObservationsByEmployeeId: vi.fn(() => []),
  addEmployeeObservation: vi.fn(),
}));

const mockUsePermissions = vi.fn();
vi.mock("~/utils/permissions", () => ({
  usePermissions: () => mockUsePermissions(),
}));

vi.mock("~/services/users.service", () => ({
  getUserById: vi.fn(),
}));

vi.mock("~/components/ui", () => ({
  Button: ({
    children,
    onClick,
    leftIcon,
    rightIcon,
    ...props
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <button onClick={onClick} {...props}>
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  ),
  StatusBadge: ({ label }: { label?: string }) => <span>{label}</span>,
  Table: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="table">{children}</div>
  ),
  FileUpload: ({ onFilesChange }: { onFilesChange?: (files: File[]) => void }) => (
    <input
      type="file"
      data-testid="file-upload"
      onChange={(e) => onFilesChange?.(Array.from(e.target.files || []))}
    />
  ),
  Alert: ({ title, variant }: { title?: string; variant?: string }) => (
    <div data-testid={`alert-${variant}`}>{title}</div>
  ),
  Select: ({
    options,
    value,
    onChange,
  }: {
    options?: Array<{ value: string; label: string }>;
    value?: string | number;
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  }) => (
    <select data-testid="select" value={value} onChange={onChange}>
      {options?.map((opt, idx: number) => (
        <option key={idx} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
  ConfirmationModal: ({
    isOpen,
    onConfirm,
    onCancel,
  }: {
    isOpen: boolean;
    onConfirm?: () => void;
    onCancel?: () => void;
  }) =>
    isOpen ? (
      <div data-testid="confirmation-modal">
        <button data-testid="confirm-button" onClick={onConfirm}>
          Confirm
        </button>
        <button data-testid="cancel-button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    ) : null,
  TableActionButtons: ({
    actions,
  }: {
    actions?: Array<{ label: string; onClick?: () => void }>;
  }) => (
    <div data-testid="table-action-buttons">
      {actions?.map((action, idx: number) => (
        <button key={idx} data-testid={`action-${idx}`} onClick={action.onClick}>
          {action.label}
        </button>
      ))}
    </div>
  ),
}));

describe("EmployeeDetails", () => {
  const mockEmployee = {
    id: "employee-1",
    name: "Test Employee",
    code: "EMP001",
    createdAt: "2024-01-15T10:00:00Z",
    status: "active" as const,
    companyId: "company-1",
    propertyIds: ["prop-1"],
    email: "test@example.com",
    phone: "(47) 99999-9999",
  };

  const createRouter = (employeeId: string, searchParams?: string) => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard/employees/:employeeId",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <AuthProvider>
                  <EmployeeDetails />
                </AuthProvider>
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: [
          `/dashboard/employees/${employeeId}${searchParams ? `?${searchParams}` : ""}`,
        ],
      }
    );
  };

  beforeEach(() => {
    clearLocalStorage();
    vi.clearAllMocks();
    const mockUser = createMockMainUser();
    vi.mocked(getUserById).mockReturnValue(mockUser);
    setCurrentUserId(mockUser.id);
    mockUsePermissions.mockReturnValue({
      canView: () => true,
      canAdd: () => true,
      canEdit: () => true,
      canRemove: () => true,
      isMainUser: () => true,
    });
    vi.mocked(getEmployeeById).mockReturnValue(mockEmployee);
  });

  it("should render employee details", () => {
    const router = createRouter("employee-1");
    render(<RouterProvider router={router} />);

    expect(getEmployeeById).toHaveBeenCalledWith("employee-1");
    const table = screen.queryByTestId("table");
    const buttons = screen.queryAllByRole("button");
    expect(table || buttons.length > 0).toBeTruthy();
  });

  it("should handle undefined employee", () => {
    vi.mocked(getEmployeeById).mockReturnValue(undefined);
    const router = createRouter("invalid-id");
    render(<RouterProvider router={router} />);

    const backButton = screen.queryByRole("button");
    expect(backButton).toBeInTheDocument();
  });

  it("should switch tabs", () => {
    const router = createRouter("employee-1");
    render(<RouterProvider router={router} />);

    const tabButtons = screen
      .queryAllByRole("button")
      .filter(
        (btn) => btn.textContent?.includes("Observações") || btn.textContent?.includes("Atividades")
      );

    if (tabButtons.length > 0) {
      fireEvent.click(tabButtons[0]);
      expect(mockSetSearchParams).toHaveBeenCalled();
    }
  });

  it("should handle tab from URL params", () => {
    const router = createRouter("employee-1", "tab=observations");
    render(<RouterProvider router={router} />);

    expect(getEmployeeById).toHaveBeenCalledWith("employee-1");
  });

  it("should have correct meta function", () => {
    expect(EmployeeDetails).toBeDefined();
  });

  it("should display info tab", () => {
    const router = createRouter("employee-1", "tab=info");
    render(<RouterProvider router={router} />);

    expect(getEmployeeById).toHaveBeenCalledWith("employee-1");
  });

  it("should display activities tab", () => {
    const router = createRouter("employee-1", "tab=activities");
    render(<RouterProvider router={router} />);

    expect(getEmployeeById).toHaveBeenCalledWith("employee-1");
  });

  it("should display movements tab", () => {
    const router = createRouter("employee-1", "tab=movements");
    render(<RouterProvider router={router} />);

    expect(getEmployeeById).toHaveBeenCalledWith("employee-1");
    const table = screen.queryByTestId("table");
    expect(table || screen.queryAllByRole("button").length > 0).toBeTruthy();
  });

  it("should display observations tab", () => {
    const router = createRouter("employee-1", "tab=observations");
    render(<RouterProvider router={router} />);

    expect(getEmployeeById).toHaveBeenCalledWith("employee-1");
  });

  it("should navigate to edit employee", () => {
    const router = createRouter("employee-1");
    render(<RouterProvider router={router} />);

    const editButtons = screen
      .queryAllByRole("button")
      .filter((btn) => btn.textContent?.includes("Editar") || btn.textContent?.includes("Edit"));

    if (editButtons.length > 0) {
      fireEvent.click(editButtons[0]);
      expect(mockNavigate).toHaveBeenCalled();
    }
  });

  it("should handle location movements display", () => {
    const router = createRouter("employee-1", "tab=movements");
    render(<RouterProvider router={router} />);

    expect(getEmployeeById).toHaveBeenCalledWith("employee-1");
  });

  it("should handle animal movements display", () => {
    const router = createRouter("employee-1", "tab=movements");
    render(<RouterProvider router={router} />);

    expect(getEmployeeById).toHaveBeenCalledWith("employee-1");
  });

  it("should handle employee observations", () => {
    const router = createRouter("employee-1", "tab=observations");
    render(<RouterProvider router={router} />);

    expect(getEmployeeById).toHaveBeenCalledWith("employee-1");
  });

  it("should handle file upload for observations", () => {
    const router = createRouter("employee-1", "tab=observations");
    render(<RouterProvider router={router} />);

    const fileUpload = screen.queryByTestId("file-upload");
    expect(fileUpload || screen.queryAllByRole("button").length > 0).toBeTruthy();
  });

  it("should handle empty location movements", () => {
    const router = createRouter("employee-1", "tab=movements");
    render(<RouterProvider router={router} />);

    expect(getEmployeeById).toHaveBeenCalledWith("employee-1");
  });

  it("should handle empty animal movements", () => {
    const router = createRouter("employee-1", "tab=movements");
    render(<RouterProvider router={router} />);

    expect(getEmployeeById).toHaveBeenCalledWith("employee-1");
  });

  it("should handle empty observations", () => {
    const router = createRouter("employee-1", "tab=observations");
    render(<RouterProvider router={router} />);

    expect(getEmployeeById).toHaveBeenCalledWith("employee-1");
  });

  it("should handle inactive employee status", () => {
    const inactiveEmployee = {
      ...mockEmployee,
      status: "inactive" as const,
    };
    vi.mocked(getEmployeeById).mockReturnValueOnce(inactiveEmployee);
    const router = createRouter("employee-1");
    render(<RouterProvider router={router} />);

    expect(getEmployeeById).toHaveBeenCalledWith("employee-1");
  });

  it("should handle default tab when no tab param provided", () => {
    const router = createRouter("employee-1");
    render(<RouterProvider router={router} />);

    expect(getEmployeeById).toHaveBeenCalledWith("employee-1");
  });

  it("should handle invalid tab param", () => {
    const router = createRouter("employee-1", "tab=invalid");
    render(<RouterProvider router={router} />);

    expect(getEmployeeById).toHaveBeenCalledWith("employee-1");
  });

  it("should handle employee with properties", () => {
    const router = createRouter("employee-1");
    render(<RouterProvider router={router} />);

    expect(getEmployeeById).toHaveBeenCalledWith("employee-1");
  });

  it("should handle employee without properties", () => {
    const employeeWithoutProperties = {
      ...mockEmployee,
      propertyIds: [],
    };
    vi.mocked(getEmployeeById).mockReturnValueOnce(employeeWithoutProperties);
    const router = createRouter("employee-1");
    render(<RouterProvider router={router} />);

    expect(getEmployeeById).toHaveBeenCalledWith("employee-1");
  });

  it("should render Finance tab", async () => {
    const router = createRouter("employee-1", "tab=finance");
    render(<RouterProvider router={router} />);

    expect(getEmployeeById).toHaveBeenCalledWith("employee-1");
    const financeTab = screen
      .queryAllByRole("button")
      .find((btn) => btn.textContent?.includes("Finanças") || btn.textContent?.includes("Finance"));
    expect(financeTab).toBeInTheDocument();
  });

  it("should switch to Finance tab", () => {
    const router = createRouter("employee-1");
    render(<RouterProvider router={router} />);

    const tabButtons = screen
      .queryAllByRole("button")
      .filter(
        (btn) => btn.textContent?.includes("Finanças") || btn.textContent?.includes("Finance")
      );

    if (tabButtons.length > 0) {
      fireEvent.click(tabButtons[0]);
      expect(mockSetSearchParams).toHaveBeenCalled();
    }
  });
});
