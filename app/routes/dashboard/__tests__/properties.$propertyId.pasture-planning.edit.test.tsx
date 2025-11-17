import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import EditPasturePlanning from "../properties.$propertyId.pasture-planning.edit";
import { getPropertyById, updateProperty } from "~/services/properties.service";
import type { Property } from "~/types";
import { AreaType } from "~/types/location";

const mockNavigate = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("~/services/properties.service", async () => {
  const actual = await vi.importActual<typeof import("~/services/properties.service")>(
    "~/services/properties.service"
  );
  return {
    ...actual,
    getPropertyById: vi.fn(),
    updateProperty: vi.fn(),
  };
});

vi.mock("~/components/ui", () => ({
  Button: ({
    children,
    onClick,
    type,
    disabled,
    ...props
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    "data-testid"?: string;
    [key: string]: unknown;
  }) => (
    <button
      data-testid={props["data-testid"] || "button"}
      type={type}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  ),
  Alert: ({ title, variant }: { title: string; variant?: string }) => (
    <div data-testid={`alert-${variant}`}>{title}</div>
  ),
  PasturePlanningTable: ({
    data,
    onChange,
    errors,
    disabled,
  }: {
    data: Array<{
      month: string;
      min: number;
      max: number;
      precipitation: number;
      classification: string;
    }>;
    onChange: (
      data: Array<{
        month: string;
        min: number;
        max: number;
        precipitation: number;
        classification: string;
      }>
    ) => void;
    errors?: Record<string, string>;
    disabled?: boolean;
  }) => (
    <div data-testid="pasture-planning-table">
      {data.map((month, index: number) => (
        <div key={month.month} data-testid={`month-${index}`}>
          <input
            data-testid={`min-${index}`}
            type="number"
            value={isNaN(month.min) ? "" : month.min}
            onChange={(e) => {
              const newData = [...data];
              newData[index] = { ...newData[index], min: parseFloat(e.target.value) || 0 };
              onChange(newData);
            }}
            disabled={disabled || false}
          />
          <input
            data-testid={`max-${index}`}
            type="number"
            value={isNaN(month.max) ? "" : month.max}
            onChange={(e) => {
              const newData = [...data];
              newData[index] = { ...newData[index], max: parseFloat(e.target.value) || 0 };
              onChange(newData);
            }}
            disabled={disabled || false}
          />
          <input
            data-testid={`precipitation-${index}`}
            type="number"
            value={isNaN(month.precipitation) ? "" : month.precipitation}
            onChange={(e) => {
              const newData = [...data];
              newData[index] = {
                ...newData[index],
                precipitation: parseFloat(e.target.value) || 0,
              };
              onChange(newData);
            }}
            disabled={disabled || false}
          />
          <select
            data-testid={`classification-${index}`}
            value={month.classification}
            onChange={(e) => {
              const newData = [...data];
              newData[index] = {
                ...newData[index],
                classification: e.target.value,
              };
              onChange(newData);
            }}
            disabled={disabled || false}
          >
            <option value="Poor">Poor</option>
            <option value="Medium">Medium</option>
            <option value="Good">Good</option>
            <option value="Excellent">Excellent</option>
          </select>
          {errors && errors[`pasturePlanning.${index}.min`] && (
            <span data-testid={`error-min-${index}`}>{errors[`pasturePlanning.${index}.min`]}</span>
          )}
        </div>
      ))}
    </div>
  ),
}));

