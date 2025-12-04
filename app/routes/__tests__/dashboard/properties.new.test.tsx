import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { meta, default as NewProperty } from "../../dashboard/properties.new";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
  };
});

vi.mock("~/services/properties.service", () => ({
  addProperty: vi.fn(() => ({ id: "property-1" })),
}));

vi.mock("~/mocks/companies", () => ({
  mockCompanies: [
    {
      id: "550e8400-e29b-41d4-a716-446655440000",
      companyName: "Test Company",
    },
  ],
}));

vi.mock("~/hooks/use-property-form", () => ({
  usePropertyForm: vi.fn(
    ({
      translationKeys: _translationKeys,
      onSubmit,
    }: {
      translationKeys: { required: (field: string) => string; areaValidationError: string };
      onSubmit: (data: unknown) => void | Promise<void>;
    }) => ({
      formData: {
        code: "",
        name: "",
        city: "",
        state: "",
        areaValue: "",
        areaType: "hectares",
        status: "active",
        zipCode: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
      },
      errors: {},
      isSubmitting: false,
      zipCodeLoading: false,
      zipCodeError: null,
      handleChange: vi.fn(),
      handleSubmit: vi.fn(async (e: React.FormEvent) => {
        e.preventDefault();
        if (onSubmit) {
          await onSubmit({
            code: "001",
            name: "New Property",
            areaValue: "100",
            areaType: "hectares",
            status: "active",
            zipCode: "12345678",
            street: "New Street",
            number: "123",
            complement: "",
            neighborhood: "New Neighborhood",
            city: "New City",
            state: "NS",
          });
        }
      }),
    })
  ),
}));

vi.mock("~/hooks/use-alert", () => ({
  useAlert: vi.fn(() => ({
    showAlert: vi.fn(),
    AlertDisplay: vi.fn(() => null),
  })),
}));

vi.mock("~/components/dashboard/properties/property-form", () => ({
  PropertyForm: vi.fn(
    ({
      formData,
      errors,
      isSubmitting,
      zipCodeLoading,
      zipCodeError,
      onChange,
      translationKeys: _translationKeys,
    }: {
      formData: Record<string, unknown>;
      errors: Record<string, string>;
      isSubmitting: boolean;
      zipCodeLoading: boolean;
      zipCodeError: string | null;
      onChange: (field: string, value: string) => void;
      translationKeys: Record<string, unknown>;
    }) => (
      <div data-testid="property-form">
        <input
          data-testid="input-code"
          value={String(formData.code || "")}
          onChange={(e) => onChange("code", e.target.value)}
          disabled={isSubmitting}
        />
        <input
          data-testid="input-name"
          value={String(formData.name || "")}
          onChange={(e) => onChange("name", e.target.value)}
          disabled={isSubmitting}
        />
        {zipCodeLoading && <div data-testid="zip-code-loading">Loading...</div>}
        {zipCodeError && <div data-testid="zip-code-error">{zipCodeError}</div>}
        {Object.keys(errors).map((key) => (
          <div key={key} data-testid={`error-${key}`}>
            {errors[key]}
          </div>
        ))}
      </div>
    )
  ),
}));

vi.mock("~/components/dashboard/properties/property-form-layout", () => ({
  PropertyFormLayout: vi.fn(
    ({
      title,
      description,
      backButtonLabel,
      onBack,
      cancelButtonLabel,
      onCancel,
      submitButtonLabel,
      loadingLabel,
      isSubmitting,
      onSubmit,
      alertDisplay,
      formContent,
    }: {
      title: string;
      description: string;
      backButtonLabel: string;
      onBack: () => void;
      cancelButtonLabel: string;
      onCancel: () => void;
      submitButtonLabel: string;
      loadingLabel: string;
      isSubmitting: boolean;
      onSubmit: (e: React.FormEvent) => void;
      alertDisplay: React.ComponentType;
      formContent: React.ReactNode;
    }) => {
      const AlertDisplay = alertDisplay;
      return (
        <div data-testid="property-form-layout">
          <h1>{title}</h1>
          <p>{description}</p>
          {AlertDisplay && <AlertDisplay />}
          {formContent}
          <button onClick={onBack}>{backButtonLabel}</button>
          <button onClick={onCancel}>{cancelButtonLabel}</button>
          <form onSubmit={onSubmit}>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? loadingLabel : submitButtonLabel}
            </button>
          </form>
        </div>
      );
    }
  ),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    properties: {
      addProperty: "Adicionar Propriedade",
      new: {
        description: "Adicione uma nova propriedade",
        nameLabel: "Nome",
        areaLabel: "Área",
        statusLabel: "Status",
        areaValidationError: "Área deve ser maior que zero",
        success: "Propriedade adicionada com sucesso",
        addButton: "Adicionar",
      },
      table: {
        code: "Código",
        active: "Ativo",
        inactive: "Inativo",
      },
    },
    profile: {
      errors: {
        required: (field: string) => `${field} é obrigatório`,
      },
      company: {
        fields: {
          zipCode: "CEP",
          street: "Rua",
          number: "Número",
          complement: "Complemento",
          neighborhood: "Bairro",
          city: "Cidade",
          state: "Estado",
        },
      },
    },
    locations: {
      areaType: "Tipo de Área",
      areaTypes: {
        hectares: "Hectares",
        square_meters: "Metros Quadrados",
        square_feet: "Pés Quadrados",
        acres: "Acres",
        square_kilometers: "Quilômetros Quadrados",
        square_miles: "Milhas Quadradas",
      },
    },
    team: {
      new: {
        searchingAddress: "Buscando endereço...",
      },
    },
    common: {
      back: "Voltar",
      cancel: "Cancelar",
      loading: "Carregando...",
    },
  })),
}));

