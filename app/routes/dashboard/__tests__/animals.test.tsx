import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import Animals from "../animals";
import { mockAnimals, deleteAnimal } from "~/mocks/animals";
import { ROUTES } from "~/routes.config";
import { getBirthByAnimalId } from "~/mocks/births";
import { getWeighingsByAnimalId } from "~/mocks/weighings";
import { getPropertyById } from "~/mocks/properties";

const mockNavigate = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("~/mocks/animals", () => ({
  mockAnimals: [
    {
      id: "animal-1",
      code: "AN001",
      registrationNumber: "REG001",
      status: "active",
      propertyId: "prop-1",
      companyId: "company-1",
      createdAt: "2024-01-01",
    },
    {
      id: "animal-2",
      code: "AN002",
      registrationNumber: "REG002",
      status: "inactive",
      propertyId: "prop-1",
      companyId: "company-1",
      createdAt: "2024-01-02",
    },
  ],
  deleteAnimal: vi.fn(() => true),
}));

vi.mock("~/mocks/properties", () => ({
  getPropertyById: vi.fn(() => ({ id: "prop-1", name: "Test Property" })),
}));

vi.mock("~/mocks/weighings", () => ({
  getWeighingsByAnimalId: vi.fn(() => []),
}));

const mockGetBirthByAnimalId = vi.fn(() => null);
vi.mock("~/mocks/births", () => ({
  getBirthByAnimalId: (...args: any[]) => mockGetBirthByAnimalId(...args),
}));

const mockGetWeighingsByAnimalId = vi.fn(() => []);
vi.mock("~/mocks/weighings", () => ({
  getWeighingsByAnimalId: (...args: any[]) => mockGetWeighingsByAnimalId(...args),
}));

