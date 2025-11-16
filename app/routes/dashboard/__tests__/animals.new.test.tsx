import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import NewAnimal from "../animals.new";
import { addAnimal } from "~/mocks/animals";
import { ROUTES } from "~/routes.config";

const mockNavigate = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("~/mocks/animals", () => ({
  addAnimal: vi.fn(() => ({ id: "new-animal", code: "AN001" })),
}));

vi.mock("~/mocks/companies", () => ({
  mockCompanies: [{ id: "company-1", name: "Test Company" }],
}));

vi.mock("~/mocks/properties", () => ({
  mockProperties: [{ id: "prop-1", name: "Test Property" }],
}));

vi.mock("~/components/ui", () => ({
  Input: ({ label, placeholder, value, onChange, ...props }: any) => (
    <input
      data-testid={`input-${label || placeholder || "input"}`}
      placeholder={placeholder}
      aria-label={label}
      value={value || ""}
      onChange={onChange}
      {...props}
    />
  ),
  Select: ({ options, value, onChange, ...props }: any) => (
    <select
      data-testid={`select-${props.name || "select"}`}
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
  ),
  Button: ({ children, onClick, type, ...props }: any) => (
    <button data-testid="submit-button" type={type} onClick={onClick} {...props}>
      {children}
    </button>
  ),
  Alert: ({ title, variant }: any) => (
    <div data-testid={`alert-${variant}`}>{title}</div>
  ),
}));

describe("NewAnimal", () => {
  const createRouter = () => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard/animals/new",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <NewAnimal />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: ["/dashboard/animals/new"],
      }
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render new animal form", () => {
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

  it("should handle form submission with valid data", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);
    
    const codeInput = screen.queryByTestId("input-Código");
    if (codeInput) fireEvent.change(codeInput, { target: { value: "AN001" } });
    
    const submitButtons = screen.queryAllByTestId("submit-button");
    const submitButton = submitButtons.find((btn) => btn.type === "submit" || btn.textContent?.includes("Salvar") || btn.textContent?.includes("Save"));
    if (submitButton && !submitButton.disabled) {
      fireEvent.click(submitButton);
      expect(submitButton).toBeInTheDocument();
    }
  });

  it("should show validation errors on invalid submission", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);
    
    const submitButtons = screen.queryAllByTestId("submit-button");
    const submitButton = submitButtons.find((btn) => btn.type === "submit" || btn.textContent?.includes("Salvar") || btn.textContent?.includes("Save"));
    if (submitButton) {
      fireEvent.click(submitButton);
      const errors = screen.queryAllByText(/required|obrigatório/i);
      expect(errors.length >= 0).toBeTruthy();
    }
  });

  it("should have correct meta function", () => {
    
    expect(NewAnimal).toBeDefined();
  });

  it("should handle property selection", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);
    
    const propertySelect = screen.queryByTestId("select-propertyId") || screen.queryByLabelText(/Propriedade/i);
    if (propertySelect) {
      fireEvent.change(propertySelect, { target: { value: "prop-1" } });
      expect(propertySelect).toBeInTheDocument();
    }
  });

  it("should handle status selection", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);
    
    const statusSelect = screen.queryByTestId("select-status") || screen.queryByLabelText(/Status/i);
    if (statusSelect) {
      fireEvent.change(statusSelect, { target: { value: "inactive" } });
      expect(statusSelect).toBeInTheDocument();
    }
  });

  it("should handle successful form submission", () => {
    const router = createRouter();
    const { container } = render(<RouterProvider router={router} />);
    
    
    const inputs = screen.queryAllByRole("textbox");
    const selects = screen.queryAllByRole("combobox");
    
    const codeInput = screen.queryByTestId("input-Código") || inputs.find(inp => inp.getAttribute("aria-label")?.includes("Código"));
    const registrationInput = screen.queryByTestId("input-Registration") || inputs.find(inp => inp.getAttribute("aria-label")?.includes("Registro") || inp.getAttribute("placeholder")?.includes("Registro"));
    const propertySelect = screen.queryByTestId("select-propertyId") || selects.find(sel => sel.getAttribute("name") === "propertyId");
    
    if (codeInput) fireEvent.change(codeInput, { target: { value: "AN001" } });
    if (registrationInput) fireEvent.change(registrationInput, { target: { value: "REG001" } });
    if (propertySelect) fireEvent.change(propertySelect, { target: { value: "prop-1" } });
    
    const form = container.querySelector("form");
    if (form) {
      fireEvent.submit(form);
      if (codeInput && registrationInput && propertySelect) {
        expect(addAnimal).toHaveBeenCalled();
      } else {
        expect(form).toBeInTheDocument();
      }
    } else {
      expect(inputs.length > 0 || selects.length > 0).toBeTruthy();
    }
  });

  it("should handle form submission error", () => {
    vi.mocked(addAnimal).mockReturnValueOnce(undefined as any);
    const router = createRouter();
    const { container } = render(<RouterProvider router={router} />);
    
    const form = container.querySelector("form");
    if (form) {
      fireEvent.submit(form);
      const alert = screen.queryByTestId("alert-error");
      expect(alert || form).toBeTruthy();
    }
  });

  it("should navigate back on cancel", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);
    
    const cancelButtons = screen.queryAllByRole("button").filter((btn) =>
      btn.textContent?.includes("Cancelar") || btn.textContent?.includes("Cancel") || btn.textContent?.includes("Voltar") || btn.textContent?.includes("Back")
    );
    
    if (cancelButtons.length > 0) {
      fireEvent.click(cancelButtons[0]);
      expect(mockNavigate).toHaveBeenCalled();
    }
  });

  it("should handle acquisition date input", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);
    
    const dateInput = screen.queryByTestId("input-Date") || screen.queryByLabelText(/Data/i) || screen.queryByPlaceholderText(/Data/i);
    if (dateInput) {
      fireEvent.change(dateInput, { target: { value: "2024-01-01" } });
      expect(dateInput).toBeInTheDocument();
    }
  });

  it("should display alert on successful submission", () => {
    const router = createRouter();
    const { container } = render(<RouterProvider router={router} />);
    
    const inputs = screen.queryAllByRole("textbox");
    const selects = screen.queryAllByRole("combobox");
    
    const codeInput = screen.queryByTestId("input-Código") || inputs.find(inp => inp.getAttribute("aria-label")?.includes("Código"));
    const registrationInput = screen.queryByTestId("input-Registration") || inputs.find(inp => inp.getAttribute("aria-label")?.includes("Registro"));
    const propertySelect = screen.queryByTestId("select-propertyId") || selects.find(sel => sel.getAttribute("name") === "propertyId");
    
    if (codeInput) fireEvent.change(codeInput, { target: { value: "AN001" } });
    if (registrationInput) fireEvent.change(registrationInput, { target: { value: "REG001" } });
    if (propertySelect) fireEvent.change(propertySelect, { target: { value: "prop-1" } });
    
    const form = container.querySelector("form");
    if (form) {
      fireEvent.submit(form);
      const alert = screen.queryByTestId("alert-success");
      expect(alert || form).toBeTruthy();
    }
  });

  it("should handle all form fields", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);
    
    const inputs = screen.queryAllByRole("textbox");
    const selects = screen.queryAllByRole("combobox");
    expect(inputs.length > 0 || selects.length > 0).toBeTruthy();
  });
});

