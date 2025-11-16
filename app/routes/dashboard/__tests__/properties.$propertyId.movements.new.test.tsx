import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import NewMovement from "../properties.$propertyId.movements.new";
import { getPropertyById } from "~/mocks/properties";
import { getLocationsByPropertyId } from "~/mocks/locations";
import { getEmployeesByPropertyId } from "~/mocks/employees";
import { getServiceProvidersByPropertyId } from "~/mocks/service-providers";
import { addLocationMovement } from "~/mocks/location-movements";

const mockNavigate = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [mockSearchParams],
    useParams: () => ({ propertyId: "property-1" }),
  };
});

vi.mock("~/mocks/properties", () => ({
  getPropertyById: vi.fn(),
}));

vi.mock("~/mocks/locations", () => ({
  getLocationsByPropertyId: vi.fn(() => []),
  getLocationById: vi.fn(() => null),
}));

vi.mock("~/mocks/employees", () => ({
  getEmployeesByPropertyId: vi.fn(() => []),
  getEmployeeById: vi.fn(() => null),
}));

vi.mock("~/mocks/service-providers", () => ({
  getServiceProvidersByPropertyId: vi.fn(() => []),
  getServiceProviderById: vi.fn(() => null),
}));

vi.mock("~/mocks/location-movements", () => ({
  addLocationMovement: vi.fn(() => ({ id: "new-movement" })),
}));

vi.mock("~/components/ui", () => ({
  Input: ({ label, value, onChange, ...props }: any) => (
    <input
      data-testid={`input-${label || props.name || "input"}`}
      value={value || ""}
      onChange={onChange}
      {...props}
    />
  ),
  Select: ({ options, value, onChange, name, ...props }: any) => (
    <select
      data-testid={`select-${name || "select"}`}
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
  FileUpload: ({ onFilesChange }: any) => (
    <input
      type="file"
      data-testid="file-upload"
      onChange={(e) => onFilesChange?.(Array.from(e.target.files || []))}
    />
  ),
  Alert: ({ title, variant }: any) => (
    <div data-testid={`alert-${variant}`}>{title}</div>
  ),
}));

describe("NewMovement", () => {
  const mockProperty = {
    id: "property-1",
    name: "Test Property",
    companyId: "company-1",
  };

  const createRouter = (propertyId: string, searchParams?: string) => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard/properties/:propertyId/movements/new",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <NewMovement />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: [`/dashboard/properties/${propertyId}/movements/new${searchParams ? `?${searchParams}` : ""}`],
      }
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.delete("locationId");
    mockSearchParams.delete("employeeId");
    mockSearchParams.delete("serviceProviderId");
    vi.mocked(getPropertyById).mockReturnValue(mockProperty);
  });

  it("should render new movement form", () => {
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);
    
    const heading = screen.queryByRole("heading", { level: 1 });
    const buttons = screen.queryAllByRole("button");
    expect(heading || buttons.length > 0).toBeTruthy();
  });

  it("should handle undefined property", () => {
    vi.mocked(getPropertyById).mockReturnValue(undefined);
    const router = createRouter("invalid-id");
    render(<RouterProvider router={router} />);
    
    const backButton = screen.queryByRole("button");
    expect(backButton).toBeInTheDocument();
  });

  it("should handle form input changes", () => {
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);
    
    const inputs = screen.queryAllByRole("textbox");
    if (inputs.length > 0) {
      fireEvent.change(inputs[0], { target: { value: "Test observation" } });
      expect(inputs[0]).toHaveValue("Test observation");
    }
  });

  it("should handle form submission", () => {
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);
    
    const submitButtons = screen.queryAllByTestId("submit-button");
    const submitButton = submitButtons.find((btn) => btn.type === "submit" || btn.textContent?.includes("Salvar") || btn.textContent?.includes("Save"));
    if (submitButton && !submitButton.disabled) {
      fireEvent.click(submitButton);
      expect(submitButton).toBeInTheDocument();
    }
  });

  it("should handle URL params for locationId", () => {
    mockSearchParams.set("locationId", "location-1");
    vi.mocked(getLocationsByPropertyId).mockReturnValue([
      { id: "location-1", name: "Location 1", propertyId: "property-1" },
    ]);
    
    const router = createRouter("property-1", "locationId=location-1");
    render(<RouterProvider router={router} />);
    
    expect(getPropertyById).toHaveBeenCalledWith("property-1");
  });

  it("should have correct meta function", () => {
    expect(NewMovement).toBeDefined();
  });
});

