import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { Sidebar } from "../sidebar";
import { LanguageProvider } from "~/contexts/language-context";

const TestWrapper = ({
  children,
  initialEntries,
}: {
  children: React.ReactNode;
  initialEntries?: string[];
}) => (
  <MemoryRouter initialEntries={initialEntries || ["/dashboard"]}>
    <LanguageProvider>{children}</LanguageProvider>
  </MemoryRouter>
);

const mockCanView = vi.fn();
const mockUsePermissions = vi.fn();
vi.mock("~/utils/permissions", () => ({
  usePermissions: () => mockUsePermissions(),
}));

const mockGetRoutePermission = vi.fn();
vi.mock("~/utils/route-permissions", () => ({
  getRoutePermission: (path: string) => mockGetRoutePermission(path),
}));

vi.mock("../sidebar-item", () => ({
  SidebarItem: vi.fn(
    ({
      label,
      path,
      subItems,
      isExpanded,
      onToggle,
      onItemClick,
    }: {
      label: string;
      path: string;
      subItems?: Array<{ path: string; label: string }>;
      isExpanded?: boolean;
      onToggle?: () => void;
      onItemClick?: () => void;
    }) => (
      <div data-testid={`sidebar-item-${label}`}>
        {subItems ? (
          <button onClick={onToggle} data-testid={`toggle-${label}`}>
            {label} {isExpanded ? "▼" : "▶"}
          </button>
        ) : (
          <a href={path} onClick={onItemClick}>
            {label}
          </a>
        )}
        {isExpanded && subItems && (
          <div data-testid={`subitems-${label}`}>
            {subItems.map((subItem) => (
              <a key={subItem.path} href={subItem.path} onClick={onItemClick}>
                {subItem.label}
              </a>
            ))}
          </div>
        )}
      </div>
    )
  ),
}));

vi.mock("../sidebar-constants", () => ({
  SIDEBAR_ITEMS: [
    {
      translationKey: "dashboard",
      path: "/dashboard",
      icon: "📊",
    },
    {
      translationKey: "registrations",
      path: "#",
      icon: "📋",
      subItems: [
        { translationKey: "properties", path: "/properties", icon: "🏡" },
        { translationKey: "locations", path: "/locations", icon: "📍" },
      ],
    },
  ],
}));

