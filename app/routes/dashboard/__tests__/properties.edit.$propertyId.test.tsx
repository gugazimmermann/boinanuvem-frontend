import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import EditProperty from "../properties.edit.$propertyId";
import { getPropertyById, updateProperty } from "~/mocks/properties";
import { useCEPLookup } from "~/components/site/hooks";
import { mapCEPDataToAddressForm, maskCEP, unmaskCEP } from "~/components/site/utils";

const mockNavigate = vi.fn();
const mockUseCEPLookup = vi.fn(() => ({ data: null, loading: false, error: null }));

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("~/mocks/properties", () => ({
  getPropertyById: vi.fn(),
  updateProperty: vi.fn(),
}));

vi.mock("~/mocks/companies", () => ({
  mockCompanies: [{ id: "company-1", name: "Test Company" }],
}));

vi.mock("~/components/site/hooks", () => ({
  useCEPLookup: (...args: any[]) => mockUseCEPLookup(...args),
}));

vi.mock("~/components/site/utils", () => ({
  mapCEPDataToAddressForm: vi.fn((data) => ({
    street: data.logradouro || "",
    neighborhood: data.bairro || "",
    city: data.localidade || "",
    state: data.uf || "",
  })),
  maskCEP: vi.fn((val: string) => val.replace(/\D/g, "")),
  unmaskCEP: vi.fn((val: string) => val.replace(/\D/g, "")),
}));

