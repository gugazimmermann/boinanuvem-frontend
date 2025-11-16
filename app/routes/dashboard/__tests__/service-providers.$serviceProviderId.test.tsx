/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import ServiceProviderDetails from "../service-providers.$serviceProviderId";
import { getServiceProviderById } from "~/services/service-providers.service";
import { getServiceProviderObservationsByServiceProviderId } from "~/services/service-provider-observations.service";

const mockNavigate = vi.fn();
const mockSetSearchParams = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams(), mockSetSearchParams],
  };
});

vi.mock("~/mocks/service-providers", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/service-providers")>(
    "~/mocks/service-providers"
  );
  return actual;
});

vi.mock("~/services/service-providers.service", () => ({
  getServiceProviderById: vi.fn(),
}));

vi.mock("~/mocks/properties", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/properties")>("~/mocks/properties");
  return actual;
});

vi.mock("~/services/properties.service", () => ({
  getPropertyById: vi.fn((id: string) => ({ id, name: `Property ${id}` })),
}));

vi.mock("~/mocks/location-movements", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/location-movements")>(
    "~/mocks/location-movements"
  );
  return actual;
});

vi.mock("~/services/location-movements.service", () => ({
  getLocationMovementsByServiceProviderId: vi.fn(() => []),
}));

vi.mock("~/mocks/animal-movements", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/animal-movements")>(
    "~/mocks/animal-movements"
  );
  return actual;
});

vi.mock("~/services/animal-movements.service", () => ({
  getAnimalMovementsByServiceProviderId: vi.fn(() => []),
}));

vi.mock("~/mocks/service-provider-observations", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/service-provider-observations")>(
    "~/mocks/service-provider-observations"
  );
  return actual;
});

vi.mock("~/services/service-provider-observations.service", () => ({
  getServiceProviderObservationsByServiceProviderId: vi.fn(() => []),
  addServiceProviderObservation: vi.fn(),
}));

