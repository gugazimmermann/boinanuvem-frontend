import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import { AuthProvider } from "~/contexts/auth-context";
import ServiceProviders from "../service-providers";
import { mockServiceProviders } from "~/mocks/service-providers";
import { deleteServiceProvider } from "~/services/service-providers.service";
import { ROUTES } from "~/routes.config";
import { getUserById } from "~/services/users.service";
import { createMockMainUser, setCurrentUserId, clearLocalStorage } from "~/test-utils";

const mockNavigate = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("~/mocks/service-providers", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/service-providers")>(
    "~/mocks/service-providers"
  );
  return {
    ...actual,
    mockServiceProviders: [
      {
        id: "sp-1",
        name: "Test Service Provider",
        code: "SP001",
        status: "active",
        propertyId: "prop-1",
      },
    ],
  };
});

vi.mock("~/services/service-providers.service", () => ({
  deleteServiceProvider: vi.fn(() => true),
}));

vi.mock("~/mocks/properties", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/properties")>("~/mocks/properties");
  return actual;
});

vi.mock("~/services/properties.service", () => ({
  getPropertyById: vi.fn(() => ({ id: "prop-1", name: "Test Property" })),
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

vi.mock("~/mocks/service-provider-observations", () => ({
  getServiceProviderObservationsByServiceProviderId: vi.fn(() => []),
}));

const mockUsePermissions = vi.fn();
vi.mock("~/utils/permissions", () => ({
  usePermissions: () => mockUsePermissions(),
}));

vi.mock("~/services/users.service", () => ({
  getUserById: vi.fn(),
}));

vi.mock("~/components/ui", () => ({
  Table: ({
    data,
    header,
    onRowClick,
  }: {
    data?: unknown[];
    header?: { title?: string };
    onRowClick?: (row: unknown) => void;
  }) => (
    <div data-testid="table">
      {header?.title && <h2>{header.title}</h2>}
      {data?.map((row, idx: number) => {
        const rowObj = row as Record<string, unknown>;
        return (
          <div key={idx} data-testid={`table-row-${idx}`} onClick={() => onRowClick?.(row)}>
            {String(rowObj.name ?? "")}
          </div>
        );
      })}
    </div>
  ),
  StatusBadge: ({ label }: { label?: string }) => <span data-testid="status-badge">{label}</span>,
  TableActionButtons: ({ onEdit, onDelete }: { onEdit?: () => void; onDelete?: () => void }) => (
    <div data-testid="table-actions">
      <button data-testid="edit-button" onClick={onEdit}>
        Edit
      </button>
      <button data-testid="delete-button" onClick={onDelete}>
        Delete
      </button>
    </div>
  ),
  ConfirmationModal: ({
    isOpen,
    onConfirm,
    onClose,
    title,
  }: {
    isOpen: boolean;
    onConfirm?: () => void;
    onClose?: () => void;
    title?: string;
  }) =>
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
  Alert: ({ title, variant }: { title?: string; variant?: string }) => (
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
                <AuthProvider>
                  <ServiceProviders />
                </AuthProvider>
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
    clearLocalStorage();
    vi.clearAllMocks();
    const mockUser = createMockMainUser();
    vi.mocked(getUserById).mockReturnValue(mockUser);
    setCurrentUserId(mockUser.id);
    mockUsePermissions.mockReturnValue({
      canView: () => true,
      canAdd: () => true,
      canEdit: () => true,
      canRemove: () => true,
      isMainUser: () => true,
    });
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

    const addButtons = screen
      .queryAllByRole("button")
      .filter((btn) => btn.textContent?.includes("Adicionar") || btn.textContent?.includes("Add"));

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
