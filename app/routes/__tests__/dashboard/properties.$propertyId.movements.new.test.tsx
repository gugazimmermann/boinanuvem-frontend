import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import {
  loader,
  meta,
  default as NewMovement,
} from "../../dashboard/properties.$propertyId.movements.new";
import { mockProperties } from "~/mocks/properties";
import { mockLocations } from "~/mocks/locations";
import { mockEmployees } from "~/mocks/employees";
import { mockServiceProviders } from "~/mocks/service-providers";
import { LocationMovementType } from "~/types";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useParams: vi.fn(() => ({ propertyId: mockProperties[0]?.id || "property-1" })),
    useNavigate: vi.fn(() => vi.fn()),
    useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()]),
  };
});

vi.mock("~/utils/route-guard", () => ({
  createRouteGuard: vi.fn(() => () => Promise.resolve(null)),
}));

vi.mock("~/services/properties.service", () => ({
  getPropertyById: vi.fn((id: string) => mockProperties.find((p) => p.id === id)),
}));

vi.mock("~/services/locations.service", () => ({
  getLocationsByPropertyId: vi.fn((propertyId: string) =>
    mockLocations.filter((l) => l.propertyId === propertyId)
  ),
  getLocationById: vi.fn((id: string) => mockLocations.find((l) => l.id === id)),
}));

vi.mock("~/services/employees.service", () => ({
  getEmployeesByPropertyId: vi.fn((propertyId: string) =>
    mockEmployees.filter((e) => e.propertyIds?.includes(propertyId))
  ),
  getEmployeeById: vi.fn((id: string) => mockEmployees.find((e) => e.id === id)),
}));

vi.mock("~/services/service-providers.service", () => ({
  getServiceProvidersByPropertyId: vi.fn((propertyId: string) =>
    mockServiceProviders.filter((sp) => sp.propertyId === propertyId)
  ),
  getServiceProviderById: vi.fn((id: string) => mockServiceProviders.find((sp) => sp.id === id)),
}));

vi.mock("~/services/location-movements.service", () => ({
  addLocationMovement: vi.fn(),
}));

vi.mock("~/hooks/use-alert", () => ({
  useAlert: vi.fn(() => ({
    alertMessage: null,
    showAlert: vi.fn(),
  })),
}));

vi.mock("~/components/dashboard/shared", () => ({
  ResponsibleSelectionSection: vi.fn(
    ({
      employees,
      serviceProviders,
      selectedEmployeeIds: _selectedEmployeeIds,
      selectedServiceProviderIds: _selectedServiceProviderIds,
      onToggleEmployee,
      onToggleServiceProvider,
      error,
      disabled,
      translationKeys: _translationKeys,
    }: {
      employees: Array<{ id: string; name: string }>;
      serviceProviders: Array<{ id: string; name: string }>;
      selectedEmployeeIds: string[];
      selectedServiceProviderIds: string[];
      onToggleEmployee: (id: string) => void;
      onToggleServiceProvider: (id: string) => void;
      error?: string;
      disabled?: boolean;
      translationKeys: Record<string, string>;
    }) => (
      <div data-testid="responsible-selection">
        <div data-testid="employees-count">{employees.length}</div>
        <div data-testid="service-providers-count">{serviceProviders.length}</div>
        {error && <div data-testid="responsible-error">{error}</div>}
        {employees.map((emp) => (
          <button
            key={emp.id}
            data-testid={`employee-${emp.id}`}
            onClick={() => onToggleEmployee(emp.id)}
            disabled={disabled}
          >
            {emp.name}
          </button>
        ))}
        {serviceProviders.map((sp) => (
          <button
            key={sp.id}
            data-testid={`service-provider-${sp.id}`}
            onClick={() => onToggleServiceProvider(sp.id)}
            disabled={disabled}
          >
            {sp.name}
          </button>
        ))}
      </div>
    )
  ),
  ObservationField: vi.fn(
    ({
      label,
      value,
      onChange,
      error,
      disabled,
      placeholder,
    }: {
      label: string;
      value: string;
      onChange: (value: string) => void;
      error?: string;
      disabled?: boolean;
      placeholder?: string;
    }) => (
      <div>
        <label>{label}</label>
        <textarea
          data-testid="observation-field"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
        />
        {error && <div data-testid="observation-error">{error}</div>}
      </div>
    )
  ),
  FormActions: vi.fn(
    ({
      onCancel,
      isSubmitting,
      cancelLabel,
      submitLabel,
      loadingLabel,
    }: {
      onCancel: () => void;
      isSubmitting: boolean;
      cancelLabel: string;
      submitLabel: string;
      loadingLabel: string;
    }) => (
      <div data-testid="form-actions">
        <button onClick={onCancel} disabled={isSubmitting}>
          {cancelLabel}
        </button>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? loadingLabel : submitLabel}
        </button>
      </div>
    )
  ),
}));

