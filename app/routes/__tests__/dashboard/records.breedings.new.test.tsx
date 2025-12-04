import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import React from "react";
import { meta, loader, default as NewBreeding } from "../../dashboard/records.breedings.new";
import { ROUTES } from "~/routes.config";
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

vi.mock("~/services/breedings.service", () => ({
  addBreeding: vi.fn(),
  getNextAttemptNumber: vi.fn(() => 1),
}));

vi.mock("~/mocks/companies", () => ({
  mockCompanies: [{ id: "company-1", companyName: "Test Company" }],
}));

vi.mock("~/mocks/employees", () => ({
  mockEmployees: [{ id: "emp-1", name: "Employee 1", companyId: "company-1", status: "active" }],
}));

vi.mock("~/mocks/service-providers", () => ({
  mockServiceProviders: [
    { id: "sp-1", name: "Service Provider 1", companyId: "company-1", status: "active" },
  ],
}));

vi.mock("~/hooks/use-breeding-form", () => ({
  useBreedingForm: vi.fn(() => ({
    formData: {
      animalIds: [],
      date: new Date().toISOString().split("T")[0],
      method: "",
      bullId: "",
      attemptNumbers: {},
      semenCode: "",
      employeeIds: [],
      serviceProviderIds: [],
      observation: "",
      confirmed: false,
    },
    errors: {},
    handleChange: vi.fn(),
    toggleAnimalSelection: vi.fn(),
    toggleSelection: vi.fn(),
    handleMethodChange: vi.fn(),
    handleAttemptNumberChange: vi.fn(),
    validate: vi.fn(() => true),
  })),
}));

vi.mock("~/hooks/use-animal-search", () => ({
  useAnimalSearch: vi.fn(() => ({
    filteredAnimals: [],
    searchValue: "",
    setSearchValue: vi.fn(),
  })),
}));

vi.mock("~/hooks/use-alert", () => ({
  useAlert: vi.fn(() => ({
    alertMessage: null,
    showAlert: vi.fn(),
  })),
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
    }: {
      label?: string;
      value?: string;
      onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
      error?: string;
      disabled?: boolean;
      required?: boolean;
      type?: string;
    }) => (
      <div>
        <label>{label}</label>
        <input
          type={type || "text"}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          data-testid={`input-${label?.toLowerCase().replace(/\s+/g, "-") || "input"}`}
        />
        {error && <span data-testid="error">{error}</span>}
      </div>
    )
  ),
  Button: vi.fn(
    ({
      onClick,
      children,
      disabled,
      type,
      variant,
    }: {
      onClick?: () => void;
      children?: React.ReactNode;
      disabled?: boolean;
      type?: "button" | "submit" | "reset";
      variant?: string;
    }) => (
      <button
        onClick={onClick}
        disabled={disabled}
        type={type}
        data-variant={variant}
        data-testid="button"
      >
        {children}
      </button>
    )
  ),
  FixedAlert: vi.fn(() => null),
}));

vi.mock("~/components/dashboard/breedings/breeding-form-sections/animal-selection-section", () => ({
  AnimalSelectionSection: vi.fn(() => <div data-testid="animal-selection">Animal Selection</div>),
}));

vi.mock("~/components/dashboard/breedings/breeding-form-sections/method-selection-section", () => ({
  MethodSelectionSection: vi.fn(() => <div data-testid="method-selection">Method Selection</div>),
}));

vi.mock("~/components/dashboard/breedings/breeding-form-sections/natural-breeding-section", () => ({
  NaturalBreedingSection: vi.fn(() => <div data-testid="natural-breeding">Natural Breeding</div>),
}));

vi.mock("~/components/dashboard/breedings/breeding-form-sections/ai-breeding-section", () => ({
  AIBreedingSection: vi.fn(() => <div data-testid="ai-breeding">AI Breeding</div>),
}));

vi.mock(
  "~/components/dashboard/breedings/breeding-form-sections/responsible-selection-section",
  () => ({
    ResponsibleSelectionSection: vi.fn(() => (
      <div data-testid="responsible-selection">Responsible Selection</div>
    )),
  })
);

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    breedings: {
      new: {
        title: "Nova Monta",
        description: "Registre uma nova monta",
        dateLabel: "Data",
        confirmedLabel: "Confirmado",
        confirmedDescription: "Marque se a monta foi confirmada",
        observationLabel: "Observações",
        observationPlaceholder: "Observações sobre a monta",
        addButton: "Registrar Monta",
        success: "Monta registrada com sucesso",
        error: "Erro ao registrar monta",
        attemptNumberLabel: "Número da Tentativa",
        semenCodeLabel: "Código do Sêmen",
      },
    },
    common: {
      back: "Voltar",
      cancel: "Cancelar",
      loading: "Carregando...",
    },
  })),
  translations: {
    pt: {
      breedings: {
        meta: {
          new: {
            title: "Nova Monta - Boi na Nuvem",
            description: "Registrar nova monta",
          },
        },
      },
    },
  },
}));

