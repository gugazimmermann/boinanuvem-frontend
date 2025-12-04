import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { loader, meta, default as NewInventoryItem } from "../../dashboard/inventory.new";
import { mockProperties } from "~/mocks/properties";
import { mockSuppliers } from "~/mocks/suppliers";
import { InventoryItemCategory, PaymentMethod } from "~/types";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
  };
});

vi.mock("~/utils/route-guard", () => ({
  createRouteGuard: vi.fn(() => () => Promise.resolve(null)),
}));

vi.mock("~/services/inventory.service", () => ({
  addInventoryItem: vi.fn(() => ({ id: "item-1", name: "New Item" })),
}));

vi.mock("~/services/inventory-movements.service", () => ({
  addInventoryMovement: vi.fn(() => ({ id: "movement-1" })),
}));

vi.mock("~/services/inventory-observations.service", () => ({
  addInventoryObservation: vi.fn(() => ({ id: "obs-1" })),
}));

vi.mock("~/services/bank-account.service", () => ({
  getBankAccountsByCompanyId: vi.fn(() => []),
}));

vi.mock("~/services/nitrogen-content.service", () => ({
  setNitrogenContent: vi.fn(),
}));

vi.mock("~/services/cash-flow.service", () => ({
  addCashFlow: vi.fn(() => ({ id: "cashflow-1" })),
}));

vi.mock("~/services/accounts-payable.service", () => ({
  addAccountsPayable: vi.fn(() => ({ id: "payable-1" })),
}));

vi.mock("~/hooks/use-inventory-form", () => ({
  useInventoryForm: vi.fn(() => ({
    formData: {
      code: "",
      name: "",
      description: "",
      category: InventoryItemCategory.FEED,
      customCategory: "",
      unit: "kg",
      minimumStock: "0",
      initialStock: "0",
      unitPrice: "",
      supplierId: "",
      hasExpiration: false,
      expirationDate: "",
      usageAmount: "",
      usageUnit: "",
      usageBasis: "",
      nitrogenContent: "",
      propertyIds: [],
      createCashFlowTransaction: false,
      paymentMethod: PaymentMethod.PIX,
      bankAccountId: "",
      createAccountPayable: false,
      dueDate: "",
      accountPayablePaymentMethod: PaymentMethod.PIX,
      accountPayableBankAccountId: "",
      observation: "",
    },
    errors: {},
    handleChange: vi.fn(),
    validate: vi.fn(() => true),
  })),
}));

vi.mock("~/hooks/use-alert", () => ({
  useAlert: vi.fn(() => ({
    alertMessage: null,
    showAlert: vi.fn(),
  })),
}));

vi.mock("~/components/dashboard/forms/form-page-layout", () => ({
  FormPageLayout: vi.fn(
    ({
      children,
      title,
      description,
      onSubmit,
      onCancel,
      alertMessage,
      isSubmitting,
    }: {
      children: React.ReactNode;
      title: string;
      description?: string;
      onSubmit?: (e: React.FormEvent) => void;
      onCancel?: () => void;
      alertMessage?: { title: string; variant?: string } | null;
      isSubmitting?: boolean;
    }) => (
      <div>
        {alertMessage && <div data-testid="alert">{alertMessage.title}</div>}
        <h1>{title}</h1>
        <p>{description}</p>
        <form onSubmit={onSubmit}>
          {children}
          <button type="submit" disabled={isSubmitting}>
            Salvar
          </button>
          <button type="button" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </button>
        </form>
      </div>
    )
  ),
}));

vi.mock("~/components/dashboard/inventory/inventory-item-form", () => ({
  InventoryItemForm: vi.fn(() => <div data-testid="inventory-item-form">Inventory Form</div>),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    inventory: {
      addItem: "Adicionar Item de Estoque",
      new: {
        description: "Adicione um novo item de estoque",
        success: "Item adicionado com sucesso",
        error: "Erro ao adicionar item",
        initialStockDescription: "Estoque inicial",
      },
    },
    common: {
      back: "Voltar",
      cancel: "Cancelar",
      save: "Salvar",
      loading: "Carregando...",
    },
  })),
}));

