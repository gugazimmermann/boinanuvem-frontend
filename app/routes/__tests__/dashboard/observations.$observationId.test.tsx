import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { meta, default as ObservationDetails } from "../../dashboard/observations.$observationId";
import { mockLocations } from "~/mocks/locations";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useParams: vi.fn(() => ({ observationId: "obs-1" })),
    useNavigate: vi.fn(() => vi.fn()),
    useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()]),
  };
});

vi.mock("~/services/location-observations.service", () => ({
  getLocationObservationById: vi.fn(() => ({
    id: "obs-1",
    locationId: mockLocations[0]?.id || "location-1",
    observation: "Test observation",
    createdAt: "2025-01-20T10:00:00Z",
    fileIds: ["file-1"],
  })),
}));

vi.mock("~/services/employee-observations.service", () => ({
  getEmployeeObservationById: vi.fn(() => null),
}));

vi.mock("~/services/service-provider-observations.service", () => ({
  getServiceProviderObservationById: vi.fn(() => null),
}));

vi.mock("~/services/supplier-observations.service", () => ({
  getSupplierObservationById: vi.fn(() => null),
}));

vi.mock("~/services/buyer-observations.service", () => ({
  getBuyerObservationById: vi.fn(() => null),
}));

vi.mock("~/services/animal-observations.service", () => ({
  getAnimalObservationById: vi.fn(() => null),
}));

vi.mock("~/services/locations.service", () => ({
  getLocationById: vi.fn((id: string) => mockLocations.find((loc) => loc.id === id)),
}));

vi.mock("~/services/employees.service", () => ({
  getEmployeeById: vi.fn(() => null),
}));

vi.mock("~/services/service-providers.service", () => ({
  getServiceProviderById: vi.fn(() => null),
}));

vi.mock("~/services/suppliers.service", () => ({
  getSupplierById: vi.fn(() => null),
}));

vi.mock("~/services/buyers.service", () => ({
  getBuyerById: vi.fn(() => null),
}));

vi.mock("~/services/animals.service", () => ({
  getAnimalById: vi.fn(() => null),
}));

vi.mock("~/components/ui", () => ({
  Button: vi.fn(
    ({
      children,
      onClick,
      leftIcon,
    }: {
      children: React.ReactNode;
      onClick?: () => void;
      leftIcon?: React.ReactNode;
    }) => (
      <button onClick={onClick}>
        {leftIcon}
        {children}
      </button>
    )
  ),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    locations: {
      details: {
        tabs: {
          observations: "Observações",
        },
        observation: "Observação",
        observationNotFound: "Observação não encontrada",
      },
      table: {
        name: "Nome",
      },
    },
    employees: {
      table: {
        name: "Nome",
      },
    },
    serviceProviders: {
      table: {
        name: "Nome",
      },
    },
    suppliers: {
      table: {
        name: "Nome",
      },
    },
    buyers: {
      table: {
        name: "Nome",
      },
    },
    animals: {
      table: {
        code: "Código",
        registration: "Registro",
      },
    },
    team: {
      new: {
        back: "Voltar",
      },
    },
  })),
}));

