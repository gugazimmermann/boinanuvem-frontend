import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import { AuthProvider } from "~/contexts/auth-context";
import BankAccounts from "../dashboard/bank-accounts";
import { getUserById } from "~/services/users.service";
import { createMockMainUser, setCurrentUserId, clearLocalStorage } from "~/test-utils";

vi.mock("~/components/ui", () => ({
  Table: () => <div data-testid="table">Table</div>,
  StatusBadge: () => <div data-testid="status-badge">StatusBadge</div>,
  TableActionButtons: () => <div data-testid="table-action-buttons">TableActionButtons</div>,
  ConfirmationModal: () => <div data-testid="confirmation-modal">ConfirmationModal</div>,
  Alert: () => <div data-testid="alert">Alert</div>,
}));

vi.mock("~/mocks/companies", () => ({
  mockCompanies: [
    {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Test Company",
    },
  ],
}));

vi.mock("~/services/bank-account.service", () => ({
  getBankAccountsByCompanyId: vi.fn(() => []),
  deleteBankAccount: vi.fn(() => true),
}));

const mockUsePermissions = vi.fn();
vi.mock("~/utils/permissions", () => ({
  usePermissions: () => mockUsePermissions(),
}));

vi.mock("~/services/users.service", () => ({
  getUserById: vi.fn(),
}));

describe("BankAccounts", () => {
  const createRouter = () => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard/bank-accounts",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <AuthProvider>
                  <BankAccounts />
                </AuthProvider>
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: ["/dashboard/bank-accounts"],
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

  it("should render bank accounts table", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    expect(screen.getByTestId("table")).toBeInTheDocument();
  });
});
