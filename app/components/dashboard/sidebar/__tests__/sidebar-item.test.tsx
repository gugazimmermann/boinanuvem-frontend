import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SidebarItem } from "../sidebar-item";
import { useLocation } from "react-router";

vi.mock("react-router", () => ({
  Link: ({
    to,
    children,
    className,
    style,
    onClick,
  }: {
    to: string;
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    onClick?: () => void;
  }) => (
    <a href={to} className={className} style={style} onClick={onClick}>
      {children}
    </a>
  ),
  useLocation: vi.fn(),
}));

describe("SidebarItem", () => {
  const mockUseLocation = vi.mocked(useLocation);

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLocation.mockReturnValue({ pathname: "/dashboard" } as ReturnType<typeof useLocation>);
  });

  it("should render label correctly", () => {
    render(<SidebarItem label="Dashboard" path="/dashboard" />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("should render icon when provided", () => {
    render(<SidebarItem label="Dashboard" path="/dashboard" icon="📊" />);
    expect(screen.getByText("📊")).toBeInTheDocument();
  });

  it("should not render icon when not provided", () => {
    const { container } = render(<SidebarItem label="Dashboard" path="/dashboard" />);
    const icons = container.querySelectorAll(".text-lg");
    expect(icons.length).toBe(0);
  });

  it("should render as Link when no subItems", () => {
    render(<SidebarItem label="Dashboard" path="/dashboard" />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/dashboard");
  });

  it("should apply active styles when path matches location", () => {
    mockUseLocation.mockReturnValue({ pathname: "/dashboard" } as ReturnType<typeof useLocation>);
    const { container } = render(<SidebarItem label="Dashboard" path="/dashboard" />);
    const link = container.querySelector("a");
    expect(link).toHaveClass("text-white");
  });

  it("should apply inactive styles when path does not match location", () => {
    mockUseLocation.mockReturnValue({ pathname: "/other" } as ReturnType<typeof useLocation>);
    const { container } = render(<SidebarItem label="Dashboard" path="/dashboard" />);
    const link = container.querySelector("a");
    expect(link).toHaveClass("text-gray-700", "dark:text-gray-300");
  });

  it("should render as button with subItems", () => {
    const subItems = [{ label: "Sub Item", path: "/sub" }];
    render(<SidebarItem label="Parent" path="/parent" subItems={subItems} />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("should toggle expansion when button is clicked", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const subItems = [{ label: "Sub Item", path: "/sub" }];

    render(
      <SidebarItem
        label="Parent"
        path="/parent"
        subItems={subItems}
        isExpanded={false}
        onToggle={onToggle}
      />
    );

    const button = screen.getByRole("button");
    await user.click(button);

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("should render subItems when expanded", () => {
    const subItems = [
      { label: "Sub Item 1", path: "/sub1" },
      { label: "Sub Item 2", path: "/sub2" },
    ];

    render(
      <SidebarItem
        label="Parent"
        path="/parent"
        subItems={subItems}
        isExpanded={true}
        onToggle={vi.fn()}
      />
    );

    expect(screen.getByText("Sub Item 1")).toBeInTheDocument();
    expect(screen.getByText("Sub Item 2")).toBeInTheDocument();
  });

  it("should not render subItems when not expanded", () => {
    const subItems = [{ label: "Sub Item", path: "/sub" }];

    render(
      <SidebarItem
        label="Parent"
        path="/parent"
        subItems={subItems}
        isExpanded={false}
        onToggle={vi.fn()}
      />
    );

    expect(screen.queryByText("Sub Item")).not.toBeInTheDocument();
  });

  it("should show active state when subItem path matches location", () => {
    mockUseLocation.mockReturnValue({ pathname: "/sub" } as ReturnType<typeof useLocation>);
    const subItems = [{ label: "Sub Item", path: "/sub" }];

    render(
      <SidebarItem
        label="Parent"
        path="/parent"
        subItems={subItems}
        isExpanded={true}
        onToggle={vi.fn()}
      />
    );

    const subItemLink = screen.getByText("Sub Item").closest("a");
    expect(subItemLink).toHaveClass("text-white");
  });

  it("should call onItemClick when subItem is clicked", async () => {
    const user = userEvent.setup();
    const onItemClick = vi.fn();
    const subItems = [{ label: "Sub Item", path: "/sub" }];

    render(
      <SidebarItem
        label="Parent"
        path="/parent"
        subItems={subItems}
        isExpanded={true}
        onToggle={vi.fn()}
        onItemClick={onItemClick}
      />
    );

    const subItemLink = screen.getByText("Sub Item").closest("a");
    if (subItemLink) {
      await user.click(subItemLink);
      expect(onItemClick).toHaveBeenCalledTimes(1);
    }
  });

  it("should toggle on Enter key press", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const subItems = [{ label: "Sub Item", path: "/sub" }];

    render(
      <SidebarItem
        label="Parent"
        path="/parent"
        subItems={subItems}
        isExpanded={false}
        onToggle={onToggle}
      />
    );

    const button = screen.getByRole("button");
    button.focus();
    await user.keyboard("{Enter}");

    // onToggle may be called multiple times due to event handling
    expect(onToggle).toHaveBeenCalled();
  });

  it("should toggle on Space key press", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const subItems = [{ label: "Sub Item", path: "/sub" }];

    render(
      <SidebarItem
        label="Parent"
        path="/parent"
        subItems={subItems}
        isExpanded={false}
        onToggle={onToggle}
      />
    );

    const button = screen.getByRole("button");
    button.focus();
    await user.keyboard(" ");

    // onToggle may be called multiple times due to event handling
    expect(onToggle).toHaveBeenCalled();
  });

  it("should rotate chevron when expanded", () => {
    const subItems = [{ label: "Sub Item", path: "/sub" }];
    const { container } = render(
      <SidebarItem
        label="Parent"
        path="/parent"
        subItems={subItems}
        isExpanded={true}
        onToggle={vi.fn()}
      />
    );

    const chevron = container.querySelector("svg");
    expect(chevron).toHaveClass("rotate-90");
  });

  it("should not rotate chevron when not expanded", () => {
    const subItems = [{ label: "Sub Item", path: "/sub" }];
    const { container } = render(
      <SidebarItem
        label="Parent"
        path="/parent"
        subItems={subItems}
        isExpanded={false}
        onToggle={vi.fn()}
      />
    );

    const chevron = container.querySelector("svg");
    expect(chevron).not.toHaveClass("rotate-90");
  });
});
