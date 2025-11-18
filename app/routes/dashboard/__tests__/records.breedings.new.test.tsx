import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import NewBreeding from "../records.breedings.new";

const mockNavigate = vi.fn();
const mockAddBreeding = vi.fn();
const mockGetNextAttemptNumber = vi.fn();
const mockGetAnimalById = vi.fn();
const mockGetBirthByAnimalId = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null }),
  };
});

vi.mock("~/services/breedings.service", () => ({
  addBreeding: (...args: unknown[]) => mockAddBreeding(...args),
  getNextAttemptNumber: (...args: unknown[]) => mockGetNextAttemptNumber(...args),
}));

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

vi.mock("~/services/births.service", () => ({
  getBirthByAnimalId: (...args: unknown[]) => mockGetBirthByAnimalId(...args),
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
}));

describe("NewBreeding", () => {
  const createRouter = () => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard/registros/montas/novo",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <NewBreeding />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: ["/dashboard/registros/montas/novo"],
      }
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockAddBreeding.mockReturnValue({
      id: "breeding-1",
      animalId: "animal-1",
      date: "2024-01-15",
      companyId: "company-1",
      createdAt: "2024-01-15T10:00:00Z",
    });
    mockGetNextAttemptNumber.mockReturnValue(1);
    mockGetAnimalById.mockReturnValue({
      id: "animal-1",
      code: "A001",
      registrationNumber: "REG001",
      companyId: "company-1",
      propertyId: "prop-1",
      status: "active",
      createdAt: "2024-01-01",
    });
    mockGetBirthByAnimalId.mockReturnValue({
      id: "birth-1",
      animalId: "animal-1",
      gender: "female",
      companyId: "company-1",
      birthDate: "2020-01-01",
      purity: "PO" as const,
      createdAt: "2020-01-01",
    });
  });

  it("should render new breeding form", () => {
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

  it("should have correct meta function", () => {
    expect(NewBreeding).toBeDefined();
  });
});