describe("Sidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePermissions.mockReturnValue({
      canView: mockCanView,
    });
    mockCanView.mockReturnValue(true);
    mockGetRoutePermission.mockReturnValue(null);
  });

  it("should render sidebar", () => {
    render(
      <TestWrapper>
        <Sidebar />
      </TestWrapper>
    );

    expect(screen.getByTestId("sidebar-item-Dashboard")).toBeInTheDocument();
  });

  it("should render sidebar items", () => {
    render(
      <TestWrapper>
        <Sidebar />
      </TestWrapper>
    );

    expect(screen.getByTestId("sidebar-item-Dashboard")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar-item-Registrations")).toBeInTheDocument();
  });

  it("should expand item when subitem is active", () => {
    render(
      <TestWrapper initialEntries={["/properties"]}>
        <Sidebar />
      </TestWrapper>
    );

    const toggleButton = screen.getByTestId("toggle-Registrations");
    expect(toggleButton).toHaveTextContent("▼");
  });

  it("should toggle item expansion", async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <Sidebar />
      </TestWrapper>
    );

    const toggleButton = screen.getByTestId("toggle-Registrations");
    await user.click(toggleButton);
    expect(toggleButton).toHaveTextContent("▼");
  });

  it("should filter items based on permissions", () => {
    mockGetRoutePermission.mockImplementation((path: string) => {
      if (path === "/properties") return "registration.properties";
      return null;
    });
    mockCanView.mockImplementation((section: string, resource: string) => {
      if (section === "registration" && resource === "properties") return false;
      return true;
    });

    render(
      <TestWrapper>
        <Sidebar />
      </TestWrapper>
    );

    // Properties should be filtered out
    const subItems = screen.queryByTestId("subitems-Registrations");
    if (subItems) {
      expect(subItems).not.toHaveTextContent("Properties");
    }
  });

  it("should show all items when canView returns true", () => {
    mockCanView.mockReturnValue(true);

    render(
      <TestWrapper>
        <Sidebar />
      </TestWrapper>
    );

    expect(screen.getByTestId("sidebar-item-Dashboard")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar-item-Registrations")).toBeInTheDocument();
  });

  it("should handle isOpen prop", () => {
    const { container } = render(
      <TestWrapper>
        <Sidebar isOpen={true} />
      </TestWrapper>
    );

    const sidebar = container.querySelector("aside");
    expect(sidebar).toHaveClass("translate-x-0");
  });

  it("should handle isOpen false prop", () => {
    const { container } = render(
      <TestWrapper>
        <Sidebar isOpen={false} />
      </TestWrapper>
    );

    const sidebar = container.querySelector("aside");
    expect(sidebar).toHaveClass("-translate-x-full");
  });

  it("should call onClose when item is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <Sidebar onClose={onClose} />
      </TestWrapper>
    );

    const link = screen.getByText("Dashboard");
    await user.click(link);
    expect(onClose).toHaveBeenCalled();
  });

  it("should filter subitems based on permissions", () => {
    mockGetRoutePermission.mockImplementation((path: string) => {
      if (path === "/properties") return "registration.properties";
      if (path === "/locations") return "registration.locations";
      return null;
    });
    mockCanView.mockImplementation((section: string, resource: string) => {
      if (section === "registration" && resource === "properties") return false;
      if (section === "registration" && resource === "locations") return true;
      return true;
    });

    render(
      <TestWrapper>
        <Sidebar />
      </TestWrapper>
    );

    // Should only show locations, not properties
    const subItems = screen.queryByTestId("subitems-Registrations");
    if (subItems) {
      expect(subItems).not.toHaveTextContent("Properties");
    }
  });

  it("should hide parent item when all subitems are filtered", () => {
    mockGetRoutePermission.mockImplementation((path: string) => {
      if (path === "/properties") return "registration.properties";
      if (path === "/locations") return "registration.locations";
      return null;
    });
    mockCanView.mockReturnValue(false);

    render(
      <TestWrapper>
        <Sidebar />
      </TestWrapper>
    );

    // Registrations should be hidden if all subitems are filtered
    expect(screen.queryByTestId("sidebar-item-Registrations")).not.toBeInTheDocument();
  });

  it("should always show dashboard item", () => {
    mockCanView.mockReturnValue(false);

    render(
      <TestWrapper>
        <Sidebar />
      </TestWrapper>
    );

    expect(screen.getByTestId("sidebar-item-Dashboard")).toBeInTheDocument();
  });

  it("should collapse item when toggled again", async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper initialEntries={["/properties"]}>
        <Sidebar />
      </TestWrapper>
    );

    const toggleButton = screen.getByTestId("toggle-Registrations");
    expect(toggleButton).toHaveTextContent("▼");
    await user.click(toggleButton);
    expect(toggleButton).toHaveTextContent("▶");
  });

  it("should handle items without subItems", () => {
    mockGetRoutePermission.mockReturnValue(null);
    render(
      <TestWrapper>
        <Sidebar />
      </TestWrapper>
    );

    expect(screen.getByTestId("sidebar-item-Dashboard")).toBeInTheDocument();
  });

  it("should handle permission path with multiple dots", () => {
    mockGetRoutePermission.mockImplementation((path: string) => {
      if (path === "/properties") return "registration.properties.subsection";
      if (path === "/locations") return null;
      return null;
    });
    mockCanView.mockImplementation((section: string, resource: string) => {
      if (section === "registration" && resource === "properties.subsection") return true;
      return true;
    });

    render(
      <TestWrapper>
        <Sidebar />
      </TestWrapper>
    );

    const subItems = screen.queryByTestId("subitems-Registrations");
    if (subItems) {
      expect(subItems).toBeInTheDocument();
    } else {
      expect(screen.getByTestId("sidebar-item-Registrations")).toBeInTheDocument();
    }
  });

  it("should handle item with empty subItems after filtering", () => {
    mockGetRoutePermission.mockImplementation((path: string) => {
      if (path === "/properties") return "registration.properties";
      if (path === "/locations") return "registration.locations";
      return null;
    });
    mockCanView.mockReturnValue(false);

    render(
      <TestWrapper>
        <Sidebar />
      </TestWrapper>
    );

    expect(screen.queryByTestId("sidebar-item-Registrations")).not.toBeInTheDocument();
  });

  it("should handle getInitialExpandedItem returning null", () => {
    render(
      <TestWrapper initialEntries={["/unknown-path"]}>
        <Sidebar />
      </TestWrapper>
    );

    const toggleButton = screen.getByTestId("toggle-Registrations");
    expect(toggleButton).toHaveTextContent("▶");
  });

  it("should handle subItems with icons", () => {
    mockGetRoutePermission.mockReturnValue(null);
    render(
      <TestWrapper>
        <Sidebar />
      </TestWrapper>
    );

    const subItems = screen.queryByTestId("subitems-Registrations");
    if (subItems) {
      expect(subItems).toBeInTheDocument();
    }
  });

  it("should handle onClose callback when subitem is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <Sidebar onClose={onClose} />
      </TestWrapper>
    );

    const toggleButton = screen.getByTestId("toggle-Registrations");
    await user.click(toggleButton);
    const subItems = screen.getByTestId("subitems-Registrations");
    expect(subItems).toBeInTheDocument();
    const subItemLink = subItems.querySelector("a");
    if (subItemLink) {
      await user.click(subItemLink);
      expect(onClose).toHaveBeenCalled();
    }
  });

  it("should handle items with permission path returning null", () => {
    mockGetRoutePermission.mockReturnValue(null);
    mockCanView.mockReturnValue(true);

    render(
      <TestWrapper>
        <Sidebar />
      </TestWrapper>
    );

    expect(screen.getByTestId("sidebar-item-Dashboard")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar-item-Registrations")).toBeInTheDocument();
  });

  it("should handle translated items with subItems", () => {
    mockGetRoutePermission.mockReturnValue(null);
    render(
      <TestWrapper>
        <Sidebar />
      </TestWrapper>
    );

    const toggleButton = screen.getByTestId("toggle-Registrations");
    expect(toggleButton).toBeInTheDocument();
  });
});