vi.mock("~/components/ui", () => ({
  Button: vi.fn(
    ({
      children,
      onClick,
      disabled,
      variant,
    }: {
      children: React.ReactNode;
      onClick?: () => void;
      disabled?: boolean;
      variant?: string;
    }) => (
      <button onClick={onClick} disabled={disabled} data-variant={variant}>
        {children}
      </button>
    )
  ),
  Input: vi.fn(
    ({
      label,
      type,
      value,
      onChange,
      error,
      disabled,
      required,
    }: {
      label: string;
      type: string;
      value: string;
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
      error?: string;
      disabled?: boolean;
      required?: boolean;
    }) => (
      <div>
        <label>
          {label} {required && <span>*</span>}
        </label>
        <input
          data-testid={`input-${label.toLowerCase().replace(/\s+/g, "-")}`}
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
        {error && (
          <div data-testid={`error-${label.toLowerCase().replace(/\s+/g, "-")}`}>{error}</div>
        )}
      </div>
    )
  ),
  FixedAlert: vi.fn(
    ({ alertMessage }: { alertMessage?: { title: string; variant?: string } | null }) =>
      alertMessage ? <div data-testid="alert">{alertMessage.title}</div> : null
  ),
  FileUpload: vi.fn(
    ({
      label,
      files: _files,
      onChange,
      disabled,
      multiple,
      helperText,
    }: {
      label: string;
      files: File[];
      onChange: (files: File[]) => void;
      disabled?: boolean;
      multiple?: boolean;
      helperText?: string;
    }) => (
      <div>
        <label>{label}</label>
        <input
          data-testid="file-upload"
          type="file"
          multiple={multiple}
          disabled={disabled}
          onChange={(e) => {
            const selectedFiles = Array.from(e.target.files || []);
            onChange(selectedFiles);
          }}
        />
        {helperText && <p>{helperText}</p>}
      </div>
    )
  ),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    properties: {
      details: {
        movements: {
          add: "Adicionar Movimentação",
          success: "Movimentação adicionada com sucesso",
          error: "Erro ao adicionar movimentação",
          observation: "Observação",
          observationPlaceholder: "Adicione observações...",
          files: "Arquivos",
          filesHelper: "Você pode fazer upload de múltiplos arquivos",
          noLocations: "Nenhuma localização disponível",
          noEmployees: "Nenhum funcionário disponível",
          noServiceProviders: "Nenhum prestador de serviço disponível",
          errors: {
            noResponsible: "Selecione pelo menos um responsável",
          },
          table: {
            type: "Tipo",
            date: "Data",
            locations: "Localizações",
          },
          types: {
            [LocationMovementType.OTHER]: "Outro",
            [LocationMovementType.PASTURE_ROTATION]: "Rotação de Pastagem",
            [LocationMovementType.FERTILIZATION]: "Fertilização",
            [LocationMovementType.PASTURE_RENOVATION]: "Roçada",
          },
        },
      },
      emptyState: {
        title: "Propriedade não encontrada",
      },
    },
    profile: {
      errors: {
        required: (field: string) => `${field} é obrigatório`,
      },
    },
    employees: {
      table: {
        name: "Nome",
      },
    },
    serviceProviders: {
      table: {
        name: "Nome",
      },
    },
    common: {
      back: "Voltar",
      cancel: "Cancelar",
      save: "Salvar",
      loading: "Carregando...",
    },
  })),
}));