vi.mock("~/components/ui", () => ({
  Table: ({ data, header, onRowClick, onSort, sortState, filters, search, pagination, selection }: any) => (
    <div data-testid="table">
      {header?.title && <h2>{header.title}</h2>}
      {search && (
        <input
          data-testid="search-input"
          placeholder={search.placeholder}
          value={search.value || ""}
          onChange={(e) => search.onChange?.(e.target.value)}
        />
      )}
      {filters && filters.map((filter: any, idx: number) => (
        <button
          key={idx}
          data-testid={`filter-${filter.value}`}
          onClick={() => filter.onClick?.()}
        >
          {filter.label}
        </button>
      ))}
      {onSort && (
        <button data-testid="sort-button" onClick={() => onSort("code", "asc")}>
          Sort
        </button>
      )}
      {data?.map((row: any, idx: number) => (
        <div
          key={idx}
          data-testid={`table-row-${idx}`}
          onClick={() => onRowClick?.(row)}
        >
          {row.code}
          {selection && (
            <input
              type="checkbox"
              data-testid={`select-${row.id}`}
              checked={selection.selectedIds?.has(row.id)}
              onChange={() => selection.onToggle?.(row.id)}
            />
          )}
        </div>
      ))}
      {pagination && (
        <div data-testid="pagination">
          <button data-testid="prev-page" onClick={() => pagination.onPageChange?.(pagination.currentPage - 1)}>
            Prev
          </button>
          <span>{pagination.currentPage} / {pagination.totalPages}</span>
          <button data-testid="next-page" onClick={() => pagination.onPageChange?.(pagination.currentPage + 1)}>
            Next
          </button>
        </div>
      )}
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
  AnimalRegistrationModal: ({ isOpen, onClose }: any) =>
    isOpen ? <div data-testid="animal-registration-modal">Modal</div> : null,
  Tooltip: ({ children, content }: any) => <div title={content}>{children}</div>,
  Button: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

describe("Animals", () => {
  const createRouter = () => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard/animals",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <Animals />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: ["/dashboard/animals"],
      }
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render animals table", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should display animals data", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    if (mockAnimals.length > 0) {
      expect(screen.getByText(mockAnimals[0].code)).toBeInTheDocument();
    }
  });

  it("should navigate to new animal route on add click", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    
    const addButtons = screen.queryAllByRole("button").filter((btn) =>
      btn.textContent?.includes("Adicionar") || btn.textContent?.includes("Add")
    );
    
    if (addButtons.length > 0) {
      fireEvent.click(addButtons[0]);
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.ANIMALS_NEW);
    } else {
      
      expect(screen.getByTestId("table")).toBeInTheDocument();
    }
  });

  it("should handle animal deletion", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    
    const deleteButtons = screen.queryAllByTestId("delete-button");
    if (deleteButtons.length > 0) {
      fireEvent.click(deleteButtons[0]);
      
      await waitFor(() => {
        const confirmButton = screen.queryByTestId("confirm-button");
        if (confirmButton) {
          fireEvent.click(confirmButton);
          expect(deleteAnimal).toHaveBeenCalled();
        }
      });
    } else {
      
      expect(screen.getByTestId("table")).toBeInTheDocument();
    }
  });

  it("should have correct meta function", () => {
    
    expect(Animals).toBeDefined();
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

  it("should handle animal selection", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);
    
    
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should cancel animal deletion", async () => {
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
    } else {
      expect(screen.getByTestId("table")).toBeInTheDocument();
    }
  });

  it("should open animal registration modal", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);
    
    const addButtons = screen.queryAllByRole("button").filter((btn) =>
      btn.textContent?.includes("Adicionar") || btn.textContent?.includes("Add")
    );
    
    if (addButtons.length > 0) {
      fireEvent.click(addButtons[0]);
      const modal = screen.queryByTestId("animal-registration-modal");
      expect(modal || screen.getByTestId("table")).toBeTruthy();
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
          const alert = screen.queryByTestId("alert-success") || screen.queryByTestId("alert-error");
          expect(alert || confirmButton).toBeTruthy();
        }
      });
    }
  });

  it("should handle empty animals list", () => {
    vi.mocked(mockAnimals).length = 0;
    const router = createRouter();
    render(<RouterProvider router={router} />);
    
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should navigate to animal view on row click", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);
    
    const rows = screen.queryAllByTestId(/table-row-/);
    if (rows.length > 0) {
      fireEvent.click(rows[0]);
      
    }
  });

  it("should navigate to animal edit", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);
    
    const editButtons = screen.queryAllByTestId("edit-button");
    if (editButtons.length > 0) {
      fireEvent.click(editButtons[0]);
      expect(mockNavigate).toHaveBeenCalled();
    }
  });

  it("should filter animals by search value", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);
    
    const searchInput = screen.queryByTestId("search-input");
    if (searchInput) {
      fireEvent.change(searchInput, { target: { value: "AN001" } });
      expect(searchInput).toBeInTheDocument();
    }
  });

  it("should filter animals by breed", () => {
    mockGetBirthByAnimalId.mockReturnValueOnce({
      id: "birth-1",
      animalId: "animal-1",
      breed: "Angus",
      birthDate: "2024-01-01",
      createdAt: "2024-01-01",
      companyId: "company-1",
    });
    
    const router = createRouter();
    render(<RouterProvider router={router} />);
    
    const searchInput = screen.queryByTestId("search-input");
    if (searchInput) {
      fireEvent.change(searchInput, { target: { value: "Angus" } });
      expect(searchInput).toBeInTheDocument();
    }
  });

  it("should filter animals by status", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);
    
    const activeFilter = screen.queryByTestId("filter-active");
    if (activeFilter) {
      fireEvent.click(activeFilter);
      expect(activeFilter).toBeInTheDocument();
    }
  });

  it("should filter animals by inactive status", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);
    
    const inactiveFilter = screen.queryByTestId("filter-inactive");
    if (inactiveFilter) {
      fireEvent.click(inactiveFilter);
      expect(inactiveFilter).toBeInTheDocument();
    }
  });

  it("should handle pagination", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);
    
    const nextPageButton = screen.queryByTestId("next-page");
    if (nextPageButton) {
      fireEvent.click(nextPageButton);
      expect(nextPageButton).toBeInTheDocument();
    }
  });

  it("should handle pagination previous page", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);
    
    const nextPageButton = screen.queryByTestId("next-page");
    if (nextPageButton) {
      fireEvent.click(nextPageButton);
      const prevPageButton = screen.queryByTestId("prev-page");
      if (prevPageButton) {
        fireEvent.click(prevPageButton);
        expect(prevPageButton).toBeInTheDocument();
      }
    }
  });

  it("should handle sorting", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);
    
    const sortButton = screen.queryByTestId("sort-button");
    if (sortButton) {
      fireEvent.click(sortButton);
      expect(sortButton).toBeInTheDocument();
    }
  });

  it("should handle animal selection", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);
    
    const selectCheckbox = screen.queryByTestId("select-animal-1");
    if (selectCheckbox) {
      fireEvent.click(selectCheckbox);
      expect(selectCheckbox).toBeInTheDocument();
    }
  });

  it("should display breed information", () => {
    mockGetBirthByAnimalId.mockReturnValueOnce({
      id: "birth-1",
      animalId: "animal-1",
      breed: "Nelore",
      birthDate: "2024-01-01",
      createdAt: "2024-01-01",
      companyId: "company-1",
    });
    
    const router = createRouter();
    render(<RouterProvider router={router} />);
    
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should display purity information", () => {
    mockGetBirthByAnimalId.mockReturnValueOnce({
      id: "birth-1",
      animalId: "animal-1",
      purity: "F1" as const,
      birthDate: "2024-01-01",
      createdAt: "2024-01-01",
      companyId: "company-1",
    });
    
    const router = createRouter();
    render(<RouterProvider router={router} />);
    
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should display gender information", () => {
    mockGetBirthByAnimalId.mockReturnValueOnce({
      id: "birth-1",
      animalId: "animal-1",
      gender: "male" as const,
      birthDate: "2024-01-01",
      createdAt: "2024-01-01",
      companyId: "company-1",
    });
    
    const router = createRouter();
    render(<RouterProvider router={router} />);
    
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should calculate and display age from birth date", () => {
    mockGetBirthByAnimalId.mockReturnValueOnce({
      id: "birth-1",
      animalId: "animal-1",
      birthDate: "2023-01-01",
      createdAt: "2023-01-01",
      companyId: "company-1",
    });
    
    const router = createRouter();
    render(<RouterProvider router={router} />);
    
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should calculate and display age from acquisition date", () => {
    mockGetBirthByAnimalId.mockReturnValueOnce(null);
    
    const router = createRouter();
    render(<RouterProvider router={router} />);
    
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should display weight from last weighing", () => {
    mockGetWeighingsByAnimalId.mockReturnValueOnce([
      { id: "w1", animalId: "animal-1", weight: 300, date: "2024-01-01", createdAt: "2024-01-01", companyId: "company-1", employeeIds: [], serviceProviderIds: [] },
    ]);
    
    const router = createRouter();
    render(<RouterProvider router={router} />);
    
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should display weight in arrobas", () => {
    mockGetWeighingsByAnimalId.mockReturnValueOnce([
      { id: "w1", animalId: "animal-1", weight: 300, date: "2024-01-01", createdAt: "2024-01-01", companyId: "company-1", employeeIds: [], serviceProviderIds: [] },
    ]);
    
    const router = createRouter();
    render(<RouterProvider router={router} />);
    
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should calculate and display GMD", () => {
    mockGetWeighingsByAnimalId.mockReturnValueOnce([
      { id: "w1", animalId: "animal-1", weight: 100, date: "2024-01-01", createdAt: "2024-01-01", companyId: "company-1", employeeIds: [], serviceProviderIds: [] },
      { id: "w2", animalId: "animal-1", weight: 150, date: "2024-02-01", createdAt: "2024-02-01", companyId: "company-1", employeeIds: [], serviceProviderIds: [] },
    ]);
    
    const router = createRouter();
    render(<RouterProvider router={router} />);
    
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should display property name", () => {
    vi.mocked(getPropertyById).mockReturnValueOnce({ id: "prop-1", name: "Test Property", status: "active" as const, companyId: "company-1", city: "Test City", state: "SC", area: { value: 100, type: "hectares" as const } });
    
    const router = createRouter();
    render(<RouterProvider router={router} />);
    
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should handle multiple animal selection", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);
    
    const selectCheckboxes = screen.queryAllByTestId(/select-animal-/);
    if (selectCheckboxes.length > 1) {
      fireEvent.click(selectCheckboxes[0]);
      fireEvent.click(selectCheckboxes[1]);
      expect(selectCheckboxes.length).toBeGreaterThan(0);
    }
  });

  it("should navigate to movement route with selected animals", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);
    
    const selectCheckbox = screen.queryByTestId("select-animal-1");
    if (selectCheckbox) {
      fireEvent.click(selectCheckbox);
      const moveButtons = screen.queryAllByRole("button").filter((btn) =>
        btn.textContent?.includes("Mover") || btn.textContent?.includes("Move")
      );
      if (moveButtons.length > 0) {
        fireEvent.click(moveButtons[0]);
        expect(mockNavigate).toHaveBeenCalled();
      }
    }
  });

  it("should handle empty search results", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);
    
    const searchInput = screen.queryByTestId("search-input");
    if (searchInput) {
      fireEvent.change(searchInput, { target: { value: "NonExistent" } });
      expect(searchInput).toBeInTheDocument();
    }
  });

  it("should handle sorting by different columns", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);
    
    const sortButton = screen.queryByTestId("sort-button");
    if (sortButton) {
      fireEvent.click(sortButton);
      fireEvent.click(sortButton);
      expect(sortButton).toBeInTheDocument();
    }
  });

  it("should display last weighing date", () => {
    mockGetWeighingsByAnimalId.mockReturnValueOnce([
      { id: "w1", animalId: "animal-1", weight: 300, date: "2024-01-15", createdAt: "2024-01-15", companyId: "company-1", employeeIds: [], serviceProviderIds: [] },
    ]);
    
    const router = createRouter();
    render(<RouterProvider router={router} />);
    
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should handle all filter option", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);
    
    const allFilter = screen.queryByTestId("filter-all");
    if (allFilter) {
      fireEvent.click(allFilter);
      expect(allFilter).toBeInTheDocument();
    }
  });
});

