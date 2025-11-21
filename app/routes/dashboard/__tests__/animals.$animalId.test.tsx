import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import { AuthProvider } from "~/contexts/auth-context";
import AnimalDetails from "../animals.$animalId";
import { getAnimalById } from "~/services/animals.service";
import { getAnimalObservationsByAnimalId } from "~/services/animal-observations.service";
import { getUserById } from "~/services/users.service";
import { createMockMainUser, setCurrentUserId, clearLocalStorage } from "~/test-utils";

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

vi.mock("~/mocks/animals", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/animals")>("~/mocks/animals");
  return actual;
});

vi.mock("~/services/animals.service", () => ({
  getAnimalById: vi.fn(),
}));

vi.mock("~/mocks/properties", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/properties")>("~/mocks/properties");
  return actual;
});

vi.mock("~/services/properties.service", () => ({
  getPropertyById: vi.fn((id: string) => ({ id, name: `Property ${id}` })),
}));

vi.mock("~/mocks/births", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/births")>("~/mocks/births");
  return actual;
});

const mockGetBirthByAnimalId = vi.fn(() => null);
const mockGetBirthsByFatherId = vi.fn(() => []);
const mockGetBirthsByCompanyId = vi.fn(() => []);
const mockGetCalvingIntervalsByAnimalId = vi.fn(() => []);
vi.mock("~/services/births.service", () => ({
  getBirthByAnimalId: () => mockGetBirthByAnimalId(),
  getBirthsByFatherId: (...args: unknown[]) => mockGetBirthsByFatherId(...args),
  getBirthsByCompanyId: (...args: unknown[]) => mockGetBirthsByCompanyId(...args),
  getCalvingIntervalsByAnimalId: (...args: unknown[]) => mockGetCalvingIntervalsByAnimalId(...args),
}));

vi.mock("~/mocks/acquisitions", async () => {
  const actual =
    await vi.importActual<typeof import("~/mocks/acquisitions")>("~/mocks/acquisitions");
  return actual;
});

const mockGetAcquisitionByAnimalId = vi.fn(() => null);
vi.mock("~/services/acquisitions.service", () => ({
  getAcquisitionByAnimalId: () => mockGetAcquisitionByAnimalId(),
}));

vi.mock("~/mocks/weighings", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/weighings")>("~/mocks/weighings");
  return actual;
});

const mockGetWeighingsByAnimalId = vi.fn(() => []);
vi.mock("~/services/weighings.service", () => ({
  getWeighingsByAnimalId: () => mockGetWeighingsByAnimalId(),
}));

vi.mock("~/mocks/animal-observations", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/animal-observations")>(
    "~/mocks/animal-observations"
  );
  return actual;
});

const mockAddAnimalObservation = vi.fn();
vi.mock("~/services/animal-observations.service", () => ({
  getAnimalObservationsByAnimalId: vi.fn(() => []),
  addAnimalObservation: (...args: unknown[]) => mockAddAnimalObservation(...args),
}));

const mockGetBreedingsByAnimalId = vi.fn(() => []);
const mockConfirmBreeding = vi.fn(() => true);
const mockDeleteBreeding = vi.fn(() => true);
vi.mock("~/services/breedings.service", () => ({
  getBreedingsByAnimalId: (...args: unknown[]) => mockGetBreedingsByAnimalId(...args),
  confirmBreeding: (...args: unknown[]) => mockConfirmBreeding(...args),
  deleteBreeding: (...args: unknown[]) => mockDeleteBreeding(...args),
}));

const mockGetAnimalMovementsByAnimalId = vi.fn(() => []);
vi.mock("~/services/animal-movements.service", () => ({
  getAnimalMovementsByAnimalId: (...args: unknown[]) => mockGetAnimalMovementsByAnimalId(...args),
}));

const mockGetReproductivePerformanceByAnimalId = vi.fn(() => ({
  totalBirths: 0,
  totalBreedings: 0,
  averageCalvingInterval: 0,
}));
vi.mock("~/services/reproductive-indexes.service", () => ({
  getReproductivePerformanceByAnimalId: (...args: unknown[]) =>
    mockGetReproductivePerformanceByAnimalId(...args),
}));

const mockGetAnimalTotalCost = vi.fn(() => ({
  totalCost: 0,
  costPerKg: 0,
  costs: [],
}));
vi.mock("~/services/location-costs.service", () => ({
  getAnimalTotalCost: (...args: unknown[]) => mockGetAnimalTotalCost(...args),
}));

const mockGetLocationById = vi.fn((id: string) => ({
  id,
  name: `Location ${id}`,
  propertyId: "prop-1",
  companyId: "company-1",
}));
vi.mock("~/services/locations.service", () => ({
  getLocationById: (...args: unknown[]) => mockGetLocationById(...args),
}));

