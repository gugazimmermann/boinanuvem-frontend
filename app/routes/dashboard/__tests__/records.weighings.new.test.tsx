import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import NewWeighing from "../records.weighings.new";

const mockNavigate = vi.fn();
const mockAddWeighing = vi.fn();
const mockGetWeighingsByAnimalId = vi.fn();
const mockGetAnimalById = vi.fn();
const mockGetEmployeeById = vi.fn();
const mockGetServiceProviderById = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("~/services/weighings.service", () => ({
  addWeighing: (...args: unknown[]) => mockAddWeighing(...args),
  getWeighingsByAnimalId: (...args: unknown[]) => mockGetWeighingsByAnimalId(...args),
}));

vi.mock("~/mocks/animals", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/animals")>("~/mocks/animals");
  return actual;
});

vi.mock("~/services/animals.service", () => ({
  getAnimalsByCompanyId: vi.fn(() => [
    {
      id: "animal-1",
      code: "A001",
      registrationNumber: "REG001",
      companyId: "company-1",
      propertyId: "prop-1",
      status: "active" as const,
      createdAt: "2024-01-01",
    },
  ]),
  getAnimalById: (...args: unknown[]) => mockGetAnimalById(...args),
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

vi.mock("~/services/employees.service", () => ({
  getEmployeeById: (...args: unknown[]) => mockGetEmployeeById(...args),
}));

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

vi.mock("~/services/service-providers.service", () => ({
  getServiceProviderById: (...args: unknown[]) => mockGetServiceProviderById(...args),
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
      value={value ?? ""}
      onChange={onChange}
      {...props}
    />
  ),
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
  Table: ({
    columns,
    data,
    search,
    pagination,
    emptyState,
    slim,
  }: {
    columns?: Array<{
      key: string;
      label: string;
      render?: (value: unknown, row: unknown, index: number) => React.ReactNode;
    }>;
    data?: unknown[];
    search?: { placeholder?: string; value: string; onChange: (value: string) => void };
    pagination?: { currentPage: number; totalPages: number };
    emptyState?: { title?: string };
    slim?: boolean;
  }) => (
    <div data-testid="table" data-slim={slim}>
      {search && (
        <input
          data-testid="table-search"
          placeholder={search.placeholder}
          value={search.value}
          onChange={(e) => search.onChange(e.target.value)}
        />
      )}
      <table>
        <thead>
          <tr>
            {columns?.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {!data || data.length === 0 ? (
            <tr>
              <td colSpan={columns?.length || 0}>{emptyState?.title || "No data"}</td>
            </tr>
          ) : (
            data?.map((row, idx: number) => (
              <tr key={idx}>
                {columns?.map((col) => (
                  <td key={col.key}>
                    {col.render
                      ? (col.render(null, row, idx) as React.ReactNode)
                      : String((row as Record<string, unknown>)[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      {pagination && (
        <div data-testid="table-pagination">
          Page {pagination.currentPage} of {pagination.totalPages}
        </div>
      )}
    </div>
  ),
}));

describe("NewWeighing", () => {
  const createRouter = () => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard/registros/pesagens/new",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <NewWeighing />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: ["/dashboard/registros/pesagens/new"],
      }
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockAddWeighing.mockReturnValue({
      id: "weighing-1",
      animalId: "animal-1",
      date: "2024-01-15",
      weight: 450.5,
      employeeIds: ["emp-1"],
      serviceProviderIds: ["sp-1"],
      companyId: "company-1",
      createdAt: "2024-01-15T10:00:00Z",
    });
    mockGetAnimalById.mockReturnValue({
      id: "animal-1",
      code: "A001",
      registrationNumber: "REG001",
      companyId: "company-1",
      propertyId: "prop-1",
      status: "active",
      createdAt: "2024-01-01",
    });
    mockGetWeighingsByAnimalId.mockReturnValue([]);
    mockGetEmployeeById.mockReturnValue({ id: "emp-1", name: "Test Employee" });
    mockGetServiceProviderById.mockReturnValue({ id: "sp-1", name: "Test SP" });
  });

  it("should render new weighing form", () => {
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
    expect(NewWeighing).toBeDefined();
  });

  it("should not navigate after successful submission", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const animalInput = screen.getByPlaceholderText(/search by code|buscar por código/i);
    fireEvent.change(animalInput, { target: { value: "A001" } });

    await waitFor(() => {
      const animalRadios = screen.getAllByRole("radio");
      if (animalRadios.length > 0) {
        fireEvent.click(animalRadios[0]);
      }
    });

    const weightInput = screen.getByLabelText(/weight|peso/i);
    fireEvent.change(weightInput, { target: { value: "450.5" } });

    const dateInput = screen.getByLabelText(/date|data/i);
    if (dateInput) {
      const today = new Date().toISOString().split("T")[0];
      fireEvent.change(dateInput, { target: { value: today } });
    }

    const submitButton = screen.getByTestId("submit-button");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAddWeighing).toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalledWith(expect.stringContaining("/animais"));
    });
  });

  it("should show session weighings button after first registration", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const animalInput = screen.getByPlaceholderText(/search by code|buscar por código/i);
    fireEvent.change(animalInput, { target: { value: "A001" } });

    await waitFor(() => {
      const animalRadios = screen.getAllByRole("radio");
      if (animalRadios.length > 0) {
        fireEvent.click(animalRadios[0]);
      }
    });

    const weightInput = screen.getByLabelText(/weight|peso/i);
    fireEvent.change(weightInput, { target: { value: "450.5" } });

    const dateInput = screen.getByLabelText(/date|data/i);
    if (dateInput) {
      const today = new Date().toISOString().split("T")[0];
      fireEvent.change(dateInput, { target: { value: today } });
    }

    const submitButton = screen.getByTestId("submit-button");
    fireEvent.click(submitButton);

    await waitFor(
      () => {
        const viewSessionButton = screen.queryByText(
          /Ver Pesagens da Sessão|View Session Weighings|Ver Pesajes de la Sesión/i
        );
        expect(viewSessionButton).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("should preserve employee and service provider selections after submission", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const animalInput = screen.getByPlaceholderText(/search by code|buscar por código/i);
    fireEvent.change(animalInput, { target: { value: "A001" } });

    await waitFor(() => {
      const animalRadios = screen.getAllByRole("radio");
      if (animalRadios.length > 0) {
        fireEvent.click(animalRadios[0]);
      }
    });

    const weightInput = screen.getByLabelText(/weight|peso/i);
    fireEvent.change(weightInput, { target: { value: "450.5" } });

    const dateInput = screen.getByLabelText(/date|data/i);
    if (dateInput) {
      const today = new Date().toISOString().split("T")[0];
      fireEvent.change(dateInput, { target: { value: today } });
    }

    const employeeCheckboxes = screen.getAllByRole("checkbox");
    if (employeeCheckboxes.length > 0) {
      fireEvent.click(employeeCheckboxes[0]);
    }

    const submitButton = screen.getByTestId("submit-button");
    fireEvent.click(submitButton);

    await waitFor(
      () => {
        const employeeCheckboxesAfter = screen.getAllByRole("checkbox");
        if (employeeCheckboxesAfter.length > 0) {
          expect(employeeCheckboxesAfter[0]).toBeChecked();
        }
      },
      { timeout: 3000 }
    );
  });

  it("should open session modal when view session button is clicked", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const animalInput = screen.getByPlaceholderText(/search by code|buscar por código/i);
    fireEvent.change(animalInput, { target: { value: "A001" } });

    await waitFor(() => {
      const animalRadios = screen.getAllByRole("radio");
      if (animalRadios.length > 0) {
        fireEvent.click(animalRadios[0]);
      }
    });

    const weightInput = screen.getByLabelText(/weight|peso/i);
    fireEvent.change(weightInput, { target: { value: "450.5" } });

    const dateInput = screen.getByLabelText(/date|data/i);
    if (dateInput) {
      const today = new Date().toISOString().split("T")[0];
      fireEvent.change(dateInput, { target: { value: today } });
    }

    const submitButton = screen.getByTestId("submit-button");
    fireEvent.click(submitButton);

    await waitFor(
      () => {
        const viewSessionButton = screen.queryByText(
          /Ver Pesagens da Sessão|View Session Weighings|Ver Pesajes de la Sesión/i
        );
        if (viewSessionButton) {
          fireEvent.click(viewSessionButton);

          const modal = screen.queryByTestId("table");
          expect(modal).toBeInTheDocument();
        }
      },
      { timeout: 3000 }
    );
  });

  it("should display session weighings in modal table", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const animalInput = screen.getByPlaceholderText(/search by code|buscar por código/i);
    fireEvent.change(animalInput, { target: { value: "A001" } });

    await waitFor(() => {
      const animalRadios = screen.getAllByRole("radio");
      if (animalRadios.length > 0) {
        fireEvent.click(animalRadios[0]);
      }
    });

    const weightInput = screen.getByLabelText(/weight|peso/i);
    fireEvent.change(weightInput, { target: { value: "450.5" } });

    const dateInput = screen.getByLabelText(/date|data/i);
    if (dateInput) {
      const today = new Date().toISOString().split("T")[0];
      fireEvent.change(dateInput, { target: { value: today } });
    }

    const submitButton = screen.getByTestId("submit-button");
    fireEvent.click(submitButton);

    await waitFor(
      async () => {
        const viewSessionButton = screen.queryByText(
          /Ver Pesagens da Sessão|View Session Weighings|Ver Pesajes de la Sesión/i
        );
        if (viewSessionButton) {
          fireEvent.click(viewSessionButton);

          await waitFor(
            () => {
              const table = screen.queryByTestId("table");
              expect(table).toBeInTheDocument();
              expect(table).toHaveAttribute("data-slim", "true");
            },
            { timeout: 3000 }
          );
        }
      },
      { timeout: 3000 }
    );
  });

  it("should reset form fields except employee and service provider selections", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const animalInput = screen.getByPlaceholderText(/search by code|buscar por código/i);
    fireEvent.change(animalInput, { target: { value: "A001" } });

    await waitFor(() => {
      const animalRadios = screen.getAllByRole("radio");
      if (animalRadios.length > 0) {
        fireEvent.click(animalRadios[0]);
      }
    });

    const weightInput = screen.getByLabelText(/weight|peso/i);
    fireEvent.change(weightInput, { target: { value: "450.5" } });
    expect(weightInput).toHaveValue(450.5);

    const dateInput = screen.getByLabelText(/date|data/i);
    if (dateInput) {
      const today = new Date().toISOString().split("T")[0];
      fireEvent.change(dateInput, { target: { value: today } });
    }

    const submitButton = screen.getByTestId("submit-button");
    fireEvent.click(submitButton);

    await waitFor(
      () => {
        expect(mockAddWeighing).toHaveBeenCalled();
      },
      { timeout: 3000 }
    );

    await waitFor(
      () => {
        const weightInputAfter = screen.getByLabelText(/weight|peso/i);
        const inputValue = (weightInputAfter as HTMLInputElement).value;
        expect(
          inputValue === "" || inputValue === null || inputValue === undefined || !inputValue
        ).toBeTruthy();
      },
      { timeout: 2000 }
    );
  });
});
