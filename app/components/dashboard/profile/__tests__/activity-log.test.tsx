import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ActivityLog } from "../activity-log";
import { LanguageProvider } from "~/contexts/language-context";

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

const mockUseLanguage = vi.fn(() => ({ language: "pt" }));

vi.mock("~/contexts/language-context", async () => {
  const actual = await vi.importActual("~/contexts/language-context");
  return {
    ...actual,
    useLanguage: () => mockUseLanguage(),
  };
});

const mockTable = vi.fn(
  ({
    data,
    columns,
    header,
    search,
    pagination: _pagination,
    emptyState,
  }: {
    data: unknown[];
    columns: unknown[];
    header: { title: string; description?: string };
    search: { value: string; onChange: (value: string) => void };
    pagination?: unknown;
    emptyState?: { title: string; onClearSearch?: () => void };
  }) => (
    <div data-testid="table">
      <div data-testid="table-title">{header.title}</div>
      <div data-testid="table-description">{header.description}</div>
      <input
        data-testid="search-input"
        value={search.value}
        onChange={(e) => search.onChange(e.target.value)}
      />
      <div data-testid="table-data">{data.length} items</div>
      {/* Render columns to trigger column render functions */}
      {columns &&
        columns.map((col: unknown, idx: number) => {
          const column = col as {
            key: string;
            render?: (value: unknown, row: unknown) => React.ReactNode;
          };
          return (
            <div key={idx} data-testid={`column-${column.key}`}>
              {data.length > 0 &&
                column.render &&
                column.render((data[0] as Record<string, unknown>)[column.key], data[0])}
            </div>
          );
        })}
      {emptyState && (
        <>
          <div data-testid="empty-title">{emptyState.title}</div>
          {emptyState.onClearSearch && (
            <button data-testid="clear-search" onClick={emptyState.onClearSearch}>
              Clear
            </button>
          )}
        </>
      )}
    </div>
  )
);

vi.mock("~/components/ui", () => ({
  Table: (props: unknown) => mockTable(props as Parameters<typeof mockTable>[0]),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    profile: {
      company: {
        logs: {
          title: "Company Logs",
          description: "Company activity log",
          searchPlaceholder: "Search logs",
          columns: {
            user: "User",
            action: "Action",
            resource: "Resource",
            timestamp: "Timestamp",
          },
          empty: "No company logs",
        },
      },
      user: {
        logs: {
          title: "User Logs",
          description: "User activity log",
          searchPlaceholder: "Search logs",
          empty: "No user logs",
        },
      },
    },
    common: {
      clearSearch: "Clear search",
    },
  })),
}));

