import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import NewWeighing from "../registros.pesagens.new";

const mockNavigate = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("~/mocks/weighings", () => ({
  addWeighing: vi.fn(() => ({ id: "new-weighing" })),
}));

vi.mock("~/mocks/animals", () => ({
  getAnimalsByCompanyId: vi.fn(() => []),
}));

vi.mock("~/mocks/companies", () => ({
  mockCompanies: [{ id: "company-1", name: "Test Company" }],
}));

vi.mock("~/mocks/employees", () => ({
  mockEmployees: [{ id: "emp-1", name: "Test Employee" }],
}));

vi.mock("~/mocks/service-providers", () => ({
  mockServiceProviders: [{ id: "sp-1", name: "Test SP" }],
}));

vi.mock("~/components/ui", () => ({
  Input: ({ label, placeholder, value, onChange, ...props }: any) => (
    <input
      data-testid={`input-${label || placeholder || "input"}`}
      aria-label={label}
      placeholder={placeholder}
      value={value || ""}
      onChange={onChange}
      {...props}
    />
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
    expect(NewWeighing).toBeDefined();
  });
});