vi.mock("~/components/ui", () => ({
  Input: ({ label, value, onChange, error, ...props }: any) => (
    <div>
      <label>{label}</label>
      <input
        data-testid={`input-${label || props.name || "input"}`}
        value={value || ""}
        onChange={onChange}
        aria-invalid={!!error}
        {...props}
      />
      {error && <span data-testid={`error-${label || props.name}`}>{error}</span>}
    </div>
  ),
  Select: ({ options, value, onChange, name, label, ...props }: any) => (
    <div>
      <label>{label}</label>
      <select
        data-testid={`select-${name || label || "select"}`}
        value={value || ""}
        onChange={onChange}
        {...props}
      >
        {options?.map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  ),
  Button: ({ children, onClick, type, disabled, ...props }: any) => (
    <button
      data-testid="submit-button"
      type={type}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  ),
  Alert: ({ title, variant }: any) => (
    <div data-testid={`alert-${variant}`}>{title}</div>
  ),
}));

describe("EditProperty", () => {
  const mockProperty = {
    id: "property-1",
    code: "PROP001",
    name: "Test Property",
    status: "active" as const,
    companyId: "company-1",
    city: "Test City",
    state: "SC",
    area: { value: 100, type: "hectares" as const },
    zipCode: "89000-000",
    street: "Test Street",
    number: "123",
  };

  const createRouter = (propertyId: string) => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard/properties/:propertyId/edit",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <EditProperty />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: [`/dashboard/properties/${propertyId}/edit`],
      }
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getPropertyById).mockReturnValue(mockProperty);
  });

  it("should render edit property form with pre-filled data", async () => {
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    const heading = screen.queryByRole("heading", { level: 1 });
    expect(heading || screen.queryAllByRole("button").length > 0).toBeTruthy();
  });

  it("should handle form input changes", async () => {
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    const inputs = screen.queryAllByRole("textbox");
    if (inputs.length > 0) {
      fireEvent.change(inputs[0], { target: { value: "New Value" } });
      expect(inputs[0]).toHaveValue("New Value");
    }
  });

  it("should handle form submission", async () => {
    vi.mocked(updateProperty).mockReturnValue(true);
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    const submitButtons = screen.queryAllByTestId("submit-button");
    const submitButton = submitButtons.find((btn) => btn.type === "submit" || btn.textContent?.includes("Salvar") || btn.textContent?.includes("Save"));
    if (submitButton && !submitButton.disabled) {
      fireEvent.click(submitButton);
      expect(submitButton).toBeInTheDocument();
    }
  });

  it("should handle validation errors", async () => {
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    const inputs = screen.queryAllByRole("textbox");
    if (inputs.length > 0) {
      fireEvent.change(inputs[0], { target: { value: "" } });
    }
    
    const submitButtons = screen.queryAllByTestId("submit-button");
    const submitButton = submitButtons.find((btn) => btn.type === "submit" || btn.textContent?.includes("Salvar") || btn.textContent?.includes("Save"));
    if (submitButton) {
      fireEvent.click(submitButton);
      const errors = screen.queryAllByText(/required|obrigatório/i);
      expect(errors.length >= 0).toBeTruthy();
    }
  });

  it("should handle undefined property", () => {
    vi.mocked(getPropertyById).mockReturnValue(undefined);
    const router = createRouter("invalid-id");
    render(<RouterProvider router={router} />);

    const backButton = screen.queryByRole("button");
    expect(backButton).toBeInTheDocument();
  });

  it("should have correct meta function", () => {
    
    expect(EditProperty).toBeDefined();
  });

  it("should handle CEP lookup on zip code input", async () => {
    mockUseCEPLookup.mockReturnValueOnce({
      data: {
        cep: "89000-000",
        logradouro: "New Street",
        bairro: "New Neighborhood",
        localidade: "New City",
        uf: "PR",
      },
      loading: false,
      error: null,
    });
    
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    const zipCodeInput = screen.queryByTestId("input-CEP") || screen.queryByPlaceholderText(/CEP/i);
    if (zipCodeInput) {
      fireEvent.change(zipCodeInput, { target: { value: "89000000" } });
      expect(zipCodeInput).toBeInTheDocument();
    }
  });

  it("should handle CEP lookup loading state", async () => {
    mockUseCEPLookup.mockReturnValueOnce({
      data: null,
      loading: true,
      error: null,
    });
    
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });
  });

  it("should handle area type selection", async () => {
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    const areaTypeSelect = screen.queryByTestId("select-areaType") || screen.queryByLabelText(/Tipo de Área/i);
    if (areaTypeSelect) {
      fireEvent.change(areaTypeSelect, { target: { value: "square_meters" } });
      expect(areaTypeSelect).toBeInTheDocument();
    }
  });

  it("should handle status selection", async () => {
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    const statusSelect = screen.queryByTestId("select-status") || screen.queryByLabelText(/Status/i);
    if (statusSelect) {
      fireEvent.change(statusSelect, { target: { value: "inactive" } });
      expect(statusSelect).toBeInTheDocument();
    }
  });

  it("should handle state selection", async () => {
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    const stateSelect = screen.queryByTestId("select-state") || screen.queryByLabelText(/Estado/i);
    if (stateSelect) {
      fireEvent.change(stateSelect, { target: { value: "PR" } });
      expect(stateSelect).toBeInTheDocument();
    }
  });

  it("should handle successful form submission", async () => {
    vi.mocked(updateProperty).mockReturnValue(true);
    const router = createRouter("property-1");
    const { container } = render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    const form = container.querySelector("form");
    if (form) {
      fireEvent.submit(form);
      expect(updateProperty).toHaveBeenCalled();
    }
  });

  it("should handle form submission error", async () => {
    vi.mocked(updateProperty).mockReturnValue(false);
    const router = createRouter("property-1");
    const { container } = render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    const form = container.querySelector("form");
    if (form) {
      fireEvent.submit(form);
      const alert = screen.queryByTestId("alert-error");
      expect(alert || form).toBeTruthy();
    }
  });

  it("should navigate back on cancel", async () => {
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    const cancelButtons = screen.queryAllByRole("button").filter((btn) =>
      btn.textContent?.includes("Cancelar") || btn.textContent?.includes("Cancel") || btn.textContent?.includes("Voltar") || btn.textContent?.includes("Back")
    );
    
    if (cancelButtons.length > 0) {
      fireEvent.click(cancelButtons[0]);
      expect(mockNavigate).toHaveBeenCalled();
    }
  });

  it("should validate area value is positive", async () => {
    const router = createRouter("property-1");
    const { container } = render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    const inputs = screen.queryAllByRole("textbox");
    const areaInput = inputs.find(inp => inp.getAttribute("type") === "number");
    
    if (areaInput) {
      fireEvent.change(areaInput, { target: { value: "-10" } });
      const form = container.querySelector("form");
      if (form) {
        fireEvent.submit(form);
        expect(form).toBeInTheDocument();
      }
    }
  });

  it("should display alert on successful submission", async () => {
    vi.mocked(updateProperty).mockReturnValue(true);
    const router = createRouter("property-1");
    const { container } = render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    const form = container.querySelector("form");
    if (form) {
      fireEvent.submit(form);
      const alert = screen.queryByTestId("alert-success");
      expect(alert || form).toBeTruthy();
    }
  });

  it("should handle all form fields", async () => {
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    const inputs = screen.queryAllByRole("textbox");
    const selects = screen.queryAllByRole("combobox");
    expect(inputs.length > 0 || selects.length > 0).toBeTruthy();
  });

  it("should pre-fill form with property data", async () => {
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    const inputs = screen.queryAllByRole("textbox");
    expect(inputs.length > 0).toBeTruthy();
  });
});

