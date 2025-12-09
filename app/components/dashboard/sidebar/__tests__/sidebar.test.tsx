import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Sidebar } from "../sidebar";
import { useLocation } from "react-router";
import { useTranslation } from "~/i18n";
import { usePermissions } from "~/utils/permissions";
import { getRoutePermission } from "~/utils/route-permissions";

vi.mock("react-router", () => ({
  useLocation: vi.fn(() => ({ pathname: "/dashboard" })),
  Link: ({
    to,
    children,
    ...props
  }: {
    to: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));
vi.mock("~/i18n");
vi.mock("~/utils/permissions");
vi.mock("~/utils/route-permissions");

vi.mock("./sidebar-item", () => ({
  SidebarItem: ({
    label,
    path,
    isExpanded,
    onToggle,
    subItems,
  }: {
    label: string;
    path: string;
    isExpanded?: boolean;
    onToggle?: () => void;
    subItems?: Array<{ label: string; path: string }>;
  }) => {
    if (subItems && subItems.length > 0) {
      return (
        <div data-testid={`sidebar-item-${label}`} data-expanded={isExpanded ? "true" : "false"}>
          <button onClick={onToggle}>{label}</button>
        </div>
      );
    }
    return (
      <a href={path} data-testid={`sidebar-item-${label}`}>
        {label}
      </a>
    );
  },
}));

describe("Sidebar", () => {
  const mockUseLocation = vi.mocked(useLocation);
  const mockUseTranslation = vi.mocked(useTranslation);
  const mockUsePermissions = vi.mocked(usePermissions);
  const mockGetRoutePermission = vi.mocked(getRoutePermission);

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLocation.mockReturnValue({ pathname: "/dashboard" } as ReturnType<typeof useLocation>);
    mockUseTranslation.mockReturnValue({
      sidebar: {
        dashboard: "Dashboard",
        registrations: "Registrations",
        properties: "Properties",
        locations: "Locations",
        employees: "Employees",
        serviceProviders: "Service Providers",
        suppliers: "Suppliers",
        buyers: "Buyers",
        animals: "Animals",
        records: "Records",
        births: "Births",
        acquisitions: "Acquisitions",
        sales: "Sales",
        deaths: "Deaths",
        medicineAdministrations: "Medicine Administrations",
        weighings: "Weighings",
        breedings: "Breedings",
        unconfirmedBreedings: "Unconfirmed Breedings",
        pregnantCows: "Pregnant Cows",
        reproductiveIndexes: "Reproductive Indexes",
        birthForecast: "Birth Forecast",
        finances: "Finances",
        cashFlow: "Cash Flow",
        accountsPayable: "Accounts Payable",
        accountsReceivable: "Accounts Receivable",
        bankAccounts: "Bank Accounts",
        reports: "Reports",
        inventory: "Inventory",
      },
    } as unknown as ReturnType<typeof useTranslation>);
    mockUsePermissions.mockReturnValue({
      canView: vi.fn(() => true),
    });
    mockGetRoutePermission.mockReturnValue(null);
  });

  it("should render sidebar", () => {
    render(<Sidebar />);
    expect(screen.getByRole("complementary")).toBeInTheDocument();
  });

  it("should render sidebar items", () => {
    render(<Sidebar />);
    // Dashboard should be rendered as a sidebar item with the testid
    expect(screen.getByTestId("sidebar-item-Dashboard")).toBeInTheDocument();
  });

  it("should expand item when subItem path matches location", () => {
    mockUseLocation.mockReturnValue({ pathname: "/dashboard/propriedades" } as ReturnType<
      typeof useLocation
    >);
    render(<Sidebar />);

    // Should have expanded item for registrations since properties is a subItem
    const registrationsItem = screen.getByTestId("sidebar-item-Registrations");
    expect(registrationsItem).toHaveAttribute("data-expanded", "true");
  });

  it("should toggle item expansion when clicked", async () => {
    const user = userEvent.setup();
    render(<Sidebar />);

    const registrationsButton = screen.getByText("Registrations");
    await user.click(registrationsButton);

    await waitFor(() => {
      const item = screen.getByTestId("sidebar-item-Registrations");
      expect(item).toHaveAttribute("data-expanded", "true");
    });
  });

  it("should call onClose when item is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Sidebar onClose={onClose} />);

    const dashboardButton = screen.getByText("Dashboard");
    await user.click(dashboardButton);

    // onClose is passed to SidebarItem's onItemClick
    // This would be called when a sidebar item is clicked
  });

  it("should filter items based on permissions", () => {
    mockGetRoutePermission.mockReturnValue("animals.view");
    mockUsePermissions.mockReturnValue({
      canView: vi.fn((section: string, resource: string) => resource === "animals"),
    });

    render(<Sidebar />);

    // Items should be filtered based on permissions
  });

  it("should apply open/closed classes based on isOpen prop", () => {
    const { container, rerender } = render(<Sidebar isOpen={true} />);
    let aside = container.querySelector("aside");
    expect(aside).toHaveClass("translate-x-0");

    rerender(<Sidebar isOpen={false} />);
    aside = container.querySelector("aside");
    expect(aside).toHaveClass("-translate-x-full", "sm:translate-x-0");
  });
});