vi.mock("~/routes.config", () => ({
  ROUTES: {
    INVENTORY: "/dashboard/estoque",
  },
}));

vi.mock("~/utils/inventory-utils", () => ({
  getCategoryForCashFlow: vi.fn(() => "feed"),
}));

vi.mock("~/utils/inventory-form-helpers", () => ({
  getUsageFields: vi.fn(() => ({})),
  getCustomCategory: vi.fn(() => ""),
  getExpirationDate: vi.fn(() => undefined),
  handleNitrogenContent: vi.fn(),
  getInitialStock: vi.fn((value: string) => Number.parseFloat(value) || 0),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe("inventory.new", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("loader", () => {
    it("should call createRouteGuard", async () => {
      const { createRouteGuard } = await import("~/utils/route-guard");
      const request = new Request("http://localhost/dashboard/estoque/novo");

      await loader({ request });

      expect(createRouteGuard).toHaveBeenCalled();
    });
  });

  describe("meta", () => {
    it("should return SEO meta tags", () => {
      const result = meta();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toHaveProperty("title");
      expect(result[0].title).toContain("Adicionar Item de Estoque");
    });
  });

  describe("NewInventoryItem component", () => {
    it("should render form with correct title", () => {
      render(
        <TestWrapper>
          <NewInventoryItem />
        </TestWrapper>
      );

      expect(screen.getByText("Adicionar Item de Estoque")).toBeInTheDocument();
    });

    it("should render inventory form", () => {
      render(
        <TestWrapper>
          <NewInventoryItem />
        </TestWrapper>
      );

      expect(screen.getByTestId("inventory-item-form")).toBeInTheDocument();
    });

    it("should call addInventoryItem when form is submitted", async () => {
      const user = userEvent.setup();
      const { addInventoryItem } = await import("~/services/inventory.service");
      const { useInventoryForm } = await import("~/hooks/use-inventory-form");

      vi.mocked(useInventoryForm).mockReturnValue({
        formData: {
          code: "NEW001",
          name: "New Item",
          description: "Test description",
          category: InventoryItemCategory.FEED,
          customCategory: "",
          unit: "kg",
          minimumStock: "100",
          initialStock: "0",
          unitPrice: "2.5",
          supplierId: "",
          hasExpiration: false,
          expirationDate: "",
          usageAmount: "",
          usageUnit: "",
          usageBasis: "",
          nitrogenContent: "",
          propertyIds: mockProperties.map((p) => p.id),
          createCashFlowTransaction: false,
          paymentMethod: PaymentMethod.PIX,
          bankAccountId: "",
          createAccountPayable: false,
          dueDate: "",
          accountPayablePaymentMethod: PaymentMethod.PIX,
          accountPayableBankAccountId: "",
          observation: "",
        },
        errors: {},
        handleChange: vi.fn(),
        validate: vi.fn(() => true),
      });

      render(
        <TestWrapper>
          <NewInventoryItem />
        </TestWrapper>
      );

      const submitButton = screen.getByText("Salvar");
      await user.click(submitButton);

      await waitFor(() => {
        expect(addInventoryItem).toHaveBeenCalled();
      });
    });

    it("should create initial stock movement when initial stock is provided", async () => {
      const user = userEvent.setup();
      const { addInventoryMovement } = await import("~/services/inventory-movements.service");
      const { useInventoryForm } = await import("~/hooks/use-inventory-form");

      vi.mocked(useInventoryForm).mockReturnValue({
        formData: {
          code: "NEW001",
          name: "New Item",
          description: "",
          category: InventoryItemCategory.FEED,
          customCategory: "",
          unit: "kg",
          minimumStock: "100",
          initialStock: "50",
          unitPrice: "2.5",
          supplierId: mockSuppliers[0]?.id || "",
          hasExpiration: false,
          expirationDate: "",
          usageAmount: "",
          usageUnit: "",
          usageBasis: "",
          nitrogenContent: "",
          propertyIds: mockProperties.map((p) => p.id),
          createCashFlowTransaction: false,
          paymentMethod: PaymentMethod.PIX,
          bankAccountId: "",
          createAccountPayable: false,
          dueDate: "",
          accountPayablePaymentMethod: PaymentMethod.PIX,
          accountPayableBankAccountId: "",
          observation: "",
        },
        errors: {},
        handleChange: vi.fn(),
        validate: vi.fn(() => true),
      });

      render(
        <TestWrapper>
          <NewInventoryItem />
        </TestWrapper>
      );

      const submitButton = screen.getByText("Salvar");
      await user.click(submitButton);

      await waitFor(() => {
        expect(addInventoryMovement).toHaveBeenCalled();
      });
    });

    it("should create observation when observation is provided", async () => {
      const user = userEvent.setup();
      const { addInventoryObservation } = await import("~/services/inventory-observations.service");
      const { useInventoryForm } = await import("~/hooks/use-inventory-form");

      vi.mocked(useInventoryForm).mockReturnValue({
        formData: {
          code: "NEW001",
          name: "New Item",
          description: "",
          category: InventoryItemCategory.FEED,
          customCategory: "",
          unit: "kg",
          minimumStock: "100",
          initialStock: "0",
          unitPrice: "",
          supplierId: "",
          hasExpiration: false,
          expirationDate: "",
          usageAmount: "",
          usageUnit: "",
          usageBasis: "",
          nitrogenContent: "",
          propertyIds: mockProperties.map((p) => p.id),
          createCashFlowTransaction: false,
          paymentMethod: PaymentMethod.PIX,
          bankAccountId: "",
          createAccountPayable: false,
          dueDate: "",
          accountPayablePaymentMethod: PaymentMethod.PIX,
          accountPayableBankAccountId: "",
          observation: "Test observation",
        },
        errors: {},
        handleChange: vi.fn(),
        validate: vi.fn(() => true),
      });

      render(
        <TestWrapper>
          <NewInventoryItem />
        </TestWrapper>
      );

      const submitButton = screen.getByText("Salvar");
      await user.click(submitButton);

      await waitFor(() => {
        expect(addInventoryObservation).toHaveBeenCalled();
      });
    });

    it("should navigate back when cancel button is clicked", async () => {
      const user = userEvent.setup();
      const { useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();

      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <NewInventoryItem />
        </TestWrapper>
      );

      const cancelButton = screen.getByText("Cancelar");
      await user.click(cancelButton);

      expect(mockNavigate).toHaveBeenCalled();
    });

    it("should display alert message on success", async () => {
      const user = userEvent.setup();
      const { useAlert } = await import("~/hooks/use-alert");
      const { useInventoryForm } = await import("~/hooks/use-inventory-form");
      const mockShowAlert = vi.fn();

      vi.mocked(useAlert).mockReturnValue({
        alertMessage: null,
        showAlert: mockShowAlert,
      });
      vi.mocked(useInventoryForm).mockReturnValue({
        formData: {
          code: "NEW001",
          name: "New Item",
          description: "",
          category: InventoryItemCategory.FEED,
          customCategory: "",
          unit: "kg",
          minimumStock: "100",
          initialStock: "0",
          unitPrice: "",
          supplierId: "",
          hasExpiration: false,
          expirationDate: "",
          usageAmount: "",
          usageUnit: "",
          usageBasis: "",
          nitrogenContent: "",
          propertyIds: mockProperties.map((p) => p.id),
          createCashFlowTransaction: false,
          paymentMethod: PaymentMethod.PIX,
          bankAccountId: "",
          createAccountPayable: false,
          dueDate: "",
          accountPayablePaymentMethod: PaymentMethod.PIX,
          accountPayableBankAccountId: "",
          observation: "",
        },
        errors: {},
        handleChange: vi.fn(),
        validate: vi.fn(() => true),
      });

      render(
        <TestWrapper>
          <NewInventoryItem />
        </TestWrapper>
      );

      const submitButton = screen.getByText("Salvar");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockShowAlert).toHaveBeenCalledWith("Item adicionado com sucesso", "success");
      });
    });
  });
});