vi.mock("~/routes.config", () => ({
  getPropertyViewRoute: vi.fn((id: string) => `/dashboard/propriedades/${id}`),
  getLocationViewRoute: vi.fn((id: string) => `/dashboard/localizacoes/${id}`),
  getEmployeeViewRoute: vi.fn((id: string) => `/dashboard/funcionarios/${id}`),
  getServiceProviderViewRoute: vi.fn((id: string) => `/dashboard/prestadores-servico/${id}`),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe("properties.$propertyId.movements.new", () => {
  beforeEach(async () => {
    vi.resetAllMocks();
    // Restore the mock implementation after resetting
    const { getPropertyById } = await import("~/services/properties.service");
    vi.mocked(getPropertyById).mockImplementation((id: string) =>
      mockProperties.find((p) => p.id === id)
    );
    const { addLocationMovement } = await import("~/services/location-movements.service");
    vi.mocked(addLocationMovement).mockImplementation(() => ({ id: "movement-1" }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("loader", () => {
    it("should call createRouteGuard", async () => {
      const { createRouteGuard } = await import("~/utils/route-guard");
      const request = new Request(
        "http://localhost/dashboard/propriedades/property-1/movimentacoes/novo"
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
      expect(result[0].title).toContain("Adicionar Movimentação");
    });
  });

  describe("NewMovement component", () => {
    it("should render form with correct title", () => {
      render(
        <TestWrapper>
          <NewMovement />
        </TestWrapper>
      );

      expect(screen.getByText("Adicionar Movimentação")).toBeInTheDocument();
    });

    it("should render empty state when property is not found", async () => {
      const { useParams } = await import("react-router");
      const { getPropertyById } = await import("~/services/properties.service");

      vi.mocked(useParams).mockReturnValue({ propertyId: "non-existent" });
      vi.mocked(getPropertyById).mockReturnValue(undefined);

      render(
        <TestWrapper>
          <NewMovement />
        </TestWrapper>
      );

      expect(screen.getByText("Propriedade não encontrada")).toBeInTheDocument();
    });

    it("should render movement type select", () => {
      render(
        <TestWrapper>
          <NewMovement />
        </TestWrapper>
      );

      // The component uses a native select with a label, find by text content
      expect(screen.getByText(/Tipo/)).toBeInTheDocument();
      // Also check that a select element exists
      const selectElement = document.querySelector("select");
      expect(selectElement).toBeInTheDocument();
    });

    it("should render date input", () => {
      render(
        <TestWrapper>
          <NewMovement />
        </TestWrapper>
      );

      const dateInput = screen.getByTestId("input-data");
      expect(dateInput).toBeInTheDocument();
    });

    it("should render locations selection", () => {
      render(
        <TestWrapper>
          <NewMovement />
        </TestWrapper>
      );

      expect(screen.getByText(/Localizações/)).toBeInTheDocument();
    });

    it("should render responsible selection section", () => {
      render(
        <TestWrapper>
          <NewMovement />
        </TestWrapper>
      );

      expect(screen.getByTestId("responsible-selection")).toBeInTheDocument();
    });

    it("should render observation field", () => {
      render(
        <TestWrapper>
          <NewMovement />
        </TestWrapper>
      );

      expect(screen.getByTestId("observation-field")).toBeInTheDocument();
    });

    it("should render file upload", () => {
      render(
        <TestWrapper>
          <NewMovement />
        </TestWrapper>
      );

      expect(screen.getByTestId("file-upload")).toBeInTheDocument();
    });

    it("should handle form submission with valid data", async () => {
      const user = userEvent.setup();
      const { addLocationMovement } = await import("~/services/location-movements.service");
      const { useAlert } = await import("~/hooks/use-alert");
      const mockShowAlert = vi.fn();

      vi.mocked(useAlert).mockReturnValue({
        alertMessage: null,
        showAlert: mockShowAlert,
      });

      render(
        <TestWrapper>
          <NewMovement />
        </TestWrapper>
      );

      // Fill required fields: date and type
      // Input component creates testid from label: "input-{label.toLowerCase().replace(/\s+/g, "-")}"
      // Date label is t.properties.details.movements.table.date which is "Data" in the mock
      const dateInput = screen.getByTestId("input-data");
      await user.clear(dateInput);
      await user.type(dateInput, "2025-01-20");

      // Select movement type - find select element
      // The select is rendered directly, not with Input component, so find by role
      const typeSelect = screen.getByRole("combobox");
      await user.selectOptions(typeSelect, "pasture_rotation");

      // Select a location - location name is displayed as "name (code)"
      const firstLocation = mockLocations.find((l) => l.propertyId === mockProperties[0]?.id);
      expect(firstLocation).toBeDefined();
      if (firstLocation) {
        const locationText = `${firstLocation.name} (${firstLocation.code})`;
        const locationElement = screen.getByText(locationText);
        const locationCheckbox = locationElement
          .closest("label")
          ?.querySelector("input[type='checkbox']");
        expect(locationCheckbox).toBeInTheDocument();
        if (locationCheckbox) {
          await user.click(locationCheckbox);
        }
      }

      // Select an employee - find one that belongs to the property
      // Employees use propertyIds (array), not propertyId
      const propertyEmployee = mockEmployees.find((e) =>
        e.propertyIds?.includes(mockProperties[0]?.id || "")
      );
      expect(propertyEmployee).toBeDefined();
      if (propertyEmployee) {
        // The ResponsibleSelectionSection mock renders buttons with data-testid
        const employeeButton = screen.getByTestId(`employee-${propertyEmployee.id}`);
        await user.click(employeeButton);
      }

      // Wait a bit for form state to update
      await waitFor(() => {
        const submitButton = screen.getByText("Salvar");
        expect(submitButton).not.toBeDisabled();
      });

      const submitButton = screen.getByText("Salvar");
      await user.click(submitButton);

      await waitFor(
        () => {
          expect(addLocationMovement).toHaveBeenCalled();
        },
        { timeout: 3000 }
      );
    });

    it("should show validation errors for required fields", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <NewMovement />
        </TestWrapper>
      );

      const submitButton = screen.getByText("Salvar");
      await user.click(submitButton);

      // Validation errors should appear
      await waitFor(() => {
        expect(screen.getByText(/é obrigatório/)).toBeInTheDocument();
      });
    });

    it("should handle navigation back", async () => {
      const user = userEvent.setup();
      const { useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();

      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <NewMovement />
        </TestWrapper>
      );

      const backButton = screen.getByText("Voltar");
      await user.click(backButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
      });
    });

    it("should handle cancel action", async () => {
      const user = userEvent.setup();
      const { useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();

      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <NewMovement />
        </TestWrapper>
      );

      const cancelButton = screen.getByText("Cancelar");
      await user.click(cancelButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
      });
    });

    it("should pre-select location from URL parameter", async () => {
      const { useSearchParams } = await import("react-router");
      const locationId = mockLocations[0]?.id || "location-1";

      vi.mocked(useSearchParams).mockReturnValue([
        new URLSearchParams(`locationId=${locationId}`),
        vi.fn(),
      ]);

      render(
        <TestWrapper>
          <NewMovement />
        </TestWrapper>
      );

      // Location should be pre-selected - location name is displayed as "name (code)"
      const firstLocation = mockLocations.find(
        (l) => l.propertyId === mockProperties[0]?.id && l.id === locationId
      );
      if (firstLocation) {
        const locationText = `${firstLocation.name} (${firstLocation.code})`;
        const locationCheckbox = screen
          .getByText(locationText)
          .closest("label")
          ?.querySelector("input[type='checkbox']");
        if (locationCheckbox) {
          expect(locationCheckbox).toBeChecked();
        }
      }
    });

    it("should navigate to correct route after successful submission", async () => {
      const user = userEvent.setup();
      const { useNavigate } = await import("react-router");
      const { addLocationMovement } = await import("~/services/location-movements.service");
      const { useAlert } = await import("~/hooks/use-alert");
      const mockNavigate = vi.fn();
      const mockShowAlert = vi.fn();

      vi.mocked(useNavigate).mockReturnValue(mockNavigate);
      vi.mocked(useAlert).mockReturnValue({
        alertMessage: null,
        showAlert: mockShowAlert,
      });

      render(
        <TestWrapper>
          <NewMovement />
        </TestWrapper>
      );

      // Fill required fields: date and type
      const dateInput = screen.getByTestId("input-data");
      await user.clear(dateInput);
      await user.type(dateInput, "2025-01-20");

      const typeSelect = screen.getByRole("combobox");
      await user.selectOptions(typeSelect, "pasture_rotation");

      // Fill form and submit - location name is displayed as "name (code)"
      const firstLocation = mockLocations.find((l) => l.propertyId === mockProperties[0]?.id);
      if (firstLocation) {
        const locationText = `${firstLocation.name} (${firstLocation.code})`;
        const locationCheckbox = screen
          .getByText(locationText)
          .closest("label")
          ?.querySelector("input[type='checkbox']");
        if (locationCheckbox) {
          await user.click(locationCheckbox);
        }
      }

      // Select an employee - find one that belongs to the property
      const propertyEmployee = mockEmployees.find((e) =>
        e.propertyIds?.includes(mockProperties[0]?.id || "")
      );
      if (propertyEmployee) {
        const employeeButton = screen.queryByTestId(`employee-${propertyEmployee.id}`);
        if (employeeButton) {
          await user.click(employeeButton);
        }
      }

      const submitButton = screen.getByText("Salvar");
      await user.click(submitButton);

      await waitFor(
        () => {
          expect(addLocationMovement).toHaveBeenCalled();
          expect(mockShowAlert).toHaveBeenCalledWith(
            "Movimentação adicionada com sucesso",
            "success"
          );
          // Navigation happens after 1.5 seconds, so wait for it
          expect(mockNavigate).toHaveBeenCalled();
        },
        { timeout: 3000 }
      );
    });

    it("should handle error during submission", async () => {
      const user = userEvent.setup();
      const { addLocationMovement } = await import("~/services/location-movements.service");
      const { useAlert } = await import("~/hooks/use-alert");
      const mockShowAlert = vi.fn();

      // Suppress console.error for this test since we're testing error handling
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      vi.mocked(useAlert).mockReturnValue({
        alertMessage: null,
        showAlert: mockShowAlert,
      });
      vi.mocked(addLocationMovement).mockImplementation(() => {
        throw new Error("Failed to add movement");
      });

      render(
        <TestWrapper>
          <NewMovement />
        </TestWrapper>
      );

      // Fill required fields: date and type
      const dateInput = screen.getByTestId("input-data");
      await user.clear(dateInput);
      await user.type(dateInput, "2025-01-20");

      const typeSelect = screen.getByRole("combobox");
      await user.selectOptions(typeSelect, "pasture_rotation");

      // Fill form - location name is displayed as "name (code)"
      const firstLocation = mockLocations.find((l) => l.propertyId === mockProperties[0]?.id);
      if (firstLocation) {
        const locationText = `${firstLocation.name} (${firstLocation.code})`;
        const locationCheckbox = screen
          .getByText(locationText)
          .closest("label")
          ?.querySelector("input[type='checkbox']");
        if (locationCheckbox) {
          await user.click(locationCheckbox);
        }
      }

      // Select an employee - find one that belongs to the property
      const propertyEmployee = mockEmployees.find((e) =>
        e.propertyIds?.includes(mockProperties[0]?.id || "")
      );
      if (propertyEmployee) {
        const employeeButton = screen.queryByTestId(`employee-${propertyEmployee.id}`);
        if (employeeButton) {
          await user.click(employeeButton);
        }
      }

      const submitButton = screen.getByText("Salvar");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockShowAlert).toHaveBeenCalledWith("Erro ao adicionar movimentação", "error");
      });

      // Restore console.error
      consoleErrorSpy.mockRestore();
    });
  });
});
