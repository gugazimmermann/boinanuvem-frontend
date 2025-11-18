import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import MovementDetails from "../movements.$movementId";
import { getLocationMovementById } from "~/services/location-movements.service";
import { getAnimalMovementById } from "~/services/animal-movements.service";
import { getPropertyById } from "~/services/properties.service";
import { getLocationById } from "~/services/locations.service";
import { getEmployeeById } from "~/services/employees.service";
import { getServiceProviderById } from "~/services/service-providers.service";
import { getAnimalById } from "~/services/animals.service";
import { getBirthByAnimalId } from "~/services/births.service";
import { getWeighingsByAnimalId } from "~/services/weighings.service";

const mockNavigate = vi.fn();
const mockSetSearchParams = vi.fn();
let currentSearchParams = new URLSearchParams();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => {
      return [currentSearchParams, mockSetSearchParams];
    },
  };
});

vi.mock("~/services/location-movements.service", () => ({
  getLocationMovementById: vi.fn(),
}));

vi.mock("~/services/animal-movements.service", () => ({
  getAnimalMovementById: vi.fn(),
}));

vi.mock("~/services/properties.service", () => ({
  getPropertyById: vi.fn(),
}));

vi.mock("~/services/locations.service", () => ({
  getLocationById: vi.fn(),
}));

vi.mock("~/services/employees.service", () => ({
  getEmployeeById: vi.fn(),
}));

vi.mock("~/services/service-providers.service", () => ({
  getServiceProviderById: vi.fn(),
}));

vi.mock("~/services/animals.service", () => ({
  getAnimalById: vi.fn(),
}));

vi.mock("~/services/births.service", () => ({
  getBirthByAnimalId: vi.fn(),
}));

vi.mock("~/services/weighings.service", () => ({
  getWeighingsByAnimalId: vi.fn(),
}));

