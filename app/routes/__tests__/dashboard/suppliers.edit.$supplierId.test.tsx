import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { loader, meta, default as EditSupplier } from "../../dashboard/suppliers.edit.$supplierId";
import { ROUTES } from "~/routes.config";
import { mockSuppliers } from "~/mocks/suppliers";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useParams: vi.fn(() => ({ supplierId: "990e8400-e29b-41d4-a716-446655440010" })),
    useNavigate: vi.fn(() => vi.fn()),
  };
});

vi.mock("~/utils/route-guard", () => ({
  createRouteGuard: vi.fn(() => () => Promise.resolve(null)),
}));

vi.mock("~/services/suppliers.service", () => ({
  getSupplierById: vi.fn((id: string) => {
    return mockSuppliers.find((s) => s.id === id) || null;
  }),
  updateSupplier: vi.fn(() => true),
}));

vi.mock("~/mocks/properties", () => ({
  mockProperties: [
    {
      id: "550e8400-e29b-41d4-a716-446655440010",
      name: "Property 1",
      companyId: "550e8400-e29b-41d4-a716-446655440000",
    },
  ],
}));

vi.mock("~/components/dashboard/forms/entity-form", () => ({
  EntityForm: vi.fn(
    ({
      onSubmit,
      onSuccess,
      onCancel,
    }: {
      entityType: string;
      initialData: unknown;
      onSubmit: (data: unknown) => Promise<void>;
      onSuccess: () => void;
      onCancel: () => void;
      successMessage: string;
      errorMessage: string;
      isEdit: boolean;
    }) => {
      const handleClick = async () => {
        try {
          await onSubmit({});
          onSuccess();
        } catch {
          // If onSubmit throws, onSuccess is not called
        }
      };
      return (
        <div data-testid="entity-form">
          <button data-testid="submit-button" onClick={handleClick}>
            Submit
          </button>
          <button data-testid="cancel-button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      );
    }
  ),
}));

vi.mock("~/components/ui", () => ({
  Button: vi.fn(
    ({
      children,
      onClick,
      variant,
    }: {
      children: React.ReactNode;
      onClick?: () => void;
      variant?: string;
    }) => (
      <button onClick={onClick} data-variant={variant}>
        {children}
      </button>
    )
  ),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    suppliers: {
      edit: {
        title: "Editar Fornecedor",
        description: "Edite as informações do fornecedor",
      },
      success: {
        updated: "Fornecedor atualizado com sucesso",
      },
      errors: {
        updateFailed: "Erro ao atualizar fornecedor",
      },
      emptyState: {
        title: "Fornecedor não encontrado",
      },
    },
    team: {
      new: {
        back: "Voltar",
      },
    },
  })),
}));

const TestWrapper = ({
  children,
  initialEntries = ["/dashboard/fornecedores/990e8400-e29b-41d4-a716-446655440010/editar"],
}: {
  children: React.ReactNode;
  initialEntries?: string[];
}) => <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>;

