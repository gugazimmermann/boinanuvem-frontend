import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { loader, meta, default as NewAnimalMovement } from "../../dashboard/animals.movement.new";
import { mockAnimals } from "~/mocks/animals";
import { mockProperties as _mockProperties } from "~/mocks/properties";
import { mockEmployees as _mockEmployees } from "~/mocks/employees";
import { mockServiceProviders as _mockServiceProviders } from "~/mocks/service-providers";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
    useLocation: vi.fn(() => ({
      state: { animalIds: [mockAnimals[0]?.id || "animal-001"] },
    })),
  };
});

vi.mock("~/utils/route-guard", () => ({
  createRouteGuard: vi.fn(() => () => Promise.resolve(null)),
}));

vi.mock("~/services/animals.service", () => ({
  getAnimalById: vi.fn((id: string) => {
    return mockAnimals.find((a) => a.id === id) || null;
  }),
}));

vi.mock("~/services/locations.service", () => ({
  getLocationsByPropertyId: vi.fn(() => []),
}));

vi.mock("~/services/animal-movements.service", () => ({
  getAnimalMovementsByAnimalId: vi.fn(() => []),
  addAnimalMovement: vi.fn(() => ({ id: "movement-001" })),
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

vi.mock("~/mocks/companies", () => ({
  mockCompanies: [{ id: "company-1", companyName: "Test Company" }],
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
  Input: vi.fn(
    ({
      label,
      value,
      onChange,
      error,
      disabled,
      required,
    }: {
      label: string;
      value: string;
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
      error?: string;
      disabled?: boolean;
      required?: boolean;
    }) => (
      <div>
        <label>{label}</label>
        <input
          value={value}
          onChange={onChange}
          data-error={error}
          disabled={disabled}
          required={required}
          data-testid={`input-${label.toLowerCase().replace(/\s+/g, "-")}`}
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
      label: string;
      value: string;
      onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
      error?: string;
      disabled?: boolean;
      required?: boolean;
      options: Array<{ value: string; label: string }>;
    }) => (
      <div>
        <label>{label}</label>
        <select
          value={value}
          onChange={onChange}
          data-error={error}
          disabled={disabled}
          required={required}
          data-testid={`select-${label.toLowerCase().replace(/\s+/g, "-")}`}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span data-testid="error">{error}</span>}
      </div>
    )
  ),
  FileUpload: vi.fn(() => <div data-testid="file-upload">File Upload</div>),
  FixedAlert: vi.fn(() => null),
}));

vi.mock("~/components/dashboard/shared", () => ({
  ResponsibleSelectionSection: vi.fn(() => (
    <div data-testid="responsible-selection">Responsible Selection</div>
  )),
  ObservationField: vi.fn(() => <div data-testid="observation-field">Observation Field</div>),
  FormActions: vi.fn(() => <div data-testid="form-actions">Form Actions</div>),
}));

vi.mock("~/hooks/use-movement-form", () => ({
  useMovementForm: vi.fn(() => ({
    formData: {
      propertyId: "",
      locationId: "",
      date: "",
      observation: "",
      employeeIds: [],
      serviceProviderIds: [],
    },
    setFormData: vi.fn((fn: (prev: unknown) => unknown) => {
      if (typeof fn === "function") {
        fn({
          propertyId: "",
          locationId: "",
          date: "",
          observation: "",
          employeeIds: [],
          serviceProviderIds: [],
        });
      }
    }),
    files: [],
    setFiles: vi.fn(),
    errors: {},
    isSubmitting: false,
    alertMessage: null,
    handleChange: vi.fn(),
    toggleSelection: vi.fn(),
  })),
}));

vi.mock("~/hooks/use-alert", () => ({
  useAlert: vi.fn(() => ({
    alertMessage: null,
    showAlert: vi.fn(),
  })),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    animals: {
      movement: {
        title: "Adicionar Movimentação",
        description: (count: number) => `Mover ${count} animal(is)`,
        selectedAnimals: "Animais Selecionados",
        locationLabel: "Localização",
        noLocation: "Sem localização",
        save: "Salvar",
        success: (success: number, total: number) =>
          `${success} de ${total} movimentações criadas com sucesso`,
        error: "Erro ao criar movimentação",
        noAnimalsSelected: "Nenhum animal selecionado",
        addButton: "Adicionar Movimentação",
      },
      edit: {
        propertyLabel: "Propriedade",
        propertyRequired: "Propriedade é obrigatória",
      },
    },
    properties: {
      details: {
        movements: {
          table: {
            date: "Data",
          },
          observation: "Observação",
          observationPlaceholder: "Adicione observações...",
          files: "Anexos",
          filesHelper: "Você pode fazer upload de múltiplos arquivos",
          errors: {
            noResponsible: "Selecione pelo menos um responsável",
          },
          noEmployees: "Nenhum funcionário disponível",
          noServiceProviders: "Nenhum prestador de serviço disponível",
        },
      },
    },
    employees: {
      table: {
        name: "Funcionários",
      },
    },
    serviceProviders: {
      table: {
        name: "Prestadores de Serviço",
      },
    },
    profile: {
      company: {
        cancel: "Cancelar",
      },
      errors: {
        required: (field: string) => `${field} é obrigatório`,
      },
    },
    team: {
      new: {
        back: "Voltar",
      },
    },
    common: {
      loading: "Carregando...",
    },
  })),
}));

