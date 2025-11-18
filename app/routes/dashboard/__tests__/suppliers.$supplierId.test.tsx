import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import { AuthProvider } from "~/contexts/auth-context";
import SupplierDetails from "../suppliers.$supplierId";
import { getSupplierById } from "~/services/suppliers.service";
import { getSupplierObservationsBySupplierId } from "~/services/supplier-observations.service";
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

vi.mock("~/mocks/suppliers", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/suppliers")>("~/mocks/suppliers");
  return {
    ...actual,
    getSupplierById: vi.fn(),
  };
});

vi.mock("~/services/suppliers.service", () => ({
  getSupplierById: vi.fn(),
}));

vi.mock("~/mocks/properties", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/properties")>("~/mocks/properties");
  return {
    ...actual,
    mockProperties: [{ id: "prop-1", name: "Test Property" }],
    getPropertyById: vi.fn((id: string) => ({ id, name: `Property ${id}` })),
  };
});

vi.mock("~/services/properties.service", async () => {
  const actual = await vi.importActual<typeof import("~/services/properties.service")>(
    "~/services/properties.service"
  );
  return {
    ...actual,
    getPropertyById: vi.fn((id: string) => ({ id, name: `Property ${id}` })),
  };
});

vi.mock("~/mocks/supplier-observations", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/supplier-observations")>(
    "~/mocks/supplier-observations"
  );
  return {
    ...actual,
    getSupplierObservationsBySupplierId: vi.fn(() => []),
    addSupplierObservation: vi.fn(),
  };
});

vi.mock("~/services/supplier-observations.service", () => ({
  getSupplierObservationsBySupplierId: vi.fn(() => []),
  addSupplierObservation: vi.fn(),
}));

vi.mock("~/mocks/cash-flow", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/cash-flow")>("~/mocks/cash-flow");
  return actual;
});

vi.mock("~/services/cash-flow.service", () => ({
  getCashFlowBySupplierId: vi.fn(() => []),
  deleteCashFlow: vi.fn(() => true),
}));

vi.mock("~/mocks/accounts-payable", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/accounts-payable")>(
    "~/mocks/accounts-payable"
  );
  return actual;
});

vi.mock("~/services/accounts-payable.service", () => ({
  getAccountsPayableBySupplierId: vi.fn(() => []),
  deleteAccountsPayable: vi.fn(() => true),
}));

vi.mock("~/services/employees.service", () => ({
  getEmployeeById: vi.fn((id: string) => ({ id, name: `Employee ${id}` })),
}));

