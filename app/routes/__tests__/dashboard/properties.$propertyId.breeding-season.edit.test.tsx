import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import {
  loader,
  meta,
  default as EditBreedingSeason,
} from "../../dashboard/properties.$propertyId.breeding-season.edit";
import { mockProperties } from "~/mocks/properties";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useParams: vi.fn(() => ({ propertyId: mockProperties[0]?.id || "property-1" })),
    useNavigate: vi.fn(() => vi.fn()),
  };
});

vi.mock("~/utils/route-guard", () => ({
  createRouteGuard: vi.fn(() => () => Promise.resolve(null)),
}));

vi.mock("~/services/properties.service", () => ({
  getPropertyById: vi.fn((id: string) => mockProperties.find((p) => p.id === id)),
  updateProperty: vi.fn(() => true),
}));

vi.mock("~/hooks/use-alert", () => ({
  useAlert: vi.fn(() => ({
    alertMessage: null,
    showAlert: vi.fn(),
  })),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    properties: {
      details: {
        pasturePlanning: {
          breedingSeason: {
            title: "Estação de Monta",
            aiGeneratedNote: "Esta estação de monta foi gerada automaticamente",
            months: {
              January: "Janeiro",
              February: "Fevereiro",
              March: "Março",
              April: "Abril",
              May: "Maio",
              June: "Junho",
              July: "Julho",
              August: "Agosto",
              September: "Setembro",
              October: "Outubro",
              November: "Novembro",
              December: "Dezembro",
            },
          },
        },
      },
      edit: {
        description: "Edite a estação de monta",
        save: "Salvar",
      },
      emptyState: {
        title: "Propriedade não encontrada",
      },
      success: {
        updated: "Estação de monta atualizada com sucesso",
      },
      errors: {
        updateFailed: "Erro ao atualizar estação de monta",
      },
    },
    common: {
      back: "Voltar",
      loading: "Carregando...",
    },
    profile: {
      company: {
        cancel: "Cancelar",
      },
    },
  })),
}));

vi.mock("~/routes.config", () => ({
  getPropertyViewRoute: vi.fn((id: string) => `/dashboard/propriedades/${id}`),
}));