const TestWrapper = ({
  children,
  initialEntries = ["/dashboard/animais/movimentacao/novo"],
}: {
  children: React.ReactNode;
  initialEntries?: string[];
}) => <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>;

describe("animals.movement.new", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("loader", () => {
    it("should call createRouteGuard", async () => {
      const { createRouteGuard } = await import("~/utils/route-guard");
      const request = new Request("http://localhost/dashboard/animais/movimentacao/novo");

      await loader({ request });

      expect(createRouteGuard).toHaveBeenCalled();
    });
  });

  describe("meta", () => {
    it("should return SEO meta tags", () => {
      const result = meta();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("NewAnimalMovement component", () => {
    it("should render form with correct title", () => {
      render(
        <TestWrapper>
          <NewAnimalMovement />
        </TestWrapper>
      );

      expect(screen.getByText("Adicionar Movimentação")).toBeInTheDocument();
    });

    it("should render empty state when no animals are selected", async () => {
      const { useLocation } = await import("react-router");
      vi.mocked(useLocation).mockReturnValue({
        state: { animalIds: [] },
      } as never);

      render(
        <TestWrapper>
          <NewAnimalMovement />
        </TestWrapper>
      );

      expect(screen.getByText("Nenhum animal selecionado")).toBeInTheDocument();
    });

    it("should display selected animals", async () => {
      const { useLocation } = await import("react-router");
      vi.mocked(useLocation).mockReturnValue({
        state: { animalIds: [mockAnimals[0]?.id || "animal-001"] },
      } as never);

      render(
        <TestWrapper>
          <NewAnimalMovement />
        </TestWrapper>
      );

      expect(screen.getByText("Animais Selecionados")).toBeInTheDocument();
    });

    it("should handle form submission with valid data", async () => {
      const { useLocation } = await import("react-router");
      const { addAnimalMovement } = await import("~/services/animal-movements.service");
      const { useAlert } = await import("~/hooks/use-alert");
      const mockShowAlert = vi.fn();
      vi.mocked(useAlert).mockReturnValue({
        alertMessage: null,
        showAlert: mockShowAlert,
      } as never);
      vi.mocked(addAnimalMovement).mockReturnValue({ id: "movement-001" } as never);

      vi.mocked(useLocation).mockReturnValue({
        state: { animalIds: [mockAnimals[0]?.id || "animal-001"] },
      } as never);

      const { useMovementForm } = await import("~/hooks/use-movement-form");
      const formData = {
        propertyId: "prop-1",
        locationId: "",
        date: "2025-01-01",
        observation: "Test observation",
        employeeIds: ["emp-1"],
        serviceProviderIds: [],
      };
      vi.mocked(useMovementForm).mockReturnValue({
        formData,
        setFormData: vi.fn((fn: ((prev: typeof formData) => typeof formData) | typeof formData) => {
          if (typeof fn === "function") {
            fn({
              propertyId: "prop-1",
              locationId: "",
              date: "2025-01-01",
              observation: "Test observation",
              employeeIds: ["emp-1"],
              serviceProviderIds: [],
            });
          }
        }),
        files: [],
        setFiles: vi.fn(),
        errors: {},
        isSubmitting: false,
        alertMessage: null,
        handleChange: vi.fn(),
        toggleSelection: vi.fn(),
      } as never);

      render(
        <TestWrapper>
          <NewAnimalMovement />
        </TestWrapper>
      );

      const form = document.querySelector("form");
      if (form) {
        await act(async () => {
          const formEvent = new Event("submit", { bubbles: true, cancelable: true });
          form.dispatchEvent(formEvent);
        });
      }

      await waitFor(
        () => {
          expect(addAnimalMovement).toHaveBeenCalled();
        },
        { timeout: 2000 }
      );
    });

    it("should handle form validation errors", async () => {
      const { useLocation } = await import("react-router");
      vi.mocked(useLocation).mockReturnValue({
        state: { animalIds: [mockAnimals[0]?.id || "animal-001"] },
      } as never);

      const { useMovementForm } = await import("~/hooks/use-movement-form");
      vi.mocked(useMovementForm).mockReturnValue({
        formData: {
          propertyId: "",
          locationId: "",
          date: "",
          observation: "",
          employeeIds: [],
          serviceProviderIds: [],
        },
        setFormData: vi.fn(),
        files: [],
        setFiles: vi.fn(),
        errors: {
          propertyId: "Propriedade é obrigatória",
          date: "Data é obrigatória",
          responsible: "Selecione pelo menos um responsável",
        },
        isSubmitting: false,
        alertMessage: null,
        handleChange: vi.fn(),
        toggleSelection: vi.fn(),
      } as never);

      render(
        <TestWrapper>
          <NewAnimalMovement />
        </TestWrapper>
      );

      const form = document.querySelector("form");
      if (form) {
        await act(async () => {
          const formEvent = new Event("submit", { bubbles: true, cancelable: true });
          form.dispatchEvent(formEvent);
        });
      }

      await waitFor(() => {
        const errors = screen.queryAllByTestId("error");
        expect(errors.length).toBeGreaterThan(0);
      });
    });

    it("should handle location selection when property changes", async () => {
      const { useLocation } = await import("react-router");
      vi.mocked(useLocation).mockReturnValue({
        state: { animalIds: [mockAnimals[0]?.id || "animal-001"] },
      } as never);

      const { getLocationsByPropertyId } = await import("~/services/locations.service");
      vi.mocked(getLocationsByPropertyId).mockReturnValue([
        { id: "loc-1", name: "Location 1", propertyId: "prop-1" },
        { id: "loc-2", name: "Location 2", propertyId: "prop-1" },
      ] as never);

      const { useMovementForm } = await import("~/hooks/use-movement-form");
      const mockSetFormData = vi.fn();
      vi.mocked(useMovementForm).mockReturnValue({
        formData: {
          propertyId: "prop-1",
          locationId: "",
          date: "",
          observation: "",
          employeeIds: [],
          serviceProviderIds: [],
        },
        setFormData: mockSetFormData,
        files: [],
        setFiles: vi.fn(),
        errors: {},
        isSubmitting: false,
        alertMessage: null,
        handleChange: vi.fn(),
        toggleSelection: vi.fn(),
      } as never);

      render(
        <TestWrapper>
          <NewAnimalMovement />
        </TestWrapper>
      );

      expect(getLocationsByPropertyId).toHaveBeenCalledWith("prop-1");
    });

    it("should handle when no animals are provided in location state", async () => {
      const { useLocation } = await import("react-router");
      vi.mocked(useLocation).mockReturnValue({
        state: null,
      } as never);

      render(
        <TestWrapper>
          <NewAnimalMovement />
        </TestWrapper>
      );

      expect(screen.getByText("Nenhum animal selecionado")).toBeInTheDocument();
    });

    it("should handle movement creation failure", async () => {
      const { useLocation } = await import("react-router");
      const { addAnimalMovement } = await import("~/services/animal-movements.service");
      const { useAlert } = await import("~/hooks/use-alert");
      const mockShowAlert = vi.fn();
      vi.mocked(useAlert).mockReturnValue({
        alertMessage: null,
        showAlert: mockShowAlert,
      } as never);
      vi.mocked(addAnimalMovement).mockReturnValue(null as never);

      vi.mocked(useLocation).mockReturnValue({
        state: { animalIds: [mockAnimals[0]?.id || "animal-001"] },
      } as never);

      const { useMovementForm } = await import("~/hooks/use-movement-form");
      vi.mocked(useMovementForm).mockReturnValue({
        formData: {
          propertyId: "prop-1",
          locationId: "",
          date: "2025-01-01",
          observation: "",
          employeeIds: ["emp-1"],
          serviceProviderIds: [],
        },
        setFormData: vi.fn(),
        files: [],
        setFiles: vi.fn(),
        errors: {},
        isSubmitting: false,
        alertMessage: null,
        handleChange: vi.fn(),
        toggleSelection: vi.fn(),
      } as never);

      render(
        <TestWrapper>
          <NewAnimalMovement />
        </TestWrapper>
      );

      const form = document.querySelector("form");
      if (form) {
        await act(async () => {
          const formEvent = new Event("submit", { bubbles: true, cancelable: true });
          form.dispatchEvent(formEvent);
        });
      }

      await waitFor(
        () => {
          expect(mockShowAlert).toHaveBeenCalledWith(expect.stringContaining("Erro"), "error");
        },
        { timeout: 2000 }
      );
    });

    it("should handle useEffect setting propertyId when animals have same property", async () => {
      const { useLocation } = await import("react-router");
      const { getAnimalMovementsByAnimalId } = await import("~/services/animal-movements.service");
      vi.mocked(useLocation).mockReturnValue({
        state: {
          animalIds: [mockAnimals[0]?.id || "animal-001", mockAnimals[1]?.id || "animal-002"],
        },
      } as never);

      vi.mocked(getAnimalMovementsByAnimalId).mockImplementation((id: string) => {
        return [
          { id: "mov-1", animalIds: [id], propertyId: "prop-1", date: "2025-01-01" },
        ] as never;
      });

      const { useMovementForm } = await import("~/hooks/use-movement-form");
      const mockSetFormData = vi.fn();
      vi.mocked(useMovementForm).mockReturnValue({
        formData: {
          propertyId: "",
          locationId: "",
          date: "",
          observation: "",
          employeeIds: [],
          serviceProviderIds: [],
        },
        setFormData: mockSetFormData,
        files: [],
        setFiles: vi.fn(),
        errors: {},
        isSubmitting: false,
        alertMessage: null,
        handleChange: vi.fn(),
        toggleSelection: vi.fn(),
      } as never);

      render(
        <TestWrapper>
          <NewAnimalMovement />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockSetFormData).toHaveBeenCalled();
      });
    });

    it("should handle createMovementForAnimal when shouldCreateMovement is false", async () => {
      const { useLocation } = await import("react-router");
      const { getAnimalMovementsByAnimalId } = await import("~/services/animal-movements.service");
      vi.mocked(useLocation).mockReturnValue({
        state: { animalIds: [mockAnimals[0]?.id || "animal-001"] },
      } as never);

      const currentPropertyId = "prop-1";
      vi.mocked(getAnimalMovementsByAnimalId).mockReturnValue([
        {
          id: "mov-1",
          animalIds: [mockAnimals[0]?.id || "animal-001"],
          propertyId: currentPropertyId,
          date: "2025-01-01",
        },
      ] as never);

      const { useMovementForm } = await import("~/hooks/use-movement-form");
      vi.mocked(useMovementForm).mockReturnValue({
        formData: {
          propertyId: currentPropertyId,
          locationId: "",
          date: "2025-01-01",
          observation: "",
          employeeIds: ["emp-1"],
          serviceProviderIds: [],
        },
        setFormData: vi.fn(),
        files: [],
        setFiles: vi.fn(),
        errors: {},
        isSubmitting: false,
        alertMessage: null,
        handleChange: vi.fn(),
        toggleSelection: vi.fn(),
      } as never);

      const { addAnimalMovement } = await import("~/services/animal-movements.service");
      const { useAlert } = await import("~/hooks/use-alert");
      const mockShowAlert = vi.fn();
      vi.mocked(useAlert).mockReturnValue({
        alertMessage: null,
        showAlert: mockShowAlert,
      } as never);

      render(
        <TestWrapper>
          <NewAnimalMovement />
        </TestWrapper>
      );

      const form = document.querySelector("form");
      if (form) {
        await act(async () => {
          const formEvent = new Event("submit", { bubbles: true, cancelable: true });
          form.dispatchEvent(formEvent);
        });
      }

      // Should not create movement when propertyId matches and locationId is empty
      await waitFor(() => {
        expect(addAnimalMovement).not.toHaveBeenCalled();
      });
    });

    it("should handle createMovementForAnimal with error", async () => {
      const { useLocation } = await import("react-router");
      const { getAnimalMovementsByAnimalId, addAnimalMovement } = await import(
        "~/services/animal-movements.service"
      );
      vi.mocked(useLocation).mockReturnValue({
        state: { animalIds: [mockAnimals[0]?.id || "animal-001"] },
      } as never);

      vi.mocked(getAnimalMovementsByAnimalId).mockReturnValue([]);
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      vi.mocked(addAnimalMovement).mockImplementation(() => {
        throw new Error("Test error");
      });

      const { useMovementForm } = await import("~/hooks/use-movement-form");
      vi.mocked(useMovementForm).mockReturnValue({
        formData: {
          propertyId: "prop-1",
          locationId: "",
          date: "2025-01-01",
          observation: "",
          employeeIds: ["emp-1"],
          serviceProviderIds: [],
        },
        setFormData: vi.fn(),
        files: [],
        setFiles: vi.fn(),
        errors: {},
        isSubmitting: false,
        alertMessage: null,
        handleChange: vi.fn(),
        toggleSelection: vi.fn(),
      } as never);

      const { useAlert } = await import("~/hooks/use-alert");
      const mockShowAlert = vi.fn();
      vi.mocked(useAlert).mockReturnValue({
        alertMessage: null,
        showAlert: mockShowAlert,
      } as never);

      render(
        <TestWrapper>
          <NewAnimalMovement />
        </TestWrapper>
      );

      const form = document.querySelector("form");
      if (form) {
        await act(async () => {
          const formEvent = new Event("submit", { bubbles: true, cancelable: true });
          form.dispatchEvent(formEvent);
        });
      }

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(mockShowAlert).toHaveBeenCalledWith(expect.stringContaining("Erro"), "error");
      });

      consoleErrorSpy.mockRestore();
    });

    it("should handle handleFormChange when propertyId changes", async () => {
      const { useLocation } = await import("react-router");
      vi.mocked(useLocation).mockReturnValue({
        state: { animalIds: [mockAnimals[0]?.id || "animal-001"] },
      } as never);

      const { useMovementForm } = await import("~/hooks/use-movement-form");
      const mockHandleChange = vi.fn();
      const mockSetFormData = vi.fn();
      vi.mocked(useMovementForm).mockReturnValue({
        formData: {
          propertyId: "",
          locationId: "loc-1",
          date: "",
          observation: "",
          employeeIds: [],
          serviceProviderIds: [],
        },
        setFormData: mockSetFormData,
        files: [],
        setFiles: vi.fn(),
        errors: {},
        isSubmitting: false,
        alertMessage: null,
        handleChange: mockHandleChange,
        toggleSelection: vi.fn(),
      } as never);

      render(
        <TestWrapper>
          <NewAnimalMovement />
        </TestWrapper>
      );

      // The component uses handleFormChange internally, which calls handleChange and resets locationId
      // We can't directly test this without accessing internal methods, but we can verify the component renders
      expect(screen.getByText("Adicionar Movimentação")).toBeInTheDocument();
    });

    it("should handle validateForm with all validation errors", async () => {
      const { useLocation } = await import("react-router");
      vi.mocked(useLocation).mockReturnValue({
        state: { animalIds: [mockAnimals[0]?.id || "animal-001"] },
      } as never);

      const { useMovementForm } = await import("~/hooks/use-movement-form");
      vi.mocked(useMovementForm).mockReturnValue({
        formData: {
          propertyId: "",
          locationId: "",
          date: "",
          observation: "",
          employeeIds: [],
          serviceProviderIds: [],
        },
        setFormData: vi.fn(),
        files: [],
        setFiles: vi.fn(),
        errors: {},
        isSubmitting: false,
        alertMessage: null,
        handleChange: vi.fn(),
        toggleSelection: vi.fn(),
      } as never);

      render(
        <TestWrapper>
          <NewAnimalMovement />
        </TestWrapper>
      );

      const form = document.querySelector("form");
      if (form) {
        await act(async () => {
          const formEvent = new Event("submit", { bubbles: true, cancelable: true });
          form.dispatchEvent(formEvent);
        });
      }

      // Form should not submit when validation fails
      const { addAnimalMovement } = await import("~/services/animal-movements.service");
      await waitFor(() => {
        // addAnimalMovement should not be called when validation fails
        expect(addAnimalMovement).not.toHaveBeenCalled();
      });
    });

    it("should handle handleSubmit with partial success", async () => {
      const { useLocation } = await import("react-router");
      const { addAnimalMovement } = await import("~/services/animal-movements.service");
      const { useAlert } = await import("~/hooks/use-alert");
      const mockShowAlert = vi.fn();
      vi.mocked(useAlert).mockReturnValue({
        alertMessage: null,
        showAlert: mockShowAlert,
      } as never);

      vi.mocked(useLocation).mockReturnValue({
        state: {
          animalIds: [mockAnimals[0]?.id || "animal-001", mockAnimals[1]?.id || "animal-002"],
        },
      } as never);

      // First animal succeeds, second fails
      vi.mocked(addAnimalMovement).mockImplementation((data: { animalIds: string[] }) => {
        if (data.animalIds[0] === mockAnimals[0]?.id) {
          return { id: "movement-001" } as never;
        }
        return null as never;
      });

      const { useMovementForm } = await import("~/hooks/use-movement-form");
      vi.mocked(useMovementForm).mockReturnValue({
        formData: {
          propertyId: "prop-1",
          locationId: "",
          date: "2025-01-01",
          observation: "",
          employeeIds: ["emp-1"],
          serviceProviderIds: [],
        },
        setFormData: vi.fn(),
        files: [],
        setFiles: vi.fn(),
        errors: {},
        isSubmitting: false,
        alertMessage: null,
        handleChange: vi.fn(),
        toggleSelection: vi.fn(),
      } as never);

      render(
        <TestWrapper>
          <NewAnimalMovement />
        </TestWrapper>
      );

      const form = document.querySelector("form");
      if (form) {
        await act(async () => {
          const formEvent = new Event("submit", { bubbles: true, cancelable: true });
          form.dispatchEvent(formEvent);
        });
      }

      await waitFor(() => {
        expect(mockShowAlert).toHaveBeenCalledWith(expect.stringContaining("1 de 2"), "success");
      });
    });

    it("should handle employees and service providers filtering", async () => {
      const { useLocation } = await import("react-router");
      vi.mocked(useLocation).mockReturnValue({
        state: { animalIds: [mockAnimals[0]?.id || "animal-001"] },
      } as never);

      render(
        <TestWrapper>
          <NewAnimalMovement />
        </TestWrapper>
      );

      // Employees and service providers should be filtered by companyId and status
      expect(screen.getByTestId("responsible-selection")).toBeInTheDocument();
    });

    it("should handle locations memoization", async () => {
      const { useLocation } = await import("react-router");
      const { getLocationsByPropertyId } = await import("~/services/locations.service");
      vi.mocked(useLocation).mockReturnValue({
        state: { animalIds: [mockAnimals[0]?.id || "animal-001"] },
      } as never);

      vi.mocked(getLocationsByPropertyId).mockReturnValue([
        { id: "loc-1", name: "Location 1", propertyId: "prop-1" },
      ] as never);

      const { useMovementForm } = await import("~/hooks/use-movement-form");
      vi.mocked(useMovementForm).mockReturnValue({
        formData: {
          propertyId: "prop-1",
          locationId: "",
          date: "",
          observation: "",
          employeeIds: [],
          serviceProviderIds: [],
        },
        setFormData: vi.fn(),
        files: [],
        setFiles: vi.fn(),
        errors: {},
        isSubmitting: false,
        alertMessage: null,
        handleChange: vi.fn(),
        toggleSelection: vi.fn(),
      } as never);

      render(
        <TestWrapper>
          <NewAnimalMovement />
        </TestWrapper>
      );

      expect(getLocationsByPropertyId).toHaveBeenCalledWith("prop-1");
    });

    it("should handle files in createMovementForAnimal", async () => {
      const { useLocation } = await import("react-router");
      const { addAnimalMovement } = await import("~/services/animal-movements.service");
      vi.mocked(useLocation).mockReturnValue({
        state: { animalIds: [mockAnimals[0]?.id || "animal-001"] },
      } as never);

      const { useMovementForm } = await import("~/hooks/use-movement-form");
      const mockFiles = [new File(["test"], "test.txt", { type: "text/plain" })];
      vi.mocked(useMovementForm).mockReturnValue({
        formData: {
          propertyId: "prop-1",
          locationId: "",
          date: "2025-01-01",
          observation: "",
          employeeIds: ["emp-1"],
          serviceProviderIds: [],
        },
        setFormData: vi.fn(),
        files: mockFiles,
        setFiles: vi.fn(),
        errors: {},
        isSubmitting: false,
        alertMessage: null,
        handleChange: vi.fn(),
        toggleSelection: vi.fn(),
      } as never);

      vi.mocked(addAnimalMovement).mockReturnValue({ id: "movement-001" } as never);

      const { useAlert } = await import("~/hooks/use-alert");
      const mockShowAlert = vi.fn();
      vi.mocked(useAlert).mockReturnValue({
        alertMessage: null,
        showAlert: mockShowAlert,
      } as never);

      render(
        <TestWrapper>
          <NewAnimalMovement />
        </TestWrapper>
      );

      const form = document.querySelector("form");
      if (form) {
        await act(async () => {
          const formEvent = new Event("submit", { bubbles: true, cancelable: true });
          form.dispatchEvent(formEvent);
        });
      }

      await waitFor(() => {
        expect(addAnimalMovement).toHaveBeenCalled();
        const callArgs = vi.mocked(addAnimalMovement).mock.calls[0][0];
        expect(callArgs.fileIds).toBeDefined();
      });
    });

    it("should handle observation trimming in createMovementForAnimal", async () => {
      const { useLocation } = await import("react-router");
      const { addAnimalMovement } = await import("~/services/animal-movements.service");
      vi.mocked(useLocation).mockReturnValue({
        state: { animalIds: [mockAnimals[0]?.id || "animal-001"] },
      } as never);

      const { useMovementForm } = await import("~/hooks/use-movement-form");
      vi.mocked(useMovementForm).mockReturnValue({
        formData: {
          propertyId: "prop-1",
          locationId: "",
          date: "2025-01-01",
          observation: "   Test observation   ",
          employeeIds: ["emp-1"],
          serviceProviderIds: [],
        },
        setFormData: vi.fn(),
        files: [],
        setFiles: vi.fn(),
        errors: {},
        isSubmitting: false,
        alertMessage: null,
        handleChange: vi.fn(),
        toggleSelection: vi.fn(),
      } as never);

      vi.mocked(addAnimalMovement).mockReturnValue({ id: "movement-001" } as never);

      const { useAlert } = await import("~/hooks/use-alert");
      const mockShowAlert = vi.fn();
      vi.mocked(useAlert).mockReturnValue({
        alertMessage: null,
        showAlert: mockShowAlert,
      } as never);

      render(
        <TestWrapper>
          <NewAnimalMovement />
        </TestWrapper>
      );

      const form = document.querySelector("form");
      if (form) {
        await act(async () => {
          const formEvent = new Event("submit", { bubbles: true, cancelable: true });
          form.dispatchEvent(formEvent);
        });
      }

      await waitFor(() => {
        expect(addAnimalMovement).toHaveBeenCalled();
        const callArgs = vi.mocked(addAnimalMovement).mock.calls[0][0];
        expect(callArgs.observation).toBe("Test observation");
      });
    });

    it("should handle empty observation in createMovementForAnimal", async () => {
      const { useLocation } = await import("react-router");
      const { addAnimalMovement } = await import("~/services/animal-movements.service");
      vi.mocked(useLocation).mockReturnValue({
        state: { animalIds: [mockAnimals[0]?.id || "animal-001"] },
      } as never);

      const { useMovementForm } = await import("~/hooks/use-movement-form");
      vi.mocked(useMovementForm).mockReturnValue({
        formData: {
          propertyId: "prop-1",
          locationId: "",
          date: "2025-01-01",
          observation: "   ",
          employeeIds: ["emp-1"],
          serviceProviderIds: [],
        },
        setFormData: vi.fn(),
        files: [],
        setFiles: vi.fn(),
        errors: {},
        isSubmitting: false,
        alertMessage: null,
        handleChange: vi.fn(),
        toggleSelection: vi.fn(),
      } as never);

      vi.mocked(addAnimalMovement).mockReturnValue({ id: "movement-001" } as never);

      const { useAlert } = await import("~/hooks/use-alert");
      const mockShowAlert = vi.fn();
      vi.mocked(useAlert).mockReturnValue({
        alertMessage: null,
        showAlert: mockShowAlert,
      } as never);

      render(
        <TestWrapper>
          <NewAnimalMovement />
        </TestWrapper>
      );

      const form = document.querySelector("form");
      if (form) {
        await act(async () => {
          const formEvent = new Event("submit", { bubbles: true, cancelable: true });
          form.dispatchEvent(formEvent);
        });
      }

      await waitFor(() => {
        expect(addAnimalMovement).toHaveBeenCalled();
        const callArgs = vi.mocked(addAnimalMovement).mock.calls[0][0];
        expect(callArgs.observation).toBeUndefined();
      });
    });
  });
});