const TestWrapper = ({
  children,
  initialEntries = ["/dashboard/registros/montas/novo"],
}: {
  children: React.ReactNode;
  initialEntries?: string[];
}) => <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>;

describe("records.breedings.new", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // Reset addBreeding mock to default (no error)
    const { addBreeding } = await import("~/services/breedings.service");
    vi.mocked(addBreeding).mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("meta", () => {
    it("should return SEO meta tags", () => {
      const result = meta();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("loader", () => {
    it("should call createRouteGuard", async () => {
      const { createRouteGuard } = await import("~/utils/route-guard");
      const request = new Request("http://localhost/dashboard/registros/montas/novo");

      await loader({ request });

      expect(createRouteGuard).toHaveBeenCalled();
    });
  });

  describe("NewBreeding component", () => {
    it("should render form with correct title", () => {
      render(
        <TestWrapper>
          <NewBreeding />
        </TestWrapper>
      );

      expect(screen.getByText("Nova Monta")).toBeInTheDocument();
    });

    it("should render animal selection section", () => {
      render(
        <TestWrapper>
          <NewBreeding />
        </TestWrapper>
      );

      expect(screen.getByTestId("animal-selection")).toBeInTheDocument();
    });

    it("should render method selection section", () => {
      render(
        <TestWrapper>
          <NewBreeding />
        </TestWrapper>
      );

      expect(screen.getByTestId("method-selection")).toBeInTheDocument();
    });

    it("should handle form submission with valid data", async () => {
      const { useNavigate } = await import("react-router");
      const { addBreeding: _addBreeding } = await import("~/services/breedings.service");
      const { useAlert } = await import("~/hooks/use-alert");
      const { useBreedingForm } = await import("~/hooks/use-breeding-form");
      const mockNavigate = vi.fn();
      const mockShowAlert = vi.fn();
      const mockValidate = vi.fn(() => true);

      vi.mocked(useNavigate).mockReturnValue(mockNavigate);
      vi.mocked(useAlert).mockReturnValue({
        alertMessage: null,
        showAlert: mockShowAlert,
      } as never);
      vi.mocked(useBreedingForm).mockReturnValue({
        formData: {
          animalIds: ["animal-1"],
          date: new Date().toISOString().split("T")[0],
          method: "natural",
          bullId: "bull-1",
          attemptNumbers: {},
          semenCode: "",
          employeeIds: [],
          serviceProviderIds: [],
          observation: "",
          confirmed: false,
        },
        errors: {},
        handleChange: vi.fn(),
        toggleAnimalSelection: vi.fn(),
        toggleSelection: vi.fn(),
        handleMethodChange: vi.fn(),
        handleAttemptNumberChange: vi.fn(),
        validate: mockValidate,
      } as never);

      render(
        <TestWrapper>
          <NewBreeding />
        </TestWrapper>
      );

      const form = document.querySelector("form");
      if (form) {
        await act(async () => {
          const submitEvent = new Event("submit", { bubbles: true, cancelable: true });
          form.dispatchEvent(submitEvent);
        });
      }

      await waitFor(
        () => {
          expect(mockValidate).toHaveBeenCalled();
        },
        { timeout: 2000 }
      );
    });

    it("should handle back button click", async () => {
      const { useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <NewBreeding />
        </TestWrapper>
      );

      const backButton = screen.getByText("Voltar");
      await userEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.ANIMALS);
    });

    it("should handle pre-selected animal IDs from location state", async () => {
      const { useLocation } = await import("react-router");
      vi.mocked(useLocation).mockReturnValue({
        state: { animalIds: ["animal-1", "animal-2"] },
        pathname: "/dashboard/registros/montas/novo",
        search: "",
        hash: "",
        key: "default",
      } as RouterLocation);

      render(
        <TestWrapper>
          <NewBreeding />
        </TestWrapper>
      );

      expect(screen.getByText("Nova Monta")).toBeInTheDocument();
    });

    it("should handle error on submission", async () => {
      const { useBreedingForm } = await import("~/hooks/use-breeding-form");
      const { useAlert } = await import("~/hooks/use-alert");
      const { addBreeding: _addBreeding } = await import("~/services/breedings.service");
      const mockShowAlert = vi.fn();
      const mockValidate = vi.fn(() => true);

      // Suppress console.error for this test since we're testing error handling
      const originalError = console.error;
      console.error = vi.fn();

      vi.mocked(_addBreeding).mockImplementation(() => {
        throw new Error("Failed");
      });
      vi.mocked(useAlert).mockReturnValue({
        alertMessage: null,
        showAlert: mockShowAlert,
      } as never);
      vi.mocked(useBreedingForm).mockReturnValue({
        formData: {
          animalIds: ["animal-1"],
          date: new Date().toISOString().split("T")[0],
          method: "natural",
          bullId: "bull-1",
          attemptNumbers: {},
          semenCode: "",
          employeeIds: [],
          serviceProviderIds: [],
          observation: "",
          confirmed: false,
        },
        errors: {},
        handleChange: vi.fn(),
        toggleAnimalSelection: vi.fn(),
        toggleSelection: vi.fn(),
        handleMethodChange: vi.fn(),
        handleAttemptNumberChange: vi.fn(),
        validate: mockValidate,
      } as never);

      render(
        <TestWrapper>
          <NewBreeding />
        </TestWrapper>
      );

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

    it("should render natural breeding section when method is natural", async () => {
      const { useBreedingForm } = await import("~/hooks/use-breeding-form");
      vi.mocked(useBreedingForm).mockReturnValueOnce({
        formData: {
          animalIds: ["animal-1"],
          date: new Date().toISOString().split("T")[0],
          method: "natural",
          bullId: "",
          attemptNumbers: {},
          semenCode: "",
          employeeIds: [],
          serviceProviderIds: [],
          observation: "",
          confirmed: false,
        },
        errors: {},
        handleChange: vi.fn(),
        toggleAnimalSelection: vi.fn(),
        toggleSelection: vi.fn(),
        handleMethodChange: vi.fn(),
        handleAttemptNumberChange: vi.fn(),
        validate: vi.fn(() => true),
      } as never);

      render(
        <TestWrapper>
          <NewBreeding />
        </TestWrapper>
      );

      expect(screen.getByTestId("natural-breeding")).toBeInTheDocument();
    });

    it("should render AI breeding section when method is artificial_insemination", async () => {
      const { useBreedingForm } = await import("~/hooks/use-breeding-form");
      vi.mocked(useBreedingForm).mockReturnValueOnce({
        formData: {
          animalIds: ["animal-1", "animal-2"],
          date: new Date().toISOString().split("T")[0],
          method: "artificial_insemination",
          bullId: "",
          attemptNumbers: { "animal-1": 1, "animal-2": 2 },
          semenCode: "SEM-001",
          employeeIds: [],
          serviceProviderIds: [],
          observation: "",
          confirmed: false,
        },
        errors: {},
        handleChange: vi.fn(),
        toggleAnimalSelection: vi.fn(),
        toggleSelection: vi.fn(),
        handleMethodChange: vi.fn(),
        handleAttemptNumberChange: vi.fn(),
        validate: vi.fn(() => true),
      } as never);

      render(
        <TestWrapper>
          <NewBreeding />
        </TestWrapper>
      );

      expect(screen.getByTestId("ai-breeding")).toBeInTheDocument();
    });

    it("should handle confirmed checkbox change", async () => {
      const { useBreedingForm } = await import("~/hooks/use-breeding-form");
      const mockHandleChange = vi.fn();
      vi.mocked(useBreedingForm).mockReturnValueOnce({
        formData: {
          animalIds: ["animal-1"],
          date: new Date().toISOString().split("T")[0],
          method: "natural",
          bullId: "",
          attemptNumbers: {},
          semenCode: "",
          employeeIds: [],
          serviceProviderIds: [],
          observation: "",
          confirmed: false,
        },
        errors: {},
        handleChange: mockHandleChange,
        toggleAnimalSelection: vi.fn(),
        toggleSelection: vi.fn(),
        handleMethodChange: vi.fn(),
        handleAttemptNumberChange: vi.fn(),
        validate: vi.fn(() => true),
      } as never);

      render(
        <TestWrapper>
          <NewBreeding />
        </TestWrapper>
      );

      const checkbox = document.querySelector('input[type="checkbox"]');
      if (checkbox) {
        await userEvent.click(checkbox);
        expect(mockHandleChange).toHaveBeenCalledWith("confirmed", true);
      }
    });

    it("should handle observation field change", async () => {
      const { useBreedingForm } = await import("~/hooks/use-breeding-form");
      const mockHandleChange = vi.fn();
      vi.mocked(useBreedingForm).mockReturnValueOnce({
        formData: {
          animalIds: ["animal-1"],
          date: new Date().toISOString().split("T")[0],
          method: "natural",
          bullId: "",
          attemptNumbers: {},
          semenCode: "",
          employeeIds: [],
          serviceProviderIds: [],
          observation: "",
          confirmed: false,
        },
        errors: {},
        handleChange: mockHandleChange,
        toggleAnimalSelection: vi.fn(),
        toggleSelection: vi.fn(),
        handleMethodChange: vi.fn(),
        handleAttemptNumberChange: vi.fn(),
        validate: vi.fn(() => true),
      } as never);

      render(
        <TestWrapper>
          <NewBreeding />
        </TestWrapper>
      );

      const textarea = document.querySelector("textarea");
      if (textarea) {
        await userEvent.type(textarea, "Test observation");
        expect(mockHandleChange).toHaveBeenCalled();
      }
    });

    it("should handle form submission with AI breeding method", async () => {
      const { useNavigate } = await import("react-router");
      const { addBreeding: _addBreeding } = await import("~/services/breedings.service");
      const { useAlert } = await import("~/hooks/use-alert");
      const { useBreedingForm } = await import("~/hooks/use-breeding-form");
      const mockNavigate = vi.fn();
      const mockShowAlert = vi.fn();
      const mockValidate = vi.fn(() => true);

      vi.mocked(useNavigate).mockReturnValue(mockNavigate);
      vi.mocked(useAlert).mockReturnValue({
        alertMessage: null,
        showAlert: mockShowAlert,
      } as never);
      vi.mocked(useBreedingForm).mockReturnValue({
        formData: {
          animalIds: ["animal-1"],
          date: new Date().toISOString().split("T")[0],
          method: "artificial_insemination",
          bullId: "",
          attemptNumbers: { "animal-1": 1 },
          semenCode: "SEM-001",
          employeeIds: [],
          serviceProviderIds: [],
          observation: "",
          confirmed: false,
        },
        errors: {},
        handleChange: vi.fn(),
        toggleAnimalSelection: vi.fn(),
        toggleSelection: vi.fn(),
        handleMethodChange: vi.fn(),
        handleAttemptNumberChange: vi.fn(),
        validate: mockValidate,
      } as never);

      render(
        <TestWrapper>
          <NewBreeding />
        </TestWrapper>
      );

      const form = document.querySelector("form");
      if (form) {
        await act(async () => {
          const submitEvent = new Event("submit", { bubbles: true, cancelable: true });
          form.dispatchEvent(submitEvent);
        });
      }

      await waitFor(
        () => {
          expect(mockValidate).toHaveBeenCalled();
          expect(_addBreeding).toHaveBeenCalledWith(
            expect.objectContaining({
              method: "artificial_insemination",
              attemptNumber: 1,
              semenCode: "SEM-001",
            })
          );
        },
        { timeout: 2000 }
      );
    });

    it("should handle validation failure", async () => {
      const { useBreedingForm } = await import("~/hooks/use-breeding-form");
      const { useAlert } = await import("~/hooks/use-alert");
      const { addBreeding: _addBreeding } = await import("~/services/breedings.service");
      const mockShowAlert = vi.fn();
      const mockValidate = vi.fn(() => false);

      vi.mocked(useAlert).mockReturnValue({
        alertMessage: null,
        showAlert: mockShowAlert,
      } as never);
      vi.mocked(useBreedingForm).mockReturnValue({
        formData: {
          animalIds: [],
          date: new Date().toISOString().split("T")[0],
          method: "",
          bullId: "",
          attemptNumbers: {},
          semenCode: "",
          employeeIds: [],
          serviceProviderIds: [],
          observation: "",
          confirmed: false,
        },
        errors: { animalIds: "Required" },
        handleChange: vi.fn(),
        toggleAnimalSelection: vi.fn(),
        toggleSelection: vi.fn(),
        handleMethodChange: vi.fn(),
        handleAttemptNumberChange: vi.fn(),
        validate: mockValidate,
      } as never);

      render(
        <TestWrapper>
          <NewBreeding />
        </TestWrapper>
      );

      const form = document.querySelector("form");
      if (form) {
        await act(async () => {
          const submitEvent = new Event("submit", { bubbles: true, cancelable: true });
          form.dispatchEvent(submitEvent);
        });
      }

      await waitFor(
        () => {
          expect(mockValidate).toHaveBeenCalled();
          expect(_addBreeding).not.toHaveBeenCalled();
        },
        { timeout: 2000 }
      );
    });
  });
});