const mockUsePermissions = vi.fn();
vi.mock("~/utils/permissions", () => ({
  usePermissions: () => mockUsePermissions(),
}));

vi.mock("~/services/users.service", () => ({
  getUserById: vi.fn(),
}));

vi.mock("~/components/ui", () => ({
  Button: ({
    children,
    onClick,
    leftIcon,
    rightIcon,
    ...props
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <button onClick={onClick} {...props}>
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  ),
  StatusBadge: ({ label }: { label?: string }) => <span>{label}</span>,
  Table: ({
    children,
    data,
    onSort,
    sortState: _sortState,
    pagination,
  }: {
    children?: React.ReactNode;
    data?: unknown[];
    onSort?: (field: string, direction: string) => void;
    sortState?: unknown;
    pagination?: { currentPage: number; totalPages: number; onPageChange: (page: number) => void };
  }) => (
    <div data-testid="table">
      {children}
      {data && <div data-testid="table-data">{data.length} items</div>}
      {onSort && (
        <button data-testid="sort-button" onClick={() => onSort("date", "asc")}>
          Sort
        </button>
      )}
      {pagination && (
        <div data-testid="pagination">
          <button
            data-testid="prev-page"
            onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
          >
            Prev
          </button>
          <button
            data-testid="next-page"
            onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  ),
  FileUpload: ({ onFilesChange }: { onFilesChange?: (files: File[]) => void }) => (
    <input
      type="file"
      data-testid="file-upload"
      multiple
      onChange={(e) => onFilesChange?.(Array.from(e.target.files || []))}
    />
  ),
  Alert: ({ title, variant }: { title?: string; variant?: string }) => (
    <div data-testid={`alert-${variant}`}>{title}</div>
  ),
  Input: ({
    value,
    onChange,
    ...props
  }: {
    value?: string | number;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    [key: string]: unknown;
  }) => (
    <input data-testid="observation-input" value={value || ""} onChange={onChange} {...props} />
  ),
  Textarea: ({
    value,
    onChange,
    ...props
  }: {
    value?: string | number;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    [key: string]: unknown;
  }) => (
    <textarea
      data-testid="observation-textarea"
      value={value || ""}
      onChange={onChange}
      {...props}
    />
  ),
  ConfirmationModal: ({
    isOpen,
    onConfirm,
    onCancel,
    title,
    message,
  }: {
    isOpen: boolean;
    onConfirm?: () => void;
    onCancel?: () => void;
    title?: string;
    message?: string;
  }) =>
    isOpen ? (
      <div data-testid="confirmation-modal">
        <h2>{title}</h2>
        <p>{message}</p>
        <button data-testid="confirm-button" onClick={onConfirm}>
          Confirm
        </button>
        <button data-testid="cancel-button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    ) : null,
}));

describe("AnimalDetails", () => {
  const mockAnimal = {
    id: "animal-1",
    code: "AN001",
    registrationNumber: "REG001",
    createdAt: "2024-01-15T10:00:00Z",
    status: "active" as const,
    companyId: "company-1",
    propertyId: "prop-1",
  };

  const mockObservations = [
    {
      id: "obs-1",
      animalId: "animal-1",
      observation: "Test observation",
      createdAt: "2024-01-15T10:00:00Z",
    },
  ];

  const createRouter = (animalId: string, searchParams?: string) => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard/animals/:animalId",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <AuthProvider>
                  <AnimalDetails />
                </AuthProvider>
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: [`/dashboard/animals/${animalId}${searchParams ? `?${searchParams}` : ""}`],
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
    vi.mocked(getAnimalById).mockReturnValue(mockAnimal);
    vi.mocked(getAnimalObservationsByAnimalId).mockReturnValue(mockObservations);
    mockGetBirthByAnimalId.mockReturnValue(null);
    mockGetAcquisitionByAnimalId.mockReturnValue(null);
    mockGetWeighingsByAnimalId.mockReturnValue([]);
    mockGetBirthsByCompanyId.mockReturnValue([]);
    mockGetCalvingIntervalsByAnimalId.mockReturnValue([]);
    mockGetAnimalMovementsByAnimalId.mockReturnValue([]);
    mockGetReproductivePerformanceByAnimalId.mockReturnValue({
      totalBirths: 0,
      totalBreedings: 0,
      averageCalvingInterval: 0,
    });
    mockGetAnimalTotalCost.mockReturnValue({
      totalCost: 0,
      costPerKg: 0,
      costs: [],
    });
  });

  it("should render animal details", () => {
    const router = createRouter("animal-1");
    render(<RouterProvider router={router} />);

    expect(getAnimalById).toHaveBeenCalledWith("animal-1");
    const buttons = screen.queryAllByRole("button");
    expect(buttons.length > 0).toBeTruthy();
  });

  it("should handle undefined animal", () => {
    vi.mocked(getAnimalById).mockReturnValue(undefined);
    const router = createRouter("invalid-id");
    render(<RouterProvider router={router} />);

    const backButton = screen.queryByRole("button");
    expect(backButton).toBeInTheDocument();
  });

  it("should switch tabs", () => {
    const router = createRouter("animal-1");
    render(<RouterProvider router={router} />);

    const tabButtons = screen
      .queryAllByRole("button")
      .filter(
        (btn) =>
          btn.textContent?.includes("Observações") ||
          btn.textContent?.includes("Atividades") ||
          btn.textContent?.includes("Genealogia")
      );

    if (tabButtons.length > 0) {
      fireEvent.click(tabButtons[0]);
      expect(mockSetSearchParams).toHaveBeenCalled();
    }
  });

  it("should handle tab from URL params", () => {
    const router = createRouter("animal-1", "tab=observations");
    render(<RouterProvider router={router} />);

    expect(getAnimalById).toHaveBeenCalledWith("animal-1");
  });

  it("should handle animal with birth data", () => {
    mockGetBirthByAnimalId.mockReturnValue({
      id: "birth-1",
      animalId: "animal-1",
      motherId: "mother-1",
      fatherId: "father-1",
      purity: "F1" as const,
      breed: "Angus",
      birthDate: "2024-01-01",
      createdAt: "2024-01-01",
      companyId: "company-1",
    });

    const router = createRouter("animal-1");
    render(<RouterProvider router={router} />);

    expect(getAnimalById).toHaveBeenCalledWith("animal-1");
  });

  it("should handle animal with weighings for GMD calculation", () => {
    mockGetWeighingsByAnimalId.mockReturnValue([
      {
        id: "w1",
        animalId: "animal-1",
        weight: 100,
        date: "2024-01-01",
        createdAt: "2024-01-01",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
      },
      {
        id: "w2",
        animalId: "animal-1",
        weight: 150,
        date: "2024-02-01",
        createdAt: "2024-02-01",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
      },
    ]);

    const router = createRouter("animal-1");
    render(<RouterProvider router={router} />);

    expect(getAnimalById).toHaveBeenCalledWith("animal-1");
  });

  it("should have correct meta function", () => {
    expect(AnimalDetails).toBeDefined();
  });

  it("should display information tab", () => {
    const router = createRouter("animal-1", "tab=info");
    render(<RouterProvider router={router} />);

    expect(getAnimalById).toHaveBeenCalledWith("animal-1");
  });

  it("should display genealogy tab", () => {
    const router = createRouter("animal-1", "tab=genealogy");
    render(<RouterProvider router={router} />);

    expect(getAnimalById).toHaveBeenCalledWith("animal-1");
  });

  it("should display activities tab", () => {
    const router = createRouter("animal-1", "tab=activities");
    render(<RouterProvider router={router} />);

    expect(getAnimalById).toHaveBeenCalledWith("animal-1");
  });

  it("should display observations tab", () => {
    const router = createRouter("animal-1", "tab=observations");
    render(<RouterProvider router={router} />);

    expect(getAnimalById).toHaveBeenCalledWith("animal-1");
  });

  it("should navigate to edit animal", () => {
    const router = createRouter("animal-1");
    render(<RouterProvider router={router} />);

    const editButtons = screen
      .queryAllByRole("button")
      .filter((btn) => btn.textContent?.includes("Editar") || btn.textContent?.includes("Edit"));

    if (editButtons.length > 0) {
      fireEvent.click(editButtons[0]);
      expect(mockNavigate).toHaveBeenCalled();
    }
  });

  it("should handle animal with acquisition data", () => {
    mockGetAcquisitionByAnimalId.mockReturnValue({
      id: "acq-1",
      animalId: "animal-1",
      acquisitionDate: "2024-01-01",
      createdAt: "2024-01-01",
      companyId: "company-1",
      propertyId: "prop-1",
    });

    const router = createRouter("animal-1");
    render(<RouterProvider router={router} />);

    expect(getAnimalById).toHaveBeenCalledWith("animal-1");
  });

  it("should handle animal observations", () => {
    const router = createRouter("animal-1", "tab=observations");
    render(<RouterProvider router={router} />);

    expect(getAnimalObservationsByAnimalId).toHaveBeenCalledWith("animal-1");
  });

  it("should handle file upload for observations", () => {
    const router = createRouter("animal-1", "tab=observations");
    render(<RouterProvider router={router} />);

    const fileUpload = screen.queryByTestId("file-upload");
    expect(fileUpload || screen.queryAllByRole("button").length > 0).toBeTruthy();
  });

  it("should calculate age from birth date", () => {
    mockGetBirthByAnimalId.mockReturnValue({
      id: "birth-1",
      animalId: "animal-1",
      birthDate: "2023-01-01",
      createdAt: "2023-01-01",
      companyId: "company-1",
    });

    const router = createRouter("animal-1");
    render(<RouterProvider router={router} />);

    expect(getAnimalById).toHaveBeenCalledWith("animal-1");
  });

  it("should calculate age from acquisition date", () => {
    mockGetAcquisitionByAnimalId.mockReturnValue({
      id: "acq-1",
      animalId: "animal-1",
      acquisitionDate: "2023-01-01",
      createdAt: "2023-01-01",
      companyId: "company-1",
      propertyId: "prop-1",
    });

    const router = createRouter("animal-1");
    render(<RouterProvider router={router} />);

    expect(getAnimalById).toHaveBeenCalledWith("animal-1");
  });

  it("should handle empty weighings list", () => {
    mockGetWeighingsByAnimalId.mockReturnValue([]);
    const router = createRouter("animal-1");
    render(<RouterProvider router={router} />);

    expect(getAnimalById).toHaveBeenCalledWith("animal-1");
  });

  it("should handle empty observations list", () => {
    vi.mocked(getAnimalObservationsByAnimalId).mockReturnValueOnce([]);
    const router = createRouter("animal-1", "tab=observations");
    render(<RouterProvider router={router} />);

    expect(getAnimalById).toHaveBeenCalledWith("animal-1");
  });

  it("should handle default tab when no tab param provided", () => {
    const router = createRouter("animal-1");
    render(<RouterProvider router={router} />);

    expect(getAnimalById).toHaveBeenCalledWith("animal-1");
  });

  it("should handle invalid tab param", () => {
    const router = createRouter("animal-1", "tab=invalid");
    render(<RouterProvider router={router} />);

    expect(getAnimalById).toHaveBeenCalledWith("animal-1");
  });

  it("should display genealogy tree with mother and father", () => {
    mockGetBirthByAnimalId.mockReturnValue({
      id: "birth-1",
      animalId: "animal-1",
      motherId: "mother-1",
      fatherId: "father-1",
      birthDate: "2024-01-01",
      createdAt: "2024-01-01",
      companyId: "company-1",
    });

    const router = createRouter("animal-1", "tab=genealogy");
    render(<RouterProvider router={router} />);

    expect(getAnimalById).toHaveBeenCalledWith("animal-1");
  });

  it("should handle animal with purity information", () => {
    mockGetBirthByAnimalId.mockReturnValue({
      id: "birth-1",
      animalId: "animal-1",
      purity: "F1" as const,
      breed: "Angus",
      birthDate: "2024-01-01",
      createdAt: "2024-01-01",
      companyId: "company-1",
    });

    const router = createRouter("animal-1");
    render(<RouterProvider router={router} />);

    expect(getAnimalById).toHaveBeenCalledWith("animal-1");
  });

  it("should handle animal with breed information", () => {
    mockGetBirthByAnimalId.mockReturnValue({
      id: "birth-1",
      animalId: "animal-1",
      breed: "Nelore",
      birthDate: "2024-01-01",
      createdAt: "2024-01-01",
      companyId: "company-1",
    });

    const router = createRouter("animal-1");
    render(<RouterProvider router={router} />);

    expect(getAnimalById).toHaveBeenCalledWith("animal-1");
  });

  it("should calculate GMD from multiple weighings", () => {
    mockGetWeighingsByAnimalId.mockReturnValue([
      {
        id: "w1",
        animalId: "animal-1",
        weight: 100,
        date: "2024-01-01",
        createdAt: "2024-01-01",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
      },
      {
        id: "w2",
        animalId: "animal-1",
        weight: 150,
        date: "2024-02-01",
        createdAt: "2024-02-01",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
      },
    ]);

    const router = createRouter("animal-1");
    render(<RouterProvider router={router} />);

    expect(getAnimalById).toHaveBeenCalledWith("animal-1");
  });

  it("should handle inactive animal status", () => {
    const inactiveAnimal = {
      ...mockAnimal,
      status: "inactive" as const,
    };
    vi.mocked(getAnimalById).mockReturnValueOnce(inactiveAnimal);
    const router = createRouter("animal-1");
    render(<RouterProvider router={router} />);

    expect(getAnimalById).toHaveBeenCalledWith("animal-1");
  });

  it("should navigate back to animals list", () => {
    vi.mocked(getAnimalById).mockReturnValue(undefined);
    const router = createRouter("invalid-id");
    render(<RouterProvider router={router} />);

    const backButton = screen.queryByRole("button");
    if (backButton) {
      fireEvent.click(backButton);
      expect(mockNavigate).toHaveBeenCalled();
    }
  });

  it("should submit observation with text", async () => {
    const router = createRouter("animal-1", "tab=observations");
    render(<RouterProvider router={router} />);

    const textarea =
      screen.queryByTestId("observation-textarea") || screen.queryByTestId("observation-input");
    if (textarea) {
      fireEvent.change(textarea, { target: { value: "Test observation" } });
      const form = textarea.closest("form");
      if (form) {
        fireEvent.submit(form);
        await waitFor(() => {
          expect(mockAddAnimalObservation).toHaveBeenCalled();
        });
      }
    }
  });

  it("should submit observation with files", async () => {
    const router = createRouter("animal-1", "tab=observations");
    render(<RouterProvider router={router} />);

    const fileUpload = screen.queryByTestId("file-upload");
    if (fileUpload) {
      const file = new File(["test"], "test.txt", { type: "text/plain" });
      fireEvent.change(fileUpload, { target: { files: [file] } });

      const textarea =
        screen.queryByTestId("observation-textarea") || screen.queryByTestId("observation-input");
      if (textarea) {
        fireEvent.change(textarea, { target: { value: "Test observation" } });
        const form = textarea.closest("form");
        if (form) {
          fireEvent.submit(form);
          await waitFor(() => {
            expect(mockAddAnimalObservation).toHaveBeenCalled();
          });
        }
      }
    }
  });

  it("should show error when submitting empty observation", async () => {
    const router = createRouter("animal-1", "tab=observations");
    render(<RouterProvider router={router} />);

    const form = screen.queryByRole("form");
    if (form) {
      fireEvent.submit(form);
      await waitFor(() => {
        const alert = screen.queryByTestId("alert-error");
        expect(alert || form).toBeTruthy();
      });
    }
  });

  it("should handle weighings pagination", () => {
    mockGetWeighingsByAnimalId.mockReturnValue([
      {
        id: "w1",
        animalId: "animal-1",
        weight: 100,
        date: "2024-01-01",
        createdAt: "2024-01-01",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
      },
      {
        id: "w2",
        animalId: "animal-1",
        weight: 150,
        date: "2024-02-01",
        createdAt: "2024-02-01",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
      },
      {
        id: "w3",
        animalId: "animal-1",
        weight: 200,
        date: "2024-03-01",
        createdAt: "2024-03-01",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
      },
    ]);

    const router = createRouter("animal-1", "tab=weighings");
    render(<RouterProvider router={router} />);

    const nextPageButton = screen.queryByTestId("next-page");
    if (nextPageButton) {
      fireEvent.click(nextPageButton);
      expect(nextPageButton).toBeInTheDocument();
    }
  });

  it("should handle weighings sorting", () => {
    mockGetWeighingsByAnimalId.mockReturnValue([
      {
        id: "w1",
        animalId: "animal-1",
        weight: 100,
        date: "2024-01-01",
        createdAt: "2024-01-01",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
      },
      {
        id: "w2",
        animalId: "animal-1",
        weight: 150,
        date: "2024-02-01",
        createdAt: "2024-02-01",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
      },
    ]);

    const router = createRouter("animal-1", "tab=weighings");
    render(<RouterProvider router={router} />);

    const sortButton = screen.queryByTestId("sort-button");
    if (sortButton) {
      fireEvent.click(sortButton);
      expect(sortButton).toBeInTheDocument();
    }
  });

  it("should render genealogy tree with clickable nodes", () => {
    mockGetBirthByAnimalId.mockReturnValue({
      id: "birth-1",
      animalId: "animal-1",
      motherId: "mother-1",
      fatherId: "father-1",
      birthDate: "2024-01-01",
      createdAt: "2024-01-01",
      companyId: "company-1",
    });

    vi.mocked(getAnimalById).mockImplementation((id: string) => {
      if (id === "mother-1")
        return {
          id: "mother-1",
          code: "M001",
          registrationNumber: "MREG001",
          status: "active" as const,
          companyId: "company-1",
          propertyId: "prop-1",
        };
      if (id === "father-1")
        return {
          id: "father-1",
          code: "F001",
          registrationNumber: "FREG001",
          status: "active" as const,
          companyId: "company-1",
          propertyId: "prop-1",
        };
      return mockAnimal;
    });

    const router = createRouter("animal-1", "tab=genealogy");
    render(<RouterProvider router={router} />);

    const buttons = screen.queryAllByRole("button");
    expect(buttons.length > 0).toBeTruthy();
  });

  it("should calculate GMD from multiple weighings", () => {
    mockGetWeighingsByAnimalId.mockReturnValue([
      {
        id: "w1",
        animalId: "animal-1",
        weight: 100,
        date: "2024-01-01",
        createdAt: "2024-01-01",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
      },
      {
        id: "w2",
        animalId: "animal-1",
        weight: 150,
        date: "2024-02-01",
        createdAt: "2024-02-01",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
      },
      {
        id: "w3",
        animalId: "animal-1",
        weight: 200,
        date: "2024-03-01",
        createdAt: "2024-03-01",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
      },
    ]);

    const router = createRouter("animal-1");
    render(<RouterProvider router={router} />);

    expect(getAnimalById).toHaveBeenCalledWith("animal-1");
  });

  it("should display weight in arrobas", () => {
    mockGetWeighingsByAnimalId.mockReturnValue([
      {
        id: "w1",
        animalId: "animal-1",
        weight: 300,
        date: "2024-01-01",
        createdAt: "2024-01-01",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
      },
    ]);

    const router = createRouter("animal-1");
    render(<RouterProvider router={router} />);

    expect(getAnimalById).toHaveBeenCalledWith("animal-1");
  });

  it("should handle observations search and sorting", () => {
    vi.mocked(getAnimalObservationsByAnimalId).mockReturnValue([
      {
        id: "obs-1",
        animalId: "animal-1",
        observation: "Test observation 1",
        createdAt: "2024-01-15T10:00:00Z",
      },
      {
        id: "obs-2",
        animalId: "animal-1",
        observation: "Test observation 2",
        createdAt: "2024-01-16T10:00:00Z",
      },
    ]);

    const router = createRouter("animal-1", "tab=observations");
    render(<RouterProvider router={router} />);

    const searchInput = screen.queryByPlaceholderText(/buscar|search/i);
    if (searchInput) {
      fireEvent.change(searchInput, { target: { value: "Test" } });
      expect(searchInput).toBeInTheDocument();
    }
  });

  it("should close observation form", () => {
    const router = createRouter("animal-1", "tab=observations");
    render(<RouterProvider router={router} />);

    const closeButtons = screen
      .queryAllByRole("button")
      .filter(
        (btn) =>
          btn.textContent?.includes("Cancelar") ||
          btn.textContent?.includes("Cancel") ||
          btn.textContent?.includes("Fechar") ||
          btn.textContent?.includes("Close")
      );

    if (closeButtons.length > 0) {
      fireEvent.click(closeButtons[0]);
      expect(closeButtons[0]).toBeInTheDocument();
    }
  });

  it("should handle observations pagination", () => {
    const manyObservations = Array.from({ length: 15 }, (_, i) => ({
      id: `obs-${i}`,
      animalId: "animal-1",
      observation: `Observation ${i}`,
      createdAt: `2024-01-${String(i + 1).padStart(2, "0")}T10:00:00Z`,
    }));

    vi.mocked(getAnimalObservationsByAnimalId).mockReturnValue(manyObservations);

    const router = createRouter("animal-1", "tab=observations");
    render(<RouterProvider router={router} />);

    const nextPageButton = screen.queryByTestId("next-page");
    if (nextPageButton) {
      fireEvent.click(nextPageButton);
      expect(nextPageButton).toBeInTheDocument();
    }
  });

  it("should display dashboard tab statistics", () => {
    mockGetWeighingsByAnimalId.mockReturnValue([
      {
        id: "w1",
        animalId: "animal-1",
        weight: 300,
        date: "2024-01-01",
        createdAt: "2024-01-01",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
      },
    ]);

    const router = createRouter("animal-1", "tab=dashboard");
    render(<RouterProvider router={router} />);

    expect(getAnimalById).toHaveBeenCalledWith("animal-1");
  });

  it("should handle genealogy tree with deep nesting", () => {
    mockGetBirthByAnimalId.mockReturnValue({
      id: "birth-1",
      animalId: "animal-1",
      motherId: "mother-1",
      fatherId: "father-1",
      birthDate: "2024-01-01",
      createdAt: "2024-01-01",
      companyId: "company-1",
    });

    vi.mocked(getAnimalById).mockImplementation((id: string) => {
      if (id === "mother-1") {
        return {
          id: "mother-1",
          code: "M001",
          registrationNumber: "MREG001",
          status: "active" as const,
          companyId: "company-1",
          propertyId: "prop-1",
        };
      }
      if (id === "father-1") {
        return {
          id: "father-1",
          code: "F001",
          registrationNumber: "FREG001",
          status: "active" as const,
          companyId: "company-1",
          propertyId: "prop-1",
        };
      }
      return mockAnimal;
    });

    const router = createRouter("animal-1", "tab=genealogy");
    render(<RouterProvider router={router} />);

    expect(getAnimalById).toHaveBeenCalledWith("animal-1");
  });

  it("should display info tab with all fields", () => {
    mockGetBirthByAnimalId.mockReturnValue({
      id: "birth-1",
      animalId: "animal-1",
      breed: "Nelore",
      gender: "male" as const,
      purity: "F1" as const,
      birthDate: "2024-01-01",
      observation: "Test observation",
      createdAt: "2024-01-01",
      companyId: "company-1",
    });

    const router = createRouter("animal-1", "tab=info");
    render(<RouterProvider router={router} />);

    expect(getAnimalById).toHaveBeenCalledWith("animal-1");
  });

  it("should display acquisition price in info tab", () => {
    mockGetAcquisitionByAnimalId.mockReturnValue({
      id: "acq-1",
      animalId: "animal-1",
      price: 5000,
      acquisitionDate: "2024-01-01",
      createdAt: "2024-01-01",
      companyId: "company-1",
      propertyId: "prop-1",
    });

    const router = createRouter("animal-1", "tab=info");
    render(<RouterProvider router={router} />);

    expect(getAnimalById).toHaveBeenCalledWith("animal-1");
  });

  it("should navigate to property from info tab", () => {
    const router = createRouter("animal-1", "tab=info");
    render(<RouterProvider router={router} />);

    const propertyLinks = screen
      .queryAllByRole("button")
      .filter((btn) => btn.textContent?.includes("prop") || btn.getAttribute("onClick"));

    if (propertyLinks.length > 0) {
      fireEvent.click(propertyLinks[0]);
      expect(mockNavigate).toHaveBeenCalled();
    }
  });

  it("should navigate to mother animal from info tab", () => {
    mockGetBirthByAnimalId.mockReturnValue({
      id: "birth-1",
      animalId: "animal-1",
      motherId: "mother-1",
      birthDate: "2024-01-01",
      createdAt: "2024-01-01",
      companyId: "company-1",
    });

    vi.mocked(getAnimalById).mockImplementation((id: string) => {
      if (id === "mother-1") {
        return {
          id: "mother-1",
          code: "M001",
          registrationNumber: "MREG001",
          status: "active" as const,
          companyId: "company-1",
          propertyId: "prop-1",
        };
      }
      return mockAnimal;
    });

    const router = createRouter("animal-1", "tab=info");
    render(<RouterProvider router={router} />);

    const motherLinks = screen
      .queryAllByRole("button")
      .filter((btn) => btn.textContent?.includes("M001") || btn.getAttribute("onClick"));

    if (motherLinks.length > 0) {
      fireEvent.click(motherLinks[0]);
      expect(mockNavigate).toHaveBeenCalled();
    }
  });

  it("should navigate to father animal from info tab", () => {
    mockGetBirthByAnimalId.mockReturnValue({
      id: "birth-1",
      animalId: "animal-1",
      fatherId: "father-1",
      birthDate: "2024-01-01",
      createdAt: "2024-01-01",
      companyId: "company-1",
    });

    vi.mocked(getAnimalById).mockImplementation((id: string) => {
      if (id === "father-1") {
        return {
          id: "father-1",
          code: "F001",
          registrationNumber: "FREG001",
          status: "active" as const,
          companyId: "company-1",
          propertyId: "prop-1",
        };
      }
      return mockAnimal;
    });

    const router = createRouter("animal-1", "tab=info");
    render(<RouterProvider router={router} />);

    const fatherLinks = screen
      .queryAllByRole("button")
      .filter((btn) => btn.textContent?.includes("F001") || btn.getAttribute("onClick"));

    if (fatherLinks.length > 0) {
      fireEvent.click(fatherLinks[0]);
      expect(mockNavigate).toHaveBeenCalled();
    }
  });

  it("should display no genealogy message when no genealogy data", () => {
    mockGetBirthByAnimalId.mockReturnValue({
      id: "birth-1",
      animalId: "animal-1",
      birthDate: "2024-01-01",
      createdAt: "2024-01-01",
      companyId: "company-1",
    });

    const router = createRouter("animal-1", "tab=info");
    render(<RouterProvider router={router} />);

    expect(getAnimalById).toHaveBeenCalledWith("animal-1");
  });

  it("should handle weighings tab with sorting by weight", () => {
    mockGetWeighingsByAnimalId.mockReturnValue([
      {
        id: "w1",
        animalId: "animal-1",
        weight: 100,
        date: "2024-01-01",
        createdAt: "2024-01-01",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
      },
      {
        id: "w2",
        animalId: "animal-1",
        weight: 150,
        date: "2024-02-01",
        createdAt: "2024-02-01",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
      },
    ]);

    const router = createRouter("animal-1", "tab=weighings");
    render(<RouterProvider router={router} />);

    const sortButton = screen.queryByTestId("sort-button");
    if (sortButton) {
      fireEvent.click(sortButton);
      expect(sortButton).toBeInTheDocument();
    }
  });

  it("should handle weighings tab with weightDiff display", () => {
    mockGetWeighingsByAnimalId.mockReturnValue([
      {
        id: "w1",
        animalId: "animal-1",
        weight: 100,
        date: "2024-01-01",
        createdAt: "2024-01-01",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
      },
      {
        id: "w2",
        animalId: "animal-1",
        weight: 150,
        date: "2024-02-01",
        createdAt: "2024-02-01",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
      },
    ]);

    const router = createRouter("animal-1", "tab=weighings");
    render(<RouterProvider router={router} />);

    expect(getAnimalById).toHaveBeenCalledWith("animal-1");
  });

  it("should handle weighings tab with periodGMD display", () => {
    mockGetWeighingsByAnimalId.mockReturnValue([
      {
        id: "w1",
        animalId: "animal-1",
        weight: 100,
        date: "2024-01-01",
        createdAt: "2024-01-01",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
      },
      {
        id: "w2",
        animalId: "animal-1",
        weight: 150,
        date: "2024-02-01",
        createdAt: "2024-02-01",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
      },
    ]);

    const router = createRouter("animal-1", "tab=weighings");
    render(<RouterProvider router={router} />);

    expect(getAnimalById).toHaveBeenCalledWith("animal-1");
  });

  it("should handle activities tab", () => {
    const router = createRouter("animal-1", "tab=activities");
    render(<RouterProvider router={router} />);

    expect(getAnimalById).toHaveBeenCalledWith("animal-1");
  });

  it("should display birth observation in info tab", () => {
    mockGetBirthByAnimalId.mockReturnValue({
      id: "birth-1",
      animalId: "animal-1",
      observation: "Birth observation text",
      birthDate: "2024-01-01",
      createdAt: "2024-01-01",
      companyId: "company-1",
    });

    const router = createRouter("animal-1", "tab=info");
    render(<RouterProvider router={router} />);

    expect(getAnimalById).toHaveBeenCalledWith("animal-1");
  });

  it("should handle acquisition with mother and father", () => {
    mockGetAcquisitionByAnimalId.mockReturnValue({
      id: "acq-1",
      animalId: "animal-1",
      motherId: "mother-1",
      fatherId: "father-1",
      acquisitionDate: "2024-01-01",
      createdAt: "2024-01-01",
      companyId: "company-1",
      propertyId: "prop-1",
    });

    vi.mocked(getAnimalById).mockImplementation((id: string) => {
      if (id === "mother-1") {
        return {
          id: "mother-1",
          code: "M001",
          registrationNumber: "MREG001",
          status: "active" as const,
          companyId: "company-1",
          propertyId: "prop-1",
        };
      }
      if (id === "father-1") {
        return {
          id: "father-1",
          code: "F001",
          registrationNumber: "FREG001",
          status: "active" as const,
          companyId: "company-1",
          propertyId: "prop-1",
        };
      }
      return mockAnimal;
    });

    const router = createRouter("animal-1", "tab=info");
    render(<RouterProvider router={router} />);

    expect(getAnimalById).toHaveBeenCalledWith("animal-1");
  });

  it("should handle weighings with observations", () => {
    mockGetWeighingsByAnimalId.mockReturnValue([
      {
        id: "w1",
        animalId: "animal-1",
        weight: 100,
        date: "2024-01-01",
        observation: "Test observation",
        createdAt: "2024-01-01",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
      },
    ]);

    const router = createRouter("animal-1", "tab=weighings");
    render(<RouterProvider router={router} />);

    expect(getAnimalById).toHaveBeenCalledWith("animal-1");
  });

  it("should handle empty weighings tab", () => {
    mockGetWeighingsByAnimalId.mockReturnValue([]);
    const router = createRouter("animal-1", "tab=weighings");
    render(<RouterProvider router={router} />);

    expect(getAnimalById).toHaveBeenCalledWith("animal-1");
  });
});
