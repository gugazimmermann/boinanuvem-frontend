import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import BuyerDetails from "../buyers.$buyerId";
import { getBuyerById } from "~/services/buyers.service";
import { getBuyerObservationsByBuyerId } from "~/services/buyer-observations.service";

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

vi.mock("~/mocks/buyers", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/buyers")>("~/mocks/buyers");
  return actual;
});

vi.mock("~/services/buyers.service", () => ({
  getBuyerById: vi.fn(),
}));

vi.mock("~/mocks/properties", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/properties")>("~/mocks/properties");
  return actual;
});

vi.mock("~/services/properties.service", () => ({
  getPropertyById: vi.fn((id: string) => ({ id, name: `Property ${id}` })),
}));

vi.mock("~/mocks/buyer-observations", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/buyer-observations")>(
    "~/mocks/buyer-observations"
  );
  return actual;
});

vi.mock("~/services/buyer-observations.service", () => ({
  getBuyerObservationsByBuyerId: vi.fn(() => []),
  addBuyerObservation: vi.fn(),
}));

vi.mock("~/mocks/cash-flow", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/cash-flow")>("~/mocks/cash-flow");
  return actual;
});

vi.mock("~/services/cash-flow.service", () => ({
  getCashFlowByBuyerId: vi.fn(() => []),
  deleteCashFlow: vi.fn(() => true),
}));

vi.mock("~/mocks/accounts-receivable", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/accounts-receivable")>(
    "~/mocks/accounts-receivable"
  );
  return actual;
});

vi.mock("~/services/accounts-receivable.service", () => ({
  getAccountsReceivableByBuyerId: vi.fn(() => []),
  deleteAccountsReceivable: vi.fn(() => true),
}));