describe("suppliers.edit.$supplierId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("loader", () => {
    it("should call createRouteGuard", async () => {
      const { createRouteGuard } = await import("~/utils/route-guard");
      const request = new Request(
        "http://localhost/dashboard/fornecedores/990e8400-e29b-41d4-a716-446655440010/editar"
      );

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
      expect(result[0].title).toContain("Editar Fornecedor");
    });
  });

  describe("EditSupplier component", () => {
    it("should render form with correct title", async () => {
      const { useParams } = await import("react-router");
      vi.mocked(useParams).mockReturnValue({ supplierId: mockSuppliers[0].id });

      render(
        <TestWrapper>
          <EditSupplier />
        </TestWrapper>
      );

      expect(screen.getByText("Editar Fornecedor")).toBeInTheDocument();
    });

    it("should render form with correct description", async () => {
      const { useParams } = await import("react-router");
      vi.mocked(useParams).mockReturnValue({ supplierId: mockSuppliers[0].id });

      render(
        <TestWrapper>
          <EditSupplier />
        </TestWrapper>
      );

      expect(screen.getByText("Edite as informações do fornecedor")).toBeInTheDocument();
    });

    it("should render empty state when supplier is not found", async () => {
      const { useParams } = await import("react-router");
      vi.mocked(useParams).mockReturnValue({ supplierId: "non-existent" });

      render(
        <TestWrapper>
          <EditSupplier />
        </TestWrapper>
      );

      expect(screen.getByText("Fornecedor não encontrado")).toBeInTheDocument();
    });

    it("should call updateSupplier when form is submitted", async () => {
      const { useParams, useNavigate } = await import("react-router");
      const { updateSupplier } = await import("~/services/suppliers.service");
      const mockNavigate = vi.fn();
      const supplier = mockSuppliers[0];
      vi.mocked(useParams).mockReturnValue({ supplierId: supplier.id });
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <EditSupplier />
        </TestWrapper>
      );

      const submitButton = screen.getByTestId("submit-button");
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(updateSupplier).toHaveBeenCalled();
      });
    });

    it("should navigate to suppliers list on success", async () => {
      const { useParams, useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();
      const supplier = mockSuppliers[0];
      vi.mocked(useParams).mockReturnValue({ supplierId: supplier.id });
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      vi.useFakeTimers();

      render(
        <TestWrapper>
          <EditSupplier />
        </TestWrapper>
      );

      const submitButton = screen.getByTestId("submit-button");
      const { fireEvent } = await import("@testing-library/react");
      fireEvent.click(submitButton);

      await vi.advanceTimersByTimeAsync(1600);

      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SUPPLIERS);

      vi.useRealTimers();
    }, 10000);

    it("should navigate to suppliers list when cancel button is clicked", async () => {
      const { useParams, useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();
      const supplier = mockSuppliers[0];
      vi.mocked(useParams).mockReturnValue({ supplierId: supplier.id });
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <EditSupplier />
        </TestWrapper>
      );

      const cancelButton = screen.getByTestId("cancel-button");
      await userEvent.click(cancelButton);

      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SUPPLIERS);
    });

    it("should navigate to suppliers list when back button is clicked", async () => {
      const { useParams, useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();
      const supplier = mockSuppliers[0];
      vi.mocked(useParams).mockReturnValue({ supplierId: supplier.id });
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <EditSupplier />
        </TestWrapper>
      );

      const backButton = screen.getByText("Voltar");
      await userEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SUPPLIERS);
    });

    it("should pass correct initial data to form", async () => {
      const { useParams } = await import("react-router");
      const supplier = mockSuppliers[0];
      vi.mocked(useParams).mockReturnValue({ supplierId: supplier.id });

      render(
        <TestWrapper>
          <EditSupplier />
        </TestWrapper>
      );

      const EntityForm = (await import("~/components/dashboard/forms/entity-form")).EntityForm;
      const calls = vi.mocked(EntityForm).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      expect(props).toHaveProperty("entityType", "supplier");
      expect(props).toHaveProperty("initialData");
      expect(props).toHaveProperty("isEdit", true);
    });

    it("should handle updateSupplier failure", async () => {
      const { useParams } = await import("react-router");
      const { updateSupplier } = await import("~/services/suppliers.service");
      const supplier = mockSuppliers[0];
      vi.mocked(useParams).mockReturnValue({ supplierId: supplier.id });
      vi.mocked(updateSupplier).mockReturnValue(false);

      render(
        <TestWrapper>
          <EditSupplier />
        </TestWrapper>
      );

      const submitButton = screen.getByTestId("submit-button");

      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(updateSupplier).toHaveBeenCalled();
      });

      expect(updateSupplier).toHaveBeenCalled();
    });

    it("should not call updateSupplier when supplierId is missing", async () => {
      const { useParams } = await import("react-router");
      const { updateSupplier } = await import("~/services/suppliers.service");
      vi.mocked(useParams).mockReturnValue({ supplierId: undefined });

      render(
        <TestWrapper>
          <EditSupplier />
        </TestWrapper>
      );

      // When supplierId is undefined, the component shows empty state (no form)
      expect(screen.getByText("Fornecedor não encontrado")).toBeInTheDocument();
      expect(screen.queryByTestId("submit-button")).not.toBeInTheDocument();
      expect(updateSupplier).not.toHaveBeenCalled();
    });
  });
});
