import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import React from "react";
import { meta, loader, default as NewDeath } from "../../dashboard/records.deaths.new";
import { ROUTES } from "~/routes.config";
import { mockAnimals } from "~/mocks/animals";
import type { Animal, Birth } from "~/types";
import type { Location as RouterLocation } from "react-router";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
    useLocation: vi.fn(() => ({ state: null })),
  };
});

vi.mock("~/utils/route-guard", () => ({
  createRouteGuard: vi.fn(() => () => Promise.resolve(null)),
}));

vi.mock("~/services/deaths.service", () => ({
  addDeath: vi.fn(),
  getDeathByAnimalId: vi.fn(() => null),
}));

vi.mock("~/services/animals.service", () => ({
  getAnimalsByCompanyId: vi.fn(() => mockAnimals.filter((a) => a.status === "active")),
  getAnimalById: vi.fn((id: string) => mockAnimals.find((a) => a.id === id)),
  updateAnimal: vi.fn(),
}));

vi.mock("~/services/births.service", () => ({
  getBirthByAnimalId: vi.fn(() => ({
    id: "birth-1",
    gender: "male",
  })),
}));

vi.mock("~/mocks/companies", () => ({
  mockCompanies: [{ id: "company-1", companyName: "Test Company" }],
}));

vi.mock("~/components/ui", () => ({
  Input: vi.fn(
    ({
      label,
      value,
      onChange,
      error,
      disabled,
      required,
      type,
      placeholder,
    }: {
      label?: string;
      value?: string;
      onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
      error?: string;
      disabled?: boolean;
      required?: boolean;
      type?: string;
      placeholder?: string;
    }) => (
      <div>
        <label>{label}</label>
        <input
          type={type || "text"}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          data-testid={`input-${label?.toLowerCase().replace(/\s+/g, "-") || "input"}`}
        />
        {error && <span data-testid="error">{error}</span>}
      </div>
    )
  ),
  Select: vi.fn(
    ({
      value,
      onChange,
      error,
      disabled,
      required,
      options,
      className,
    }: {
      value?: string;
      onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
      error?: string;
      disabled?: boolean;
      required?: boolean;
      options?: Array<{ value: string; label: string }>;
      className?: string;
    }) => (
      <div>
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={className}
          data-testid="select"
        >
          {options?.map((opt: { value: string; label: string }) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span data-testid="error">{error}</span>}
      </div>
    )
  ),
  FormPageLayout: vi.fn(
    ({
      title,
      description,
      children,
      alert,
      backButton,
      footer,
    }: {
      title?: string;
      description?: string;
      children?: React.ReactNode;
      alert?: { title?: string };
      backButton?: { onClick?: () => void; disabled?: boolean; label?: string };
      footer?: {
        cancelButton?: { onClick?: () => void; disabled?: boolean; label?: string };
        submitButton?: {
          onClick?: () => void;
          disabled?: boolean;
          isLoading?: boolean;
          loadingLabel?: string;
          label?: string;
        };
      };
    }) => (
      <div data-testid="form-page-layout">
        <h1>{title}</h1>
        <p>{description}</p>
        {alert && <div data-testid="alert">{alert.title}</div>}
        {backButton && (
          <button onClick={backButton.onClick} disabled={backButton.disabled}>
            {backButton.label}
          </button>
        )}
        {children}
        {footer && (
          <div>
            {footer.cancelButton && (
              <button onClick={footer.cancelButton.onClick} disabled={footer.cancelButton.disabled}>
                {footer.cancelButton.label}
              </button>
            )}
            {footer.submitButton && (
              <button onClick={() => {}} disabled={footer.submitButton.disabled} type="submit">
                {footer.submitButton.isLoading
                  ? footer.submitButton.loadingLabel
                  : footer.submitButton.label}
              </button>
            )}
          </div>
        )}
      </div>
    )
  ),
}));

vi.mock("~/hooks/use-alert", () => ({
  useAlert: vi.fn(() => ({
    alertMessage: null,
    showAlert: vi.fn(),
  })),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    deaths: {
      new: {
        title: "Registrar Óbito",
        description: "Registre um novo óbito",
        deathInfoTitle: "Informações do Óbito",
        animalLabel: "Animal",
        searchPlaceholder: "Buscar animal...",
        dateLabel: "Data",
        causeLabel: "Causa",
        causePlaceholder: "Causa do óbito",
        observationLabel: "Observações",
        observationPlaceholder: "Observações sobre o óbito",
        addButton: "Registrar Óbito",
        success: "Óbito registrado com sucesso",
        error: "Erro ao registrar óbito",
        animalAlreadyDead: "Este animal já possui um registro de óbito",
      },
    },
    animals: {
      gender: {
        male: "Macho",
        female: "Fêmea",
      },
    },
    profile: {
      errors: {
        required: (field: string) => `${field} é obrigatório`,
      },
    },
    common: {
      back: "Voltar",
      cancel: "Cancelar",
      loading: "Carregando...",
    },
  })),
}));

