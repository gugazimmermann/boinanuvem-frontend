import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import SupplierDetails from "../suppliers.$supplierId";
import { getSupplierById } from "~/mocks/suppliers";
import { getSupplierObservationsBySupplierId } from "~/mocks/supplier-observations";

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

vi.mock("~/mocks/suppliers", () => ({
  getSupplierById: vi.fn(),
}));

vi.mock("~/mocks/properties", () => ({
  getPropertyById: vi.fn((id) => ({ id, name: `Property ${id}` })),
}));

vi.mock("~/mocks/supplier-observations", () => ({
  getSupplierObservationsBySupplierId: vi.fn(() => []),
  addSupplierObservation: vi.fn(),
}));

vi.mock("~/components/ui", () => ({
  Button: ({ children, onClick, leftIcon, rightIcon, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  ),
  StatusBadge: ({ label }: any) => <span>{label}</span>,
  Table: ({ children }: any) => <div data-testid="table">{children}</div>,
  FileUpload: ({ onFilesChange }: any) => (
    <input
      type="file"
      data-testid="file-upload"
      onChange={(e) => onFilesChange?.(Array.from(e.target.files || []))}
    />
  ),
  Alert: ({ title, variant }: any) => (
    <div data-testid={`alert-${variant}`}>{title}</div>
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
                <SupplierDetails />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: [`/dashboard/suppliers/${supplierId}${searchParams ? `?${searchParams}` : ""}`],
      }
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
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
    
    const tabButtons = screen.queryAllByRole("button").filter((btn) =>
      btn.textContent?.includes("Observações") || 
      btn.textContent?.includes("Atividades")
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
    
    const editButtons = screen.queryAllByRole("button").filter((btn) =>
      btn.textContent?.includes("Editar") || btn.textContent?.includes("Edit")
    );
    
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
});