vi.mock("~/routes.config", () => ({
  ROUTES: {
    LOCATIONS: "/dashboard/localizacoes",
  },
  getLocationViewRoute: vi.fn((id: string) => `/dashboard/localizacoes/${id}`),
  getEmployeeViewRoute: vi.fn((id: string) => `/dashboard/funcionarios/${id}`),
  getServiceProviderViewRoute: vi.fn((id: string) => `/dashboard/prestadores/${id}`),
  getSupplierViewRoute: vi.fn((id: string) => `/dashboard/fornecedores/${id}`),
  getBuyerViewRoute: vi.fn((id: string) => `/dashboard/compradores/${id}`),
  getAnimalViewRoute: vi.fn((id: string) => `/dashboard/animais/${id}`),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe("observations.$observationId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("meta", () => {
    it("should return SEO meta tags", () => {
      const result = meta();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toHaveProperty("title");
      expect(result[0].title).toContain("Detalhes da Observação");
    });
  });

  describe("ObservationDetails component", () => {
    it("should render observation details when observation exists", async () => {
      const { useParams } = await import("react-router");
      vi.mocked(useParams).mockReturnValue({ observationId: "obs-1" });

      render(
        <TestWrapper>
          <ObservationDetails />
        </TestWrapper>
      );

      expect(screen.getByText("Observações")).toBeInTheDocument();
      expect(screen.getByText("Test observation")).toBeInTheDocument();
    });

    it("should render empty state when observation is not found", async () => {
      const { useParams } = await import("react-router");
      const { getLocationObservationById } = await import(
        "~/services/location-observations.service"
      );

      vi.mocked(useParams).mockReturnValue({ observationId: "non-existent" });
      vi.mocked(getLocationObservationById).mockReturnValue(undefined);

      render(
        <TestWrapper>
          <ObservationDetails />
        </TestWrapper>
      );

      expect(screen.getByText("Observação não encontrada")).toBeInTheDocument();
    });

    it("should render location information when observation is for location", async () => {
      const { useParams } = await import("react-router");
      const { getLocationObservationById } = await import(
        "~/services/location-observations.service"
      );

      vi.mocked(useParams).mockReturnValue({ observationId: "obs-1" });
      vi.mocked(getLocationObservationById).mockReturnValue({
        id: "obs-1",
        locationId: mockLocations[0]?.id || "location-1",
        observation: "Test observation",
        createdAt: "2025-01-20T10:00:00Z",
        fileIds: ["file-1"],
      });

      render(
        <TestWrapper>
          <ObservationDetails />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(mockLocations[0]?.name || "Pasto Norte")).toBeInTheDocument();
      });
    });

    it("should navigate back when back button is clicked", async () => {
      const user = userEvent.setup();
      const { useParams, useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();

      vi.mocked(useParams).mockReturnValue({ observationId: "obs-1" });
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <ObservationDetails />
        </TestWrapper>
      );

      const backButton = screen.getByText("Voltar");
      await user.click(backButton);

      expect(mockNavigate).toHaveBeenCalled();
    });

    it("should render employee observation", async () => {
      const { useParams } = await import("react-router");
      const { getLocationObservationById } = await import(
        "~/services/location-observations.service"
      );
      const { getEmployeeObservationById } = await import(
        "~/services/employee-observations.service"
      );
      const { getEmployeeById } = await import("~/services/employees.service");
      const mockEmployees = [{ id: "emp-1", name: "Employee 1", code: "E001" }];

      vi.mocked(useParams).mockReturnValue({ observationId: "obs-1" });
      vi.mocked(getLocationObservationById).mockReturnValue(undefined);
      vi.mocked(getEmployeeObservationById).mockReturnValue({
        id: "obs-1",
        employeeId: "emp-1",
        observation: "Employee observation",
        createdAt: "2025-01-20T10:00:00Z",
        fileIds: [],
      });
      vi.mocked(getEmployeeById).mockReturnValue(mockEmployees[0]);

      render(
        <TestWrapper>
          <ObservationDetails />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText("Employee 1")).toBeInTheDocument();
      });
    });

    it("should render service provider observation", async () => {
      const { useParams } = await import("react-router");
      const { getLocationObservationById } = await import(
        "~/services/location-observations.service"
      );
      const { getEmployeeObservationById } = await import(
        "~/services/employee-observations.service"
      );
      const { getServiceProviderObservationById } = await import(
        "~/services/service-provider-observations.service"
      );
      const { getServiceProviderById } = await import("~/services/service-providers.service");
      const mockServiceProviders = [{ id: "sp-1", name: "Service Provider 1", code: "SP001" }];

      vi.mocked(useParams).mockReturnValue({ observationId: "obs-1" });
      vi.mocked(getLocationObservationById).mockReturnValue(undefined);
      vi.mocked(getEmployeeObservationById).mockReturnValue(undefined);
      vi.mocked(getServiceProviderObservationById).mockReturnValue({
        id: "obs-1",
        serviceProviderId: "sp-1",
        observation: "Service provider observation",
        createdAt: "2025-01-20T10:00:00Z",
        fileIds: [],
      });
      vi.mocked(getServiceProviderById).mockReturnValue(mockServiceProviders[0]);

      render(
        <TestWrapper>
          <ObservationDetails />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText("Service Provider 1")).toBeInTheDocument();
      });
    });

    it("should render supplier observation", async () => {
      const { useParams } = await import("react-router");
      const { getLocationObservationById } = await import(
        "~/services/location-observations.service"
      );
      const { getEmployeeObservationById } = await import(
        "~/services/employee-observations.service"
      );
      const { getServiceProviderObservationById } = await import(
        "~/services/service-provider-observations.service"
      );
      const { getSupplierObservationById } = await import(
        "~/services/supplier-observations.service"
      );
      const { getSupplierById } = await import("~/services/suppliers.service");
      const mockSuppliers = [{ id: "sup-1", name: "Supplier 1", code: "S001" }];

      vi.mocked(useParams).mockReturnValue({ observationId: "obs-1" });
      vi.mocked(getLocationObservationById).mockReturnValue(undefined);
      vi.mocked(getEmployeeObservationById).mockReturnValue(undefined);
      vi.mocked(getServiceProviderObservationById).mockReturnValue(undefined);
      vi.mocked(getSupplierObservationById).mockReturnValue({
        id: "obs-1",
        supplierId: "sup-1",
        observation: "Supplier observation",
        createdAt: "2025-01-20T10:00:00Z",
        fileIds: [],
      });
      vi.mocked(getSupplierById).mockReturnValue(mockSuppliers[0]);

      render(
        <TestWrapper>
          <ObservationDetails />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText("Supplier 1")).toBeInTheDocument();
      });
    });

    it("should render buyer observation", async () => {
      const { useParams } = await import("react-router");
      const { getLocationObservationById } = await import(
        "~/services/location-observations.service"
      );
      const { getEmployeeObservationById } = await import(
        "~/services/employee-observations.service"
      );
      const { getServiceProviderObservationById } = await import(
        "~/services/service-provider-observations.service"
      );
      const { getSupplierObservationById } = await import(
        "~/services/supplier-observations.service"
      );
      const { getBuyerObservationById } = await import("~/services/buyer-observations.service");
      const { getBuyerById } = await import("~/services/buyers.service");
      const mockBuyers = [{ id: "buy-1", name: "Buyer 1", code: "B001" }];

      vi.mocked(useParams).mockReturnValue({ observationId: "obs-1" });
      vi.mocked(getLocationObservationById).mockReturnValue(undefined);
      vi.mocked(getEmployeeObservationById).mockReturnValue(undefined);
      vi.mocked(getServiceProviderObservationById).mockReturnValue(undefined);
      vi.mocked(getSupplierObservationById).mockReturnValue(undefined);
      vi.mocked(getBuyerObservationById).mockReturnValue({
        id: "obs-1",
        buyerId: "buy-1",
        observation: "Buyer observation",
        createdAt: "2025-01-20T10:00:00Z",
        fileIds: [],
      });
      vi.mocked(getBuyerById).mockReturnValue(mockBuyers[0]);

      render(
        <TestWrapper>
          <ObservationDetails />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText("Buyer 1")).toBeInTheDocument();
      });
    });

    it("should render animal observation", async () => {
      const { useParams } = await import("react-router");
      const { getLocationObservationById } = await import(
        "~/services/location-observations.service"
      );
      const { getEmployeeObservationById } = await import(
        "~/services/employee-observations.service"
      );
      const { getServiceProviderObservationById } = await import(
        "~/services/service-provider-observations.service"
      );
      const { getSupplierObservationById } = await import(
        "~/services/supplier-observations.service"
      );
      const { getBuyerObservationById } = await import("~/services/buyer-observations.service");
      const { getAnimalObservationById } = await import("~/services/animal-observations.service");
      const { getAnimalById } = await import("~/services/animals.service");
      const { mockAnimals } = await import("~/mocks/animals");

      vi.mocked(useParams).mockReturnValue({ observationId: "obs-1" });
      vi.mocked(getLocationObservationById).mockReturnValue(undefined);
      vi.mocked(getEmployeeObservationById).mockReturnValue(undefined);
      vi.mocked(getServiceProviderObservationById).mockReturnValue(undefined);
      vi.mocked(getSupplierObservationById).mockReturnValue(undefined);
      vi.mocked(getBuyerObservationById).mockReturnValue(undefined);
      vi.mocked(getAnimalObservationById).mockReturnValue({
        id: "obs-1",
        animalId: mockAnimals[0]?.id || "animal-1",
        observation: "Animal observation",
        createdAt: "2025-01-20T10:00:00Z",
        fileIds: [],
      });
      vi.mocked(getAnimalById).mockReturnValue(mockAnimals[0]);

      render(
        <TestWrapper>
          <ObservationDetails />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(mockAnimals[0]?.code || "")).toBeInTheDocument();
      });
    });

    it("should handle observation with files", async () => {
      const { useParams } = await import("react-router");
      const { getLocationObservationById } = await import(
        "~/services/location-observations.service"
      );

      vi.mocked(useParams).mockReturnValue({ observationId: "obs-1" });
      vi.mocked(getLocationObservationById).mockReturnValue({
        id: "obs-1",
        locationId: mockLocations[0]?.id || "location-1",
        observation: "Test observation",
        createdAt: "2025-01-20T10:00:00Z",
        fileIds: ["file-1", "file-2"],
      });

      render(
        <TestWrapper>
          <ObservationDetails />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Anexos.*2/)).toBeInTheDocument();
      });
    });

    it("should handle navigation from location param", async () => {
      const user = userEvent.setup();
      const { useParams, useNavigate, useSearchParams } = await import("react-router");
      const { getLocationObservationById } = await import(
        "~/services/location-observations.service"
      );
      const { getLocationById } = await import("~/services/locations.service");
      const mockNavigate = vi.fn();

      vi.mocked(useParams).mockReturnValue({ observationId: "obs-1" });
      vi.mocked(useSearchParams).mockReturnValue([
        new URLSearchParams("?fromLocation=location-1"),
        vi.fn(),
      ]);
      vi.mocked(getLocationObservationById).mockReturnValue({
        id: "obs-1",
        locationId: mockLocations[0]?.id || "location-1",
        observation: "Test observation",
        createdAt: "2025-01-20T10:00:00Z",
        fileIds: [],
      });
      vi.mocked(getLocationById).mockReturnValue(mockLocations[0]);
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <ObservationDetails />
        </TestWrapper>
      );

      const backButton = screen.getByText("Voltar");
      await user.click(backButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
      });
    });

    it("should handle navigation from employee param", async () => {
      const user = userEvent.setup();
      const { useParams, useNavigate, useSearchParams } = await import("react-router");
      const { getEmployeeObservationById } = await import(
        "~/services/employee-observations.service"
      );
      const { getEmployeeById } = await import("~/services/employees.service");
      const mockNavigate = vi.fn();
      const mockEmployees = [{ id: "emp-1", name: "Employee 1", code: "E001" }];

      vi.mocked(useParams).mockReturnValue({ observationId: "obs-1" });
      vi.mocked(useSearchParams).mockReturnValue([
        new URLSearchParams("?fromEmployee=emp-1"),
        vi.fn(),
      ]);
      vi.mocked(getEmployeeObservationById).mockReturnValue({
        id: "obs-1",
        employeeId: "emp-1",
        observation: "Test observation",
        createdAt: "2025-01-20T10:00:00Z",
        fileIds: [],
      });
      vi.mocked(getEmployeeById).mockReturnValue(mockEmployees[0]);
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <ObservationDetails />
        </TestWrapper>
      );

      const backButton = screen.getByText("Voltar");
      await user.click(backButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
      });
    });

    it("should handle location click navigation", async () => {
      const user = userEvent.setup();
      const { useParams, useNavigate } = await import("react-router");
      const { getLocationObservationById } = await import(
        "~/services/location-observations.service"
      );
      const { getLocationById } = await import("~/services/locations.service");
      const mockNavigate = vi.fn();

      vi.mocked(useParams).mockReturnValue({ observationId: "obs-1" });
      vi.mocked(getLocationObservationById).mockReturnValue({
        id: "obs-1",
        locationId: mockLocations[0]?.id || "location-1",
        observation: "Test observation",
        createdAt: "2025-01-20T10:00:00Z",
        fileIds: [],
      });
      vi.mocked(getLocationById).mockReturnValue(mockLocations[0]);
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <ObservationDetails />
        </TestWrapper>
      );

      const locationButton = screen.getByText(mockLocations[0]?.name || "Pasto Norte");
      await user.click(locationButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
      });
    });

    it("should handle observation without files", async () => {
      const { useParams } = await import("react-router");
      const { getLocationObservationById } = await import(
        "~/services/location-observations.service"
      );

      vi.mocked(useParams).mockReturnValue({ observationId: "obs-1" });
      vi.mocked(getLocationObservationById).mockReturnValue({
        id: "obs-1",
        locationId: mockLocations[0]?.id || "location-1",
        observation: "Test observation",
        createdAt: "2025-01-20T10:00:00Z",
        fileIds: [],
      });

      render(
        <TestWrapper>
          <ObservationDetails />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText("Test observation")).toBeInTheDocument();
      });

      // Files section should not be rendered
      expect(screen.queryByText(/Anexos/)).not.toBeInTheDocument();
    });
  });
});
