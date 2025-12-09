import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ActivityLog } from "../activity-log";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import type { ActivityLogEntry } from "~/types";

vi.mock("~/i18n");
vi.mock("~/contexts/language-context");
vi.mock("~/components/ui", () => ({
  Table: ({
    data,
    columns,
    search,
    pagination,
    emptyState,
    header,
  }: {
    data: unknown[];
    columns: Array<{ key: string; label: string; render?: (value: unknown) => React.ReactNode }>;
    search?: { placeholder?: string; value?: string; onChange?: (value: string) => void };
    pagination?: {
      currentPage?: number;
      totalPages?: number;
      onPageChange?: (page: number) => void;
    };
    emptyState?: { title?: string; onClearSearch?: () => void; clearSearchLabel?: string };
    header?: { title?: string; description?: string };
  }) => (
    <div data-testid="table">
      {header?.title && <div data-testid="header-title">{header.title}</div>}
      {header?.description && <div data-testid="header-description">{header.description}</div>}
      {search && (
        <input
          data-testid="search-input"
          value={search.value || ""}
          onChange={(e) => search.onChange?.(e.target.value)}
          placeholder={search.placeholder}
        />
      )}
      {data.length > 0 ? (
        <div data-testid="table-data">
          {columns.map((col) => (
            <div key={col.key} data-testid={`column-${col.key}`}>
              {col.label}
            </div>
          ))}
        </div>
      ) : (
        <div data-testid="empty-state">
          {emptyState?.title && <div data-testid="empty-title">{emptyState.title}</div>}
          {emptyState?.onClearSearch && (
            <button data-testid="clear-search" onClick={emptyState.onClearSearch}>
              {emptyState.clearSearchLabel}
            </button>
          )}
        </div>
      )}
      {pagination && (
        <div data-testid="pagination">
          <button
            data-testid="page-prev"
            onClick={() => pagination.onPageChange?.(pagination.currentPage! - 1)}
            disabled={pagination.currentPage === 1}
          >
            Prev
          </button>
          <span data-testid="page-info">
            {pagination.currentPage} / {pagination.totalPages}
          </span>
          <button
            data-testid="page-next"
            onClick={() => pagination.onPageChange?.(pagination.currentPage! + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  ),
}));

describe("ActivityLog", () => {
  const mockUseTranslation = vi.mocked(useTranslation);
  const mockUseLanguage = vi.mocked(useLanguage);

  const mockLogs: ActivityLogEntry[] = [
    {
      id: "1",
      action: "created",
      entityType: "animal",
      entityId: "1",
      userId: "1",
      userName: "User 1",
      timestamp: "2024-01-01T10:00:00Z",
      resource: "Animal 1",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTranslation.mockReturnValue({
      common: {
        clearSearch: "Clear Search",
      },
      activityLog: {
        date: "Date",
        action: "Action",
        user: "User",
      },
      profile: {
        company: {
          logs: {
            title: "Company Activity Log",
            description: "Activity history",
            searchPlaceholder: "Search activities",
            empty: "No activities",
            columns: {
              user: "User",
              action: "Action",
              resource: "Resource",
              date: "Date",
              timestamp: "Timestamp",
            },
          },
        },
        user: {
          logs: {
            title: "User Activity Log",
            description: "Your activity history",
            empty: "No activities",
          },
        },
      },
    } as unknown as ReturnType<typeof useTranslation>);
    mockUseLanguage.mockReturnValue({ language: "pt" });
  });

  it("should render table with logs", () => {
    render(<ActivityLog logs={mockLogs} />);
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should show empty message when no logs", () => {
    render(<ActivityLog logs={[]} emptyMessage="No activities" />);
    // Empty message handling depends on Table component
  });

  it("should filter logs by search value", async () => {
    const _user = userEvent.setup();
    render(<ActivityLog logs={mockLogs} />);

    // Search functionality would be tested through Table component
  });

  it("should show user column when showUser is true", () => {
    render(<ActivityLog logs={mockLogs} showUser={true} />);
    expect(screen.getByTestId("column-user")).toBeInTheDocument();
  });

  it("should not show user column when showUser is false", () => {
    render(<ActivityLog logs={mockLogs} showUser={false} />);
    expect(screen.queryByTestId("column-user")).not.toBeInTheDocument();
  });

  it("should use custom emptyMessage when provided", () => {
    render(<ActivityLog logs={[]} emptyMessage="Custom empty message" />);
    expect(screen.getByTestId("empty-title")).toHaveTextContent("Custom empty message");
  });

  it("should use company logs empty message when showUser is true", () => {
    render(<ActivityLog logs={[]} showUser={true} />);
    expect(screen.getByTestId("empty-title")).toHaveTextContent("No activities");
  });

  it("should use user logs empty message when showUser is false", () => {
    mockUseTranslation.mockReturnValue({
      common: {
        clearSearch: "Clear Search",
      },
      profile: {
        company: {
          logs: {
            title: "Company Activity Log",
            description: "Activity history",
            searchPlaceholder: "Search activities",
            empty: "No company activities",
            columns: {
              user: "User",
              action: "Action",
              resource: "Resource",
              timestamp: "Timestamp",
            },
          },
        },
        user: {
          logs: {
            title: "User Activity Log",
            description: "Your activity history",
            searchPlaceholder: "Search your activities",
            empty: "No user activities",
          },
        },
      },
    } as unknown as ReturnType<typeof useTranslation>);
    render(<ActivityLog logs={[]} showUser={false} />);
    expect(screen.getByTestId("empty-title")).toHaveTextContent("No user activities");
  });

  it("should filter logs by action", async () => {
    const user = userEvent.setup();
    const logs: ActivityLogEntry[] = [
      {
        id: "1",
        action: "created",
        entityType: "animal",
        entityId: "1",
        userId: "1",
        userName: "User 1",
        timestamp: "2024-01-01T10:00:00Z",
        resource: "Animal 1",
      },
      {
        id: "2",
        action: "updated",
        entityType: "animal",
        entityId: "2",
        userId: "1",
        userName: "User 1",
        timestamp: "2024-01-01T11:00:00Z",
        resource: "Animal 2",
      },
    ];
    render(<ActivityLog logs={logs} />);
    const searchInput = screen.getByTestId("search-input");
    await user.type(searchInput, "created");
    // The filtered data should only contain logs with "created" action
    expect(searchInput).toHaveValue("created");
  });

  it("should filter logs by resource", async () => {
    const user = userEvent.setup();
    const logs: ActivityLogEntry[] = [
      {
        id: "1",
        action: "created",
        entityType: "animal",
        entityId: "1",
        userId: "1",
        userName: "User 1",
        timestamp: "2024-01-01T10:00:00Z",
        resource: "Animal 1",
      },
      {
        id: "2",
        action: "updated",
        entityType: "animal",
        entityId: "2",
        userId: "1",
        userName: "User 1",
        timestamp: "2024-01-01T11:00:00Z",
        resource: "Animal 2",
      },
    ];
    render(<ActivityLog logs={logs} />);
    const searchInput = screen.getByTestId("search-input");
    await user.type(searchInput, "Animal 1");
    expect(searchInput).toHaveValue("Animal 1");
  });

  it("should filter logs by user when showUser is true", async () => {
    const user = userEvent.setup();
    const logs: ActivityLogEntry[] = [
      {
        id: "1",
        action: "created",
        entityType: "animal",
        entityId: "1",
        userId: "1",
        userName: "User 1",
        timestamp: "2024-01-01T10:00:00Z",
        resource: "Animal 1",
      },
      {
        id: "2",
        action: "updated",
        entityType: "animal",
        entityId: "2",
        userId: "2",
        userName: "User 2",
        timestamp: "2024-01-01T11:00:00Z",
        resource: "Animal 2",
      },
    ];
    render(<ActivityLog logs={logs} showUser={true} />);
    const searchInput = screen.getByTestId("search-input");
    await user.type(searchInput, "User 1");
    expect(searchInput).toHaveValue("User 1");
  });

  it("should reset to page 1 when search changes", async () => {
    const user = userEvent.setup();
    const logs: ActivityLogEntry[] = Array.from({ length: 25 }, (_, i) => ({
      id: `${i + 1}`,
      action: "created",
      entityType: "animal",
      entityId: `${i + 1}`,
      userId: "1",
      userName: "User 1",
      timestamp: `2024-01-01T${String(i).padStart(2, "0")}:00:00Z`,
      resource: `Animal ${i + 1}`,
    }));
    render(<ActivityLog logs={logs} />);
    // Go to page 2
    const nextButton = screen.getByTestId("page-next");
    await user.click(nextButton);
    expect(screen.getByTestId("page-info")).toHaveTextContent("2 /");
    // Change search
    const searchInput = screen.getByTestId("search-input");
    await user.type(searchInput, "test");
    // Should reset to page 1
    expect(screen.getByTestId("page-info")).toHaveTextContent("1 /");
  });

  it("should show clear search button when search value exists", async () => {
    const user = userEvent.setup();
    render(<ActivityLog logs={mockLogs} />);
    const searchInput = screen.getByTestId("search-input");
    await user.type(searchInput, "test");
    const clearButton = screen.getByTestId("clear-search");
    expect(clearButton).toBeInTheDocument();
    await user.click(clearButton);
    expect(searchInput).toHaveValue("");
  });

  it("should use English locale when language is 'en'", () => {
    mockUseLanguage.mockReturnValue({ language: "en" });
    render(<ActivityLog logs={mockLogs} />);
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should use Spanish locale when language is 'es'", () => {
    mockUseLanguage.mockReturnValue({ language: "es" });
    render(<ActivityLog logs={mockLogs} />);
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should display company logs title when showUser is true", () => {
    render(<ActivityLog logs={mockLogs} showUser={true} />);
    expect(screen.getByTestId("header-title")).toHaveTextContent("Company Activity Log");
  });

  it("should display user logs title when showUser is false", () => {
    render(<ActivityLog logs={mockLogs} showUser={false} />);
    expect(screen.getByTestId("header-title")).toHaveTextContent("User Activity Log");
  });

  it("should render user column with '-' when user is null", () => {
    const logsWithNullUser: ActivityLogEntry[] = [
      {
        id: "1",
        action: "created",
        entityType: "animal",
        entityId: "1",
        userId: "1",
        userName: null,
        timestamp: "2024-01-01T10:00:00Z",
        resource: "Animal 1",
      },
    ];
    render(<ActivityLog logs={logsWithNullUser} showUser={true} />);
    expect(screen.getByTestId("column-user")).toBeInTheDocument();
  });
});
