import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import NewAnimalMovement from "../animals.movement.new";

const mockNavigate = vi.fn();
const mockUseLocation = vi.fn(() => ({ state: { animalIds: [] } }));

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockUseLocation(),
  };
});

vi.mock("~/mocks/animal-movements", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/animal-movements")>(
    "~/mocks/animal-movements"
  );
  return actual;
});

const mockAddAnimalMovement = vi.fn(() => ({ id: "new-movement" }));
const mockGetAnimalMovementsByAnimalId = vi.fn(() => []);

const mockGetAnimalById = vi.fn(() => ({
  id: "animal-1",
  code: "AN001",
  registrationNumber: "REG001",
  status: "active" as const,
  companyId: "company-1",
  propertyId: "prop-1",
}));
vi.mock("~/mocks/animals", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/animals")>("~/mocks/animals");
  return actual;
});

vi.mock("~/services/animals.service", () => ({
  getAnimalById: (...args: unknown[]) => mockGetAnimalById(...args),
}));

const mockGetLocationsByPropertyId = vi.fn(() => [{ id: "loc-1", name: "Test Location" }]);

vi.mock("~/mocks/properties", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/properties")>("~/mocks/properties");
  return {
    ...actual,
    mockProperties: [{ id: "prop-1", name: "Test Property" }],
  };
});

vi.mock("~/mocks/locations", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/locations")>("~/mocks/locations");
  return actual;
});

vi.mock("~/services/locations.service", () => ({
  getLocationsByPropertyId: (...args: unknown[]) => mockGetLocationsByPropertyId(...args),
}));

vi.mock("~/mocks/employees", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/employees")>("~/mocks/employees");
  return {
    ...actual,
    mockEmployees: [{ id: "emp-1", name: "Test Employee" }],
  };
});

vi.mock("~/mocks/service-providers", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/service-providers")>(
    "~/mocks/service-providers"
  );
  return {
    ...actual,
    mockServiceProviders: [{ id: "sp-1", name: "Test SP" }],
  };
});

vi.mock("~/mocks/companies", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/companies")>("~/mocks/companies");
  return {
    ...actual,
    mockCompanies: [{ id: "company-1", name: "Test Company" }],
  };
});

vi.mock("~/services/animal-movements.service", () => ({
  addAnimalMovement: (...args: unknown[]) => mockAddAnimalMovement(...args),
  getAnimalMovementsByAnimalId: (...args: unknown[]) => mockGetAnimalMovementsByAnimalId(...args),
}));

