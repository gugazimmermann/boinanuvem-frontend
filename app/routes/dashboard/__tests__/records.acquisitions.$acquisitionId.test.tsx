import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import AcquisitionDetails from "../records.acquisitions.$acquisitionId";
import { getAcquisitionById } from "~/services/acquisitions.service";
import { getSupplierById } from "~/services/suppliers.service";
import { getPropertyById } from "~/services/properties.service";
import { getAnimalById } from "~/services/animals.service";
import { AcquisitionPaymentMethod } from "~/types";

vi.mock("~/services/acquisitions.service");
vi.mock("~/services/suppliers.service");
vi.mock("~/services/properties.service");
vi.mock("~/services/animals.service");
vi.mock("~/i18n", () => ({
  useTranslation: () => ({
    acquisitions: {
      details: {
        title: "Detalhes da Aquisição",
      },
      table: {
        supplier: "Fornecedor",
        paymentMethod: "Pagamento",
        totalPrice: "Valor Total",
        animals: "Animais",
      },
      paymentMethods: {
        cashFlow: "À Vista",
        accountsPayable: "A Pagar",
      },
      errors: {
        loadFailed: "Erro ao carregar aquisição",
      },
      notFound: "Aquisição não encontrada",
    },
    sales: {
      details: {
        property: "Propriedade",
        observation: "Observações",
      },
    },
    animals: {
      table: {
        gender: "Sexo",
        birthDate: "Idade",
      },
      gender: {
        male: "Macho",
        female: "Fêmea",
      },
    },
    common: {
      back: "Voltar",
      edit: "Editar",
      month: "mês",
      months: "meses",
    },
  }),
}));
vi.mock("~/contexts/language-context", () => ({
  useLanguage: () => ({ language: "pt" }),
}));
vi.mock("~/utils/permissions", () => ({
  usePermissions: () => ({
    canEdit: () => true,
    canRemove: () => true,
  }),
}));
vi.mock("~/hooks/use-alert", () => ({
  useAlert: () => ({
    alertMessage: null,
    showAlert: vi.fn(),
  }),
}));
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useParams: () => ({ acquisitionId: "acq-1" }),
    useNavigate: () => vi.fn(),
  };
});

describe("records.acquisitions.$acquisitionId", () => {
  const mockAcquisition = {
    id: "acq-1",
    companyId: "company-1",
    propertyId: "property-1",
    supplierId: "supplier-1",
    acquisitionDate: "2024-01-01",
    pricingMode: "per_animal" as const,
    paymentMethod: AcquisitionPaymentMethod.CASH_FLOW,
    totalPrice: 10000,
    fees: [
      {
        id: "fee-1",
        name: "Taxa de Transporte",
        amount: 500,
      },
    ],
    transportationFee: 200,
    handlingFee: 100,
    acquisitionItems: [
      {
        animalId: "animal-1",
        price: 5000,
        weight: 500,
        costPerArroba: 300,
        gender: "male" as const,
        birthDate: "2023-01-01",
      },
    ],
    createdAt: "2024-01-01T00:00:00Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAcquisitionById).mockResolvedValue(mockAcquisition);
    vi.mocked(getSupplierById).mockResolvedValue({
      id: "supplier-1",
      name: "Supplier 1",
      companyId: "company-1",
      createdAt: "2024-01-01T00:00:00Z",
    });
    vi.mocked(getPropertyById).mockResolvedValue({
      id: "property-1",
      name: "Property 1",
      code: "PROP-1",
      companyId: "company-1",
      status: "active" as const,
      createdAt: "2024-01-01T00:00:00Z",
      area: { value: 100, type: "hectares" as const },
      street: "Main St",
      number: "123",
      complement: "",
      neighborhood: "Downtown",
      city: "City",
      state: "ST",
      zipCode: "12345-678",
    });
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

  it("should load acquisition data asynchronously", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/records/acquisitions/acq-1"]}>
        {children}
      </MemoryRouter>
    );
    render(<AcquisitionDetails />, { wrapper });

    await waitFor(() => {
      expect(getAcquisitionById).toHaveBeenCalledWith("acq-1");
    });
  });

  it("should load related supplier, property, and animal data", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/records/acquisitions/acq-1"]}>
        {children}
      </MemoryRouter>
    );
    render(<AcquisitionDetails />, { wrapper });

    await waitFor(() => {
      expect(getSupplierById).toHaveBeenCalled();
      expect(getPropertyById).toHaveBeenCalled();
      expect(getAnimalById).toHaveBeenCalled();
    });
  });

  it("should display acquisition details when loaded", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/records/acquisitions/acq-1"]}>
        {children}
      </MemoryRouter>
    );
    const { getByText } = render(<AcquisitionDetails />, { wrapper });

    await waitFor(() => {
      expect(getByText("Detalhes da Aquisição")).toBeInTheDocument();
    });
  });

  it("should handle missing acquisition gracefully", async () => {
    vi.mocked(getAcquisitionById).mockResolvedValue(undefined);
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/records/acquisitions/acq-1"]}>
        {children}
      </MemoryRouter>
    );
    const { getByText } = render(<AcquisitionDetails />, { wrapper });

    await waitFor(() => {
      expect(getByText("Aquisição não encontrada")).toBeInTheDocument();
    });
  });

  it("should display payment method badge", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/records/acquisitions/acq-1"]}>
        {children}
      </MemoryRouter>
    );
    const { getByText } = render(<AcquisitionDetails />, { wrapper });

    await waitFor(() => {
      expect(getByText("À Vista")).toBeInTheDocument();
    });
  });
});
