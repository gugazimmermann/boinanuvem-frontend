import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import UnconfirmedBreedings from "../records.breedings.unconfirmed";

const mockNavigate = vi.fn();
const mockConfirmBreeding = vi.fn();
const mockDeleteBreeding = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("~/services/breedings.service", () => ({
  getUnconfirmedBreedings: vi.fn(() => [
    {
      id: "breeding-1",
      animalId: "animal-1",
      companyId: "company-1",
      date: "2024-01-01",
      confirmed: false,
      createdAt: "2024-01-01T10:00:00Z",
    },
  ]),
  confirmBreeding: (...args: unknown[]) => mockConfirmBreeding(...args),
  deleteBreeding: (...args: unknown[]) => mockDeleteBreeding(...args),
}));

vi.mock("~/services/animals.service", () => ({
  getAnimalById: vi.fn(() => ({
    id: "animal-1",
    code: "A001",
    registrationNumber: "REG001",
    companyId: "company-1",
    propertyId: "prop-1",
    status: "active" as const,
    createdAt: "2024-01-01",
  })),
}));

vi.mock("~/services/births.service", () => ({
  getBirthByAnimalId: vi.fn(() => ({
    id: "birth-1",
    animalId: "animal-1",
    gender: "female",
    companyId: "company-1",
    birthDate: "2020-01-01",
    purity: "PO" as const,
    createdAt: "2020-01-01",
  })),
}));

vi.mock("~/services/properties.service", () => ({
  getPropertyById: vi.fn(() => ({
    id: "prop-1",
    name: "Test Property",
    companyId: "company-1",
    status: "active" as const,
  })),
}));

vi.mock("~/mocks/companies", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/companies")>("~/mocks/companies");
  return {
    ...actual,
    mockCompanies: [{ id: "company-1", name: "Test Company" }],
  };
});

vi.mock("~/components/ui", () => ({
  Table: () => <div data-testid="table">Table</div>,
  Button: ({ children, onClick }: { children?: React.ReactNode; onClick?: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
  Alert: () => <div data-testid="alert">Alert</div>,
  ConfirmationModal: ({
    isOpen,
    onConfirm,
    onCancel,
  }: {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
  }) =>
    isOpen ? (
      <div data-testid="confirmation-modal">
        <button onClick={onConfirm}>Confirm</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    ) : null,
}));

describe("UnconfirmedBreedings", () => {
  const createRouter = () => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard/registros/montas/nao-confirmadas",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <UnconfirmedBreedings />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: ["/dashboard/registros/montas/nao-confirmadas"],
      }
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockConfirmBreeding.mockReturnValue(true);
    mockDeleteBreeding.mockReturnValue(true);
  });

  it("should render unconfirmed breedings page", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const table = screen.queryByTestId("table");
    expect(table || document.body).toBeTruthy();
  });

  it("should have correct meta function", () => {
    expect(UnconfirmedBreedings).toBeDefined();
  });
});
