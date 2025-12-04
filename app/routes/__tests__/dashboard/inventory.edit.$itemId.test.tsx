import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { loader, meta, default as EditInventoryItem } from "../../dashboard/inventory.edit.$itemId";
import { mockInventoryItems } from "~/mocks/inventory";
import { PaymentMethod } from "~/types";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useParams: vi.fn(() => ({ itemId: mockInventoryItems[0]?.id || "item-1" })),
    useNavigate: vi.fn(() => vi.fn()),
  };
});

vi.mock("~/utils/route-guard", () => ({
  createRouteGuard: vi.fn(() => () => Promise.resolve(null)),
}));

vi.mock("~/services/inventory.service", () => ({
  getInventoryItemById: vi.fn(),
  updateInventoryItem: vi.fn(() => true),
}));

vi.mock("~/services/nitrogen-content.service", () => ({
  getNitrogenContent: vi.fn(() => 0),
  setNitrogenContent: vi.fn(),
}));

vi.mock("~/services/bank-account.service", () => ({
  getBankAccountsByCompanyId: vi.fn(() => []),
}));

vi.mock("~/hooks/use-inventory-form", () => ({
  useInventoryForm: vi.fn(() => ({
    formData: {
      code: "RAC001",
      name: "Ração Premium",
      description: "",
      category: "feed",
      customCategory: "",
      unit: "kg",
      minimumStock: "500",
      initialStock: "0",
      unitPrice: "2.5",
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
    setFormData: vi.fn(),
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
      submitButtonLabel,
      cancelButtonLabel,
    }: {
      children: React.ReactNode;
      title: string;
      description?: string;
      onSubmit?: (e: React.FormEvent) => void;
      onCancel?: () => void;
      alertMessage?: { title: string; variant?: string } | null;
      isSubmitting?: boolean;
      submitButtonLabel?: string;
      cancelButtonLabel?: string;
    }) => (
      <div>
        {alertMessage && <div data-testid="alert">{alertMessage.title}</div>}
        <h1>{title}</h1>
        <p>{description}</p>
        <form onSubmit={onSubmit}>
          {children}
          <button type="submit" disabled={isSubmitting}>
            {submitButtonLabel || "Salvar"}
          </button>
          <button type="button" onClick={onCancel} disabled={isSubmitting}>
            {cancelButtonLabel || "Cancelar"}
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
      emptyState: { title: "Item não encontrado" },
      edit: {
        title: "Editar Item de Estoque",
        description: "Edite as informações do item de estoque",
        success: "Item atualizado com sucesso",
        error: "Erro ao atualizar item",
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
  getInventoryViewRoute: vi.fn((id: string) => `/dashboard/estoque/${id}`),
}));

vi.mock("~/utils/inventory-form-helpers", () => ({
  getUsageFields: vi.fn(() => ({})),
  getCustomCategory: vi.fn(() => ""),
  getExpirationDate: vi.fn(() => undefined),
  handleNitrogenContent: vi.fn(),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe("inventory.edit.$itemId", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { getInventoryItemById } = await import("~/services/inventory.service");
    vi.mocked(getInventoryItemById).mockImplementation((id: string) =>
      mockInventoryItems.find((item) => item.id === id)
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("loader", () => {
    it("should call createRouteGuard", async () => {
      const { createRouteGuard } = await import("~/utils/route-guard");
      const request = new Request("http://localhost/dashboard/estoque/item-1/editar");

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
      expect(result[0].title).toContain("Editar Item de Estoque");
    });
  });

  describe("EditInventoryItem component", () => {
    it("should render form with correct title", async () => {
      const { useParams } = await import("react-router");
      vi.mocked(useParams).mockReturnValue({ itemId: mockInventoryItems[0]?.id || "item-1" });

      render(
        <TestWrapper>
          <EditInventoryItem />
        </TestWrapper>
      );

      expect(screen.getByText("Editar Item de Estoque")).toBeInTheDocument();
    });

    it("should render empty state when item is not found", async () => {
      const { useParams } = await import("react-router");
      vi.mocked(useParams).mockReturnValue({ itemId: "non-existent" });

      const { getInventoryItemById } = await import("~/services/inventory.service");
      vi.mocked(getInventoryItemById).mockReturnValue(undefined);

      render(
        <TestWrapper>
          <EditInventoryItem />
        </TestWrapper>
      );

      expect(screen.getByText("Item não encontrado")).toBeInTheDocument();
    });

    it("should render inventory form", async () => {
      const { useParams } = await import("react-router");
      vi.mocked(useParams).mockReturnValue({ itemId: mockInventoryItems[0]?.id || "item-1" });

      render(
        <TestWrapper>
          <EditInventoryItem />
        </TestWrapper>
      );

      expect(screen.getByTestId("inventory-item-form")).toBeInTheDocument();
    });

    it("should call updateInventoryItem when form is submitted", async () => {
      const user = userEvent.setup();
      const { useParams } = await import("react-router");
      const { useInventoryForm } = await import("~/hooks/use-inventory-form");

      vi.mocked(useParams).mockReturnValue({ itemId: mockInventoryItems[0]?.id || "item-1" });
      vi.mocked(useInventoryForm).mockReturnValue({
        formData: {
          code: "RAC001",
          name: "Ração Premium Updated",
          description: "",
          category: "feed",
          customCategory: "",
          unit: "kg",
          minimumStock: "500",
          initialStock: "0",
          unitPrice: "2.5",
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
        setFormData: vi.fn(),
      });

      render(
        <TestWrapper>
          <EditInventoryItem />
        </TestWrapper>
      );

      const submitButton = screen.getByText("Salvar");
      await user.click(submitButton);

      const { updateInventoryItem } = await import("~/services/inventory.service");
      await waitFor(() => {
        expect(updateInventoryItem).toHaveBeenCalled();
      });
    });

    it("should navigate back when cancel button is clicked", async () => {
      const user = userEvent.setup();
      const { useParams, useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();

      vi.mocked(useParams).mockReturnValue({ itemId: mockInventoryItems[0]?.id || "item-1" });
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <EditInventoryItem />
        </TestWrapper>
      );

      const cancelButton = screen.getByText("Cancelar");
      await user.click(cancelButton);

      expect(mockNavigate).toHaveBeenCalled();
    });

    it("should display alert message on success", async () => {
      const user = userEvent.setup();
      const { useParams } = await import("react-router");
      const { useAlert } = await import("~/hooks/use-alert");
      const { useInventoryForm } = await import("~/hooks/use-inventory-form");
      const mockShowAlert = vi.fn();

      vi.mocked(useParams).mockReturnValue({ itemId: mockInventoryItems[0]?.id || "item-1" });
      vi.mocked(useAlert).mockReturnValue({
        alertMessage: null,
        showAlert: mockShowAlert,
      });
      vi.mocked(useInventoryForm).mockReturnValue({
        formData: {
          code: "RAC001",
          name: "Ração Premium",
          description: "",
          category: "feed",
          customCategory: "",
          unit: "kg",
          minimumStock: "500",
          initialStock: "0",
          unitPrice: "2.5",
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
        setFormData: vi.fn(),
      });

      render(
        <TestWrapper>
          <EditInventoryItem />
        </TestWrapper>
      );

      const submitButton = screen.getByText("Salvar");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockShowAlert).toHaveBeenCalledWith("Item atualizado com sucesso", "success");
      });
    });

    it("should display alert message on error", async () => {
      const user = userEvent.setup();
      const { useParams } = await import("react-router");
      const { useAlert } = await import("~/hooks/use-alert");
      const { useInventoryForm } = await import("~/hooks/use-inventory-form");
      const mockShowAlert = vi.fn();

      const { updateInventoryItem } = await import("~/services/inventory.service");
      vi.mocked(useParams).mockReturnValue({ itemId: mockInventoryItems[0]?.id || "item-1" });
      vi.mocked(updateInventoryItem).mockReturnValueOnce(false);
      vi.mocked(useAlert).mockReturnValue({
        alertMessage: null,
        showAlert: mockShowAlert,
      });
      vi.mocked(useInventoryForm).mockReturnValue({
        formData: {
          code: "RAC001",
          name: "Ração Premium",
          description: "",
          category: "feed",
          customCategory: "",
          unit: "kg",
          minimumStock: "500",
          initialStock: "0",
          unitPrice: "2.5",
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
        setFormData: vi.fn(),
      });

      render(
        <TestWrapper>
          <EditInventoryItem />
        </TestWrapper>
      );

      const submitButton = screen.getByText("Salvar");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockShowAlert).toHaveBeenCalledWith("Erro ao atualizar item", "error");
      });
    });
  });
});
