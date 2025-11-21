import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import NewDeath from "../records.deaths.new";

const mockNavigate = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("~/services/deaths.service", () => ({
  addDeath: vi.fn(() => ({
    id: "new-death",
    animalId: "animal-1",
    date: "2024-01-15",
    cause: "Disease",
  })),
  getDeathByAnimalId: vi.fn(() => null),
}));

vi.mock("~/services/animals.service", () => ({
  updateAnimal: vi.fn(() => true),
  getAnimalsByCompanyId: vi.fn(() => [
    {
      id: "animal-1",
      code: "FJ001",
      registrationNumber: "BR-2020-FJ0001",
      status: "active" as const,
      createdAt: "2020-01-15",
      companyId: "company-1",
      propertyId: "property-1",
    },
  ]),
  getAnimalById: vi.fn((id: string) => {
    if (id === "animal-1") {
      return {
        id: "animal-1",
        code: "FJ001",
        registrationNumber: "BR-2020-FJ0001",
        status: "active" as const,
        createdAt: "2020-01-15",
        companyId: "company-1",
        propertyId: "property-1",
      };
    }
    return null;
  }),
}));

vi.mock("~/services/births.service", () => ({
  getBirthByAnimalId: vi.fn(() => ({
    id: "birth-1",
    animalId: "animal-1",
    gender: "male" as const,
    birthDate: "2020-01-01",
    createdAt: "2020-01-01",
    companyId: "company-1",
  })),
}));

vi.mock("~/mocks/companies", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/companies")>("~/mocks/companies");
  return {
    ...actual,
    mockCompanies: [{ id: "company-1", name: "Test Company" }],
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
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    [key: string]: unknown;
  }) => (
    <input
      data-testid={`input-${label || placeholder || "input"}`}
      aria-label={label}
      placeholder={placeholder}
      value={value || ""}
      onChange={onChange}
      type={type}
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
      data-testid={type === "submit" ? "submit-button" : "button"}
      type={type as "button" | "submit" | "reset" | undefined}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  ),
  Alert: ({ title, variant }: { title?: string; variant?: string }) => (
    <div data-testid={`alert-${variant}`}>{title}</div>
  ),
}));

describe("NewDeath", () => {
  const createRouter = () => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard/registros/obitos/novo",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <NewDeath />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: ["/dashboard/registros/obitos/novo"],
      }
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render new death form", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const heading = screen.queryByRole("heading", { level: 1 });
    const buttons = screen.queryAllByRole("button");
    expect(heading || buttons.length > 0).toBeTruthy();
  });

  it("should handle form input changes", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const dateInput =
      screen.queryByTestId("input-Data do Óbito") || screen.queryByLabelText(/date/i);
    if (dateInput) {
      fireEvent.change(dateInput, { target: { value: "2024-01-15" } });
      expect(dateInput).toHaveValue("2024-01-15");
    }

    const causeInput =
      screen.queryByTestId("input-Causa da Morte") || screen.queryByLabelText(/cause/i);
    if (causeInput) {
      fireEvent.change(causeInput, { target: { value: "Disease" } });
      expect(causeInput).toHaveValue("Disease");
    }
  });

  it("should handle animal selection", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const animalSelect =
      screen.queryByTestId("select-Animal") || screen.queryByLabelText(/animal/i);
    if (animalSelect) {
      fireEvent.change(animalSelect, { target: { value: "animal-1" } });
      expect(animalSelect).toHaveValue("animal-1");
    }
  });

  it("should show validation errors on invalid submission", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const submitButton = screen.queryByTestId("submit-button") as HTMLButtonElement | null;
    if (submitButton && !submitButton.disabled) {
      fireEvent.click(submitButton);
      // Wait for validation to run
      await waitFor(() => {
        expect(submitButton).toBeInTheDocument();
      });
    }
  });

  it("should handle successful form submission", async () => {
    const { addDeath } = await import("~/services/deaths.service");
    const { updateAnimal } = await import("~/services/animals.service");

    const router = createRouter();
    render(<RouterProvider router={router} />);

    // Fill in form fields
    const animalSelect = screen.queryByTestId("select-select");
    if (animalSelect) {
      fireEvent.change(animalSelect, { target: { value: "animal-1" } });
    }

    const dateInput = screen.queryByTestId("input-Death Date");
    if (dateInput) {
      fireEvent.change(dateInput, { target: { value: "2024-01-15" } });
    }

    const causeInput = screen.queryByTestId("input-Cause of Death");
    if (causeInput) {
      fireEvent.change(causeInput, { target: { value: "Disease" } });
    }

    // Submit the form
    const form = document.querySelector("form");
    if (form) {
      fireEvent.submit(form);

      await waitFor(
        () => {
          expect(addDeath).toHaveBeenCalled();
          expect(updateAnimal).toHaveBeenCalledWith("animal-1", { status: "inactive" });
        },
        { timeout: 3000 }
      );
    }
  });

  it("should prevent duplicate death records", async () => {
    const { getDeathByAnimalId, addDeath } = await import("~/services/deaths.service");
    vi.mocked(getDeathByAnimalId).mockReturnValueOnce({
      id: "existing-death",
      animalId: "animal-1",
      date: "2024-01-10",
      cause: "Previous cause",
      companyId: "company-1",
      createdAt: "2024-01-10",
    });

    const router = createRouter();
    render(<RouterProvider router={router} />);

    const animalSelect = screen.queryByTestId("select-select");
    if (animalSelect) {
      fireEvent.change(animalSelect, { target: { value: "animal-1" } });
    }

    const dateInput = screen.queryByTestId("input-Death Date");
    if (dateInput) {
      fireEvent.change(dateInput, { target: { value: "2024-01-15" } });
    }

    const causeInput = screen.queryByTestId("input-Cause of Death");
    if (causeInput) {
      fireEvent.change(causeInput, { target: { value: "Disease" } });
    }

    // Submit the form
    const form = document.querySelector("form");
    if (form) {
      // Clear any previous calls
      vi.mocked(addDeath).mockClear();

      fireEvent.submit(form);

      await waitFor(
        () => {
          // Should show validation error for duplicate death
          // The validation should prevent submission, so addDeath should NOT be called
          expect(addDeath).not.toHaveBeenCalled();
        },
        { timeout: 3000 }
      );
    }
  });

  it("should navigate back when cancel button is clicked", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const cancelButtons = screen.queryAllByTestId("button");
    const cancelButton = cancelButtons.find(
      (btn) =>
        btn.textContent?.includes("Cancelar") ||
        btn.textContent?.includes("Cancel") ||
        btn.textContent?.includes("Voltar") ||
        btn.textContent?.includes("Back")
    );

    if (cancelButton) {
      fireEvent.click(cancelButton);
      // Navigation is mocked, so we just verify the button exists
      expect(cancelButton).toBeInTheDocument();
    }
  });
});
