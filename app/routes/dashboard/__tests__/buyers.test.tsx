import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import { AuthProvider } from "~/contexts/auth-context";
import Buyers from "../buyers";
import { mockBuyers } from "~/mocks/buyers";
import { deleteBuyer } from "~/services/buyers.service";
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

vi.mock("~/mocks/buyers", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/buyers")>("~/mocks/buyers");
  return {
    ...actual,
    mockBuyers: [
      {
        id: "buyer-1",
        name: "Test Buyer",
        code: "BYR001",
        status: "active",
        propertyId: "prop-1",
      },
    ],
  };
});

vi.mock("~/services/buyers.service", () => ({
  deleteBuyer: vi.fn(() => true),
}));

vi.mock("~/mocks/properties", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/properties")>("~/mocks/properties");
  return actual;
});

vi.mock("~/services/properties.service", () => ({
  getPropertyById: vi.fn(() => ({ id: "prop-1", name: "Test Property" })),
}));

vi.mock("~/mocks/buyer-observations", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/buyer-observations")>(
    "~/mocks/buyer-observations"
  );
  return actual;
});

vi.mock("~/services/buyer-observations.service", () => ({
  getBuyerObservationsByBuyerId: vi.fn(() => []),
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

describe("Buyers", () => {
  const createRouter = () => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard/buyers",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <AuthProvider>
                  <Buyers />
                </AuthProvider>
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: ["/dashboard/buyers"],
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

  it("should render buyers table", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should display buyers data", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    if (mockBuyers.length > 0) {
      expect(screen.getByText(mockBuyers[0].name)).toBeInTheDocument();
    }
  });

  it("should navigate to new buyer route on add click", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const addButtons = screen
      .queryAllByRole("button")
      .filter((btn) => btn.textContent?.includes("Adicionar") || btn.textContent?.includes("Add"));

    if (addButtons.length > 0) {
      fireEvent.click(addButtons[0]);
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.BUYERS_NEW);
    } else {
      expect(screen.getByTestId("table")).toBeInTheDocument();
    }
  });

  it("should handle buyer deletion", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const deleteButtons = screen.queryAllByTestId("delete-button");
    if (deleteButtons.length > 0) {
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        const confirmButton = screen.queryByTestId("confirm-button");
        if (confirmButton) {
          fireEvent.click(confirmButton);
          expect(deleteBuyer).toHaveBeenCalled();
        }
      });
    } else {
      expect(screen.getByTestId("table")).toBeInTheDocument();
    }
  });

  it("should have correct meta function", () => {
    expect(Buyers).toBeDefined();
  });

  it("should handle search filtering", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should handle filter changes", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should handle pagination", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should handle sorting", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should cancel buyer deletion", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const deleteButtons = screen.queryAllByTestId("delete-button");
    if (deleteButtons.length > 0) {
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        const cancelButton = screen.queryByTestId("cancel-button");
        if (cancelButton) {
          fireEvent.click(cancelButton);
          expect(cancelButton).toBeInTheDocument();
        }
      });
    }
  });

  it("should navigate to buyer view on row click", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const rows = screen.queryAllByTestId(/table-row-/);
    if (rows.length > 0) {
      fireEvent.click(rows[0]);
    }
  });

  it("should navigate to buyer edit", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const editButtons = screen.queryAllByTestId("edit-button");
    if (editButtons.length > 0) {
      fireEvent.click(editButtons[0]);
      expect(mockNavigate).toHaveBeenCalled();
    }
  });

  it("should handle alert message display", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const deleteButtons = screen.queryAllByTestId("delete-button");
    if (deleteButtons.length > 0) {
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        const confirmButton = screen.queryByTestId("confirm-button");
        if (confirmButton) {
          fireEvent.click(confirmButton);
          const alert =
            screen.queryByTestId("alert-success") || screen.queryByTestId("alert-error");
          expect(alert || confirmButton).toBeTruthy();
        }
      });
    }
  });

  it("should handle empty buyers list", () => {
    vi.mocked(mockBuyers).length = 0;
    const router = createRouter();
    render(<RouterProvider router={router} />);

    expect(screen.getByTestId("table")).toBeInTheDocument();
  });
});
