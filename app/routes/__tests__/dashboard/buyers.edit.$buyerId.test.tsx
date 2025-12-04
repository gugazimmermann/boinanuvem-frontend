import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { loader, meta, default as EditBuyer } from "../../dashboard/buyers.edit.$buyerId";
import { mockBuyers } from "~/mocks/buyers";
import { mockProperties } from "~/mocks/properties";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useParams: vi.fn(() => ({ buyerId: "aa0e8400-e29b-41d4-a716-446655440010" })),
    useNavigate: vi.fn(() => vi.fn()),
  };
});

vi.mock("~/utils/route-guard", () => ({
  createRouteGuard: vi.fn(() => () => Promise.resolve(null)),
}));

vi.mock("~/services/buyers.service", () => ({
  getBuyerById: vi.fn(),
  updateBuyer: vi.fn(),
}));

vi.mock("~/components/dashboard/forms/entity-form", () => ({
  EntityForm: vi.fn(
    ({
      entityType,
      initialData,
      onSubmit,
      onSuccess,
      onCancel,
    }: {
      entityType: string;
      initialData: Record<string, unknown>;
      onSubmit: (data: Record<string, unknown>) => Promise<void>;
      onSuccess: () => void;
      onCancel: () => void;
    }) => (
      <div data-testid="entity-form">
        <h1>Edit {entityType}</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(initialData)
              .then(() => {
                onSuccess();
              })
              .catch(() => {
                // Error is handled by the form component
              });
          }}
        >
          <button type="submit">Save</button>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        </form>
      </div>
    )
  ),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    buyers: {
      emptyState: { title: "Comprador não encontrado" },
      edit: {
        title: "Editar Comprador",
        description: "Edite as informações do comprador",
      },
      success: {
        updated: "Comprador atualizado com sucesso",
      },
      errors: {
        updateFailed: "Erro ao atualizar comprador",
      },
    },
    team: {
      new: {
        back: "Voltar",
      },
    },
  })),
}));

vi.mock("~/utils/entity-route-helpers", () => ({
  mapEntityToFormData: vi.fn(
    (entity: {
      name: string;
      code: string;
      cpf?: string;
      cnpj?: string;
      email?: string;
      phone?: string;
      propertyIds?: string[];
      street?: string;
      number?: string;
      complement?: string;
      neighborhood?: string;
      city?: string;
      state?: string;
      zipCode?: string;
    }) => ({
      name: entity.name,
      code: entity.code,
      cpf: entity.cpf,
      cnpj: entity.cnpj,
      email: entity.email,
      phone: entity.phone,
      propertyIds: entity.propertyIds,
      street: entity.street,
      number: entity.number,
      complement: entity.complement,
      neighborhood: entity.neighborhood,
      city: entity.city,
      state: entity.state,
      zipCode: entity.zipCode,
    })
  ),
  mapFormDataToEntityUpdate: vi.fn((data: Record<string, unknown>) => data),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe("buyers.edit.$buyerId", () => {
  const mockNavigate = vi.fn();
  const mockBuyer = mockBuyers[0];

  beforeEach(async () => {
    vi.clearAllMocks();
    const { useParams, useNavigate } = await import("react-router");
    vi.mocked(useParams).mockReturnValue({ buyerId: mockBuyer.id });
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    const { getBuyerById, updateBuyer } = await import("~/services/buyers.service");
    vi.mocked(getBuyerById).mockReturnValue(mockBuyer);
    vi.mocked(updateBuyer).mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("loader", () => {
    it("should call createRouteGuard", async () => {
      const { createRouteGuard } = await import("~/utils/route-guard");
      const request = new Request(
        "http://localhost/dashboard/compradores/aa0e8400-e29b-41d4-a716-446655440010/editar"
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
      expect(result[0].title).toContain("Editar Comprador");
    });
  });

  describe("EditBuyer component", () => {
    it("should render empty state when buyer is not found", async () => {
      const { useParams } = await import("react-router");
      vi.mocked(useParams).mockReturnValue({ buyerId: "non-existent" });

      const { getBuyerById } = await import("~/services/buyers.service");
      vi.mocked(getBuyerById).mockReturnValue(undefined);

      render(
        <TestWrapper>
          <EditBuyer />
        </TestWrapper>
      );

      expect(screen.getByText("Comprador não encontrado")).toBeInTheDocument();
    });

    it("should render form with correct title", () => {
      render(
        <TestWrapper>
          <EditBuyer />
        </TestWrapper>
      );

      expect(screen.getByText("Editar Comprador")).toBeInTheDocument();
      expect(screen.getByTestId("entity-form")).toBeInTheDocument();
    });

    it("should call updateBuyer when form is submitted", async () => {
      const { updateBuyer } = await import("~/services/buyers.service");

      render(
        <TestWrapper>
          <EditBuyer />
        </TestWrapper>
      );

      const saveButton = screen.getByText("Save");
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(updateBuyer).toHaveBeenCalledWith(mockBuyer.id, expect.any(Object));
      });
    });

    it("should navigate to buyers list after successful update", async () => {
      render(
        <TestWrapper>
          <EditBuyer />
        </TestWrapper>
      );

      const saveButton = screen.getByText("Save");
      await userEvent.click(saveButton);

      await waitFor(
        () => {
          expect(mockNavigate).toHaveBeenCalled();
        },
        { timeout: 2000 }
      );
    });

    it("should navigate back when back button is clicked", async () => {
      render(
        <TestWrapper>
          <EditBuyer />
        </TestWrapper>
      );

      const backButton = screen.getByText("Voltar");
      await userEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalled();
    });

    it("should navigate back when cancel button is clicked", async () => {
      render(
        <TestWrapper>
          <EditBuyer />
        </TestWrapper>
      );

      const cancelButton = screen.getByText("Cancel");
      await userEvent.click(cancelButton);

      expect(mockNavigate).toHaveBeenCalled();
    });

    it("should pass correct props to EntityForm", async () => {
      render(
        <TestWrapper>
          <EditBuyer />
        </TestWrapper>
      );

      const EntityForm = await import("~/components/dashboard/forms/entity-form");
      const calls = vi.mocked(EntityForm.EntityForm).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      expect(props.entityType).toBe("buyer");
      expect(props.isEdit).toBe(true);
      expect(props.properties).toBe(mockProperties);
      expect(props.initialData).toBeDefined();
    });

    it("should handle update failure", async () => {
      const { updateBuyer } = await import("~/services/buyers.service");
      vi.mocked(updateBuyer).mockReturnValueOnce(false);

      render(
        <TestWrapper>
          <EditBuyer />
        </TestWrapper>
      );

      const saveButton = screen.getByText("Save");
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(updateBuyer).toHaveBeenCalled();
      });
    });
  });
});