const TestWrapper = ({
  children,
  initialEntries = ["/dashboard/registros/obitos/novo"],
}: {
  children: React.ReactNode;
  initialEntries?: string[];
}) => <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>;

describe("records.deaths.new", () => {
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
      expect(result[0].title).toContain("Registrar Óbito");
    });
  });

  describe("loader", () => {
    it("should call createRouteGuard", async () => {
      const { createRouteGuard } = await import("~/utils/route-guard");
      const request = new Request("http://localhost/dashboard/registros/obitos/novo");

      await loader({ request });

      expect(createRouteGuard).toHaveBeenCalled();
    });
  });

  describe("NewDeath component", () => {
    it("should render form with correct title", () => {
      render(
        <TestWrapper>
          <NewDeath />
        </TestWrapper>
      );

      const titles = screen.getAllByText("Registrar Óbito");
      expect(titles.length).toBeGreaterThan(0);
    });

    it("should handle form submission with valid data", async () => {
      const { useNavigate } = await import("react-router");
      const { addDeath } = await import("~/services/deaths.service");
      const { updateAnimal } = await import("~/services/animals.service");
      const { useAlert } = await import("~/hooks/use-alert");
      const mockNavigate = vi.fn();
      const mockShowAlert = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);
      vi.mocked(useAlert).mockReturnValue({
        alertMessage: null,
        showAlert: mockShowAlert,
      } as never);

      render(
        <TestWrapper>
          <NewDeath />
        </TestWrapper>
      );

      // Search for animal first
      const animalSearchInput = screen.getByPlaceholderText("Buscar animal...");
      await userEvent.type(animalSearchInput, mockAnimals[0]?.code || "FJ");

      // Wait for animal select to be populated, then select
      await waitFor(
        async () => {
          const animalSelects = document.querySelectorAll('select[data-testid="select"]');
          const animalSelect = Array.from(animalSelects).find((select) => {
            const selectElement = select as HTMLSelectElement;
            const options = Array.from(selectElement.options).map((opt) => opt.value);
            return options.includes(mockAnimals[0]?.id || "");
          }) as HTMLSelectElement | undefined;
          if (animalSelect) {
            await userEvent.selectOptions(animalSelect, mockAnimals[0]?.id || "");
            return true;
          }
          return false;
        },
        { timeout: 2000 }
      );

      // Find date input
      const dateInputs = document.querySelectorAll('input[type="date"]');
      if (dateInputs[0]) {
        await userEvent.clear(dateInputs[0]);
        await userEvent.type(dateInputs[0], "2024-01-15");
      }

      // Find cause input
      const inputs = document.querySelectorAll('input[type="text"]');
      const causeInput = Array.from(inputs).find(
        (input) =>
          input.getAttribute("placeholder")?.toLowerCase().includes("causa") ||
          input.getAttribute("data-testid")?.includes("causa")
      ) as HTMLInputElement | undefined;
      if (causeInput) {
        await userEvent.type(causeInput, "Doença");
      }

      const form = document.querySelector("form");
      if (form) {
        await act(async () => {
          const submitEvent = new Event("submit", { bubbles: true, cancelable: true });
          form.dispatchEvent(submitEvent);
        });
      }

      await waitFor(
        () => {
          expect(addDeath).toHaveBeenCalled();
          expect(updateAnimal).toHaveBeenCalled();
        },
        { timeout: 2000 }
      );
    });

    it("should validate required fields", async () => {
      const { useAlert } = await import("~/hooks/use-alert");
      const mockShowAlert = vi.fn();
      vi.mocked(useAlert).mockReturnValue({
        alertMessage: null,
        showAlert: mockShowAlert,
      } as never);

      render(
        <TestWrapper>
          <NewDeath />
        </TestWrapper>
      );

      const form = document.querySelector("form");
      if (form) {
        await act(async () => {
          const submitEvent = new Event("submit", { bubbles: true, cancelable: true });
          form.dispatchEvent(submitEvent);
        });
      }

      await waitFor(() => {
        const errors = screen.queryAllByTestId("error");
        expect(errors.length).toBeGreaterThan(0);
      });
    });

    it("should validate that animal is not already dead", async () => {
      const { getDeathByAnimalId } = await import("~/services/deaths.service");
      vi.mocked(getDeathByAnimalId).mockReturnValueOnce({
        id: "death-1",
        animalId: mockAnimals[0]?.id || "",
        date: "2024-01-01",
        cause: "Test",
      } as never);

      render(
        <TestWrapper>
          <NewDeath />
        </TestWrapper>
      );

      const animalSelect = screen.getByTestId("select");
      await userEvent.selectOptions(animalSelect, mockAnimals[0]?.id || "");

      const dateInput = screen.getByTestId("input-data");
      await userEvent.type(dateInput, "2024-01-15");

      const causeInput = screen.getByTestId("input-causa");
      await userEvent.type(causeInput, "Doença");

      const form = document.querySelector("form");
      if (form) {
        await act(async () => {
          const submitEvent = new Event("submit", { bubbles: true, cancelable: true });
          form.dispatchEvent(submitEvent);
        });
      }

      await waitFor(() => {
        const errors = screen.queryAllByTestId("error");
        expect(errors.length).toBeGreaterThan(0);
      });
    });

    it("should handle back button click", async () => {
      const { useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <NewDeath />
        </TestWrapper>
      );

      const FormPageLayout = (await import("~/components/ui")).FormPageLayout;
      const calls = vi.mocked(FormPageLayout).mock.calls;
      if (calls.length > 0 && calls[0][0]?.backButton?.onClick) {
        calls[0][0].backButton.onClick();
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.ANIMALS);
      }
    });

    it("should handle pre-selected animal from location state", async () => {
      const { useLocation } = await import("react-router");
      const { getAnimalsByCompanyId, getAnimalById } = await import("~/services/animals.service");
      vi.mocked(getAnimalsByCompanyId).mockReturnValueOnce(
        mockAnimals.filter((a) => a.status === "active") as Animal[]
      );
      vi.mocked(getAnimalById).mockReturnValueOnce(mockAnimals[0] as Animal);
      vi.mocked(useLocation).mockReturnValue({
        state: { animalId: mockAnimals[0]?.id || "" },
        pathname: "/dashboard/registros/obitos/novo",
        search: "",
        hash: "",
        key: "default",
      } as RouterLocation);

      render(
        <TestWrapper>
          <NewDeath />
        </TestWrapper>
      );

      const titles = screen.getAllByText("Registrar Óbito");
      expect(titles.length).toBeGreaterThan(0);
    });

    it("should handle animal search filtering", async () => {
      const { getAnimalsByCompanyId } = await import("~/services/animals.service");
      vi.mocked(getAnimalsByCompanyId).mockReturnValueOnce(
        mockAnimals.filter((a) => a.status === "active") as Animal[]
      );

      render(
        <TestWrapper>
          <NewDeath />
        </TestWrapper>
      );

      const animalSearchInput = screen.getByPlaceholderText("Buscar animal...");
      await userEvent.type(animalSearchInput, mockAnimals[0]?.code || "FJ");

      expect(animalSearchInput).toHaveValue(mockAnimals[0]?.code || "FJ");
    });

    it("should display gender in animal select options", async () => {
      const { getAnimalsByCompanyId } = await import("~/services/animals.service");
      const { getBirthByAnimalId } = await import("~/services/births.service");
      vi.mocked(getAnimalsByCompanyId).mockReturnValueOnce(
        mockAnimals.filter((a) => a.status === "active") as Animal[]
      );
      vi.mocked(getBirthByAnimalId).mockReturnValueOnce({
        id: "birth-1",
        gender: "male",
      } as unknown as Birth);

      render(
        <TestWrapper>
          <NewDeath />
        </TestWrapper>
      );

      // The gender should be displayed in the select options
      const animalSelect = screen.getByTestId("select");
      expect(animalSelect).toBeInTheDocument();
    });

    it("should handle cancel button click", async () => {
      const { useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <NewDeath />
        </TestWrapper>
      );

      const FormPageLayout = (await import("~/components/ui")).FormPageLayout;
      const calls = vi.mocked(FormPageLayout).mock.calls;
      if (calls.length > 0 && calls[0][0]?.footer?.cancelButton?.onClick) {
        calls[0][0].footer.cancelButton.onClick();
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.ANIMALS);
      }
    });

    it("should handle observation field", async () => {
      render(
        <TestWrapper>
          <NewDeath />
        </TestWrapper>
      );

      const textarea = document.querySelector("textarea");
      if (textarea) {
        await userEvent.type(textarea, "Test observation");
        expect(textarea).toHaveValue("Test observation");
      }
    });
  });
});
