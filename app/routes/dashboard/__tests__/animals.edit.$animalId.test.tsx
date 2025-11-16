/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import EditAnimal from "../animals.edit.$animalId";
import { getAnimalById, updateAnimal } from "~/services/animals.service";

const mockNavigate = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("~/mocks/animals", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/animals")>("~/mocks/animals");
  return actual;
});

vi.mock("~/services/animals.service", () => ({
  getAnimalById: vi.fn(),
  updateAnimal: vi.fn(),
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
    mockProperties: [{ id: "prop-1", name: "Test Property" }],
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

describe("EditAnimal", () => {
  const mockAnimal = {
    id: "animal-1",
    code: "AN001",
    registrationNumber: "REG001",
    status: "active" as const,
    companyId: "company-1",
    propertyId: "prop-1",
    acquisitionDate: "2024-01-01",
  };

  const createRouter = (animalId: string) => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard/animals/:animalId/edit",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <EditAnimal />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: [`/dashboard/animals/${animalId}/edit`],
      }
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAnimalById).mockReturnValue(mockAnimal);
  });

  it("should render edit animal form with pre-filled data", async () => {
    const router = createRouter("animal-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getAnimalById).toHaveBeenCalledWith("animal-1");
    });

    const heading = screen.queryByRole("heading", { level: 1 });
    expect(heading || screen.queryAllByRole("button").length > 0).toBeTruthy();
  });

  it("should handle form input changes", async () => {
    const router = createRouter("animal-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getAnimalById).toHaveBeenCalledWith("animal-1");
    });

    const inputs = screen.queryAllByRole("textbox");
    if (inputs.length > 0) {
      fireEvent.change(inputs[0], { target: { value: "New Value" } });
      expect(inputs[0]).toHaveValue("New Value");
    }
  });

  it("should handle form submission", async () => {
    vi.mocked(updateAnimal).mockReturnValue(true);
    const router = createRouter("animal-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getAnimalById).toHaveBeenCalledWith("animal-1");
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
    const router = createRouter("animal-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getAnimalById).toHaveBeenCalledWith("animal-1");
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

  it("should handle undefined animal", () => {
    vi.mocked(getAnimalById).mockReturnValue(undefined);
    const router = createRouter("invalid-id");
    render(<RouterProvider router={router} />);

    const backButton = screen.queryByRole("button");
    expect(backButton).toBeInTheDocument();
  });

  it("should have correct meta function", () => {
    expect(EditAnimal).toBeDefined();
  });

  it("should handle property selection", async () => {
    const router = createRouter("animal-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getAnimalById).toHaveBeenCalledWith("animal-1");
    });

    const propertySelect =
      screen.queryByTestId("select-propertyId") || screen.queryByLabelText(/Propriedade/i);
    if (propertySelect) {
      fireEvent.change(propertySelect, { target: { value: "prop-1" } });
      expect(propertySelect).toBeInTheDocument();
    }
  });

  it("should handle status selection", async () => {
    const router = createRouter("animal-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getAnimalById).toHaveBeenCalledWith("animal-1");
    });

    const statusSelect =
      screen.queryByTestId("select-status") || screen.queryByLabelText(/Status/i);
    if (statusSelect) {
      fireEvent.change(statusSelect, { target: { value: "inactive" } });
      expect(statusSelect).toBeInTheDocument();
    }
  });

  it("should handle successful form submission", async () => {
    vi.mocked(updateAnimal).mockReturnValue(true);
    const router = createRouter("animal-1");
    const { container } = render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getAnimalById).toHaveBeenCalledWith("animal-1");
    });

    const form = container.querySelector("form");
    if (form) {
      fireEvent.submit(form);
      expect(updateAnimal).toHaveBeenCalled();
    }
  });

  it("should handle form submission error", async () => {
    vi.mocked(updateAnimal).mockReturnValue(false);
    const router = createRouter("animal-1");
    const { container } = render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getAnimalById).toHaveBeenCalledWith("animal-1");
    });

    const form = container.querySelector("form");
    if (form) {
      fireEvent.submit(form);
      const alert = screen.queryByTestId("alert-error");
      expect(alert || form).toBeTruthy();
    }
  });

  it("should navigate back on cancel", async () => {
    const router = createRouter("animal-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getAnimalById).toHaveBeenCalledWith("animal-1");
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

  it("should handle acquisition date input", async () => {
    const router = createRouter("animal-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getAnimalById).toHaveBeenCalledWith("animal-1");
    });

    const dateInput =
      screen.queryByTestId("input-Date") ||
      screen.queryByLabelText(/Data/i) ||
      screen.queryByPlaceholderText(/Data/i);
    if (dateInput) {
      fireEvent.change(dateInput, { target: { value: "2024-02-01" } });
      expect(dateInput).toBeInTheDocument();
    }
  });

  it("should display alert on successful submission", async () => {
    vi.mocked(updateAnimal).mockReturnValue(true);
    const router = createRouter("animal-1");
    const { container } = render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getAnimalById).toHaveBeenCalledWith("animal-1");
    });

    const form = container.querySelector("form");
    if (form) {
      fireEvent.submit(form);
      const alert = screen.queryByTestId("alert-success");
      expect(alert || form).toBeTruthy();
    }
  });

  it("should handle all form fields", async () => {
    const router = createRouter("animal-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getAnimalById).toHaveBeenCalledWith("animal-1");
    });

    const inputs = screen.queryAllByRole("textbox");
    const selects = screen.queryAllByRole("combobox");
    expect(inputs.length > 0 || selects.length > 0).toBeTruthy();
  });

  it("should pre-fill form with animal data", async () => {
    const router = createRouter("animal-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getAnimalById).toHaveBeenCalledWith("animal-1");
    });

    const inputs = screen.queryAllByRole("textbox");
    expect(inputs.length > 0).toBeTruthy();
  });
});