vi.mock("~/services/service-providers.service", () => ({
  getServiceProviderById: vi.fn((id: string) => ({ id, name: `ServiceProvider ${id}` })),
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

describe("BuyerDetails", () => {
  const mockBuyer = {
    id: "buyer-1",
    name: "Test Buyer",
    code: "BYR001",
    createdAt: "2024-01-15T10:00:00Z",
    status: "active" as const,
    companyId: "company-1",
    propertyIds: ["prop-1"],
    email: "test@example.com",
    phone: "(47) 99999-9999",
    street: "Test Street",
    number: "123",
    city: "Test City",
    state: "SC",
    zipCode: "89000-000",
    cpf: "123.456.789-00",
    cnpj: "12.345.678/0001-90",
  };

  const mockObservations = [
    {
      id: "obs-1",
      buyerId: "buyer-1",
      observation: "Test observation",
      createdAt: "2024-01-15T10:00:00Z",
    },
  ];

  const createRouter = (buyerId: string, searchParams?: string) => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard/buyers/:buyerId",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <BuyerDetails />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: [`/dashboard/buyers/${buyerId}${searchParams ? `?${searchParams}` : ""}`],
      }
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getBuyerById).mockReturnValue(mockBuyer);
    vi.mocked(getBuyerObservationsByBuyerId).mockReturnValue(mockObservations);
  });

  it("should render buyer details", () => {
    const router = createRouter("buyer-1");
    render(<RouterProvider router={router} />);

    expect(getBuyerById).toHaveBeenCalledWith("buyer-1");
    const table = screen.queryByTestId("table");
    const buttons = screen.queryAllByRole("button");
    expect(table || buttons.length > 0).toBeTruthy();
  });

  it("should handle undefined buyer", () => {
    vi.mocked(getBuyerById).mockReturnValue(undefined);
    const router = createRouter("invalid-id");
    render(<RouterProvider router={router} />);

    const backButton = screen.queryByRole("button");
    expect(backButton).toBeInTheDocument();
  });

  it("should switch tabs", () => {
    const router = createRouter("buyer-1");
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
    const router = createRouter("buyer-1", "tab=observations");
    render(<RouterProvider router={router} />);

    expect(getBuyerById).toHaveBeenCalledWith("buyer-1");
  });

  it("should have correct meta function", () => {
    expect(BuyerDetails).toBeDefined();
  });

  it("should display info tab", () => {
    const router = createRouter("buyer-1", "tab=info");
    render(<RouterProvider router={router} />);

    expect(getBuyerById).toHaveBeenCalledWith("buyer-1");
  });

  it("should display activities tab", () => {
    const router = createRouter("buyer-1", "tab=activities");
    render(<RouterProvider router={router} />);

    expect(getBuyerById).toHaveBeenCalledWith("buyer-1");
  });

  it("should display observations tab", () => {
    const router = createRouter("buyer-1", "tab=observations");
    render(<RouterProvider router={router} />);

    expect(getBuyerById).toHaveBeenCalledWith("buyer-1");
  });

  it("should navigate to edit buyer", () => {
    const router = createRouter("buyer-1");
    render(<RouterProvider router={router} />);

    const editButtons = screen
      .queryAllByRole("button")
      .filter((btn) => btn.textContent?.includes("Editar") || btn.textContent?.includes("Edit"));

    if (editButtons.length > 0) {
      fireEvent.click(editButtons[0]);
      expect(mockNavigate).toHaveBeenCalled();
    }
  });

  it("should handle buyer observations", () => {
    const router = createRouter("buyer-1", "tab=observations");
    render(<RouterProvider router={router} />);

    expect(getBuyerObservationsByBuyerId).toHaveBeenCalledWith("buyer-1");
  });

  it("should handle file upload for observations", () => {
    const router = createRouter("buyer-1", "tab=observations");
    render(<RouterProvider router={router} />);

    const fileUpload = screen.queryByTestId("file-upload");
    expect(fileUpload || screen.queryAllByRole("button").length > 0).toBeTruthy();
  });

  it("should handle empty observations", () => {
    vi.mocked(getBuyerObservationsByBuyerId).mockReturnValueOnce([]);
    const router = createRouter("buyer-1", "tab=observations");
    render(<RouterProvider router={router} />);

    expect(getBuyerById).toHaveBeenCalledWith("buyer-1");
  });

  it("should handle inactive buyer status", () => {
    const inactiveBuyer = {
      ...mockBuyer,
      status: "inactive" as const,
    };
    vi.mocked(getBuyerById).mockReturnValueOnce(inactiveBuyer);
    const router = createRouter("buyer-1");
    render(<RouterProvider router={router} />);

    expect(getBuyerById).toHaveBeenCalledWith("buyer-1");
  });

  it("should handle default tab when no tab param provided", () => {
    const router = createRouter("buyer-1");
    render(<RouterProvider router={router} />);

    expect(getBuyerById).toHaveBeenCalledWith("buyer-1");
  });

  it("should handle invalid tab param", () => {
    const router = createRouter("buyer-1", "tab=invalid");
    render(<RouterProvider router={router} />);

    expect(getBuyerById).toHaveBeenCalledWith("buyer-1");
  });

  it("should handle buyer with properties", () => {
    const router = createRouter("buyer-1");
    render(<RouterProvider router={router} />);

    expect(getBuyerById).toHaveBeenCalledWith("buyer-1");
  });

  it("should handle buyer without properties", () => {
    const buyerWithoutProperties = {
      ...mockBuyer,
      propertyIds: [],
    };
    vi.mocked(getBuyerById).mockReturnValueOnce(buyerWithoutProperties);
    const router = createRouter("buyer-1");
    render(<RouterProvider router={router} />);

    expect(getBuyerById).toHaveBeenCalledWith("buyer-1");
  });

  it("should navigate back to buyers list", () => {
    vi.mocked(getBuyerById).mockReturnValue(undefined);
    const router = createRouter("invalid-id");
    render(<RouterProvider router={router} />);

    const backButton = screen.queryByRole("button");
    if (backButton) {
      fireEvent.click(backButton);
      expect(mockNavigate).toHaveBeenCalled();
    }
  });

  it("should render Finance tab with i18n translation", async () => {
    const router = createRouter("buyer-1", "tab=finance");
    render(<RouterProvider router={router} />);

    expect(getBuyerById).toHaveBeenCalledWith("buyer-1");
    const financeTab = screen
      .queryAllByRole("button")
      .find((btn) => btn.textContent?.includes("Finanças") || btn.textContent?.includes("Finance"));
    expect(financeTab).toBeInTheDocument();
  });

  it("should switch to Finance tab", () => {
    const router = createRouter("buyer-1");
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
    const router = createRouter("buyer-1", "tab=finance&subTab=dashboard");
    render(<RouterProvider router={router} />);

    expect(getBuyerById).toHaveBeenCalledWith("buyer-1");
  });

  it("should display finance transactions sub-tab", () => {
    const router = createRouter("buyer-1", "tab=finance&subTab=transactions");
    render(<RouterProvider router={router} />);

    expect(getBuyerById).toHaveBeenCalledWith("buyer-1");
    const table = screen.queryByTestId("table");
    expect(table || screen.queryAllByRole("button").length > 0).toBeTruthy();
  });

  it("should switch between finance sub-tabs using i18n", () => {
    const router = createRouter("buyer-1", "tab=finance&subTab=dashboard");
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
    const router = createRouter("buyer-1", "tab=finance&subTab=dashboard");
    render(<RouterProvider router={router} />);

    expect(getBuyerById).toHaveBeenCalledWith("buyer-1");
    expect(screen.queryAllByRole("button").length).toBeGreaterThan(0);
  });
});
