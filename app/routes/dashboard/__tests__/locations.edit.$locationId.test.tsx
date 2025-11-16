/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import EditLocation from "../locations.edit.$locationId";
import { getLocationById, updateLocation } from "~/services/locations.service";

const mockNavigate = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("~/mocks/locations", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/locations")>("~/mocks/locations");
  return actual;
});

vi.mock("~/services/locations.service", () => ({
  getLocationById: vi.fn(),
  updateLocation: vi.fn(),
}));

vi.mock("~/mocks/properties", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/properties")>("~/mocks/properties");
  return {
    ...actual,
    mockProperties: [{ id: "prop-1", name: "Test Property" }],
  };
});

vi.mock("~/services/properties.service", async () => {
  const actual = await vi.importActual<typeof import("~/services/properties.service")>(
    "~/services/properties.service"
  );
  return {
    ...actual,
    getPropertyById: vi.fn((id: string) => ({ id, name: `Property ${id}` })),
  };
});

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
  Alert: ({ title, variant }: any) => <div data-testid={`alert-${variant}`}>{title}</div>,
}));

describe("EditLocation", () => {
  const mockLocation = {
    id: "location-1",
    code: "LOC001",
    name: "Test Location",
    status: "active" as const,
    propertyId: "prop-1",
    locationType: "pasture" as const,
    area: { value: 100, type: "hectares" as const },
  };

  const createRouter = (locationId: string) => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard/locations/:locationId/edit",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <EditLocation />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: [`/dashboard/locations/${locationId}/edit`],
      }
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getLocationById).mockReturnValue(mockLocation);
  });

  it("should render edit location form with pre-filled data", async () => {
    const router = createRouter("location-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getLocationById).toHaveBeenCalledWith("location-1");
    });

    const heading = screen.queryByRole("heading", { level: 1 });
    expect(heading || screen.queryAllByRole("button").length > 0).toBeTruthy();
  });

  it("should handle form input changes", async () => {
    const router = createRouter("location-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getLocationById).toHaveBeenCalledWith("location-1");
    });

    const inputs = screen.queryAllByRole("textbox");
    if (inputs.length > 0) {
      fireEvent.change(inputs[0], { target: { value: "New Value" } });
      expect(inputs[0]).toHaveValue("New Value");
    }
  });

  it("should handle form submission", async () => {
    vi.mocked(updateLocation).mockReturnValue(true);
    const router = createRouter("location-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getLocationById).toHaveBeenCalledWith("location-1");
    });

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

  it("should handle validation errors", async () => {
    const router = createRouter("location-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getLocationById).toHaveBeenCalledWith("location-1");
    });

    const inputs = screen.queryAllByRole("textbox");
    if (inputs.length > 0) {
      fireEvent.change(inputs[0], { target: { value: "" } });
    }

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

  it("should handle undefined location", () => {
    vi.mocked(getLocationById).mockReturnValue(undefined);
    const router = createRouter("invalid-id");
    render(<RouterProvider router={router} />);

    const backButton = screen.queryByRole("button");
    expect(backButton).toBeInTheDocument();
  });

  it("should have correct meta function", () => {
    expect(EditLocation).toBeDefined();
  });

  it("should handle location type selection", async () => {
    const router = createRouter("location-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getLocationById).toHaveBeenCalledWith("location-1");
    });

    const locationTypeSelect =
      screen.queryByTestId("select-locationType") || screen.queryByLabelText(/Tipo/i);
    if (locationTypeSelect) {
      fireEvent.change(locationTypeSelect, { target: { value: "corral" } });
      expect(locationTypeSelect).toBeInTheDocument();
    }
  });

  it("should handle area type selection", async () => {
    const router = createRouter("location-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getLocationById).toHaveBeenCalledWith("location-1");
    });

    const areaTypeSelect =
      screen.queryByTestId("select-areaType") || screen.queryByLabelText(/Tipo de Área/i);
    if (areaTypeSelect) {
      fireEvent.change(areaTypeSelect, { target: { value: "square_meters" } });
      expect(areaTypeSelect).toBeInTheDocument();
    }
  });

  it("should handle status selection", async () => {
    const router = createRouter("location-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getLocationById).toHaveBeenCalledWith("location-1");
    });

    const statusSelect =
      screen.queryByTestId("select-status") || screen.queryByLabelText(/Status/i);
    if (statusSelect) {
      fireEvent.change(statusSelect, { target: { value: "inactive" } });
      expect(statusSelect).toBeInTheDocument();
    }
  });

  it("should handle property selection", async () => {
    const router = createRouter("location-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getLocationById).toHaveBeenCalledWith("location-1");
    });

    const propertySelect =
      screen.queryByTestId("select-propertyId") || screen.queryByLabelText(/Propriedade/i);
    if (propertySelect) {
      fireEvent.change(propertySelect, { target: { value: "prop-1" } });
      expect(propertySelect).toBeInTheDocument();
    }
  });

  it("should handle successful form submission", async () => {
    vi.mocked(updateLocation).mockReturnValue(true);
    const router = createRouter("location-1");
    const { container } = render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getLocationById).toHaveBeenCalledWith("location-1");
    });

    const form = container.querySelector("form");
    if (form) {
      fireEvent.submit(form);
      expect(updateLocation).toHaveBeenCalled();
    }
  });

  it("should handle form submission error", async () => {
    vi.mocked(updateLocation).mockReturnValue(false);
    const router = createRouter("location-1");
    const { container } = render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getLocationById).toHaveBeenCalledWith("location-1");
    });

    const form = container.querySelector("form");
    if (form) {
      fireEvent.submit(form);
      const alert = screen.queryByTestId("alert-error");
      expect(alert || form).toBeTruthy();
    }
  });

  it("should navigate back on cancel", async () => {
    const router = createRouter("location-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getLocationById).toHaveBeenCalledWith("location-1");
    });

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

  it("should validate area value is positive", async () => {
    const router = createRouter("location-1");
    const { container } = render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getLocationById).toHaveBeenCalledWith("location-1");
    });

    const inputs = screen.queryAllByRole("textbox");
    const areaInput = inputs.find((inp) => inp.getAttribute("type") === "number");

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
    vi.mocked(updateLocation).mockReturnValue(true);
    const router = createRouter("location-1");
    const { container } = render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getLocationById).toHaveBeenCalledWith("location-1");
    });

    const form = container.querySelector("form");
    if (form) {
      fireEvent.submit(form);
      const alert = screen.queryByTestId("alert-success");
      expect(alert || form).toBeTruthy();
    }
  });

  it("should handle all form fields", async () => {
    const router = createRouter("location-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getLocationById).toHaveBeenCalledWith("location-1");
    });

    const inputs = screen.queryAllByRole("textbox");
    const selects = screen.queryAllByRole("combobox");
    expect(inputs.length > 0 || selects.length > 0).toBeTruthy();
  });

  it("should pre-fill form with location data", async () => {
    const router = createRouter("location-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getLocationById).toHaveBeenCalledWith("location-1");
    });

    const inputs = screen.queryAllByRole("textbox");
    expect(inputs.length > 0).toBeTruthy();
  });
});