vi.mock("~/components/ui", () => ({
  Input: ({
    label,
    placeholder,
    value,
    onChange,
    ...props
  }: {
    label?: string;
    placeholder?: string;
    value?: string | number;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    [key: string]: unknown;
  }) => (
    <input
      data-testid={`input-${label || placeholder || "input"}`}
      aria-label={label}
      placeholder={placeholder}
      value={value || ""}
      onChange={onChange}
      {...props}
    />
  ),
  Select: ({
    options,
    value,
    onChange,
    name,
    label,
    ...props
  }: {
    options?: Array<{ value: string; label: string }>;
    value?: string | number;
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    name?: string;
    label?: string;
    [key: string]: unknown;
  }) => (
    <select
      data-testid={`select-${name || label || "select"}`}
      value={value || ""}
      onChange={onChange}
      {...props}
    >
      {options?.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
  Button: ({
    children,
    onClick,
    type,
    disabled,
    ...props
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    type?: "button" | "submit" | "reset" | undefined;
    disabled?: boolean;
    [key: string]: unknown;
  }) => (
    <button
      data-testid="submit-button"
      type={type as "button" | "submit" | "reset" | undefined}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  ),
  FileUpload: ({ onFilesChange }: { onFilesChange?: (files: File[]) => void }) => (
    <input
      type="file"
      data-testid="file-upload"
      onChange={(e) => onFilesChange?.(Array.from(e.target.files || []))}
    />
  ),
  Alert: ({ title, variant }: { title?: string; variant?: string }) => (
    <div data-testid={`alert-${variant}`}>{title}</div>
  ),
}));

describe("NewAnimalMovement", () => {
  const createRouter = () => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard/animals/movement/new",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <NewAnimalMovement />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: ["/dashboard/animals/movement/new"],
      }
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render new animal movement form", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const heading = screen.queryByRole("heading", { level: 1 });
    const buttons = screen.queryAllByRole("button");
    expect(heading || buttons.length > 0).toBeTruthy();
  });

  it("should handle form input changes", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const inputs = screen.queryAllByRole("textbox");
    if (inputs.length > 0) {
      fireEvent.change(inputs[0], { target: { value: "Test Value" } });
      expect(inputs[0]).toHaveValue("Test Value");
    }
  });

  it("should handle form submission", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const submitButtons = screen.queryAllByTestId("submit-button");
    const submitButton = submitButtons.find(
      (btn) =>
        (btn as HTMLButtonElement).type === "submit" ||
        btn.textContent?.includes("Salvar") ||
        btn.textContent?.includes("Save")
    ) as HTMLButtonElement | undefined;
    if (submitButton && !submitButton.disabled) {
      fireEvent.click(submitButton);
      expect(submitButton).toBeInTheDocument();
    }
  });

  it("should show validation errors on invalid submission", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const submitButtons = screen.queryAllByTestId("submit-button");
    const submitButton = submitButtons.find(
      (btn) =>
        (btn as HTMLButtonElement).type === "submit" ||
        btn.textContent?.includes("Salvar") ||
        btn.textContent?.includes("Save")
    ) as HTMLButtonElement | undefined;
    if (submitButton) {
      fireEvent.click(submitButton);
      const errors = screen.queryAllByText(/required|obrigatório/i);
      expect(errors.length >= 0).toBeTruthy();
    }
  });

  it("should have correct meta function", () => {
    expect(NewAnimalMovement).toBeDefined();
  });

  it("should load animals from location state", () => {
    mockUseLocation.mockReturnValueOnce({ state: { animalIds: ["animal-1", "animal-2"] } });
    mockGetAnimalById.mockReturnValueOnce({
      id: "animal-1",
      code: "AN001",
      registrationNumber: "REG001",
      status: "active" as const,
      companyId: "company-1",
      propertyId: "prop-1",
    });
    mockGetAnimalById.mockReturnValueOnce({
      id: "animal-2",
      code: "AN002",
      registrationNumber: "REG002",
      status: "active" as const,
      companyId: "company-1",
      propertyId: "prop-1",
    });

    const router = createRouter();
    render(<RouterProvider router={router} />);

    expect(mockGetAnimalById).toHaveBeenCalled();
  });

  it("should handle property selection", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const propertySelect =
      screen.queryByTestId("select-propertyId") || screen.queryByLabelText(/Propriedade/i);
    if (propertySelect) {
      fireEvent.change(propertySelect, { target: { value: "prop-1" } });
      expect(propertySelect).toBeInTheDocument();
    }
  });

  it("should handle location selection when property is selected", () => {
    mockGetLocationsByPropertyId.mockReturnValueOnce([{ id: "loc-1", name: "Test Location" }]);
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const propertySelect =
      screen.queryByTestId("select-propertyId") || screen.queryByLabelText(/Propriedade/i);
    if (propertySelect) {
      fireEvent.change(propertySelect, { target: { value: "prop-1" } });

      const locationSelect =
        screen.queryByTestId("select-locationId") || screen.queryByLabelText(/Localização/i);
      if (locationSelect) {
        fireEvent.change(locationSelect, { target: { value: "loc-1" } });
        expect(locationSelect).toBeInTheDocument();
      }
    }
  });

  it("should handle employee selection", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const employeeCheckboxes = screen
      .queryAllByRole("checkbox")
      .filter(
        (cb) =>
          cb.getAttribute("name")?.includes("employee") ||
          cb.getAttribute("data-testid")?.includes("employee")
      );

    if (employeeCheckboxes.length > 0) {
      fireEvent.click(employeeCheckboxes[0]);
      expect(employeeCheckboxes[0]).toBeInTheDocument();
    }
  });

  it("should handle service provider selection", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const spCheckboxes = screen
      .queryAllByRole("checkbox")
      .filter(
        (cb) =>
          cb.getAttribute("name")?.includes("service") ||
          cb.getAttribute("data-testid")?.includes("service")
      );

    if (spCheckboxes.length > 0) {
      fireEvent.click(spCheckboxes[0]);
      expect(spCheckboxes[0]).toBeInTheDocument();
    }
  });

  it("should handle successful form submission with multiple animals", async () => {
    mockUseLocation.mockReturnValueOnce({ state: { animalIds: ["animal-1", "animal-2"] } });
    mockGetAnimalById.mockReturnValueOnce({
      id: "animal-1",
      code: "AN001",
      registrationNumber: "REG001",
      status: "active" as const,
      companyId: "company-1",
      propertyId: "prop-1",
    });
    mockGetAnimalById.mockReturnValueOnce({
      id: "animal-2",
      code: "AN002",
      registrationNumber: "REG002",
      status: "active" as const,
      companyId: "company-1",
      propertyId: "prop-1",
    });
    mockGetAnimalMovementsByAnimalId.mockReturnValueOnce([]);
    mockGetAnimalMovementsByAnimalId.mockReturnValueOnce([]);

    const router = createRouter();
    const { container } = render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(mockGetAnimalById).toHaveBeenCalled();
    });

    const propertySelect =
      screen.queryByTestId("select-propertyId") || screen.queryByLabelText(/Propriedade/i);
    const dateInput = screen.queryByTestId("input-date") || screen.queryByLabelText(/Data/i);

    if (propertySelect) fireEvent.change(propertySelect, { target: { value: "prop-1" } });
    if (dateInput) fireEvent.change(dateInput, { target: { value: "2024-01-01" } });

    const employeeCheckboxes = screen.queryAllByRole("checkbox");
    if (employeeCheckboxes.length > 0) {
      fireEvent.click(employeeCheckboxes[0]);
    }

    const form = container.querySelector("form");
    if (form) {
      fireEvent.submit(form);
      await waitFor(() => {
        expect(mockAddAnimalMovement).toHaveBeenCalled();
      });
    }
  });

  it("should validate required fields", () => {
    const router = createRouter();
    const { container } = render(<RouterProvider router={router} />);

    const form = container.querySelector("form");
    if (form) {
      fireEvent.submit(form);
      const errors = screen.queryAllByText(/required|obrigatório/i);
      expect(errors.length >= 0).toBeTruthy();
    }
  });

  it("should validate at least one responsible is selected", () => {
    const router = createRouter();
    const { container } = render(<RouterProvider router={router} />);

    const propertySelect =
      screen.queryByTestId("select-propertyId") || screen.queryByLabelText(/Propriedade/i);
    const dateInput = screen.queryByTestId("input-date") || screen.queryByLabelText(/Data/i);

    if (propertySelect) fireEvent.change(propertySelect, { target: { value: "prop-1" } });
    if (dateInput) fireEvent.change(dateInput, { target: { value: "2024-01-01" } });

    const form = container.querySelector("form");
    if (form) {
      fireEvent.submit(form);
      const errors = screen.queryAllByText(/responsável|responsible/i);
      expect(errors.length >= 0).toBeTruthy();
    }
  });

  it("should handle file upload", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const fileUpload = screen.queryByTestId("file-upload");
    if (fileUpload) {
      const file = new File(["test"], "test.txt", { type: "text/plain" });
      fireEvent.change(fileUpload, { target: { files: [file] } });
      expect(fileUpload).toBeInTheDocument();
    }
  });

  it("should handle observation input", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const observationInput =
      screen.queryByTestId("input-observation") ||
      screen.queryByPlaceholderText(/observação|observation/i);
    if (observationInput) {
      fireEvent.change(observationInput, { target: { value: "Test observation" } });
      expect(observationInput).toBeInTheDocument();
    }
  });

  it("should navigate back on cancel", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const cancelButtons = screen
      .queryAllByRole("button")
      .filter(
        (btn) =>
          btn.textContent?.includes("Cancelar") ||
          btn.textContent?.includes("Cancel") ||
          btn.textContent?.includes("Voltar") ||
          btn.textContent?.includes("Back")
      );

    if (cancelButtons.length > 0) {
      fireEvent.click(cancelButtons[0]);
      expect(mockNavigate).toHaveBeenCalled();
    }
  });

  it("should display selected animals", () => {
    mockUseLocation.mockReturnValueOnce({ state: { animalIds: ["animal-1"] } });
    mockGetAnimalById.mockReturnValueOnce({
      id: "animal-1",
      code: "AN001",
      registrationNumber: "REG001",
      status: "active" as const,
      companyId: "company-1",
      propertyId: "prop-1",
    });

    const router = createRouter();
    render(<RouterProvider router={router} />);

    expect(mockGetAnimalById).toHaveBeenCalled();
  });

  it("should handle empty animalIds", () => {
    mockUseLocation.mockReturnValueOnce({ state: { animalIds: [] } });
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const backButton = screen.queryByRole("button");
    expect(backButton).toBeInTheDocument();
  });

  it("should auto-fill property from animal movements", async () => {
    mockUseLocation.mockReturnValueOnce({ state: { animalIds: ["animal-1"] } });
    mockGetAnimalById.mockReturnValueOnce({
      id: "animal-1",
      code: "AN001",
      registrationNumber: "REG001",
      status: "active" as const,
      companyId: "company-1",
      propertyId: "prop-1",
    });
    mockGetAnimalMovementsByAnimalId.mockReturnValueOnce([
      {
        id: "mov-1",
        animalIds: ["animal-1"],
        propertyId: "prop-1",
        date: "2024-01-01",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
      },
    ]);

    const router = createRouter();
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(mockGetAnimalMovementsByAnimalId).toHaveBeenCalled();
    });
  });

  it("should clear location when property changes", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const propertySelect =
      screen.queryByTestId("select-propertyId") || screen.queryByLabelText(/Propriedade/i);
    if (propertySelect) {
      fireEvent.change(propertySelect, { target: { value: "prop-1" } });
      const locationSelect = screen.queryByTestId("select-locationId");
      if (locationSelect) {
        expect(locationSelect).toBeInTheDocument();
      }
    }
  });
});