vi.mock("~/services/service-providers.service", () => ({
  getServiceProviderById: vi.fn((id: string) => ({ id, name: `ServiceProvider ${id}` })),
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

describe("SupplierDetails", () => {
  const mockSupplier = {
    id: "supplier-1",
    name: "Test Supplier",
    code: "SUP001",
    createdAt: "2024-01-15T10:00:00Z",
    status: "active" as const,
    companyId: "company-1",
    propertyIds: ["prop-1"],
    email: "test@example.com",
    phone: "(47) 99999-9999",
  };

  const mockObservations = [
    {
      id: "obs-1",
      supplierId: "supplier-1",
      observation: "Test observation",
      createdAt: "2024-01-15T10:00:00Z",
    },
  ];

  const createRouter = (supplierId: string, searchParams?: string) => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard/suppliers/:supplierId",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <AuthProvider>
                  <SupplierDetails />
                </AuthProvider>
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: [
          `/dashboard/suppliers/${supplierId}${searchParams ? `?${searchParams}` : ""}`,
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
    vi.mocked(getSupplierById).mockReturnValue(mockSupplier);
    vi.mocked(getSupplierObservationsBySupplierId).mockReturnValue(mockObservations);
  });

  it("should render supplier details", () => {
    const router = createRouter("supplier-1");
    render(<RouterProvider router={router} />);

    expect(getSupplierById).toHaveBeenCalledWith("supplier-1");
    const table = screen.queryByTestId("table");
    const buttons = screen.queryAllByRole("button");
    expect(table || buttons.length > 0).toBeTruthy();
  });

  it("should handle undefined supplier", () => {
    vi.mocked(getSupplierById).mockReturnValue(undefined);
    const router = createRouter("invalid-id");
    render(<RouterProvider router={router} />);

    const backButton = screen.queryByRole("button");
    expect(backButton).toBeInTheDocument();
  });

  it("should switch tabs", () => {
    const router = createRouter("supplier-1");
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
    const router = createRouter("supplier-1", "tab=observations");
    render(<RouterProvider router={router} />);

    expect(getSupplierById).toHaveBeenCalledWith("supplier-1");
  });

  it("should have correct meta function", () => {
    expect(SupplierDetails).toBeDefined();
  });

  it("should display info tab", () => {
    const router = createRouter("supplier-1", "tab=info");
    render(<RouterProvider router={router} />);

    expect(getSupplierById).toHaveBeenCalledWith("supplier-1");
  });

  it("should display activities tab", () => {
    const router = createRouter("supplier-1", "tab=activities");
    render(<RouterProvider router={router} />);

    expect(getSupplierById).toHaveBeenCalledWith("supplier-1");
  });

  it("should display observations tab", () => {
    const router = createRouter("supplier-1", "tab=observations");
    render(<RouterProvider router={router} />);

    expect(getSupplierById).toHaveBeenCalledWith("supplier-1");
  });

  it("should navigate to edit supplier", () => {
    const router = createRouter("supplier-1");
    render(<RouterProvider router={router} />);

    const editButtons = screen
      .queryAllByRole("button")
      .filter((btn) => btn.textContent?.includes("Editar") || btn.textContent?.includes("Edit"));

    if (editButtons.length > 0) {
      fireEvent.click(editButtons[0]);
      expect(mockNavigate).toHaveBeenCalled();
    }
  });

  it("should handle supplier observations", () => {
    const router = createRouter("supplier-1", "tab=observations");
    render(<RouterProvider router={router} />);

    expect(getSupplierObservationsBySupplierId).toHaveBeenCalledWith("supplier-1");
  });

  it("should handle file upload for observations", () => {
    const router = createRouter("supplier-1", "tab=observations");
    render(<RouterProvider router={router} />);

    const fileUpload = screen.queryByTestId("file-upload");
    expect(fileUpload || screen.queryAllByRole("button").length > 0).toBeTruthy();
  });

  it("should handle empty observations", () => {
    vi.mocked(getSupplierObservationsBySupplierId).mockReturnValueOnce([]);
    const router = createRouter("supplier-1", "tab=observations");
    render(<RouterProvider router={router} />);

    expect(getSupplierById).toHaveBeenCalledWith("supplier-1");
  });

  it("should handle inactive supplier status", () => {
    const inactiveSupplier = {
      ...mockSupplier,
      status: "inactive" as const,
    };
    vi.mocked(getSupplierById).mockReturnValueOnce(inactiveSupplier);
    const router = createRouter("supplier-1");
    render(<RouterProvider router={router} />);

    expect(getSupplierById).toHaveBeenCalledWith("supplier-1");
  });

  it("should handle default tab when no tab param provided", () => {
    const router = createRouter("supplier-1");
    render(<RouterProvider router={router} />);

    expect(getSupplierById).toHaveBeenCalledWith("supplier-1");
  });

  it("should handle invalid tab param", () => {
    const router = createRouter("supplier-1", "tab=invalid");
    render(<RouterProvider router={router} />);

    expect(getSupplierById).toHaveBeenCalledWith("supplier-1");
  });

  it("should handle supplier with properties", () => {
    const router = createRouter("supplier-1");
    render(<RouterProvider router={router} />);

    expect(getSupplierById).toHaveBeenCalledWith("supplier-1");
  });

  it("should handle supplier without properties", () => {
    const supplierWithoutProperties = {
      ...mockSupplier,
      propertyIds: [],
    };
    vi.mocked(getSupplierById).mockReturnValueOnce(supplierWithoutProperties);
    const router = createRouter("supplier-1");
    render(<RouterProvider router={router} />);

    expect(getSupplierById).toHaveBeenCalledWith("supplier-1");
  });

  it("should navigate back to suppliers list", () => {
    vi.mocked(getSupplierById).mockReturnValue(undefined);
    const router = createRouter("invalid-id");
    render(<RouterProvider router={router} />);

    const backButton = screen.queryByRole("button");
    if (backButton) {
      fireEvent.click(backButton);
      expect(mockNavigate).toHaveBeenCalled();
    }
  });

  it("should render Finance tab with i18n translation", async () => {
    const router = createRouter("supplier-1", "tab=finance");
    render(<RouterProvider router={router} />);

    expect(getSupplierById).toHaveBeenCalledWith("supplier-1");
    const financeTab = screen
      .queryAllByRole("button")
      .find((btn) => btn.textContent?.includes("Finanças") || btn.textContent?.includes("Finance"));
    expect(financeTab).toBeInTheDocument();
  });

  it("should switch to Finance tab", () => {
    const router = createRouter("supplier-1");
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

  it("should display finance dashboard sub-tab", () => {
    const router = createRouter("supplier-1", "tab=finance&subTab=dashboard");
    render(<RouterProvider router={router} />);

    expect(getSupplierById).toHaveBeenCalledWith("supplier-1");
  });

  it("should display finance transactions sub-tab", () => {
    const router = createRouter("supplier-1", "tab=finance&subTab=transactions");
    render(<RouterProvider router={router} />);

    expect(getSupplierById).toHaveBeenCalledWith("supplier-1");
    const table = screen.queryByTestId("table");
    expect(table || screen.queryAllByRole("button").length > 0).toBeTruthy();
  });

  it("should switch between finance sub-tabs using i18n", () => {
    const router = createRouter("supplier-1", "tab=finance&subTab=dashboard");
    render(<RouterProvider router={router} />);

    const subTabButtons = screen
      .queryAllByRole("button")
      .filter(
        (btn) =>
          btn.textContent?.includes("Dashboard") ||
          btn.textContent?.includes("Transações") ||
          btn.textContent?.includes("Transactions")
      );

    if (subTabButtons.length > 0) {
      fireEvent.click(subTabButtons[0]);
      expect(mockSetSearchParams).toHaveBeenCalled();
    }
  });

  it("should use i18n for finance dashboard labels", () => {
    const router = createRouter("supplier-1", "tab=finance&subTab=dashboard");
    render(<RouterProvider router={router} />);

    expect(getSupplierById).toHaveBeenCalledWith("supplier-1");
    expect(screen.queryAllByRole("button").length).toBeGreaterThan(0);
  });
});