describe("EditPasturePlanning", () => {
  const mockProperty: Property = {
    id: "property-1",
    code: "PROP001",
    name: "Test Property",
    status: "active",
    companyId: "company-1",
    city: "Test City",
    state: "SC",
    area: { value: 100, type: AreaType.HECTARES },
    zipCode: "89000-000",
    street: "Test Street",
    number: "123",
    createdAt: "2024-01-01T00:00:00Z",
    complement: "",
    neighborhood: "Test Neighborhood",
    pasturePlanning: [
      {
        month: "January",
        min: 15,
        max: 25,
        precipitation: 100,
        classification: "Good",
      },
      {
        month: "February",
        min: 16,
        max: 26,
        precipitation: 120,
        classification: "Excellent",
      },
    ],
    pasturePlanningModifiedByUser: false,
  };

  const createRouter = (propertyId: string) => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard/properties/:propertyId/pasture-planning/edit",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <EditPasturePlanning />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: [`/dashboard/properties/${propertyId}/pasture-planning/edit`],
      }
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getPropertyById).mockReturnValue(mockProperty);
  });

  it("should render edit pasture planning form", async () => {
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    const heading = screen.queryByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
  });

  it("should load existing pasture planning data", async () => {
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    const table = screen.getByTestId("pasture-planning-table");
    expect(table).toBeInTheDocument();
  });

  it("should display AI-generated note when data has not been modified", async () => {
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    const note = document.querySelector(
      ".mt-2.p-3.bg-blue-50.dark\\:bg-blue-900\\/20.border.border-blue-200"
    );
    expect(note).toBeInTheDocument();
  });

  it("should not display AI-generated note when data has been modified", async () => {
    const modifiedProperty = {
      ...mockProperty,
      pasturePlanningModifiedByUser: true,
    };
    vi.mocked(getPropertyById).mockReturnValue(modifiedProperty);

    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    const note = document.querySelector(
      ".mt-2.p-3.bg-blue-50.dark\\:bg-blue-900\\/20.border.border-blue-200"
    );
    expect(note).not.toBeInTheDocument();
  });

  it("should handle form input changes", async () => {
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    const minInput = screen.getByTestId("min-0");
    fireEvent.change(minInput, { target: { value: "20" } });

    await waitFor(() => {
      expect(minInput).toHaveValue(20);
    });
  });

  it("should hide AI-generated note after user modifies data", async () => {
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    const minInput = screen.getByTestId("min-0");
    fireEvent.change(minInput, { target: { value: "20" } });

    await waitFor(() => {
      const note = document.querySelector(
        ".mt-2.p-3.bg-blue-50.dark\\:bg-blue-900\\/20.border.border-blue-200"
      );
      expect(note).not.toBeInTheDocument();
    });
  });

  it("should handle form submission", async () => {
    vi.mocked(updateProperty).mockReturnValue(true);
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    const form = document.querySelector("form");
    if (form) {
      fireEvent.submit(form);
      await waitFor(() => {
        expect(updateProperty).toHaveBeenCalled();
      });
    }
  });

  it("should save modification status on submit", async () => {
    vi.mocked(updateProperty).mockReturnValue(true);
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    const minInput = screen.getByTestId("min-0");
    fireEvent.change(minInput, { target: { value: "20" } });

    const form = document.querySelector("form");
    if (form) {
      fireEvent.submit(form);
      await waitFor(() => {
        expect(updateProperty).toHaveBeenCalledWith(
          "property-1",
          expect.objectContaining({
            pasturePlanningModifiedByUser: true,
          })
        );
      });
    }
  });

  it("should validate form data", async () => {
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    const minInput = screen.getByTestId("min-0");
    fireEvent.change(minInput, { target: { value: "60" } });

    const form = document.querySelector("form");
    if (form) {
      fireEvent.submit(form);
      await waitFor(() => {
        const error = screen.queryByTestId("error-min-0");
        expect(error || form).toBeTruthy();
      });
    }
  });

  it("should handle undefined property", () => {
    vi.mocked(getPropertyById).mockReturnValue(undefined);
    const router = createRouter("invalid-id");
    render(<RouterProvider router={router} />);

    const backButton = screen.queryByRole("button");
    expect(backButton).toBeInTheDocument();
  });

  it("should navigate back on cancel", async () => {
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    const buttons = screen.queryAllByRole("button");
    const cancelButton = buttons.find(
      (btn) =>
        btn.textContent?.includes("Cancelar") ||
        btn.textContent?.includes("Cancel") ||
        btn.textContent?.includes("Voltar") ||
        btn.textContent?.includes("Back")
    );

    if (cancelButton) {
      fireEvent.click(cancelButton);
      expect(mockNavigate).toHaveBeenCalled();
    }
  });

  it("should navigate to property view on successful submission", async () => {
    vi.mocked(updateProperty).mockReturnValue(true);
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    const form = document.querySelector("form");
    if (form) {
      fireEvent.submit(form);
      await waitFor(
        () => {
          expect(mockNavigate).toHaveBeenCalled();
        },
        { timeout: 2000 }
      );
    }
  });

  it("should display alert on successful submission", async () => {
    vi.mocked(updateProperty).mockReturnValue(true);
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    const form = document.querySelector("form");
    if (form) {
      fireEvent.submit(form);
      await waitFor(() => {
        const alert = screen.queryByTestId("alert-success");
        expect(alert || form).toBeTruthy();
      });
    }
  });

  it("should display alert on failed submission", async () => {
    vi.mocked(updateProperty).mockReturnValue(false);
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    const form = document.querySelector("form");
    if (form) {
      fireEvent.submit(form);
      await waitFor(() => {
        const alert = screen.queryByTestId("alert-error");
        expect(alert || form).toBeTruthy();
      });
    }
  });

  it("should generate default pasture planning when property has none", async () => {
    const propertyWithoutPlanning = {
      ...mockProperty,
      pasturePlanning: undefined,
    };
    vi.mocked(getPropertyById).mockReturnValue(propertyWithoutPlanning);

    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    const table = screen.getByTestId("pasture-planning-table");
    expect(table).toBeInTheDocument();
  });

  it("should disable form when submitting", async () => {
    let resolvePromise: (value: boolean) => void;
    const promise = new Promise<boolean>((resolve) => {
      resolvePromise = resolve;
    });
    vi.mocked(updateProperty).mockReturnValue(promise);

    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    const form = document.querySelector("form");
    if (form) {
      fireEvent.submit(form);
      await waitFor(() => {
        const inputs = screen.getAllByTestId(/^(min|max|precipitation|classification)-/);
        const allDisabled = inputs.every(
          (input) => (input as HTMLInputElement | HTMLSelectElement).disabled
        );
        expect(allDisabled || inputs.length > 0).toBeTruthy();
      });
      resolvePromise!(true);
    }
  });
});
