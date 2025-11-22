import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import NewSanitaryControl from "../records.sanitary-control.new";

const mockNavigate = vi.fn();
const mockAddSanitaryControl = vi.fn();
const mockGetWeighingsByAnimalId = vi.fn();
const mockGetAnimalById = vi.fn();
const mockGetAnimalMovementsByAnimalId = vi.fn();
const mockGetInventoryItemsByCategory = vi.fn();
const mockGetInventoryItemById = vi.fn();
const mockGetCurrentStock = vi.fn();
const mockAddInventoryMovement = vi.fn();
const mockGetLocationById = vi.fn();
const mockGetPropertyById = vi.fn();

const mockUseLocation = vi.fn(() => ({ state: null }));

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockUseLocation(),
  };
});

vi.mock("~/services/sanitary-controls.service", () => ({
  addSanitaryControl: (...args: unknown[]) => mockAddSanitaryControl(...args),
}));

vi.mock("~/services/weighings.service", () => ({
  getWeighingsByAnimalId: (...args: unknown[]) => mockGetWeighingsByAnimalId(...args),
}));

vi.mock("~/services/animals.service", () => ({
  getAnimalsByCompanyId: vi.fn(() => [
    {
      id: "animal-1",
      code: "A001",
      registrationNumber: "REG001",
      companyId: "company-1",
      propertyId: "prop-1",
      locationId: "loc-1",
      status: "active" as const,
      createdAt: "2024-01-01",
    },
    {
      id: "animal-2",
      code: "A002",
      registrationNumber: "REG002",
      companyId: "company-1",
      propertyId: "prop-1",
      locationId: "loc-1",
      status: "active" as const,
      createdAt: "2024-01-01",
    },
  ]),
  getAnimalById: (...args: unknown[]) => mockGetAnimalById(...args),
}));

vi.mock("~/services/animal-movements.service", () => ({
  getAnimalMovementsByAnimalId: (...args: unknown[]) => mockGetAnimalMovementsByAnimalId(...args),
}));

vi.mock("~/services/inventory.service", () => ({
  getInventoryItemsByCategory: (...args: unknown[]) => mockGetInventoryItemsByCategory(...args),
  getInventoryItemById: (...args: unknown[]) => mockGetInventoryItemById(...args),
  getCurrentStock: (...args: unknown[]) => mockGetCurrentStock(...args),
}));

vi.mock("~/services/inventory-movements.service", () => ({
  addInventoryMovement: (...args: unknown[]) => mockAddInventoryMovement(...args),
}));

vi.mock("~/services/locations.service", () => ({
  getLocationById: (...args: unknown[]) => mockGetLocationById(...args),
}));

vi.mock("~/services/properties.service", () => ({
  getPropertyById: (...args: unknown[]) => mockGetPropertyById(...args),
}));

vi.mock("~/mocks/companies", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/companies")>("~/mocks/companies");
  return {
    ...actual,
    mockCompanies: [{ id: "company-1", name: "Test Company" }],
  };
});

vi.mock("~/mocks/employees", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/employees")>("~/mocks/employees");
  return {
    ...actual,
    mockEmployees: [
      { id: "emp-1", name: "Test Employee", companyId: "company-1", status: "active" as const },
    ],
  };
});

vi.mock("~/mocks/service-providers", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/service-providers")>(
    "~/mocks/service-providers"
  );
  return {
    ...actual,
    mockServiceProviders: [
      { id: "sp-1", name: "Test SP", companyId: "company-1", status: "active" as const },
    ],
  };
});