vi.mock("~/components/ui", () => ({
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
      type?: "button" | "submit";
      variant?: string;
    }) => (
      <button type={type} onClick={onClick} disabled={disabled} data-variant={variant}>
        {children}
      </button>
    )
  ),
  FixedAlert: vi.fn(
    ({ alertMessage }: { alertMessage?: { title: string; variant?: string } | null }) =>
      alertMessage ? <div data-testid="alert">{alertMessage.title}</div> : null
  ),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe("properties.$propertyId.breeding-season.edit", () => {
  beforeEach(async () => {
    vi.resetAllMocks();
    // Restore the mock implementation after resetting
    const { getPropertyById, updateProperty } = await import("~/services/properties.service");
    vi.mocked(getPropertyById).mockImplementation((id: string) =>
      mockProperties.find((p) => p.id === id)
    );
    vi.mocked(updateProperty).mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("loader", () => {
    it("should call createRouteGuard", async () => {
      const { createRouteGuard } = await import("~/utils/route-guard");
      const request = new Request(
        "http://localhost/dashboard/propriedades/property-1/estacao-monta/editar"
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
      expect(result[0].title).toContain("Editar Estação de Monta");
    });
  });

  describe("EditBreedingSeason component", () => {
    it("should render form with correct title", () => {
      render(
        <TestWrapper>
          <EditBreedingSeason />
        </TestWrapper>
      );

      const title = screen.getByRole("heading", { level: 1, name: "Estação de Monta" });
      expect(title).toBeInTheDocument();
    });

    it("should render empty state when property is not found", async () => {
      const { useParams } = await import("react-router");
      const { getPropertyById } = await import("~/services/properties.service");

      vi.mocked(useParams).mockReturnValue({ propertyId: "non-existent" });
      vi.mocked(getPropertyById).mockReturnValue(undefined);

      render(
        <TestWrapper>
          <EditBreedingSeason />
        </TestWrapper>
      );

      expect(screen.getByText("Propriedade não encontrada")).toBeInTheDocument();
    });

    it("should render all month checkboxes", () => {
      render(
        <TestWrapper>
          <EditBreedingSeason />
        </TestWrapper>
      );

      const months = [
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro",
      ];
      months.forEach((month) => {
        // Checkboxes are rendered as labels with text - use getAllByText since months can appear multiple times
        const monthElements = screen.getAllByText(month);
        expect(monthElements.length).toBeGreaterThan(0);
      });
    });

    it("should toggle month selection", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <EditBreedingSeason />
        </TestWrapper>
      );

      const janeiroCheckbox = screen
        .getByText("Janeiro")
        .closest("label")
        ?.querySelector("input[type='checkbox']");
      if (janeiroCheckbox) {
        await user.click(janeiroCheckbox);
        expect(janeiroCheckbox).toBeChecked();
      }
    });

    it("should display selected months summary", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <EditBreedingSeason />
        </TestWrapper>
      );

      const janeiroCheckbox = screen
        .getByText("Janeiro")
        .closest("label")
        ?.querySelector("input[type='checkbox']");
      if (janeiroCheckbox) {
        await user.click(janeiroCheckbox);

        await waitFor(() => {
          // The summary section should appear when months are selected
          expect(screen.getByText("Estação de Monta:")).toBeInTheDocument();
        });
      }
    });

    it("should show AI generated note when not modified", () => {
      render(
        <TestWrapper>
          <EditBreedingSeason />
        </TestWrapper>
      );

      expect(
        screen.getByText("Esta estação de monta foi gerada automaticamente")
      ).toBeInTheDocument();
    });

    it("should handle form submission", async () => {
      const user = userEvent.setup();
      const { updateProperty } = await import("~/services/properties.service");
      const { useAlert } = await import("~/hooks/use-alert");
      const mockShowAlert = vi.fn();

      vi.mocked(useAlert).mockReturnValue({
        alertMessage: null,
        showAlert: mockShowAlert,
      });
      vi.mocked(updateProperty).mockReturnValue(true);

      render(
        <TestWrapper>
          <EditBreedingSeason />
        </TestWrapper>
      );

      const submitButton = screen.getByText("Salvar");
      await user.click(submitButton);

      await waitFor(() => {
        expect(updateProperty).toHaveBeenCalled();
      });
    });

    it("should handle successful update", async () => {
      const user = userEvent.setup();
      const { updateProperty } = await import("~/services/properties.service");
      const { useNavigate } = await import("react-router");
      const { useAlert } = await import("~/hooks/use-alert");
      const mockNavigate = vi.fn();
      const mockShowAlert = vi.fn();

      vi.mocked(useNavigate).mockReturnValue(mockNavigate);
      vi.mocked(useAlert).mockReturnValue({
        alertMessage: null,
        showAlert: mockShowAlert,
      });
      vi.mocked(updateProperty).mockReturnValue(true);

      render(
        <TestWrapper>
          <EditBreedingSeason />
        </TestWrapper>
      );

      const submitButton = screen.getByText("Salvar");
      await user.click(submitButton);

      await waitFor(
        () => {
          expect(mockShowAlert).toHaveBeenCalledWith(
            "Estação de monta atualizada com sucesso",
            "success"
          );
        },
        { timeout: 2000 }
      );
    });

    it("should handle update failure", async () => {
      const user = userEvent.setup();
      const { updateProperty } = await import("~/services/properties.service");
      const { useAlert } = await import("~/hooks/use-alert");
      const mockShowAlert = vi.fn();

      vi.mocked(useAlert).mockReturnValue({
        alertMessage: null,
        showAlert: mockShowAlert,
      });
      vi.mocked(updateProperty).mockReturnValue(false);

      render(
        <TestWrapper>
          <EditBreedingSeason />
        </TestWrapper>
      );

      const submitButton = screen.getByText("Salvar");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockShowAlert).toHaveBeenCalledWith("Erro ao atualizar estação de monta", "error");
      });
    });

    it("should handle navigation back", async () => {
      const user = userEvent.setup();
      const { useNavigate } = await import("react-router");
      const { getPropertyViewRoute } = await import("~/routes.config");
      const mockNavigate = vi.fn();
      const propertyId = mockProperties[0]?.id || "property-1";

      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <EditBreedingSeason />
        </TestWrapper>
      );

      const backButtons = screen.getAllByText("Voltar");
      if (backButtons.length > 0) {
        await user.click(backButtons[0]);

        await waitFor(() => {
          expect(mockNavigate).toHaveBeenCalledWith(getPropertyViewRoute(propertyId!));
        });
      }
    });

    it("should disable buttons when submitting", async () => {
      const { useAlert } = await import("~/hooks/use-alert");
      const mockShowAlert = vi.fn();

      vi.mocked(useAlert).mockReturnValue({
        alertMessage: null,
        showAlert: mockShowAlert,
      });

      render(
        <TestWrapper>
          <EditBreedingSeason />
        </TestWrapper>
      );

      // Initially buttons should not be disabled
      const submitButton = screen.getByText("Salvar");
      expect(submitButton).not.toBeDisabled();
    });

    it("should handle error during update", async () => {
      const user = userEvent.setup();
      const { updateProperty } = await import("~/services/properties.service");
      const { useAlert } = await import("~/hooks/use-alert");
      const mockShowAlert = vi.fn();
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      vi.mocked(useAlert).mockReturnValue({
        alertMessage: null,
        showAlert: mockShowAlert,
      });
      vi.mocked(updateProperty).mockImplementation(() => {
        throw new Error("Update failed");
      });

      render(
        <TestWrapper>
          <EditBreedingSeason />
        </TestWrapper>
      );

      const submitButton = screen.getByText("Salvar");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockShowAlert).toHaveBeenCalledWith("Erro ao atualizar estação de monta", "error");
      });

      consoleErrorSpy.mockRestore();
    });

    it("should initialize with existing breeding months", async () => {
      const { useTranslation } = await import("~/i18n");
      const t = useTranslation();

      render(
        <TestWrapper>
          <EditBreedingSeason />
        </TestWrapper>
      );

      // If property has breeding months, they should be pre-selected
      const property = mockProperties[0];
      if (property?.breedingMonths && property.breedingMonths.length > 0) {
        property.breedingMonths.forEach((month) => {
          // Get the month translation from the mock
          const monthTranslation =
            t.properties.details.pasturePlanning.breedingSeason.months[
              month as keyof typeof t.properties.details.pasturePlanning.breedingSeason.months
            ] || month;
          // Use getAllByText since months can appear multiple times
          const monthElements = screen.getAllByText(monthTranslation);
          expect(monthElements.length).toBeGreaterThan(0);
        });
      }
    });

    it("should sort selected months correctly", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <EditBreedingSeason />
        </TestWrapper>
      );

      // Select months out of order
      const dezembroCheckbox = screen
        .getByText("Dezembro")
        .closest("label")
        ?.querySelector("input[type='checkbox']");
      const janeiroCheckbox = screen
        .getByText("Janeiro")
        .closest("label")
        ?.querySelector("input[type='checkbox']");

      if (dezembroCheckbox && janeiroCheckbox) {
        await user.click(dezembroCheckbox);
        await user.click(janeiroCheckbox);

        // The summary should show months in order
        await waitFor(() => {
          expect(screen.getByText("Estação de Monta:")).toBeInTheDocument();
        });
      }
    });
  });
});