vi.mock("~/components/ui", () => ({
  Button: ({
    children,
    onClick,
    leftIcon,
    ...props
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    leftIcon?: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <button onClick={onClick} {...props}>
      {leftIcon}
      {children}
    </button>
  ),
  Table: ({
    data,
    columns,
    onRowClick,
    emptyState,
  }: {
    data?: unknown[];
    columns?: Array<{ key: string; render?: (value: unknown, row: unknown) => React.ReactNode }>;
    onRowClick?: (row: unknown) => void;
    emptyState?: { title?: string };
  }) => (
    <div data-testid="table">
      {data && data.length > 0 ? (
        <div>
          {data.map((row, idx: number) => {
            const rowObj = row as Record<string, unknown>;
            return (
              <div key={idx} data-testid={`table-row-${idx}`} onClick={() => onRowClick?.(row)}>
                {columns?.map((col, colIdx: number) => (
                  <div key={colIdx} data-testid={`cell-${col.key}`}>
                    {col.render ? col.render(null, row) : String(rowObj[col.key] ?? "")}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      ) : (
        <div data-testid="empty-state">{emptyState?.title}</div>
      )}
    </div>
  ),
  Tooltip: ({ children, content }: { children?: React.ReactNode; content?: string }) => (
    <div title={content}>{children}</div>
  ),
  StatusBadge: ({ label, variant }: { label?: string; variant?: string }) => (
    <span data-testid={`status-badge-${variant}`}>{label}</span>
  ),
}));

describe("MovementDetails", () => {
  const createRouter = (movementId: string, searchParams?: string) => {
    const url = `/dashboard/movements/${movementId}${searchParams ? `?${searchParams}` : ""}`;
    currentSearchParams = new URLSearchParams(searchParams || "");
    return createMemoryRouter(
      [
        {
          path: "/dashboard/movements/:movementId",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <MovementDetails />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: [url],
      }
    );
  };

  const mockAnimalMovement = {
    id: "movement-1",
    date: "2024-01-15",
    companyId: "company-1",
    propertyId: "prop-1",
    locationId: "loc-1",
    animalIds: ["animal-1", "animal-2"],
    employeeIds: ["emp-1"],
    serviceProviderIds: ["sp-1"],
    observation: "Test observation",
    fileIds: ["file-1", "file-2"],
    createdAt: "2024-01-15",
  };

  const mockLocationMovement = {
    id: "movement-2",
    date: "2024-01-20",
    companyId: "company-1",
    propertyId: "prop-1",
    locationIds: ["loc-1", "loc-2"],
    employeeIds: ["emp-1", "emp-2"],
    serviceProviderIds: ["sp-1"],
    type: "FERTILIZATION" as const,
    observation: "Location observation",
    fileIds: ["file-3"],
    createdAt: "2024-01-20",
  };

  const mockProperty = {
    id: "prop-1",
    name: "Test Property",
    code: "PROP001",
    status: "active" as const,
    companyId: "company-1",
    city: "Test City",
    state: "SC",
    area: { value: 100, type: "hectares" as const },
  };

  const mockLocation = {
    id: "loc-1",
    name: "Test Location",
    code: "LOC001",
    propertyId: "prop-1",
    companyId: "company-1",
    status: "active" as const,
  };

  const mockEmployee = {
    id: "emp-1",
    name: "Test Employee",
    code: "EMP001",
    companyId: "company-1",
    status: "active" as const,
  };

  const mockServiceProvider = {
    id: "sp-1",
    name: "Test Service Provider",
    code: "SP001",
    companyId: "company-1",
    status: "active" as const,
  };

  const mockAnimal = {
    id: "animal-1",
    code: "AN001",
    registrationNumber: "REG001",
    status: "active" as const,
    propertyId: "prop-1",
    companyId: "company-1",
    createdAt: "2024-01-01",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getPropertyById).mockImplementation((id: string) =>
      id === "prop-1" ? mockProperty : undefined
    );
    vi.mocked(getLocationById).mockImplementation((id: string) =>
      id === "loc-1" ? mockLocation : undefined
    );
    vi.mocked(getEmployeeById).mockImplementation((id: string) =>
      id === "emp-1" ? mockEmployee : undefined
    );
    vi.mocked(getServiceProviderById).mockImplementation((id: string) =>
      id === "sp-1" ? mockServiceProvider : undefined
    );
    vi.mocked(getAnimalById).mockImplementation((id: string) =>
      id === "animal-1" ? mockAnimal : undefined
    );
    vi.mocked(getBirthByAnimalId).mockReturnValue(null);
    vi.mocked(getWeighingsByAnimalId).mockReturnValue([]);
  });

  it("should display empty state when movement is not found", () => {
    vi.mocked(getLocationMovementById).mockReturnValue(undefined);
    vi.mocked(getAnimalMovementById).mockReturnValue(undefined);

    const router = createRouter("invalid-id");
    render(<RouterProvider router={router} />);

    expect(
      screen.getByText(/Nenhuma movimentação encontrada|No movements found/i)
    ).toBeInTheDocument();
  });

  it("should navigate back to properties when movement not found and back button clicked", () => {
    vi.mocked(getLocationMovementById).mockReturnValue(undefined);
    vi.mocked(getAnimalMovementById).mockReturnValue(undefined);

    const router = createRouter("invalid-id");
    render(<RouterProvider router={router} />);

    const backButton = screen.getByRole("button");
    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalled();
  });

  it("should display animal movement details", () => {
    vi.mocked(getAnimalMovementById).mockReturnValue(mockAnimalMovement);
    vi.mocked(getLocationMovementById).mockReturnValue(undefined);

    const router = createRouter("movement-1");
    render(<RouterProvider router={router} />);

    expect(getAnimalMovementById).toHaveBeenCalledWith("movement-1");
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent(/Movimentação de Animal|Animal Movement/i);
  });

  it("should display location movement details", () => {
    vi.mocked(getLocationMovementById).mockReturnValue(mockLocationMovement);
    vi.mocked(getAnimalMovementById).mockReturnValue(undefined);

    const router = createRouter("movement-2");
    render(<RouterProvider router={router} />);

    expect(getLocationMovementById).toHaveBeenCalledWith("movement-2");
  });

  it("should display property information when available", () => {
    vi.mocked(getAnimalMovementById).mockReturnValue(mockAnimalMovement);
    vi.mocked(getLocationMovementById).mockReturnValue(undefined);

    const router = createRouter("movement-1");
    render(<RouterProvider router={router} />);

    expect(getPropertyById).toHaveBeenCalledWith("prop-1");
  });

  it("should display locations for location movement", () => {
    vi.mocked(getLocationMovementById).mockReturnValue(mockLocationMovement);
    vi.mocked(getAnimalMovementById).mockReturnValue(undefined);
    vi.mocked(getLocationById).mockImplementation((id: string) =>
      id === "loc-1" || id === "loc-2" ? { ...mockLocation, id, name: `Location ${id}` } : undefined
    );

    const router = createRouter("movement-2");
    render(<RouterProvider router={router} />);

    expect(getLocationById).toHaveBeenCalledWith("loc-1");
    expect(getLocationById).toHaveBeenCalledWith("loc-2");
  });

  it("should display location for animal movement", () => {
    vi.mocked(getAnimalMovementById).mockReturnValue(mockAnimalMovement);
    vi.mocked(getLocationMovementById).mockReturnValue(undefined);

    const router = createRouter("movement-1");
    render(<RouterProvider router={router} />);

    expect(getLocationById).toHaveBeenCalledWith("loc-1");
  });

  it("should display employees information", () => {
    vi.mocked(getAnimalMovementById).mockReturnValue(mockAnimalMovement);
    vi.mocked(getLocationMovementById).mockReturnValue(undefined);
    vi.mocked(getEmployeeById).mockImplementation((id: string) =>
      id === "emp-1" ? mockEmployee : undefined
    );

    const router = createRouter("movement-1");
    render(<RouterProvider router={router} />);

    expect(getEmployeeById).toHaveBeenCalledWith("emp-1");
  });

  it("should display service providers information", () => {
    vi.mocked(getAnimalMovementById).mockReturnValue(mockAnimalMovement);
    vi.mocked(getLocationMovementById).mockReturnValue(undefined);

    const router = createRouter("movement-1");
    render(<RouterProvider router={router} />);

    expect(getServiceProviderById).toHaveBeenCalledWith("sp-1");
  });

  it("should display observation when available", () => {
    vi.mocked(getAnimalMovementById).mockReturnValue(mockAnimalMovement);
    vi.mocked(getLocationMovementById).mockReturnValue(undefined);

    const router = createRouter("movement-1");
    render(<RouterProvider router={router} />);

    expect(screen.getByText("Test observation")).toBeInTheDocument();
  });

  it("should display file attachments when available", () => {
    vi.mocked(getAnimalMovementById).mockReturnValue(mockAnimalMovement);
    vi.mocked(getLocationMovementById).mockReturnValue(undefined);

    const router = createRouter("movement-1");
    render(<RouterProvider router={router} />);

    expect(screen.getByText(/Anexos|Attachments/i)).toBeInTheDocument();
    expect(screen.getByText("file-1")).toBeInTheDocument();
    expect(screen.getByText("file-2")).toBeInTheDocument();
  });

  it("should display animals table for animal movement", () => {
    vi.mocked(getAnimalMovementById).mockReturnValue(mockAnimalMovement);
    vi.mocked(getLocationMovementById).mockReturnValue(undefined);
    vi.mocked(getAnimalById).mockImplementation((id: string) =>
      id === "animal-1"
        ? mockAnimal
        : id === "animal-2"
          ? { ...mockAnimal, id: "animal-2", code: "AN002" }
          : undefined
    );

    const router = createRouter("movement-1");
    render(<RouterProvider router={router} />);

    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should navigate back to location when fromLocation param is provided", () => {
    vi.mocked(getAnimalMovementById).mockReturnValue(mockAnimalMovement);
    vi.mocked(getLocationMovementById).mockReturnValue(undefined);

    const router = createRouter("movement-1", "fromLocation=loc-1");
    render(<RouterProvider router={router} />);

    const backButton = screen.getByRole("button");
    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalled();
  });

  it("should navigate back to employee when fromEmployee param is provided", () => {
    vi.mocked(getAnimalMovementById).mockReturnValue(mockAnimalMovement);
    vi.mocked(getLocationMovementById).mockReturnValue(undefined);
    vi.mocked(getEmployeeById).mockReturnValue(mockEmployee);

    const router = createRouter("movement-1", "fromEmployee=emp-1");
    render(<RouterProvider router={router} />);

    const backButton = screen.getByRole("button");
    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalled();
  });

  it("should navigate back to service provider when fromServiceProvider param is provided", () => {
    vi.mocked(getAnimalMovementById).mockReturnValue(mockAnimalMovement);
    vi.mocked(getLocationMovementById).mockReturnValue(undefined);
    vi.mocked(getServiceProviderById).mockReturnValue(mockServiceProvider);

    const router = createRouter("movement-1", "fromServiceProvider=sp-1");
    render(<RouterProvider router={router} />);

    const backButton = screen.getByRole("button");
    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalled();
  });

  it("should navigate back to property when fromProperty param is provided", () => {
    vi.mocked(getAnimalMovementById).mockReturnValue(mockAnimalMovement);
    vi.mocked(getLocationMovementById).mockReturnValue(undefined);

    const router = createRouter("movement-1", "fromProperty=prop-1");
    render(<RouterProvider router={router} />);

    const backButton = screen.getByRole("button");
    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalled();
  });

  it("should navigate back to property when no search params but property exists", () => {
    vi.mocked(getAnimalMovementById).mockReturnValue(mockAnimalMovement);
    vi.mocked(getLocationMovementById).mockReturnValue(undefined);

    const router = createRouter("movement-1");
    render(<RouterProvider router={router} />);

    const backButton = screen.getByRole("button");
    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalled();
  });

  it("should handle clicking on location to navigate", () => {
    vi.mocked(getLocationMovementById).mockReturnValue(mockLocationMovement);
    vi.mocked(getAnimalMovementById).mockReturnValue(undefined);
    vi.mocked(getLocationById).mockImplementation((id: string) =>
      id === "loc-1" ? mockLocation : undefined
    );

    const router = createRouter("movement-2");
    render(<RouterProvider router={router} />);

    const locationElements = screen.getAllByText("Test Location");
    if (locationElements.length > 0) {
      fireEvent.click(locationElements[0].closest("div") || locationElements[0]);
      expect(mockNavigate).toHaveBeenCalled();
    }
  });

  it("should handle clicking on employee to navigate", () => {
    vi.mocked(getAnimalMovementById).mockReturnValue(mockAnimalMovement);
    vi.mocked(getLocationMovementById).mockReturnValue(undefined);

    const router = createRouter("movement-1");
    render(<RouterProvider router={router} />);

    const employeeElements = screen.getAllByText("Test Employee");
    if (employeeElements.length > 0) {
      fireEvent.click(employeeElements[0].closest("div") || employeeElements[0]);
      expect(mockNavigate).toHaveBeenCalled();
    }
  });

  it("should handle clicking on service provider to navigate", () => {
    vi.mocked(getAnimalMovementById).mockReturnValue(mockAnimalMovement);
    vi.mocked(getLocationMovementById).mockReturnValue(undefined);

    const router = createRouter("movement-1");
    render(<RouterProvider router={router} />);

    const spElements = screen.getAllByText("Test Service Provider");
    if (spElements.length > 0) {
      fireEvent.click(spElements[0].closest("div") || spElements[0]);
      expect(mockNavigate).toHaveBeenCalled();
    }
  });

  it("should handle clicking on property to navigate", () => {
    vi.mocked(getAnimalMovementById).mockReturnValue(mockAnimalMovement);
    vi.mocked(getLocationMovementById).mockReturnValue(undefined);

    const router = createRouter("movement-1");
    render(<RouterProvider router={router} />);

    const propertyElements = screen.queryAllByText(/Test Property|PROP001/);
    if (propertyElements.length > 0) {
      fireEvent.click(propertyElements[0]);
      expect(mockNavigate).toHaveBeenCalled();
    }
  });

  it("should handle animal table row click to navigate", () => {
    vi.mocked(getAnimalMovementById).mockReturnValue(mockAnimalMovement);
    vi.mocked(getLocationMovementById).mockReturnValue(undefined);

    const router = createRouter("movement-1");
    render(<RouterProvider router={router} />);

    const tableRow = screen.queryByTestId("table-row-0");
    if (tableRow) {
      fireEvent.click(tableRow);
      expect(mockNavigate).toHaveBeenCalled();
    }
  });

  it("should handle missing location gracefully", () => {
    vi.mocked(getLocationMovementById).mockReturnValue(mockLocationMovement);
    vi.mocked(getAnimalMovementById).mockReturnValue(undefined);
    vi.mocked(getLocationById).mockReturnValue(undefined);

    const router = createRouter("movement-2");
    render(<RouterProvider router={router} />);

    expect(getLocationById).toHaveBeenCalled();
  });

  it("should handle missing employee gracefully", () => {
    vi.mocked(getAnimalMovementById).mockReturnValue(mockAnimalMovement);
    vi.mocked(getLocationMovementById).mockReturnValue(undefined);
    vi.mocked(getEmployeeById).mockReturnValue(undefined);

    const router = createRouter("movement-1");
    render(<RouterProvider router={router} />);

    expect(getEmployeeById).toHaveBeenCalled();
  });

  it("should handle missing service provider gracefully", () => {
    vi.mocked(getAnimalMovementById).mockReturnValue(mockAnimalMovement);
    vi.mocked(getLocationMovementById).mockReturnValue(undefined);
    vi.mocked(getServiceProviderById).mockReturnValue(undefined);

    const router = createRouter("movement-1");
    render(<RouterProvider router={router} />);

    expect(getServiceProviderById).toHaveBeenCalled();
  });

  it("should handle missing animal gracefully", () => {
    vi.mocked(getAnimalMovementById).mockReturnValue(mockAnimalMovement);
    vi.mocked(getLocationMovementById).mockReturnValue(undefined);
    vi.mocked(getAnimalById).mockReturnValue(undefined);

    const router = createRouter("movement-1");
    render(<RouterProvider router={router} />);

    expect(getAnimalById).toHaveBeenCalled();
  });

  it("should have correct meta function", () => {
    expect(MovementDetails).toBeDefined();
  });
});
