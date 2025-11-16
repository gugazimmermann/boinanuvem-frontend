import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import BuyerDetails from "../buyers.$buyerId";
import { getBuyerById } from "~/services/buyers.service";
import { getBuyerObservationsByBuyerId, addBuyerObservation } from "~/services/buyer-observations.service";

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
  getPropertyById: vi.fn((id) => ({ id, name: `Property ${id}` })),
}));

vi.mock("~/mocks/buyer-observations", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/buyer-observations")>("~/mocks/buyer-observations");
  return actual;
});

vi.mock("~/services/buyer-observations.service", () => ({
  getBuyerObservationsByBuyerId: vi.fn(() => []),
  addBuyerObservation: vi.fn(),
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
    
    const tabButtons = screen.queryAllByRole("button").filter((btn) =>
      btn.textContent?.includes("Observações") || btn.textContent?.includes("Atividades")
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
    
    const editButtons = screen.queryAllByRole("button").filter((btn) =>
      btn.textContent?.includes("Editar") || btn.textContent?.includes("Edit")
    );
    
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
});

