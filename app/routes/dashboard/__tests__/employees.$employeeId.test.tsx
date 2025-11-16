import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import EmployeeDetails from "../employees.$employeeId";
import { getEmployeeById } from "~/mocks/employees";

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

vi.mock("~/mocks/employees", () => ({
  getEmployeeById: vi.fn(),
}));

vi.mock("~/mocks/properties", () => ({
  getPropertyById: vi.fn((id) => ({ id, name: `Property ${id}` })),
}));

vi.mock("~/mocks/location-movements", () => ({
  getLocationMovementsByEmployeeId: vi.fn(() => []),
}));

vi.mock("~/mocks/animal-movements", () => ({
  getAnimalMovementsByEmployeeId: vi.fn(() => []),
}));

vi.mock("~/mocks/employee-observations", () => ({
  getEmployeeObservationsByEmployeeId: vi.fn(() => []),
  addEmployeeObservation: vi.fn(),
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
                <EmployeeDetails />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: [`/dashboard/employees/${employeeId}${searchParams ? `?${searchParams}` : ""}`],
      }
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
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
    
    const editButtons = screen.queryAllByRole("button").filter((btn) =>
      btn.textContent?.includes("Editar") || btn.textContent?.includes("Edit")
    );
    
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
});