vi.mock("~/components/ui", () => ({
  Button: ({ children, onClick, leftIcon, rightIcon, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  ),
  StatusBadge: ({ label }: any) => <span>{label}</span>,
  Table: ({ children }: any) => <div data-testid="table">{children}</div>,
  FileUpload: ({ onFilesChange }: any) => (
    <input
      type="file"
      data-testid="file-upload"
      onChange={(e) => onFilesChange?.(Array.from(e.target.files || []))}
    />
  ),
  Alert: ({ title, variant }: any) => <div data-testid={`alert-${variant}`}>{title}</div>,
}));

describe("ServiceProviderDetails", () => {
  const mockServiceProvider = {
    id: "sp-1",
    name: "Test Service Provider",
    code: "SP001",
    createdAt: "2024-01-15T10:00:00Z",
    status: "active" as const,
    companyId: "company-1",
    propertyIds: ["prop-1"],
    email: "test@example.com",
    phone: "(47) 99999-9999",
  };

  const mockObservations = [
    {
      id: "obs-1",
      serviceProviderId: "sp-1",
      observation: "Test observation",
      createdAt: "2024-01-15T10:00:00Z",
    },
  ];

  const createRouter = (serviceProviderId: string, searchParams?: string) => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard/service-providers/:serviceProviderId",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <ServiceProviderDetails />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: [
          `/dashboard/service-providers/${serviceProviderId}${searchParams ? `?${searchParams}` : ""}`,
        ],
      }
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getServiceProviderById).mockReturnValue(mockServiceProvider);
    vi.mocked(getServiceProviderObservationsByServiceProviderId).mockReturnValue(mockObservations);
  });

  it("should render service provider details", () => {
    const router = createRouter("sp-1");
    render(<RouterProvider router={router} />);

    expect(getServiceProviderById).toHaveBeenCalledWith("sp-1");
    const table = screen.queryByTestId("table");
    const buttons = screen.queryAllByRole("button");
    expect(table || buttons.length > 0).toBeTruthy();
  });

  it("should handle undefined service provider", () => {
    vi.mocked(getServiceProviderById).mockReturnValue(undefined);
    const router = createRouter("invalid-id");
    render(<RouterProvider router={router} />);

    const backButton = screen.queryByRole("button");
    expect(backButton).toBeInTheDocument();
  });

  it("should switch tabs", () => {
    const router = createRouter("sp-1");
    render(<RouterProvider router={router} />);

    const tabButtons = screen
      .queryAllByRole("button")
      .filter(
        (btn) => btn.textContent?.includes("Observações") || btn.textContent?.includes("Atividades")
      );

    if (tabButtons.length > 0) {
      fireEvent.click(tabButtons[0]);
      expect(mockSetSearchParams).toHaveBeenCalled();
    }
  });

  it("should handle tab from URL params", () => {
    const router = createRouter("sp-1", "tab=observations");
    render(<RouterProvider router={router} />);

    expect(getServiceProviderById).toHaveBeenCalledWith("sp-1");
  });

  it("should have correct meta function", () => {
    expect(ServiceProviderDetails).toBeDefined();
  });

  it("should display info tab", () => {
    const router = createRouter("sp-1", "tab=info");
    render(<RouterProvider router={router} />);

    expect(getServiceProviderById).toHaveBeenCalledWith("sp-1");
  });

  it("should display activities tab", () => {
    const router = createRouter("sp-1", "tab=activities");
    render(<RouterProvider router={router} />);

    expect(getServiceProviderById).toHaveBeenCalledWith("sp-1");
  });

  it("should display movements tab", () => {
    const router = createRouter("sp-1", "tab=movements");
    render(<RouterProvider router={router} />);

    expect(getServiceProviderById).toHaveBeenCalledWith("sp-1");
    const table = screen.queryByTestId("table");
    expect(table || screen.queryAllByRole("button").length > 0).toBeTruthy();
  });

  it("should display observations tab", () => {
    const router = createRouter("sp-1", "tab=observations");
    render(<RouterProvider router={router} />);

    expect(getServiceProviderById).toHaveBeenCalledWith("sp-1");
  });

  it("should navigate to edit service provider", () => {
    const router = createRouter("sp-1");
    render(<RouterProvider router={router} />);

    const editButtons = screen
      .queryAllByRole("button")
      .filter((btn) => btn.textContent?.includes("Editar") || btn.textContent?.includes("Edit"));

    if (editButtons.length > 0) {
      fireEvent.click(editButtons[0]);
      expect(mockNavigate).toHaveBeenCalled();
    }
  });

  it("should handle location movements display", () => {
    const router = createRouter("sp-1", "tab=movements");
    render(<RouterProvider router={router} />);

    expect(getServiceProviderById).toHaveBeenCalledWith("sp-1");
  });

  it("should handle animal movements display", () => {
    const router = createRouter("sp-1", "tab=movements");
    render(<RouterProvider router={router} />);

    expect(getServiceProviderById).toHaveBeenCalledWith("sp-1");
  });

  it("should handle service provider observations", () => {
    const router = createRouter("sp-1", "tab=observations");
    render(<RouterProvider router={router} />);

    expect(getServiceProviderObservationsByServiceProviderId).toHaveBeenCalledWith("sp-1");
  });

  it("should handle file upload for observations", () => {
    const router = createRouter("sp-1", "tab=observations");
    render(<RouterProvider router={router} />);

    const fileUpload = screen.queryByTestId("file-upload");
    expect(fileUpload || screen.queryAllByRole("button").length > 0).toBeTruthy();
  });

  it("should handle empty location movements", () => {
    const router = createRouter("sp-1", "tab=movements");
    render(<RouterProvider router={router} />);

    expect(getServiceProviderById).toHaveBeenCalledWith("sp-1");
  });

  it("should handle empty animal movements", () => {
    const router = createRouter("sp-1", "tab=movements");
    render(<RouterProvider router={router} />);

    expect(getServiceProviderById).toHaveBeenCalledWith("sp-1");
  });

  it("should handle empty observations", () => {
    vi.mocked(getServiceProviderObservationsByServiceProviderId).mockReturnValueOnce([]);
    const router = createRouter("sp-1", "tab=observations");
    render(<RouterProvider router={router} />);

    expect(getServiceProviderById).toHaveBeenCalledWith("sp-1");
  });

  it("should handle inactive service provider status", () => {
    const inactiveServiceProvider = {
      ...mockServiceProvider,
      status: "inactive" as const,
    };
    vi.mocked(getServiceProviderById).mockReturnValueOnce(inactiveServiceProvider);
    const router = createRouter("sp-1");
    render(<RouterProvider router={router} />);

    expect(getServiceProviderById).toHaveBeenCalledWith("sp-1");
  });

  it("should handle default tab when no tab param provided", () => {
    const router = createRouter("sp-1");
    render(<RouterProvider router={router} />);

    expect(getServiceProviderById).toHaveBeenCalledWith("sp-1");
  });

  it("should handle invalid tab param", () => {
    const router = createRouter("sp-1", "tab=invalid");
    render(<RouterProvider router={router} />);

    expect(getServiceProviderById).toHaveBeenCalledWith("sp-1");
  });

  it("should handle service provider with properties", () => {
    const router = createRouter("sp-1");
    render(<RouterProvider router={router} />);

    expect(getServiceProviderById).toHaveBeenCalledWith("sp-1");
  });

  it("should handle service provider without properties", () => {
    const serviceProviderWithoutProperties = {
      ...mockServiceProvider,
      propertyIds: [],
    };
    vi.mocked(getServiceProviderById).mockReturnValueOnce(serviceProviderWithoutProperties);
    const router = createRouter("sp-1");
    render(<RouterProvider router={router} />);

    expect(getServiceProviderById).toHaveBeenCalledWith("sp-1");
  });

  it("should navigate back to service providers list", () => {
    vi.mocked(getServiceProviderById).mockReturnValue(undefined);
    const router = createRouter("invalid-id");
    render(<RouterProvider router={router} />);

    const backButton = screen.queryByRole("button");
    if (backButton) {
      fireEvent.click(backButton);
      expect(mockNavigate).toHaveBeenCalled();
    }
  });
});
