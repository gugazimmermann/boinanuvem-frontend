import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { SidebarItem } from "../sidebar-item";

const TestWrapper = ({
  children,
  initialEntries,
}: {
  children: React.ReactNode;
  initialEntries?: string[];
}) => <MemoryRouter initialEntries={initialEntries || ["/dashboard"]}>{children}</MemoryRouter>;

vi.mock("../utils/colors", () => ({
  DASHBOARD_COLORS: {
    primary: "#3b82f6",
  },
}));

describe("SidebarItem", () => {
  const defaultProps = {
    label: "Dashboard",
    path: "/dashboard",
    icon: "📊",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render simple item", () => {
    render(
      <TestWrapper>
        <SidebarItem {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("should render icon", () => {
    render(
      <TestWrapper>
        <SidebarItem {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText("📊")).toBeInTheDocument();
  });

  it("should render as link when no subitems", () => {
    render(
      <TestWrapper>
        <SidebarItem {...defaultProps} />
      </TestWrapper>
    );

    const link = screen.getByText("Dashboard").closest("a");
    expect(link).toHaveAttribute("href", "/dashboard");
  });

  it("should apply active style when path matches location", () => {
    render(
      <TestWrapper initialEntries={["/dashboard"]}>
        <SidebarItem {...defaultProps} />
      </TestWrapper>
    );

    const link = screen.getByText("Dashboard").closest("a");
    expect(link).toBeInTheDocument();
    // Check if style is applied (may be rgb or hex format)
    const bgColor = link?.getAttribute("style");
    expect(bgColor).toContain("background");
  });

  it("should render as button when subitems exist", () => {
    const subItems = [
      { label: "Sub Item 1", path: "/sub1" },
      { label: "Sub Item 2", path: "/sub2" },
    ];

    render(
      <TestWrapper>
        <SidebarItem {...defaultProps} subItems={subItems} />
      </TestWrapper>
    );

    const button = screen.getByText("Dashboard").closest("button");
    expect(button).toBeInTheDocument();
  });

  it("should toggle expansion when button is clicked", async () => {
    const onToggle = vi.fn();
    const subItems = [{ label: "Sub Item 1", path: "/sub1" }];

    const user = userEvent.setup();
    render(
      <TestWrapper>
        <SidebarItem {...defaultProps} subItems={subItems} onToggle={onToggle} />
      </TestWrapper>
    );

    const button = screen.getByText("Dashboard").closest("button");
    if (button) {
      await user.click(button);
      expect(onToggle).toHaveBeenCalledTimes(1);
    }
  });

  it("should render subitems when expanded", () => {
    const subItems = [
      { label: "Sub Item 1", path: "/sub1" },
      { label: "Sub Item 2", path: "/sub2" },
    ];

    render(
      <TestWrapper>
        <SidebarItem {...defaultProps} subItems={subItems} isExpanded={true} />
      </TestWrapper>
    );

    expect(screen.getByText("Sub Item 1")).toBeInTheDocument();
    expect(screen.getByText("Sub Item 2")).toBeInTheDocument();
  });

  it("should not render subitems when not expanded", () => {
    const subItems = [{ label: "Sub Item 1", path: "/sub1" }];

    render(
      <TestWrapper>
        <SidebarItem {...defaultProps} subItems={subItems} isExpanded={false} />
      </TestWrapper>
    );

    expect(screen.queryByText("Sub Item 1")).not.toBeInTheDocument();
  });

  it("should show chevron icon when subitems exist", () => {
    const subItems = [{ label: "Sub Item 1", path: "/sub1" }];

    const { container } = render(
      <TestWrapper>
        <SidebarItem {...defaultProps} subItems={subItems} />
      </TestWrapper>
    );

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should rotate chevron when expanded", () => {
    const subItems = [{ label: "Sub Item 1", path: "/sub1" }];

    const { container } = render(
      <TestWrapper>
        <SidebarItem {...defaultProps} subItems={subItems} isExpanded={true} />
      </TestWrapper>
    );

    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("rotate-90");
  });

  it("should apply active style when subitem path matches location", () => {
    const subItems = [{ label: "Sub Item 1", path: "/sub1" }];

    render(
      <TestWrapper initialEntries={["/sub1"]}>
        <SidebarItem {...defaultProps} subItems={subItems} />
      </TestWrapper>
    );

    const button = screen.getByText("Dashboard").closest("button");
    expect(button).toBeInTheDocument();
    // Check if style is applied (may be rgb or hex format)
    const bgColor = button?.getAttribute("style");
    expect(bgColor).toContain("background");
  });

  it("should call onItemClick when subitem is clicked", async () => {
    const onItemClick = vi.fn();
    const subItems = [{ label: "Sub Item 1", path: "/sub1" }];

    const user = userEvent.setup();
    render(
      <TestWrapper>
        <SidebarItem
          {...defaultProps}
          subItems={subItems}
          isExpanded={true}
          onItemClick={onItemClick}
        />
      </TestWrapper>
    );

    const subItemLink = screen.getByText("Sub Item 1");
    await user.click(subItemLink);
    expect(onItemClick).toHaveBeenCalledTimes(1);
  });

  it("should handle keyboard navigation", async () => {
    const onToggle = vi.fn();
    const subItems = [{ label: "Sub Item 1", path: "/sub1" }];

    const user = userEvent.setup();
    render(
      <TestWrapper>
        <SidebarItem {...defaultProps} subItems={subItems} onToggle={onToggle} />
      </TestWrapper>
    );

    const button = screen.getByText("Dashboard").closest("button");
    if (button) {
      button.focus();
      await user.keyboard("{Enter}");
      expect(onToggle).toHaveBeenCalled();
    }
  });

  it("should handle space key for keyboard navigation", async () => {
    const onToggle = vi.fn();
    const subItems = [{ label: "Sub Item 1", path: "/sub1" }];

    const user = userEvent.setup();
    render(
      <TestWrapper>
        <SidebarItem {...defaultProps} subItems={subItems} onToggle={onToggle} />
      </TestWrapper>
    );

    const button = screen.getByText("Dashboard").closest("button");
    if (button) {
      button.focus();
      await user.keyboard(" ");
      expect(onToggle).toHaveBeenCalled();
    }
  });
});
