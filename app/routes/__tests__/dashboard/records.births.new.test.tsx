import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import React from "react";
import { meta, default as NewBirth } from "../../dashboard/records.births.new";
import { ROUTES } from "~/routes.config";
import { mockProperties } from "~/mocks/properties";
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

vi.mock("~/services/births.service", () => ({
  addBirth: vi.fn(),
  calculatePurity: vi.fn(() => undefined),
  getBirthByAnimalId: vi.fn(() => null),
}));

vi.mock("~/services/breedings.service", () => ({
  unconfirmMostRecentBreedingForAnimal: vi.fn(),
}));

vi.mock("~/services/animals.service", () => ({
  addAnimal: vi.fn(() => ({ id: "animal-1", code: "TEST-001" })),
  getAnimalsByCompanyId: vi.fn(() => []),
  getAnimalById: vi.fn(() => null),
}));

vi.mock("~/services/weighings.service", () => ({
  addWeighing: vi.fn(),
}));

vi.mock("~/mocks/companies", () => ({
  mockCompanies: [{ id: "company-1", companyName: "Test Company" }],
}));

vi.mock("~/mocks/properties", () => ({
  mockProperties: [
    { id: "prop-1", name: "Property 1" },
    { id: "prop-2", name: "Property 2" },
  ],
}));

vi.mock("~/mocks/employees", () => ({
  mockEmployees: [{ id: "emp-1", name: "Employee 1", companyId: "company-1", status: "active" }],
}));

vi.mock("~/mocks/service-providers", () => ({
  mockServiceProviders: [
    { id: "sp-1", name: "Service Provider 1", companyId: "company-1", status: "active" },
  ],
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
      className,
      placeholder,
    }: {
      label?: string;
      value?: string;
      onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
      error?: string;
      disabled?: boolean;
      required?: boolean;
      type?: string;
      className?: string;
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
          className={className}
          placeholder={placeholder}
          data-testid={`input-${label?.toLowerCase().replace(/\s+/g, "-") || "input"}`}
        />
        {error && <span data-testid="error">{error}</span>}
      </div>
    )
  ),
  Select: vi.fn(
    ({
      label,
      value,
      onChange,
      error,
      disabled,
      required,
      options,
    }: {
      label?: string;
      value?: string;
      onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
      error?: string;
      disabled?: boolean;
      required?: boolean;
      options?: Array<{ value: string; label: string }>;
    }) => (
      <div>
        <label>{label}</label>
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          data-testid={`select-${label?.toLowerCase().replace(/\s+/g, "-") || "select"}`}
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
  Button: vi.fn(
    ({
      onClick,
      children,
      disabled,
      variant,
    }: {
      onClick?: () => void;
      children?: React.ReactNode;
      disabled?: boolean;
      variant?: string;
    }) => (
      <button onClick={onClick} disabled={disabled} data-variant={variant} data-testid="button">
        {children}
      </button>
    )
  ),
  FixedAlert: vi.fn(() => null),
}));