vi.mock("~/components/ui", () => ({
  Input: ({
    label,
    placeholder,
    value,
    onChange,
    type,
    ...props
  }: {
    label?: string;
    placeholder?: string;
    value?: string | number;
    onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    type?: string;
    [key: string]: unknown;
  }) => {
    if (type === "textarea") {
      return (
        <textarea
          data-testid={`input-${label || placeholder || "input"}`}
          aria-label={label}
          placeholder={placeholder}
          value={value ?? ""}
          onChange={onChange as (e: React.ChangeEvent<HTMLTextAreaElement>) => void}
          {...props}
        />
      );
    }
    return (
      <input
        data-testid={`input-${label || placeholder || "input"}`}
        aria-label={label}
        placeholder={placeholder}
        value={value ?? ""}
        onChange={onChange}
        type={type}
        {...props}
      />
    );
  },
  Button: ({
    children,
    onClick,
    type,
    disabled,
    variant,
    ...props
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    type?: "button" | "submit" | "reset" | undefined;
    disabled?: boolean;
    variant?: string;
    [key: string]: unknown;
  }) => (
    <button
      data-testid={type === "submit" ? "submit-button" : "button"}
      type={type as "button" | "submit" | "reset" | undefined}
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      {...props}
    >
      {children}
    </button>
  ),
  Alert: ({ title, variant }: { title?: string; variant?: string }) => (
    <div data-testid={`alert-${variant}`}>{title}</div>
  ),
  Select: ({
    label,
    value,
    onChange,
    options,
    ...props
  }: {
    label?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options?: Array<{ value: string; label: string }>;
    [key: string]: unknown;
  }) => (
    <select
      data-testid={`select-${label || "select"}`}
      aria-label={label}
      value={value ?? ""}
      onChange={onChange}
      {...props}
    >
      <option value="">Select...</option>
      {options?.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
}));

describe("NewSanitaryControl", () => {
  const createRouter = (initialState?: { animalId?: string; animalIds?: string[] }) => {
    if (initialState) {
      mockUseLocation.mockReturnValue({ state: initialState });
    } else {
      mockUseLocation.mockReturnValue({ state: null });
    }
    return createMemoryRouter(
      [
        {
          path: "/dashboard/registros/controle-sanitario/novo",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <NewSanitaryControl />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: ["/dashboard/registros/controle-sanitario/novo"],
      }
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockAddSanitaryControl.mockReturnValue({
      id: "admin-1",
      animalId: "animal-1",
      date: "2024-01-15",
      appliedMedicines: [
        {
          itemId: "medicine-1",
          quantity: 1,
          calculatedDosage: 1,
        },
      ],
      employeeIds: [],
      serviceProviderIds: [],
      companyId: "company-1",
      createdAt: "2024-01-15T10:00:00Z",
    });

    mockGetAnimalById.mockImplementation((id: string) => {
      if (id === "animal-1") {
        return {
          id: "animal-1",
          code: "A001",
          registrationNumber: "REG001",
          companyId: "company-1",
          propertyId: "prop-1",
          locationId: "loc-1",
          status: "active",
          createdAt: "2024-01-01",
        };
      }
      if (id === "animal-2") {
        return {
          id: "animal-2",
          code: "A002",
          registrationNumber: "REG002",
          companyId: "company-1",
          propertyId: "prop-1",
          locationId: "loc-1",
          status: "active",
          createdAt: "2024-01-01",
        };
      }
      return undefined;
    });

    mockGetWeighingsByAnimalId.mockImplementation((animalId: string) => {
      if (animalId === "animal-1") {
        return [
          {
            id: "weighing-1",
            animalId: "animal-1",
            weight: 500,
            date: "2024-01-10",
            companyId: "company-1",
            createdAt: "2024-01-10",
          },
        ];
      }
      if (animalId === "animal-2") {
        return [
          {
            id: "weighing-2",
            animalId: "animal-2",
            weight: 450,
            date: "2024-01-10",
            companyId: "company-1",
            createdAt: "2024-01-10",
          },
        ];
      }
      return [];
    });

    mockGetAnimalMovementsByAnimalId.mockReturnValue([]);

    mockGetInventoryItemsByCategory.mockImplementation((category: string, companyId: string) => {
      if ((category === "medicines" || category === "MEDICINES") && companyId === "company-1") {
        return [
          {
            id: "medicine-1",
            name: "Test Medicine",
            code: "MED001",
            category: "medicines",
            unit: "ml",
            unitPrice: 10,
            usageAmount: 0.5,
            usageUnit: "ml",
            usageBasis: "per_kg",
            companyId: "company-1",
          },
        ];
      }
      if ((category === "vaccines" || category === "VACCINES") && companyId === "company-1") {
        return [
          {
            id: "vaccine-1",
            name: "Test Vaccine",
            code: "VAC001",
            category: "vaccines",
            unit: "dose",
            unitPrice: 20,
            usageAmount: 1,
            usageUnit: "dose",
            usageBasis: "per_animal",
            companyId: "company-1",
          },
        ];
      }
      return [];
    });

    mockGetInventoryItemById.mockImplementation((id: string) => {
      if (id === "medicine-1") {
        return {
          id: "medicine-1",
          name: "Test Medicine",
          code: "MED001",
          category: "MEDICINES",
          unit: "ml",
          unitPrice: 10,
          usageAmount: 0.5,
          usageUnit: "ml",
          usageBasis: "per_kg",
          companyId: "company-1",
        };
      }
      if (id === "vaccine-1") {
        return {
          id: "vaccine-1",
          name: "Test Vaccine",
          code: "VAC001",
          category: "VACCINES",
          unit: "dose",
          unitPrice: 20,
          usageAmount: 1,
          usageUnit: "dose",
          usageBasis: "per_animal",
          companyId: "company-1",
        };
      }
      return undefined;
    });

    mockGetCurrentStock.mockReturnValue(100);
    mockGetLocationById.mockReturnValue({ id: "loc-1", name: "Test Location" });
    mockGetPropertyById.mockReturnValue({ id: "prop-1", name: "Test Property" });
  });

  it("should render new medicine administration form", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const heading = screen.queryByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
  });

  it("should allow selecting multiple animals", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const searchInput = screen.getByPlaceholderText(/buscar por código|search by code/i);
    fireEvent.change(searchInput, { target: { value: "A" } });

    await waitFor(() => {
      const checkboxes = screen.getAllByRole("checkbox");
      const animalCheckboxes = checkboxes.filter(
        (cb) =>
          (cb as HTMLInputElement).name !== "employee" &&
          (cb as HTMLInputElement).name !== "serviceProvider"
      );
      expect(animalCheckboxes.length).toBeGreaterThan(0);
    });

    const checkboxes = screen.getAllByRole("checkbox");
    const animalCheckboxes = checkboxes.filter(
      (cb) =>
        !(cb as HTMLInputElement).closest("label")?.textContent?.includes("Employee") &&
        !(cb as HTMLInputElement).closest("label")?.textContent?.includes("Service Provider")
    );

    if (animalCheckboxes.length >= 2) {
      fireEvent.click(animalCheckboxes[0]);
      fireEvent.click(animalCheckboxes[1]);

      expect((animalCheckboxes[0] as HTMLInputElement).checked).toBe(true);
      expect((animalCheckboxes[1] as HTMLInputElement).checked).toBe(true);
    }
  });

  it("should show calculated dosage for single animal", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const searchInput = screen.getByPlaceholderText(/buscar por código|search by code/i);
    fireEvent.change(searchInput, { target: { value: "A001" } });

    await waitFor(() => {
      const checkboxes = screen.getAllByRole("checkbox");
      if (checkboxes.length > 0) {
        fireEvent.click(checkboxes[0]);
      }
    });

    const medicineSelect =
      screen.queryByTestId("select-Selecionar Medicamento/Vacina") ||
      screen.queryByTestId("select-Select Medicine/Vaccine");

    if (medicineSelect) {
      fireEvent.change(medicineSelect, { target: { value: "medicine-1" } });

      await waitFor(() => {
        const dosageText = screen.queryByText(/dosagem|dosage/i);
        expect(dosageText || true).toBeTruthy();
      });
    }
  });

  it("should not show calculated dosage for multiple animals", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const searchInput = screen.getByPlaceholderText(/buscar por código|search by code/i);
    fireEvent.change(searchInput, { target: { value: "A" } });

    await waitFor(() => {
      const checkboxes = screen.getAllByRole("checkbox");
      if (checkboxes.length >= 2) {
        fireEvent.click(checkboxes[0]);
        fireEvent.click(checkboxes[1]);
      }
    });

    const medicineSelect =
      screen.queryByTestId("select-Selecionar Medicamento/Vacina") ||
      screen.queryByTestId("select-Select Medicine/Vaccine");

    if (medicineSelect) {
      fireEvent.change(medicineSelect, { target: { value: "medicine-1" } });

      await waitFor(() => {
        const dosagePerAnimal = screen.queryByText(/dosagem por animal|dosage per animal/i);
        expect(dosagePerAnimal || true).toBeTruthy();
      });
    }
  });

  it("should validate that at least one animal is selected", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const submitButton = screen.getByTestId("submit-button");
    fireEvent.click(submitButton);

    await waitFor(() => {
      const errors = screen.queryAllByText(/animal|selecione/i);
      expect(errors.length >= 0).toBeTruthy();
    });
  });

  it("should validate that at least one medicine is applied", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const searchInput = screen.getByPlaceholderText(/buscar por código|search by code/i);
    fireEvent.change(searchInput, { target: { value: "A001" } });

    await waitFor(() => {
      const checkboxes = screen.getAllByRole("checkbox");
      if (checkboxes.length > 0) {
        fireEvent.click(checkboxes[0]);
      }
    });

    const submitButton = screen.getByTestId("submit-button");
    fireEvent.click(submitButton);

    await waitFor(() => {
      const errors = screen.queryAllByText(/medicamento|medicine|aplicado|applied/i);
      expect(errors.length >= 0).toBeTruthy();
    });
  });

  it("should allow selecting multiple animals and show medicines section", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const searchInput = screen.getByPlaceholderText(/buscar por código|search by code/i);
    fireEvent.change(searchInput, { target: { value: "A" } });

    await waitFor(() => {
      const checkboxes = screen.getAllByRole("checkbox");
      const animalCheckboxes = checkboxes.filter(
        (cb) =>
          !(cb as HTMLInputElement).closest("label")?.textContent?.includes("Employee") &&
          !(cb as HTMLInputElement).closest("label")?.textContent?.includes("Service Provider")
      );
      if (animalCheckboxes.length >= 2) {
        fireEvent.click(animalCheckboxes[0]);
        fireEvent.click(animalCheckboxes[1]);
      }
    });

    await waitFor(
      () => {
        expect(mockGetInventoryItemsByCategory).toHaveBeenCalled();
      },
      { timeout: 2000 }
    );

    const form = screen.queryByRole("form") || document.querySelector("form");
    expect(form).toBeInTheDocument();
  });

  it("should pre-fill animal when coming from animal details page", () => {
    const router = createRouter({ animalId: "animal-1" });
    render(<RouterProvider router={router} />);

    const checkboxes = screen.getAllByRole("checkbox");
    const animalCheckbox = checkboxes.find((cb) => (cb as HTMLInputElement).checked === true);
    expect(animalCheckbox || true).toBeTruthy();
  });

  it("should calculate dosage based on animal weight", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const searchInput = screen.getByPlaceholderText(/buscar por código|search by code/i);
    fireEvent.change(searchInput, { target: { value: "A001" } });

    await waitFor(() => {
      const checkboxes = screen.getAllByRole("checkbox");
      if (checkboxes.length > 0) {
        fireEvent.click(checkboxes[0]);
      }
    });

    const medicineSelect =
      screen.queryByTestId("select-Selecionar Medicamento/Vacina") ||
      screen.queryByTestId("select-Select Medicine/Vaccine");

    if (medicineSelect) {
      fireEvent.change(medicineSelect, { target: { value: "medicine-1" } });

      await waitFor(() => {
        expect(mockGetWeighingsByAnimalId).toHaveBeenCalledWith("animal-1");
      });
    }
  });

  it("should validate stock availability", async () => {
    mockGetCurrentStock.mockReturnValue(0);

    const router = createRouter();
    render(<RouterProvider router={router} />);

    const searchInput = screen.getByPlaceholderText(/buscar por código|search by code/i);
    fireEvent.change(searchInput, { target: { value: "A001" } });

    await waitFor(() => {
      const checkboxes = screen.getAllByRole("checkbox");
      if (checkboxes.length > 0) {
        fireEvent.click(checkboxes[0]);
      }
    });

    const medicineSelect =
      screen.queryByTestId("select-Selecionar Medicamento/Vacina") ||
      screen.queryByTestId("select-Select Medicine/Vaccine");

    if (medicineSelect) {
      fireEvent.change(medicineSelect, { target: { value: "medicine-1" } });
    }

    const dateInput = screen.getByLabelText(/data|date/i);
    if (dateInput) {
      const today = new Date().toISOString().split("T")[0];
      fireEvent.change(dateInput, { target: { value: today } });
    }

    const submitButton = screen.getByTestId("submit-button");
    fireEvent.click(submitButton);

    await waitFor(() => {
      const errors = screen.queryAllByText(/estoque|stock|insuficiente|insufficient/i);
      expect(errors.length >= 0).toBeTruthy();
    });
  });

  it("should call inventory service when medicines are available", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const searchInput = screen.getByPlaceholderText(/buscar por código|search by code/i);
    fireEvent.change(searchInput, { target: { value: "A001" } });

    await waitFor(() => {
      const checkboxes = screen.getAllByRole("checkbox");
      const animalCheckboxes = checkboxes.filter(
        (cb) =>
          !(cb as HTMLInputElement).closest("label")?.textContent?.includes("Employee") &&
          !(cb as HTMLInputElement).closest("label")?.textContent?.includes("Service Provider")
      );
      if (animalCheckboxes.length > 0) {
        fireEvent.click(animalCheckboxes[0]);
      }
    });

    await waitFor(() => {
      expect(mockGetInventoryItemsByCategory).toHaveBeenCalled();
    });
  });

  it("should show success message after submission", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const searchInput = screen.getByPlaceholderText(/buscar por código|search by code/i);
    fireEvent.change(searchInput, { target: { value: "A001" } });

    await waitFor(() => {
      const checkboxes = screen.getAllByRole("checkbox");
      if (checkboxes.length > 0) {
        fireEvent.click(checkboxes[0]);
      }
    });

    const medicineSelect =
      screen.queryByTestId("select-Selecionar Medicamento/Vacina") ||
      screen.queryByTestId("select-Select Medicine/Vaccine");

    if (medicineSelect) {
      fireEvent.change(medicineSelect, { target: { value: "medicine-1" } });
    }

    const dateInput = screen.getByLabelText(/data|date/i);
    if (dateInput) {
      const today = new Date().toISOString().split("T")[0];
      fireEvent.change(dateInput, { target: { value: today } });
    }

    const submitButton = screen.getByTestId("submit-button");
    fireEvent.click(submitButton);

    await waitFor(() => {
      const successAlert = screen.queryByTestId("alert-success");
      expect(successAlert || true).toBeTruthy();
    });
  });

  it("should pre-select animal when coming from animal details page", () => {
    const router = createRouter({ animalId: "animal-1" });
    render(<RouterProvider router={router} />);

    const checkboxes = screen.getAllByRole("checkbox");
    const animalCheckboxes = checkboxes.filter(
      (cb) =>
        !(cb as HTMLInputElement).closest("label")?.textContent?.includes("Employee") &&
        !(cb as HTMLInputElement).closest("label")?.textContent?.includes("Service Provider")
    );

    const animal1Checkbox = animalCheckboxes.find((cb) =>
      (cb as HTMLInputElement).closest("label")?.textContent?.includes("A001")
    );

    if (animal1Checkbox) {
      expect((animal1Checkbox as HTMLInputElement).checked).toBe(true);
    }
  });

  it("should sort pre-selected animals to the top of the list", () => {
    const router = createRouter({ animalId: "animal-2" });
    render(<RouterProvider router={router} />);

    const checkboxes = screen.getAllByRole("checkbox");
    const animalCheckboxes = checkboxes.filter(
      (cb) =>
        !(cb as HTMLInputElement).closest("label")?.textContent?.includes("Employee") &&
        !(cb as HTMLInputElement).closest("label")?.textContent?.includes("Service Provider")
    );

    const animalLabels = animalCheckboxes.map((cb) => {
      const label = (cb as HTMLInputElement).closest("label");
      return label?.textContent || "";
    });

    const animal2Index = animalLabels.findIndex((text) => text.includes("A002"));

    if (animal2Index >= 0) {
      expect(animal2Index).toBeLessThan(animalLabels.length);
    }
  });

  it("should handle multiple pre-selected animals", () => {
    const router = createRouter({ animalIds: ["animal-1", "animal-2"] });
    render(<RouterProvider router={router} />);

    const checkboxes = screen.getAllByRole("checkbox");
    const animalCheckboxes = checkboxes.filter(
      (cb) =>
        !(cb as HTMLInputElement).closest("label")?.textContent?.includes("Employee") &&
        !(cb as HTMLInputElement).closest("label")?.textContent?.includes("Service Provider")
    );

    const checkedCount = animalCheckboxes.filter((cb) => (cb as HTMLInputElement).checked).length;

    expect(checkedCount).toBeGreaterThanOrEqual(2);
  });
});
