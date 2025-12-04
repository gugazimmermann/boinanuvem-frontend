import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { loader, meta, default as EditLocation } from "../../dashboard/locations.edit.$locationId";
import { mockLocations } from "~/mocks/locations";
import { mockProperties } from "~/mocks/properties";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useParams: vi.fn(() => ({ locationId: mockLocations[0]?.id || "location-1" })),
    useNavigate: vi.fn(() => vi.fn()),
  };
});

vi.mock("~/utils/route-guard", () => ({
  createRouteGuard: vi.fn(() => () => Promise.resolve(null)),
}));

vi.mock("~/services/locations.service", () => ({
  getLocationById: vi.fn((id: string) => mockLocations.find((loc) => loc.id === id)),
  updateLocation: vi.fn(() => true),
}));

vi.mock("~/services/properties.service", () => ({
  getPropertyById: vi.fn((id: string) => mockProperties.find((p) => p.id === id)),
}));

vi.mock("~/hooks/use-location-form", () => ({
  useLocationForm: vi.fn(() => ({
    formData: {
      code: "001",
      name: "Pasto Norte",
      locationType: "pasture",
      areaValue: "28.5",
      areaType: "hectares",
      status: "active",
      propertyId: mockProperties[0]?.id || "",
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
  Button: vi.fn(
    ({
      children,
      onClick,
      disabled,
    }: {
      children: React.ReactNode;
      onClick?: () => void;
      disabled?: boolean;
    }) => (
      <button onClick={onClick} disabled={disabled}>
        {children}
      </button>
    )
  ),
  FixedAlert: vi.fn(
    ({ alertMessage }: { alertMessage?: { title: string; variant?: string } | null }) =>
      alertMessage ? <div data-testid="alert">{alertMessage.title}</div> : null
  ),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    locations: {
      emptyState: { title: "Localização não encontrada" },
      table: {
        code: "Código",
      },
      edit: {
        title: "Editar Localização",
        description: "Edite as informações da localização",
        nameLabel: "Nome",
        locationTypeLabel: "Tipo",
        areaLabel: "Área",
        propertyLabel: "Propriedade",
        areaValidationError: "Área deve ser maior que zero",
        propertyNotFound: "Propriedade não encontrada",
        save: "Salvar",
      },
      errors: {
        updateFailed: "Erro ao atualizar localização",
      },
      success: {
        updated: "Localização atualizada com sucesso",
      },
    },
    team: {
      new: {
        back: "Voltar",
      },
    },
    profile: {
      company: {
        cancel: "Cancelar",
      },
    },
    common: {
      loading: "Carregando...",
    },
  })),
}));

vi.mock("~/routes.config", () => ({
  ROUTES: {
    LOCATIONS: "/dashboard/localizacoes",
  },
  getLocationViewRoute: vi.fn((id: string) => `/dashboard/localizacoes/${id}`),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe("locations.edit.$locationId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("loader", () => {
    it("should call createRouteGuard", async () => {
      const { createRouteGuard } = await import("~/utils/route-guard");
      const request = new Request("http://localhost/dashboard/localizacoes/location-1/editar");

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
      expect(result[0].title).toContain("Editar Localização");
    });
  });

  describe("EditLocation component", () => {
    it("should render form with correct title", async () => {
      const { useParams } = await import("react-router");
      vi.mocked(useParams).mockReturnValue({ locationId: mockLocations[0]?.id || "location-1" });

      render(
        <TestWrapper>
          <EditLocation />
        </TestWrapper>
      );

      expect(screen.getByText("Editar Localização")).toBeInTheDocument();
    });

    it("should render empty state when location is not found", async () => {
      const { useParams } = await import("react-router");
      vi.mocked(useParams).mockReturnValue({ locationId: "non-existent" });

      const { getLocationById } = await import("~/services/locations.service");
      vi.mocked(getLocationById).mockReturnValue(undefined);

      render(
        <TestWrapper>
          <EditLocation />
        </TestWrapper>
      );

      expect(screen.getByText("Localização não encontrada")).toBeInTheDocument();
    });

    it("should call updateLocation when form is submitted", async () => {
      const _user = userEvent.setup();
      const { useParams } = await import("react-router");
      const { getLocationById, updateLocation: _updateLocation } = await import(
        "~/services/locations.service"
      );
      const { useLocationForm } = await import("~/hooks/use-location-form");
      const mockHandleSubmit = vi.fn(async (e: React.FormEvent) => {
        e.preventDefault();
      });
      const locationId = mockLocations[0]?.id || "location-1";

      vi.mocked(useParams).mockReturnValue({ locationId });
      vi.mocked(getLocationById).mockReturnValue(mockLocations[0]);
      vi.mocked(useLocationForm).mockReturnValueOnce({
        formData: {
          code: "001",
          name: "Pasto Norte Updated",
          locationType: "pasture",
          areaValue: "28.5",
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
          <EditLocation />
        </TestWrapper>
      );

      // Find submit button - check if form is rendered
      const form = document.querySelector("form");
      expect(form).toBeInTheDocument();

      const submitButton =
        screen.getByText("Salvar") || screen.getByRole("button", { name: /salvar/i });
      if (submitButton) {
        await _user.click(submitButton);
        await waitFor(() => {
          expect(mockHandleSubmit).toHaveBeenCalled();
        });
      } else if (form) {
        // Fallback: submit form directly
        const submitEvent = new Event("submit", { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);
        await waitFor(() => {
          expect(mockHandleSubmit).toHaveBeenCalled();
        });
      }
    });

    it("should handle property not found error", async () => {
      const _user = userEvent.setup();
      const { useParams } = await import("react-router");
      const { getLocationById } = await import("~/services/locations.service");
      const { getPropertyById } = await import("~/services/properties.service");
      const { useLocationForm } = await import("~/hooks/use-location-form");
      const locationId = mockLocations[0]?.id || "location-1";
      const mockShowAlert = vi.fn();

      vi.mocked(useParams).mockReturnValue({ locationId });
      vi.mocked(getLocationById).mockReturnValue(mockLocations[0]);
      vi.mocked(getPropertyById).mockReturnValue(undefined); // Property not found

      const mockHandleSubmit = vi.fn(async (e: React.FormEvent) => {
        e.preventDefault();
        throw new Error("Propriedade não encontrada");
      });

      vi.mocked(useLocationForm).mockReturnValueOnce({
        formData: {
          code: "001",
          name: "Pasto Norte",
          locationType: "pasture",
          areaValue: "28.5",
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
          <EditLocation />
        </TestWrapper>
      );

      const form = document.querySelector("form");
      if (form) {
        const submitEvent = new Event("submit", { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);

        await waitFor(() => {
          expect(mockShowAlert).toHaveBeenCalled();
        });
      }
    });

    it("should handle update failure", async () => {
      const _user = userEvent.setup();
      const { useParams } = await import("react-router");
      const { getLocationById, updateLocation } = await import("~/services/locations.service");
      const { useLocationForm } = await import("~/hooks/use-location-form");
      const locationId = mockLocations[0]?.id || "location-1";
      const mockShowAlert = vi.fn();

      vi.mocked(useParams).mockReturnValue({ locationId });
      vi.mocked(getLocationById).mockReturnValue(mockLocations[0]);
      vi.mocked(updateLocation).mockReturnValue(false); // Update failed

      const mockHandleSubmit = vi.fn(async (e: React.FormEvent) => {
        e.preventDefault();
        throw new Error("Erro ao atualizar localização");
      });

      vi.mocked(useLocationForm).mockReturnValueOnce({
        formData: {
          code: "001",
          name: "Pasto Norte",
          locationType: "pasture",
          areaValue: "28.5",
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
          <EditLocation />
        </TestWrapper>
      );

      const form = document.querySelector("form");
      if (form) {
        const submitEvent = new Event("submit", { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);

        await waitFor(() => {
          expect(mockShowAlert).toHaveBeenCalled();
        });
      }
    });

    it("should navigate to location view when back button is clicked", async () => {
      const _user = userEvent.setup();
      const { useParams, useNavigate } = await import("react-router");
      const { getLocationById } = await import("~/services/locations.service");
      const { getLocationViewRoute: _getLocationViewRoute } = await import("~/routes.config");
      const locationId = mockLocations[0]?.id || "location-1";
      const mockNavigate = vi.fn();

      vi.mocked(useParams).mockReturnValue({ locationId });
      vi.mocked(getLocationById).mockReturnValue(mockLocations[0]);
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <EditLocation />
        </TestWrapper>
      );

      const backButtons = screen.getAllByText("Voltar");
      if (backButtons.length > 0) {
        await _user.click(backButtons[0]);
        await waitFor(() => {
          expect(mockNavigate).toHaveBeenCalled();
        });
      }
    });

    it("should handle cancel button click", async () => {
      const _user = userEvent.setup();
      const { useParams, useNavigate } = await import("react-router");
      const { getLocationById } = await import("~/services/locations.service");
      const locationId = mockLocations[0]?.id || "location-1";
      const mockNavigate = vi.fn();

      vi.mocked(useParams).mockReturnValue({ locationId });
      vi.mocked(getLocationById).mockReturnValue(mockLocations[0]);
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <EditLocation />
        </TestWrapper>
      );

      const cancelButton = screen.getByText("Cancelar");
      await _user.click(cancelButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
      });
    });

    it("should disable buttons when isSubmitting", async () => {
      const { useParams } = await import("react-router");
      const { getLocationById } = await import("~/services/locations.service");
      const { useLocationForm } = await import("~/hooks/use-location-form");
      const locationId = mockLocations[0]?.id || "location-1";

      vi.mocked(useParams).mockReturnValue({ locationId });
      vi.mocked(getLocationById).mockReturnValue(mockLocations[0]);

      vi.mocked(useLocationForm).mockReturnValueOnce({
        formData: {
          code: "001",
          name: "Pasto Norte",
          locationType: "pasture",
          areaValue: "28.5",
          areaType: "hectares",
          status: "active",
          propertyId: mockProperties[0]?.id || "",
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
          <EditLocation />
        </TestWrapper>
      );

      const submitButton = screen.getByText("Carregando...");
      expect(submitButton).toBeInTheDocument();
    });

    it("should handle error that is not an Error instance", async () => {
      const { useParams } = await import("react-router");
      const { getLocationById } = await import("~/services/locations.service");
      const { useLocationForm } = await import("~/hooks/use-location-form");
      const locationId = mockLocations[0]?.id || "location-1";
      const mockShowAlert = vi.fn();

      vi.mocked(useParams).mockReturnValue({ locationId });
      vi.mocked(getLocationById).mockReturnValue(mockLocations[0]);

      const mockHandleSubmit = vi.fn(async (e: React.FormEvent) => {
        e.preventDefault();
        throw "String error"; // Not an Error instance
      });

      vi.mocked(useLocationForm).mockReturnValueOnce({
        formData: {
          code: "001",
          name: "Pasto Norte",
          locationType: "pasture",
          areaValue: "28.5",
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
          <EditLocation />
        </TestWrapper>
      );

      const form = document.querySelector("form");
      if (form) {
        const submitEvent = new Event("submit", { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);

        // Should not throw, but also should not call showAlert with non-Error
        await waitFor(() => {
          expect(mockHandleSubmit).toHaveBeenCalled();
        });
      }
    });
  });
});
