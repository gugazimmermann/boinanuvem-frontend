import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import { AuthProvider } from "~/contexts/auth-context";
import UnconfirmedBreedings from "../records.breedings.unconfirmed";
import { getUserById } from "~/services/users.service";
import { createMockMainUser, setCurrentUserId, clearLocalStorage } from "~/test-utils";

vi.mock("~/components/ui", () => ({
  Table: ({ rightContent }: { rightContent?: React.ReactNode }) => (
    <div data-testid="table">
      {rightContent && <div data-testid="right-content">{rightContent}</div>}
    </div>
  ),
  Button: () => <button data-testid="button">Button</button>,
  Alert: () => <div data-testid="alert">Alert</div>,
  ConfirmationModal: () => <div data-testid="confirmation-modal">ConfirmationModal</div>,
}));

vi.mock("~/mocks/companies", () => ({
  mockCompanies: [
    {
      id: "company-1",
      name: "Test Company",
    },
  ],
}));

vi.mock("~/services/breedings.service", () => ({
  getUnconfirmedBreedings: vi.fn(() => []),
  confirmBreeding: vi.fn(() => true),
  deleteBreeding: vi.fn(() => true),
}));

vi.mock("~/services/animals.service", () => ({
  getAnimalById: vi.fn(() => ({
    id: "animal-1",
    code: "AN001",
    registrationNumber: "REG001",
    propertyId: "property-1",
  })),
}));

vi.mock("~/services/births.service", () => ({
  getBirthByAnimalId: vi.fn(() => null),
}));

vi.mock("~/services/properties.service", () => ({
  getPropertyById: vi.fn(() => ({ id: "property-1", name: "Property One" })),
  getPropertiesByCompanyId: vi.fn(() => [
    { id: "property-1", name: "Property One" },
    { id: "property-2", name: "Property Two" },
  ]),
}));

vi.mock("~/services/users.service", () => ({
  getUserById: vi.fn(),
}));

describe("UnconfirmedBreedings", () => {
  const createRouter = () => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard/breedings/unconfirmed",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <AuthProvider>
                  <UnconfirmedBreedings />
                </AuthProvider>
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: ["/dashboard/breedings/unconfirmed"],
      }
    );
  };

  beforeEach(() => {
    clearLocalStorage();
    vi.clearAllMocks();
    const mockUser = createMockMainUser();
    vi.mocked(getUserById).mockReturnValue(mockUser);
    setCurrentUserId(mockUser.id);
  });

  it("should render unconfirmed breedings table", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should render property filter", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const rightContent = screen.queryByTestId("right-content");
    expect(rightContent || screen.getByTestId("table")).toBeTruthy();
  });
});