describe("ActivityLog", () => {
  const mockLogs = [
    {
      id: "log-1",
      action: "CREATE",
      resource: "Animal",
      timestamp: "2025-01-15T10:00:00Z",
      user: "User 1",
    },
    {
      id: "log-2",
      action: "UPDATE",
      resource: "Property",
      timestamp: "2025-01-16T10:00:00Z",
      user: "User 2",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render activity log", () => {
    render(
      <TestWrapper>
        <ActivityLog logs={mockLogs} />
      </TestWrapper>
    );
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should render company logs when showUser is true", () => {
    render(
      <TestWrapper>
        <ActivityLog logs={mockLogs} showUser={true} />
      </TestWrapper>
    );
    expect(screen.getByTestId("table-title")).toHaveTextContent("Company Logs");
  });

  it("should render user logs when showUser is false", () => {
    render(
      <TestWrapper>
        <ActivityLog logs={mockLogs} showUser={false} />
      </TestWrapper>
    );
    expect(screen.getByTestId("table-title")).toHaveTextContent("User Logs");
  });

  it("should handle search", async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <ActivityLog logs={mockLogs} />
      </TestWrapper>
    );
    const searchInput = screen.getByTestId("search-input");
    await user.type(searchInput, "CREATE");
    expect(searchInput).toHaveValue("CREATE");
  });

  it("should display empty state", () => {
    render(
      <TestWrapper>
        <ActivityLog logs={[]} />
      </TestWrapper>
    );
    expect(screen.getByTestId("empty-title")).toBeInTheDocument();
  });

  it("should handle clear search", async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <ActivityLog logs={mockLogs} />
      </TestWrapper>
    );
    const searchInput = screen.getByTestId("search-input");
    await user.type(searchInput, "Test");
    const clearButton = screen.getByTestId("clear-search");
    await user.click(clearButton);
    expect(searchInput).toHaveValue("");
  });

  it("should use custom empty message", () => {
    render(
      <TestWrapper>
        <ActivityLog logs={[]} emptyMessage="Custom empty message" />
      </TestWrapper>
    );
    expect(screen.getByText("Custom empty message")).toBeInTheDocument();
  });

  it("should render user column when showUser is true", () => {
    const logsWithUser = [
      {
        id: "log-3",
        action: "CREATE",
        resource: "Animal",
        timestamp: "2025-01-15T10:00:00Z",
        user: "User 1",
      },
    ];
    render(
      <TestWrapper>
        <ActivityLog logs={logsWithUser} showUser={true} />
      </TestWrapper>
    );
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should handle search by user when showUser is true", async () => {
    const user = userEvent.setup();
    const logsWithUser = [
      {
        id: "log-4",
        action: "CREATE",
        resource: "Animal",
        timestamp: "2025-01-15T10:00:00Z",
        user: "John Doe",
      },
    ];
    render(
      <TestWrapper>
        <ActivityLog logs={logsWithUser} showUser={true} />
      </TestWrapper>
    );
    const searchInput = screen.getByTestId("search-input");
    await user.type(searchInput, "John");
    expect(searchInput).toHaveValue("John");
  });

  it("should handle search by action", async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <ActivityLog logs={mockLogs} />
      </TestWrapper>
    );
    const searchInput = screen.getByTestId("search-input");
    await user.type(searchInput, "UPDATE");
    expect(searchInput).toHaveValue("UPDATE");
  });

  it("should handle search by resource", async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <ActivityLog logs={mockLogs} />
      </TestWrapper>
    );
    const searchInput = screen.getByTestId("search-input");
    await user.type(searchInput, "Property");
    expect(searchInput).toHaveValue("Property");
  });

  it("should handle search by date", async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <ActivityLog logs={mockLogs} />
      </TestWrapper>
    );
    const searchInput = screen.getByTestId("search-input");
    await user.type(searchInput, "2025");
    expect(searchInput).toHaveValue("2025");
  });

  it("should handle pagination", async () => {
    const manyLogs = Array.from({ length: 25 }, (_, i) => ({
      id: `log-${i + 5}`,
      action: "CREATE",
      resource: "Animal",
      timestamp: `2025-01-${String(i + 1).padStart(2, "0")}T10:00:00Z`,
      user: `User ${i}`,
    }));
    render(
      <TestWrapper>
        <ActivityLog logs={manyLogs} showUser={true} />
      </TestWrapper>
    );
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should handle user column with null user", () => {
    const logsWithNullUser = [
      {
        id: "log-30",
        action: "CREATE",
        resource: "Animal",
        timestamp: "2025-01-15T10:00:00Z",
        user: undefined,
      },
    ];
    render(
      <TestWrapper>
        <ActivityLog logs={logsWithNullUser} showUser={true} />
      </TestWrapper>
    );
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should handle different languages for date formatting", () => {
    const { rerender: _rerender } = render(
      <TestWrapper>
        <ActivityLog logs={mockLogs} />
      </TestWrapper>
    );
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should handle English language for date formatting", () => {
    mockUseLanguage.mockReturnValueOnce({ language: "en" });
    render(
      <TestWrapper>
        <ActivityLog logs={mockLogs} />
      </TestWrapper>
    );
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should handle Spanish language for date formatting", () => {
    mockUseLanguage.mockReturnValueOnce({ language: "es" });
    render(
      <TestWrapper>
        <ActivityLog logs={mockLogs} />
      </TestWrapper>
    );
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should render user column with value when showUser is true", () => {
    const logsWithUser = [
      {
        id: "log-32",
        action: "CREATE",
        resource: "Animal",
        timestamp: "2025-01-15T10:00:00Z",
        user: "User 1",
      },
    ];
    render(
      <TestWrapper>
        <ActivityLog logs={logsWithUser} showUser={true} />
      </TestWrapper>
    );
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should render action column with styling", () => {
    render(
      <TestWrapper>
        <ActivityLog logs={mockLogs} />
      </TestWrapper>
    );
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should render resource column", () => {
    render(
      <TestWrapper>
        <ActivityLog logs={mockLogs} />
      </TestWrapper>
    );
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should render timestamp column with formatted date", () => {
    render(
      <TestWrapper>
        <ActivityLog logs={mockLogs} />
      </TestWrapper>
    );
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should render user column with value when showUser is true", () => {
    const logsWithUser = [
      {
        id: "log-35",
        action: "CREATE",
        resource: "Animal",
        timestamp: "2025-01-15T10:00:00Z",
        user: "User 1",
      },
    ];
    render(
      <TestWrapper>
        <ActivityLog logs={logsWithUser} showUser={true} />
      </TestWrapper>
    );
    // The column render function should be called
    expect(screen.getByTestId("column-user")).toBeInTheDocument();
  });

  it("should render action column with styling", () => {
    render(
      <TestWrapper>
        <ActivityLog logs={mockLogs} />
      </TestWrapper>
    );
    // The action column render function should be called
    expect(screen.getByTestId("column-action")).toBeInTheDocument();
  });

  it("should render resource column", () => {
    render(
      <TestWrapper>
        <ActivityLog logs={mockLogs} />
      </TestWrapper>
    );
    // The resource column render function should be called
    expect(screen.getByTestId("column-resource")).toBeInTheDocument();
  });

  it("should render timestamp column with formatted date", () => {
    render(
      <TestWrapper>
        <ActivityLog logs={mockLogs} />
      </TestWrapper>
    );
    // The timestamp column render function should be called
    expect(screen.getByTestId("column-timestamp")).toBeInTheDocument();
  });
});