vi.mock("~/components/dashboard/shared", () => ({
  ResponsibleSelectionSection: vi.fn(() => null),
  ObservationField: vi.fn(() => null),
  FormActions: vi.fn(
    ({
      onCancel,
      isSubmitting,
      submitLabel,
    }: {
      onCancel?: () => void;
      isSubmitting?: boolean;
      submitLabel?: string;
    }) => (
      <div>
        <button onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting}>
          {submitLabel}
        </button>
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
    births: {
      new: {
        title: "Registrar Nascimento",
        description: "Registre um novo nascimento",
        animalInfoTitle: "Informações do Animal",
        birthInfoTitle: "Informações do Nascimento",
        weighingInfoTitle: "Informações da Pesagem",
        birthDateLabel: "Data de Nascimento",
        genderLabel: "Gênero",
        motherLabel: "Mãe",
        fatherLabel: "Pai",
        observationLabel: "Observações",
        observationPlaceholder: "Observações sobre o nascimento",
        weighingDateLabel: "Data da Pesagem",
        weightLabel: "Peso",
        employeesLabel: "Funcionários",
        serviceProvidersLabel: "Prestadores de Serviço",
        noEmployees: "Nenhum funcionário cadastrado",
        noServiceProviders: "Nenhum prestador de serviço cadastrado",
        weighingObservationLabel: "Observações da Pesagem",
        weighingObservationPlaceholder: "Observações sobre a pesagem",
        searchPlaceholder: "Buscar...",
        addButton: "Registrar Nascimento",
        success: "Nascimento registrado com sucesso",
        error: "Erro ao registrar nascimento",
      },
    },
    animals: {
      table: {
        code: "Código",
      },
      new: {
        registrationNumberLabel: "Número de Registro",
        propertyLabel: "Propriedade",
        propertyRequired: "Propriedade é obrigatória",
      },
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
  initialEntries = ["/dashboard/registros/nascimentos/novo"],
}: {
  children: React.ReactNode;
  initialEntries?: string[];
}) => <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>;

describe("records.births.new", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // Reset addBirth mock to default (no error)
    const { addBirth } = await import("~/services/births.service");
    vi.mocked(addBirth).mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("meta", () => {
    it("should return SEO meta tags", () => {
      const result = meta();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result[0].title).toContain("Registrar Nascimento");
    });
  });

  describe("NewBirth component", () => {
    it("should render form with correct title", () => {
      render(
        <TestWrapper>
          <NewBirth />
        </TestWrapper>
      );

      const titles = screen.getAllByText("Registrar Nascimento");
      expect(titles.length).toBeGreaterThan(0);
    });

    it("should handle form submission with valid data", async () => {
      const { useNavigate } = await import("react-router");
      const { addBirth } = await import("~/services/births.service");
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
          <NewBirth />
        </TestWrapper>
      );

      // Fill form
      const codeInput = screen.getByTestId("input-código");
      await userEvent.type(codeInput, "TEST-001");

      const registrationInput = screen.getByTestId("input-número-de-registro");
      await userEvent.type(registrationInput, "REG-001");

      const propertySelect = screen.getByTestId("select-propriedade");
      await userEvent.selectOptions(propertySelect, mockProperties[0]?.id || "");

      const genderSelect = screen.getByTestId("select-gênero");
      await userEvent.selectOptions(genderSelect, "male");

      const form = document.querySelector("form");
      if (form) {
        await act(async () => {
          const submitEvent = new Event("submit", { bubbles: true, cancelable: true });
          form.dispatchEvent(submitEvent);
        });
      }

      await waitFor(
        () => {
          expect(addBirth).toHaveBeenCalled();
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
          <NewBirth />
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

    it("should handle back button click", async () => {
      const { useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <NewBirth />
        </TestWrapper>
      );

      const backButton = screen.getByText("Voltar");
      await userEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.ANIMALS);
    });

    it("should handle pre-selected mother and father from location state", async () => {
      const { useLocation } = await import("react-router");
      const { getAnimalsByCompanyId, getAnimalById: _getAnimalById } = await import(
        "~/services/animals.service"
      );
      const { getBirthByAnimalId } = await import("~/services/births.service");

      const mockFemaleAnimal = {
        id: "mother-1",
        code: "FEM-001",
        registrationNumber: "REG-FEM-001",
        status: "active",
        companyId: "company-1",
        propertyId: "prop-1",
      };
      const mockMaleAnimal = {
        id: "father-1",
        code: "MAL-001",
        registrationNumber: "REG-MAL-001",
        status: "active",
        companyId: "company-1",
        propertyId: "prop-1",
      };

      vi.mocked(getAnimalsByCompanyId).mockReturnValueOnce([
        mockFemaleAnimal,
        mockMaleAnimal,
      ] as Animal[]);
      vi.mocked(_getAnimalById).mockImplementation((id: string) => {
        if (id === "mother-1") return mockFemaleAnimal as Animal;
        if (id === "father-1") return mockMaleAnimal as Animal;
        return null;
      });
      vi.mocked(getBirthByAnimalId).mockImplementation((id: string) => {
        if (id === "mother-1")
          return { id: "birth-1", gender: "female", breed: "Nelore" } as unknown as Birth;
        if (id === "father-1")
          return { id: "birth-2", gender: "male", breed: "Nelore" } as unknown as Birth;
        return null;
      });

      vi.mocked(useLocation).mockReturnValue({
        state: { motherId: "mother-1", fatherId: "father-1" },
        pathname: "/dashboard/registros/nascimentos/novo",
        search: "",
        hash: "",
        key: "default",
      } as RouterLocation);

      render(
        <TestWrapper>
          <NewBirth />
        </TestWrapper>
      );

      const titles = screen.getAllByText("Registrar Nascimento");
      expect(titles.length).toBeGreaterThan(0);
    });

    it("should handle responsible selection", async () => {
      render(
        <TestWrapper>
          <NewBirth />
        </TestWrapper>
      );

      // ResponsibleSelectionSection is mocked, but we can verify it's rendered
      const ResponsibleSelectionSection = (await import("~/components/dashboard/shared"))
        .ResponsibleSelectionSection;
      const calls = vi.mocked(ResponsibleSelectionSection).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
    });

    it("should handle mother and father search", async () => {
      const { getAnimalsByCompanyId, getAnimalById: _getAnimalById } = await import(
        "~/services/animals.service"
      );
      const { getBirthByAnimalId } = await import("~/services/births.service");

      const mockFemaleAnimal = {
        id: "mother-1",
        code: "FEM-001",
        registrationNumber: "REG-FEM-001",
        status: "active",
        companyId: "company-1",
        propertyId: "prop-1",
      };
      const mockMaleAnimal = {
        id: "father-1",
        code: "MAL-001",
        registrationNumber: "REG-MAL-001",
        status: "active",
        companyId: "company-1",
        propertyId: "prop-1",
      };

      vi.mocked(getAnimalsByCompanyId).mockReturnValueOnce([
        mockFemaleAnimal,
        mockMaleAnimal,
      ] as Animal[]);
      vi.mocked(getBirthByAnimalId).mockImplementation((id: string) => {
        if (id === "mother-1")
          return { id: "birth-1", gender: "female", breed: "Nelore" } as unknown as Birth;
        if (id === "father-1")
          return { id: "birth-2", gender: "male", breed: "Nelore" } as unknown as Birth;
        return null;
      });

      render(
        <TestWrapper>
          <NewBirth />
        </TestWrapper>
      );

      // Find mother search input
      const motherInputs = Array.from(document.querySelectorAll("input")).filter((input) =>
        input.getAttribute("placeholder")?.toLowerCase().includes("buscar")
      );
      if (motherInputs[0]) {
        await userEvent.type(motherInputs[0], "FEM");
        expect(motherInputs[0]).toHaveValue("FEM");
      }
    });

    it("should handle error on submission", async () => {
      const { addBirth } = await import("~/services/births.service");
      const { useAlert } = await import("~/hooks/use-alert");
      const mockShowAlert = vi.fn();

      // Suppress console.error for this test
      const originalError = console.error;
      console.error = vi.fn();

      vi.mocked(addBirth).mockImplementation(() => {
        throw new Error("Database error");
      });
      vi.mocked(useAlert).mockReturnValue({
        alertMessage: null,
        showAlert: mockShowAlert,
      } as never);

      render(
        <TestWrapper>
          <NewBirth />
        </TestWrapper>
      );

      // Fill form
      const codeInput = screen.getByTestId("input-código");
      await userEvent.type(codeInput, "TEST-001");

      const registrationInput = screen.getByTestId("input-número-de-registro");
      await userEvent.type(registrationInput, "REG-001");

      const propertySelect = screen.getByTestId("select-propriedade");
      await userEvent.selectOptions(propertySelect, mockProperties[0]?.id || "");

      const genderSelect = screen.getByTestId("select-gênero");
      await userEvent.selectOptions(genderSelect, "male");

      const form = document.querySelector("form");
      if (form) {
        await act(async () => {
          const submitEvent = new Event("submit", { bubbles: true, cancelable: true });
          form.dispatchEvent(submitEvent);
        });
      }

      await waitFor(
        () => {
          expect(mockShowAlert).toHaveBeenCalled();
        },
        { timeout: 2000 }
      );

      // Restore console.error
      console.error = originalError;
    });

    it("should not create weighing when weight is not provided", async () => {
      const { addWeighing } = await import("~/services/weighings.service");
      const { useNavigate } = await import("react-router");
      const { useAlert } = await import("~/hooks/use-alert");
      const mockNavigate = vi.fn();
      const mockShowAlert = vi.fn();

      // Suppress console.error for this test in case of any errors
      const originalError = console.error;
      console.error = vi.fn();

      vi.mocked(useNavigate).mockReturnValue(mockNavigate);
      vi.mocked(useAlert).mockReturnValue({
        alertMessage: null,
        showAlert: mockShowAlert,
      } as never);

      render(
        <TestWrapper>
          <NewBirth />
        </TestWrapper>
      );

      // Fill form without weight
      const codeInput = screen.getByTestId("input-código");
      await userEvent.type(codeInput, "TEST-001");

      const registrationInput = screen.getByTestId("input-número-de-registro");
      await userEvent.type(registrationInput, "REG-001");

      const propertySelect = screen.getByTestId("select-propriedade");
      await userEvent.selectOptions(propertySelect, mockProperties[0]?.id || "");

      const genderSelect = screen.getByTestId("select-gênero");
      await userEvent.selectOptions(genderSelect, "male");

      const form = document.querySelector("form");
      if (form) {
        await act(async () => {
          const submitEvent = new Event("submit", { bubbles: true, cancelable: true });
          form.dispatchEvent(submitEvent);
        });
      }

      await waitFor(
        () => {
          // addWeighing should not be called when weight is not provided
          expect(addWeighing).not.toHaveBeenCalled();
        },
        { timeout: 2000 }
      );

      // Restore console.error
      console.error = originalError;
    });
  });
});
