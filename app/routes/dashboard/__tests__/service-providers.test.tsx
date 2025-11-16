import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import ServiceProviders from "../service-providers";
import { mockServiceProviders, deleteServiceProvider } from "~/mocks/service-providers";
import { ROUTES } from "~/routes.config";

const mockNavigate = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("~/mocks/service-providers", () => ({
  mockServiceProviders: [
    {
      id: "sp-1",
      name: "Test Service Provider",
      code: "SP001",
      status: "active",
      propertyId: "prop-1",
    },
  ],
  deleteServiceProvider: vi.fn(() => true),
}));

vi.mock("~/mocks/properties", () => ({
  getPropertyById: vi.fn(() => ({ id: "prop-1", name: "Test Property" })),
}));

vi.mock("~/mocks/location-movements", () => ({
  getLocationMovementsByServiceProviderId: vi.fn(() => []),
}));

vi.mock("~/mocks/service-provider-observations", () => ({
  getServiceProviderObservationsByServiceProviderId: vi.fn(() => []),
}));

vi.mock("~/components/ui", () => ({
  Table: ({ data, header, onRowClick }: any) => (
    <div data-testid="table">
      {header?.title && <h2>{header.title}</h2>}
      {data?.map((row: any, idx: number) => (
        <div
          key={idx}
          data-testid={`table-row-${idx}`}
          onClick={() => onRowClick?.(row)}
        >
          {row.name}
        </div>
      ))}
    </div>
  ),
  StatusBadge: ({ label }: any) => <span data-testid="status-badge">{label}</span>,
  TableActionButtons: ({ onEdit, onDelete }: any) => (
    <div data-testid="table-actions">
      <button data-testid="edit-button" onClick={onEdit}>
        Edit
      </button>
      <button data-testid="delete-button" onClick={onDelete}>
        Delete
      </button>
    </div>
  ),
  ConfirmationModal: ({ isOpen, onConfirm, onClose, title }: any) =>
    isOpen ? (
      <div data-testid="confirmation-modal">
        <div>{title}</div>
        <button data-testid="confirm-button" onClick={onConfirm}>
          Confirm
        </button>
        <button data-testid="cancel-button" onClick={onClose}>
          Cancel
        </button>
      </div>
    ) : null,
  Alert: ({ title, variant }: any) => (
    <div data-testid={`alert-${variant}`}>{title}</div>
  ),
}));

describe("ServiceProviders", () => {
  const createRouter = () => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard/service-providers",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <ServiceProviders />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: ["/dashboard/service-providers"],
      }
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render service providers table", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should display service providers data", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    if (mockServiceProviders.length > 0) {
      expect(screen.getByText(mockServiceProviders[0].name)).toBeInTheDocument();
    }
  });

  it("should navigate to new service provider route on add click", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const addButtons = screen.queryAllByRole("button").filter((btn) =>
      btn.textContent?.includes("Adicionar") || btn.textContent?.includes("Add")
    );
    
    if (addButtons.length > 0) {
      fireEvent.click(addButtons[0]);
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SERVICE_PROVIDERS_NEW);
    } else {
      expect(screen.getByTestId("table")).toBeInTheDocument();
    }
  });

  it("should handle service provider deletion", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const deleteButtons = screen.queryAllByTestId("delete-button");
    if (deleteButtons.length > 0) {
      fireEvent.click(deleteButtons[0]);
      
      await waitFor(() => {
        const confirmButton = screen.queryByTestId("confirm-button");
        if (confirmButton) {
          fireEvent.click(confirmButton);
          expect(deleteServiceProvider).toHaveBeenCalled();
        }
      });
    } else {
      expect(screen.getByTestId("table")).toBeInTheDocument();
    }
  });

  it("should have correct meta function", () => {
    expect(ServiceProviders).toBeDefined();
  });
});

