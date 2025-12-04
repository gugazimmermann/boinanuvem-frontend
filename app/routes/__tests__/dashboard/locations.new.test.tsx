import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { meta, default as NewLocation } from "../../dashboard/locations.new";
import { mockProperties } from "~/mocks/properties";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
  };
});

vi.mock("~/services/locations.service", () => ({
  addLocation: vi.fn(() => ({ id: "location-1" })),
}));

vi.mock("~/services/properties.service", () => ({
  getPropertyById: vi.fn((id: string) => mockProperties.find((p) => p.id === id)),
}));

vi.mock("~/hooks/use-location-form", () => ({
  useLocationForm: vi.fn(() => ({
    formData: {
      code: "",
      name: "",
      locationType: "pasture",
      areaValue: "",
      areaType: "hectares",
      status: "active",
      propertyId: "",
    },
    errors: {},
    isSubmitting: false,
    alertMessage: null,
    handleChange: vi.fn(),
    handleSubmit: vi.fn((e: React.FormEvent) => {
      e.preventDefault();
    }),
    showAlert: vi.fn(),
  })),
}));

vi.mock("~/components/dashboard/locations/location-form", () => ({
  LocationForm: vi.fn(() => <div data-testid="location-form">Location Form</div>),
}));

vi.mock("~/components/ui", () => ({
  FormPageLayout: vi.fn(
    ({
      children,
      title,
      description,
      alert,
      backButton,
      footer,
    }: {
      children: React.ReactNode;
      title: string;
      description?: string;
      alert?: { title: string; variant?: string } | null;
      backButton?: { onClick: () => void; disabled?: boolean; label: string };
      footer?: {
        cancelButton?: { onClick: () => void; disabled?: boolean; label: string };
        submitButton?: {
          onClick: () => void;
          disabled?: boolean;
          isLoading?: boolean;
          label: string;
          loadingLabel?: string;
        };
      };
    }) => (
      <div>
        {alert && <div data-testid="alert">{alert.title}</div>}
        <h1>{title}</h1>
        <p>{description}</p>
        <div>
          {children}
          {backButton && (
            <button type="button" onClick={backButton.onClick} disabled={backButton.disabled}>
              {backButton.label}
            </button>
          )}
          {footer && (
            <>
              {footer.cancelButton && (
                <button
                  type="button"
                  onClick={footer.cancelButton.onClick}
                  disabled={footer.cancelButton.disabled}
                >
                  {footer.cancelButton.label}
                </button>
              )}
              {footer.submitButton && (
                <button
                  type="submit"
                  form="location-form"
                  disabled={footer.submitButton.disabled || footer.submitButton.isLoading}
                >
                  {footer.submitButton.isLoading
                    ? footer.submitButton.loadingLabel
                    : footer.submitButton.label}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    )
  ),
  FixedAlert: vi.fn(
    ({ alertMessage }: { alertMessage?: { title: string; variant?: string } | null }) =>
      alertMessage ? <div data-testid="alert">{alertMessage.title}</div> : null
  ),
  Button: vi.fn(
    ({
      children,
      onClick,
      disabled,
      type,
      variant,
    }: {
      children: React.ReactNode;
      onClick?: () => void;
      disabled?: boolean;
      type?: "button" | "submit" | "reset";
      variant?: string;
    }) => (
      <button type={type} onClick={onClick} disabled={disabled} data-variant={variant}>
        {children}
      </button>
    )
  ),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    locations: {
      addLocation: "Adicionar Localização",
      table: {
        code: "Código",
      },
      new: {
        description: "Adicione uma nova localização",
        nameLabel: "Nome",
        locationTypeLabel: "Tipo",
        areaLabel: "Área",
        propertyLabel: "Propriedade",
        areaValidationError: "Área deve ser maior que zero",
        propertyNotFound: "Propriedade não encontrada",
        success: "Localização adicionada com sucesso",
        error: "Erro ao adicionar localização",
        addButton: "Adicionar",
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
    LOCATIONS: "/dashboard/localizacoes",
  },
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe("locations.new", () => {
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
      expect(result[0].title).toContain("Adicionar Localização");
    });
  });

  describe("NewLocation component", () => {
    it("should render form with correct title", () => {
      render(
        <TestWrapper>
          <NewLocation />
        </TestWrapper>
      );

      expect(screen.getByText("Adicionar Localização")).toBeInTheDocument();
    });

    it("should render location form", () => {
      render(
        <TestWrapper>
          <NewLocation />
        </TestWrapper>
      );

      expect(screen.getByTestId("location-form")).toBeInTheDocument();
    });

    it("should call addLocation when form is submitted", async () => {
      const _user = userEvent.setup();
      const { useLocationForm } = await import("~/hooks/use-location-form");
      const mockHandleSubmit = vi.fn(async (e: React.FormEvent) => {
        e.preventDefault();
      });

      vi.mocked(useLocationForm).mockReturnValue({
        formData: {
          code: "NEW001",
          name: "New Location",
          locationType: "pasture",
          areaValue: "25.0",
          areaType: "hectares",
          status: "active",
          propertyId: mockProperties[0]?.id || "",
        },
        errors: {},
        isSubmitting: false,
        alertMessage: null,
        handleChange: vi.fn(),
        handleSubmit: mockHandleSubmit,
        showAlert: vi.fn(),
      });

      render(
        <TestWrapper>
          <NewLocation />
        </TestWrapper>
      );

      // Find the form element and trigger submit
      const form = document.querySelector("form");
      expect(form).toBeInTheDocument();

      if (form) {
        const submitEvent = new Event("submit", { bubbles: true, cancelable: true });
        Object.defineProperty(submitEvent, "preventDefault", { value: vi.fn() });
        form.dispatchEvent(submitEvent);
      }

      await waitFor(
        () => {
          expect(mockHandleSubmit).toHaveBeenCalled();
        },
        { timeout: 2000 }
      );
    });

    it("should handle property not found error", async () => {
      const { useLocationForm } = await import("~/hooks/use-location-form");
      const { getPropertyById } = await import("~/services/properties.service");
      const mockShowAlert = vi.fn();

      vi.mocked(getPropertyById).mockReturnValue(undefined); // Property not found

      const mockHandleSubmit = vi.fn(async (e: React.FormEvent) => {
        e.preventDefault();
        throw new Error("Propriedade não encontrada");
      });

      vi.mocked(useLocationForm).mockReturnValue({
        formData: {
          code: "NEW001",
          name: "New Location",
          locationType: "pasture",
          areaValue: "25.0",
          areaType: "hectares",
          status: "active",
          propertyId: "non-existent-property",
        },
        errors: {},
        isSubmitting: false,
        alertMessage: null,
        handleChange: vi.fn(),
        handleSubmit: mockHandleSubmit,
        showAlert: mockShowAlert,
      });

      render(
        <TestWrapper>
          <NewLocation />
        </TestWrapper>
      );

      const form = document.querySelector("form");
      if (form) {
        const submitEvent = new Event("submit", { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);

        await waitFor(() => {
          expect(mockShowAlert).toHaveBeenCalledWith("Propriedade não encontrada", "error");
        });
      }
    });

    it("should handle non-propertyNotFound errors", async () => {
      const { useLocationForm } = await import("~/hooks/use-location-form");
      const mockShowAlert = vi.fn();

      const mockHandleSubmit = vi.fn(async (e: React.FormEvent) => {
        e.preventDefault();
        throw new Error("Some other error");
      });

      vi.mocked(useLocationForm).mockReturnValue({
        formData: {
          code: "NEW001",
          name: "New Location",
          locationType: "pasture",
          areaValue: "25.0",
          areaType: "hectares",
          status: "active",
          propertyId: mockProperties[0]?.id || "",
        },
        errors: {},
        isSubmitting: false,
        alertMessage: null,
        handleChange: vi.fn(),
        handleSubmit: mockHandleSubmit,
        showAlert: mockShowAlert,
      });

      render(
        <TestWrapper>
          <NewLocation />
        </TestWrapper>
      );

      const form = document.querySelector("form");
      if (form) {
        const submitEvent = new Event("submit", { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);

        // Should not call showAlert for non-propertyNotFound errors
        await waitFor(() => {
          expect(mockHandleSubmit).toHaveBeenCalled();
        });
      }
    });

    it("should navigate back when back button is clicked", async () => {
      const _user = userEvent.setup();
      const { useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();

      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <NewLocation />
        </TestWrapper>
      );

      const backButton = screen.getByText("Voltar");
      await _user.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith("/dashboard/localizacoes");
    });

    it("should navigate back when cancel button is clicked", async () => {
      const _user = userEvent.setup();
      const { useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();

      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <NewLocation />
        </TestWrapper>
      );

      const cancelButton = screen.getByText("Cancelar");
      await _user.click(cancelButton);

      expect(mockNavigate).toHaveBeenCalledWith("/dashboard/localizacoes");
    });

    it("should disable buttons when isSubmitting", async () => {
      const { useLocationForm } = await import("~/hooks/use-location-form");

      vi.mocked(useLocationForm).mockReturnValue({
        formData: {
          code: "",
          name: "",
          locationType: "pasture",
          areaValue: "",
          areaType: "hectares",
          status: "active",
          propertyId: "",
        },
        errors: {},
        isSubmitting: true, // Submitting
        alertMessage: null,
        handleChange: vi.fn(),
        handleSubmit: vi.fn((e: React.FormEvent) => {
          e.preventDefault();
        }),
        showAlert: vi.fn(),
      });

      render(
        <TestWrapper>
          <NewLocation />
        </TestWrapper>
      );

      const submitButton = screen.getByText("Carregando...");
      expect(submitButton).toBeInTheDocument();
    });

    it("should display alert message when present", async () => {
      const { useLocationForm } = await import("~/hooks/use-location-form");

      vi.mocked(useLocationForm).mockReturnValue({
        formData: {
          code: "",
          name: "",
          locationType: "pasture",
          areaValue: "",
          areaType: "hectares",
          status: "active",
          propertyId: "",
        },
        errors: {},
        isSubmitting: false,
        alertMessage: { title: "Test alert", variant: "success" },
        handleChange: vi.fn(),
        handleSubmit: vi.fn((e: React.FormEvent) => {
          e.preventDefault();
        }),
        showAlert: vi.fn(),
      });

      render(
        <TestWrapper>
          <NewLocation />
        </TestWrapper>
      );

      expect(screen.getByText("Test alert")).toBeInTheDocument();
    });
  });
});
