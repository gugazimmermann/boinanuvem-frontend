import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import ObservationDetails from "../observations.$observationId";
import { getLocationObservationById } from "~/services/location-observations.service";
import { getEmployeeObservationById } from "~/services/employee-observations.service";
import { getServiceProviderObservationById } from "~/services/service-provider-observations.service";
import { getSupplierObservationById } from "~/services/supplier-observations.service";
import { getBuyerObservationById } from "~/services/buyer-observations.service";
import { getAnimalObservationById } from "~/services/animal-observations.service";
import { getLocationById } from "~/services/locations.service";
import { getEmployeeById } from "~/services/employees.service";
import { getServiceProviderById } from "~/services/service-providers.service";
import { getSupplierById } from "~/services/suppliers.service";
import { getBuyerById } from "~/services/buyers.service";
import { getAnimalById } from "~/services/animals.service";

const mockNavigate = vi.fn();
let currentSearchParams = new URLSearchParams();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [currentSearchParams, vi.fn()],
  };
});

vi.mock("~/services/location-observations.service", () => ({
  getLocationObservationById: vi.fn(),
}));

vi.mock("~/services/employee-observations.service", () => ({
  getEmployeeObservationById: vi.fn(),
}));

vi.mock("~/services/service-provider-observations.service", () => ({
  getServiceProviderObservationById: vi.fn(),
}));

vi.mock("~/services/supplier-observations.service", () => ({
  getSupplierObservationById: vi.fn(),
}));

vi.mock("~/services/buyer-observations.service", () => ({
  getBuyerObservationById: vi.fn(),
}));

