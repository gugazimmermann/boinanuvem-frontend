import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import ObservationDetails from "../observations.$observationId";
import { getAnimalObservationById } from "~/services/animal-observations.service";
import { getAnimalById } from "~/services/animals.service";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useParams: () => ({ observationId: "observation-1" }),
  };
});

vi.mock("~/services/animal-observations.service");
vi.mock("~/services/animals.service");
vi.mock("~/i18n", () => ({
  useTranslation: () => ({
    common: {
      loading: "Carregando observação...",
    },
    locations: {
      details: {
        tabs: {
          observations: "Observação",
        },
        observationNotFound: "Observação não encontrada",
        observation: "Observação",
        files: "Anexos",
      },
      table: {
        name: "Nome",
      },
    },
    team: {
      new: {
        back: "Voltar",
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
  }),
}));
vi.mock("~/contexts/language-context", () => ({
  useLanguage: () => ({ language: "en" }),
}));
vi.mock("~/utils/permissions", () => ({
  usePermissions: () => ({ canEdit: true, canRemove: true }),
}));
vi.mock("~/hooks/use-alert", () => ({
  useAlert: () => ({
    alertMessage: null,
    showAlert: vi.fn(),
  }),
}));

describe("observations.$observationId", () => {
  const mockObservation = {
    id: "observation-1",
    animalId: "animal-1",
    date: "2024-01-01",
    description: "Test observation",
    companyId: "company-1",
    createdAt: "2024-01-01T00:00:00Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAnimalObservationById).mockReturnValue(mockObservation);
    vi.mocked(getAnimalById).mockResolvedValue({
      id: "animal-1",
      code: "A001",
      registrationNumber: "REG001",
      companyId: "company-1",
      propertyId: "property-1",
      status: "active" as const,
      createdAt: "2024-01-01T00:00:00Z",
    });
  });

  it("should load observation data asynchronously", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/observations/observation-1"]}>
        {children}
      </MemoryRouter>
    );
    render(<ObservationDetails />, { wrapper });

    await waitFor(() => {
      expect(getAnimalObservationById).toHaveBeenCalledWith("observation-1");
    });
  });

  it("should load related animal data", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/observations/observation-1"]}>
        {children}
      </MemoryRouter>
    );
    render(<ObservationDetails />, { wrapper });

    await waitFor(() => {
      expect(getAnimalById).toHaveBeenCalled();
    });
  });
});