vi.mock("~/routes.config", () => ({
  ROUTES: {
    PROPERTIES: "/dashboard/propriedades",
  },
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe("properties.new", () => {
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
      expect(result[0].title).toContain("Adicionar Propriedade");
    });
  });

  describe("NewProperty component", () => {
    it("should render form with correct title", () => {
      render(
        <TestWrapper>
          <NewProperty />
        </TestWrapper>
      );

      expect(screen.getByText("Adicionar Propriedade")).toBeInTheDocument();
    });

    it("should render property form", () => {
      render(
        <TestWrapper>
          <NewProperty />
        </TestWrapper>
      );

      expect(screen.getByTestId("property-form")).toBeInTheDocument();
    });

    it("should handle form submission", async () => {
      const user = userEvent.setup();
      const { addProperty } = await import("~/services/properties.service");
      const { useAlert } = await import("~/hooks/use-alert");
      const mockShowAlert = vi.fn();

      vi.mocked(useAlert).mockReturnValue({
        showAlert: mockShowAlert,
        AlertDisplay: vi.fn(() => null),
      });

      render(
        <TestWrapper>
          <NewProperty />
        </TestWrapper>
      );

      const submitButton = screen.getByText("Adicionar");
      await user.click(submitButton);

      await waitFor(() => {
        expect(addProperty).toHaveBeenCalled();
      });
    });

    it("should handle successful creation", async () => {
      const user = userEvent.setup();
      const { addProperty: _addProperty } = await import("~/services/properties.service");
      const { useNavigate } = await import("react-router");
      const { useAlert } = await import("~/hooks/use-alert");
      const mockNavigate = vi.fn();
      const mockShowAlert = vi.fn();

      vi.mocked(useNavigate).mockReturnValue(mockNavigate);
      vi.mocked(useAlert).mockReturnValue({
        showAlert: mockShowAlert,
        AlertDisplay: vi.fn(() => null),
      });

      render(
        <TestWrapper>
          <NewProperty />
        </TestWrapper>
      );

      const submitButton = screen.getByText("Adicionar");
      await user.click(submitButton);

      await waitFor(
        () => {
          expect(mockShowAlert).toHaveBeenCalledWith(
            "Propriedade adicionada com sucesso",
            "success"
          );
        },
        { timeout: 2000 }
      );
    });

    it("should navigate back to properties list", async () => {
      const user = userEvent.setup();
      const { useNavigate } = await import("react-router");
      const { ROUTES } = await import("~/routes.config");
      const mockNavigate = vi.fn();

      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <NewProperty />
        </TestWrapper>
      );

      const backButton = screen.getByText("Voltar");
      await user.click(backButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.PROPERTIES);
      });
    });

    it("should handle cancel action", async () => {
      const user = userEvent.setup();
      const { useNavigate } = await import("react-router");
      const { ROUTES } = await import("~/routes.config");
      const mockNavigate = vi.fn();

      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <NewProperty />
        </TestWrapper>
      );

      const cancelButton = screen.getByText("Cancelar");
      await user.click(cancelButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.PROPERTIES);
      });
    });

    it("should disable form when submitting", async () => {
      const { usePropertyForm } = await import("~/hooks/use-property-form");

      vi.mocked(usePropertyForm).mockReturnValue({
        formData: {
          code: "",
          name: "",
          city: "",
          state: "",
          areaValue: "",
          areaType: "hectares",
          status: "active",
          zipCode: "",
          street: "",
          number: "",
          complement: "",
          neighborhood: "",
        },
        errors: {},
        isSubmitting: true,
        zipCodeLoading: false,
        zipCodeError: null,
        handleChange: vi.fn(),
        handleSubmit: vi.fn(),
      });

      render(
        <TestWrapper>
          <NewProperty />
        </TestWrapper>
      );

      const submitButton = screen.getByText("Carregando...");
      expect(submitButton).toBeDisabled();
    });

    it("should use company from mock", () => {
      render(
        <TestWrapper>
          <NewProperty />
        </TestWrapper>
      );

      // The component should use mockCompanies[0]
      expect(screen.getByTestId("property-form")).toBeInTheDocument();
    });
  });
});