vi.mock("~/services/animal-observations.service", () => ({
  getAnimalObservationById: vi.fn(),
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

vi.mock("~/services/suppliers.service", () => ({
  getSupplierById: vi.fn(),
}));

vi.mock("~/services/buyers.service", () => ({
  getBuyerById: vi.fn(),
}));

vi.mock("~/services/animals.service", () => ({
  getAnimalById: vi.fn(),
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
}));

describe("ObservationDetails", () => {
  const createRouter = (observationId: string, searchParams?: string) => {
    const url = `/dashboard/observations/${observationId}${searchParams ? `?${searchParams}` : ""}`;
    currentSearchParams = new URLSearchParams(searchParams || "");
    return createMemoryRouter(
      [
        {
          path: "/dashboard/observations/:observationId",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <ObservationDetails />
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

  const mockLocationObservation = {
    id: "obs-1",
    locationId: "loc-1",
    observation: "Location observation text",
    createdAt: "2024-01-15T10:00:00Z",
    fileIds: ["file-1"],
  };

  const mockEmployeeObservation = {
    id: "obs-2",
    employeeId: "emp-1",
    observation: "Employee observation text",
    createdAt: "2024-01-16T10:00:00Z",
    fileIds: ["file-2"],
  };

  const mockServiceProviderObservation = {
    id: "obs-3",
    serviceProviderId: "sp-1",
    observation: "Service provider observation text",
    createdAt: "2024-01-17T10:00:00Z",
  };

  const mockSupplierObservation = {
    id: "obs-4",
    supplierId: "supplier-1",
    observation: "Supplier observation text",
    createdAt: "2024-01-18T10:00:00Z",
    fileIds: ["file-3", "file-4"],
  };

  const mockBuyerObservation = {
    id: "obs-5",
    buyerId: "buyer-1",
    observation: "Buyer observation text",
    createdAt: "2024-01-19T10:00:00Z",
  };

  const mockAnimalObservation = {
    id: "obs-6",
    animalId: "animal-1",
    observation: "Animal observation text",
    createdAt: "2024-01-20T10:00:00Z",
    fileIds: ["file-5"],
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

  const mockSupplier = {
    id: "supplier-1",
    name: "Test Supplier",
    code: "SUP001",
    companyId: "company-1",
    status: "active" as const,
  };

  const mockBuyer = {
    id: "buyer-1",
    name: "Test Buyer",
    code: "BUY001",
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
    vi.mocked(getLocationObservationById).mockReturnValue(undefined);
    vi.mocked(getEmployeeObservationById).mockReturnValue(undefined);
    vi.mocked(getServiceProviderObservationById).mockReturnValue(undefined);
    vi.mocked(getSupplierObservationById).mockReturnValue(undefined);
    vi.mocked(getBuyerObservationById).mockReturnValue(undefined);
    vi.mocked(getAnimalObservationById).mockReturnValue(undefined);
  });

  it("should display empty state when observation is not found", () => {
    const router = createRouter("invalid-id");
    render(<RouterProvider router={router} />);

    expect(
      screen.getByText(/Observação não encontrada|Observation not found/i)
    ).toBeInTheDocument();
  });

  it("should navigate back to locations when observation not found", () => {
    const router = createRouter("invalid-id");
    render(<RouterProvider router={router} />);

    const backButton = screen.getByRole("button");
    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalled();
  });

  it("should display location observation details", () => {
    vi.mocked(getLocationObservationById).mockReturnValue(mockLocationObservation);
    vi.mocked(getLocationById).mockReturnValue(mockLocation);

    const router = createRouter("obs-1");
    render(<RouterProvider router={router} />);

    expect(getLocationObservationById).toHaveBeenCalledWith("obs-1");
    expect(screen.getByText("Location observation text")).toBeInTheDocument();
    expect(screen.getByText("Test Location")).toBeInTheDocument();
  });

  it("should display employee observation details", () => {
    vi.mocked(getEmployeeObservationById).mockReturnValue(mockEmployeeObservation);
    vi.mocked(getEmployeeById).mockReturnValue(mockEmployee);

    const router = createRouter("obs-2");
    render(<RouterProvider router={router} />);

    expect(getEmployeeObservationById).toHaveBeenCalledWith("obs-2");
    expect(screen.getByText("Employee observation text")).toBeInTheDocument();
    expect(screen.getByText("Test Employee")).toBeInTheDocument();
  });

  it("should display service provider observation details", () => {
    vi.mocked(getServiceProviderObservationById).mockReturnValue(mockServiceProviderObservation);
    vi.mocked(getServiceProviderById).mockReturnValue(mockServiceProvider);

    const router = createRouter("obs-3");
    render(<RouterProvider router={router} />);

    expect(getServiceProviderObservationById).toHaveBeenCalledWith("obs-3");
    expect(screen.getByText("Service provider observation text")).toBeInTheDocument();
    expect(screen.getByText("Test Service Provider")).toBeInTheDocument();
  });

  it("should display supplier observation details", () => {
    vi.mocked(getSupplierObservationById).mockReturnValue(mockSupplierObservation);
    vi.mocked(getSupplierById).mockReturnValue(mockSupplier);

    const router = createRouter("obs-4");
    render(<RouterProvider router={router} />);

    expect(getSupplierObservationById).toHaveBeenCalledWith("obs-4");
    expect(screen.getByText("Supplier observation text")).toBeInTheDocument();
    expect(screen.getByText("Test Supplier")).toBeInTheDocument();
  });

  it("should display buyer observation details", () => {
    vi.mocked(getBuyerObservationById).mockReturnValue(mockBuyerObservation);
    vi.mocked(getBuyerById).mockReturnValue(mockBuyer);

    const router = createRouter("obs-5");
    render(<RouterProvider router={router} />);

    expect(getBuyerObservationById).toHaveBeenCalledWith("obs-5");
    expect(screen.getByText("Buyer observation text")).toBeInTheDocument();
    expect(screen.getByText("Test Buyer")).toBeInTheDocument();
  });

  it("should display animal observation details", () => {
    vi.mocked(getAnimalObservationById).mockReturnValue(mockAnimalObservation);
    vi.mocked(getAnimalById).mockReturnValue(mockAnimal);

    const router = createRouter("obs-6");
    render(<RouterProvider router={router} />);

    expect(getAnimalObservationById).toHaveBeenCalledWith("obs-6");
    expect(screen.getByText("Animal observation text")).toBeInTheDocument();
    expect(screen.getByText("AN001")).toBeInTheDocument();
  });

  it("should display file attachments when available", () => {
    vi.mocked(getLocationObservationById).mockReturnValue(mockLocationObservation);
    vi.mocked(getLocationById).mockReturnValue(mockLocation);

    const router = createRouter("obs-1");
    render(<RouterProvider router={router} />);

    expect(screen.getByText(/Anexos|Attachments/i)).toBeInTheDocument();
    expect(screen.getByText("file-1")).toBeInTheDocument();
  });

  it("should display multiple file attachments", () => {
    vi.mocked(getSupplierObservationById).mockReturnValue(mockSupplierObservation);
    vi.mocked(getSupplierById).mockReturnValue(mockSupplier);

    const router = createRouter("obs-4");
    render(<RouterProvider router={router} />);

    expect(screen.getByText("file-3")).toBeInTheDocument();
    expect(screen.getByText("file-4")).toBeInTheDocument();
  });

  it("should navigate back to location when fromLocation param is provided", () => {
    vi.mocked(getLocationObservationById).mockReturnValue(mockLocationObservation);
    vi.mocked(getLocationById).mockReturnValue(mockLocation);

    const router = createRouter("obs-1", "fromLocation=loc-1");
    render(<RouterProvider router={router} />);

    const backButton = screen.getByRole("button");
    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalled();
  });

  it("should navigate back to employee when fromEmployee param is provided", () => {
    vi.mocked(getEmployeeObservationById).mockReturnValue(mockEmployeeObservation);
    vi.mocked(getEmployeeById).mockReturnValue(mockEmployee);

    const router = createRouter("obs-2", "fromEmployee=emp-1");
    render(<RouterProvider router={router} />);

    const backButton = screen.getByRole("button");
    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalled();
  });

  it("should navigate back to service provider when fromServiceProvider param is provided", () => {
    vi.mocked(getServiceProviderObservationById).mockReturnValue(mockServiceProviderObservation);
    vi.mocked(getServiceProviderById).mockReturnValue(mockServiceProvider);

    const router = createRouter("obs-3", "fromServiceProvider=sp-1");
    render(<RouterProvider router={router} />);

    const backButton = screen.getByRole("button");
    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalled();
  });

  it("should navigate back to supplier when fromSupplier param is provided", () => {
    vi.mocked(getSupplierObservationById).mockReturnValue(mockSupplierObservation);
    vi.mocked(getSupplierById).mockReturnValue(mockSupplier);

    const router = createRouter("obs-4", "fromSupplier=supplier-1");
    render(<RouterProvider router={router} />);

    const backButton = screen.getByRole("button");
    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalled();
  });

  it("should navigate back to buyer when fromBuyer param is provided", () => {
    vi.mocked(getBuyerObservationById).mockReturnValue(mockBuyerObservation);
    vi.mocked(getBuyerById).mockReturnValue(mockBuyer);

    const router = createRouter("obs-5", "fromBuyer=buyer-1");
    render(<RouterProvider router={router} />);

    const backButton = screen.getByRole("button");
    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalled();
  });

  it("should navigate back to animal when fromAnimal param is provided", () => {
    vi.mocked(getAnimalObservationById).mockReturnValue(mockAnimalObservation);
    vi.mocked(getAnimalById).mockReturnValue(mockAnimal);

    const router = createRouter("obs-6", "fromAnimal=animal-1");
    render(<RouterProvider router={router} />);

    const backButton = screen.getByRole("button");
    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalled();
  });

  it("should navigate back to location when no search params but location exists", () => {
    vi.mocked(getLocationObservationById).mockReturnValue(mockLocationObservation);
    vi.mocked(getLocationById).mockReturnValue(mockLocation);

    const router = createRouter("obs-1");
    render(<RouterProvider router={router} />);

    const backButton = screen.getByRole("button");
    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalled();
  });

  it("should handle clicking on location to navigate", () => {
    vi.mocked(getLocationObservationById).mockReturnValue(mockLocationObservation);
    vi.mocked(getLocationById).mockReturnValue(mockLocation);

    const router = createRouter("obs-1");
    render(<RouterProvider router={router} />);

    const locationElements = screen.getAllByText("Test Location");
    if (locationElements.length > 0) {
      fireEvent.click(locationElements[0].closest("div") || locationElements[0]);
      expect(mockNavigate).toHaveBeenCalled();
    }
  });

  it("should handle clicking on employee to navigate", () => {
    vi.mocked(getEmployeeObservationById).mockReturnValue(mockEmployeeObservation);
    vi.mocked(getEmployeeById).mockReturnValue(mockEmployee);

    const router = createRouter("obs-2");
    render(<RouterProvider router={router} />);

    const employeeElements = screen.getAllByText("Test Employee");
    if (employeeElements.length > 0) {
      fireEvent.click(employeeElements[0].closest("div") || employeeElements[0]);
      expect(mockNavigate).toHaveBeenCalled();
    }
  });

  it("should handle clicking on service provider to navigate", () => {
    vi.mocked(getServiceProviderObservationById).mockReturnValue(mockServiceProviderObservation);
    vi.mocked(getServiceProviderById).mockReturnValue(mockServiceProvider);

    const router = createRouter("obs-3");
    render(<RouterProvider router={router} />);

    const spElements = screen.getAllByText("Test Service Provider");
    if (spElements.length > 0) {
      fireEvent.click(spElements[0].closest("div") || spElements[0]);
      expect(mockNavigate).toHaveBeenCalled();
    }
  });

  it("should handle clicking on supplier to navigate", () => {
    vi.mocked(getSupplierObservationById).mockReturnValue(mockSupplierObservation);
    vi.mocked(getSupplierById).mockReturnValue(mockSupplier);

    const router = createRouter("obs-4");
    render(<RouterProvider router={router} />);

    const supplierElements = screen.getAllByText("Test Supplier");
    if (supplierElements.length > 0) {
      fireEvent.click(supplierElements[0].closest("div") || supplierElements[0]);
      expect(mockNavigate).toHaveBeenCalled();
    }
  });

  it("should handle clicking on buyer to navigate", () => {
    vi.mocked(getBuyerObservationById).mockReturnValue(mockBuyerObservation);
    vi.mocked(getBuyerById).mockReturnValue(mockBuyer);

    const router = createRouter("obs-5");
    render(<RouterProvider router={router} />);

    const buyerElements = screen.getAllByText("Test Buyer");
    if (buyerElements.length > 0) {
      fireEvent.click(buyerElements[0].closest("div") || buyerElements[0]);
      expect(mockNavigate).toHaveBeenCalled();
    }
  });

  it("should handle clicking on animal to navigate", () => {
    vi.mocked(getAnimalObservationById).mockReturnValue(mockAnimalObservation);
    vi.mocked(getAnimalById).mockReturnValue(mockAnimal);

    const router = createRouter("obs-6");
    render(<RouterProvider router={router} />);

    const animalElements = screen.getAllByText("AN001");
    if (animalElements.length > 0) {
      fireEvent.click(animalElements[0].closest("div") || animalElements[0]);
      expect(mockNavigate).toHaveBeenCalled();
    }
  });

  it("should handle missing location gracefully", () => {
    vi.mocked(getLocationObservationById).mockReturnValue(mockLocationObservation);
    vi.mocked(getLocationById).mockReturnValue(undefined);

    const router = createRouter("obs-1");
    render(<RouterProvider router={router} />);

    expect(getLocationById).toHaveBeenCalled();
  });

  it("should handle missing employee gracefully", () => {
    vi.mocked(getEmployeeObservationById).mockReturnValue(mockEmployeeObservation);
    vi.mocked(getEmployeeById).mockReturnValue(undefined);

    const router = createRouter("obs-2");
    render(<RouterProvider router={router} />);

    expect(getEmployeeById).toHaveBeenCalled();
  });

  it("should handle missing service provider gracefully", () => {
    vi.mocked(getServiceProviderObservationById).mockReturnValue(mockServiceProviderObservation);
    vi.mocked(getServiceProviderById).mockReturnValue(undefined);

    const router = createRouter("obs-3");
    render(<RouterProvider router={router} />);

    expect(getServiceProviderById).toHaveBeenCalled();
  });

  it("should handle missing supplier gracefully", () => {
    vi.mocked(getSupplierObservationById).mockReturnValue(mockSupplierObservation);
    vi.mocked(getSupplierById).mockReturnValue(undefined);

    const router = createRouter("obs-4");
    render(<RouterProvider router={router} />);

    expect(getSupplierById).toHaveBeenCalled();
  });

  it("should handle missing buyer gracefully", () => {
    vi.mocked(getBuyerObservationById).mockReturnValue(mockBuyerObservation);
    vi.mocked(getBuyerById).mockReturnValue(undefined);

    const router = createRouter("obs-5");
    render(<RouterProvider router={router} />);

    expect(getBuyerById).toHaveBeenCalled();
  });

  it("should handle missing animal gracefully", () => {
    vi.mocked(getAnimalObservationById).mockReturnValue(mockAnimalObservation);
    vi.mocked(getAnimalById).mockReturnValue(undefined);

    const router = createRouter("obs-6");
    render(<RouterProvider router={router} />);

    expect(getAnimalById).toHaveBeenCalled();
  });

  it("should format date correctly", () => {
    vi.mocked(getLocationObservationById).mockReturnValue(mockLocationObservation);
    vi.mocked(getLocationById).mockReturnValue(mockLocation);

    const router = createRouter("obs-1");
    render(<RouterProvider router={router} />);

    const datePattern = /\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}/;
    const dateElements = screen.getAllByText(datePattern);
    expect(dateElements.length).toBeGreaterThan(0);
  });

  it("should have correct meta function", () => {
    expect(ObservationDetails).toBeDefined();
  });
});
