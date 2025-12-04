import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { meta, default as NewBuyer } from "../../dashboard/buyers.new";
import { mockCompanies } from "~/mocks/companies";
import { mockProperties } from "~/mocks/properties";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
  };
});

vi.mock("~/services/buyers.service", () => ({
  addBuyer: vi.fn(),
}));

vi.mock("~/components/dashboard/forms/entity-form", () => ({
  EntityForm: vi.fn(
    ({
      entityType,
      onSubmit,
      onSuccess,
      onCancel,
    }: {
      entityType: string;
      onSubmit: (data: Record<string, unknown>) => Promise<void>;
      onSuccess: () => void;
      onCancel: () => void;
    }) => (
      <div data-testid="entity-form">
        <h1>New {entityType}</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({ name: "New Buyer", code: "004" })
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
      addBuyer: "Adicionar Comprador",
      new: {
        description: "Adicione um novo comprador",
        success: "Comprador adicionado com sucesso",
        error: "Erro ao adicionar comprador",
      },
    },
    common: {
      back: "Voltar",
    },
  })),
}));

vi.mock("~/utils/entity-route-helpers", () => ({
  mapFormDataToEntity: vi.fn((data: Record<string, unknown>, companyId: string) => ({
    ...data,
    companyId,
  })),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe("buyers.new", () => {
  const mockNavigate = vi.fn();

  beforeEach(async () => {
    vi.clearAllMocks();
    const { useNavigate } = await import("react-router");
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    const { addBuyer } = await import("~/services/buyers.service");
    vi.mocked(addBuyer).mockReturnValue({
      id: "new-buyer-id",
      companyId: mockCompanies[0].id,
      name: "New Buyer",
      code: "004",
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("meta", () => {
    it("should return SEO meta tags", () => {
      const result = meta();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result[0].title).toContain("Adicionar Comprador");
    });
  });

  describe("NewBuyer component", () => {
    it("should render form with correct title", () => {
      render(
        <TestWrapper>
          <NewBuyer />
        </TestWrapper>
      );

      expect(screen.getByText("Adicionar Comprador")).toBeInTheDocument();
      expect(screen.getByTestId("entity-form")).toBeInTheDocument();
    });

    it("should call addBuyer when form is submitted", async () => {
      const { addBuyer } = await import("~/services/buyers.service");

      render(
        <TestWrapper>
          <NewBuyer />
        </TestWrapper>
      );

      const saveButton = screen.getByText("Save");
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(addBuyer).toHaveBeenCalledWith(
          expect.objectContaining({
            companyId: mockCompanies[0].id,
          })
        );
      });
    });

    it("should navigate to buyers list after successful creation", async () => {
      render(
        <TestWrapper>
          <NewBuyer />
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
          <NewBuyer />
        </TestWrapper>
      );

      const backButton = screen.getByText("Voltar");
      await userEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalled();
    });

    it("should navigate back when cancel button is clicked", async () => {
      render(
        <TestWrapper>
          <NewBuyer />
        </TestWrapper>
      );

      const cancelButton = screen.getByText("Cancel");
      await userEvent.click(cancelButton);

      expect(mockNavigate).toHaveBeenCalled();
    });

    it("should pass correct props to EntityForm", async () => {
      render(
        <TestWrapper>
          <NewBuyer />
        </TestWrapper>
      );

      const EntityForm = await import("~/components/dashboard/forms/entity-form");
      const calls = vi.mocked(EntityForm.EntityForm).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      expect(props.entityType).toBe("buyer");
      expect(props.properties).toBe(mockProperties);
      expect(props.isEdit).toBeUndefined();
    });
  });
});
