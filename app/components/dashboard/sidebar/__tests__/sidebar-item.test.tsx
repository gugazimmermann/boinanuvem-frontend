import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { SidebarItem } from "../sidebar-item";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter initialEntries={["/dashboard"]}>{children}</MemoryRouter>
);

describe("SidebarItem", () => {
  it("should render sidebar item", () => {
    render(<SidebarItem translationKey="test" label="Test Item" path="/test" />, { wrapper });
    expect(screen.getByText("Test Item")).toBeInTheDocument();
  });

  it("should render with icon", () => {
    render(<SidebarItem translationKey="test" label="Test Item" path="/test" icon="📊" />, {
      wrapper,
    });
    expect(screen.getByText("📊")).toBeInTheDocument();
  });

  it("should render as link when no subItems", () => {
    render(<SidebarItem translationKey="test" label="Test Item" path="/test" />, { wrapper });
    const link = screen.getByText("Test Item").closest("a");
    expect(link).toHaveAttribute("href", "/test");
  });

  it("should call onToggle when clicked with subItems", async () => {
    const user = userEvent.setup();
    const subItems = [
      { label: "Sub Item 1", path: "/test/sub1" },
      { label: "Sub Item 2", path: "/test/sub2" },
    ];
    const handleToggle = vi.fn();

    render(
      <SidebarItem
        translationKey="test"
        label="Test Item"
        path="/test"
        subItems={subItems}
        isExpanded={false}
        onToggle={handleToggle}
      />,
      { wrapper }
    );

    const item = screen.getByText("Test Item").closest("div");
    if (item) {
      await user.click(item);
      expect(handleToggle).toHaveBeenCalledTimes(1);
    }
  });

  it("should render subItems when expanded", () => {
    const subItems = [{ label: "Sub Item", path: "/test/sub" }];

    render(
      <SidebarItem
        translationKey="test"
        label="Test Item"
        path="/test"
        subItems={subItems}
        isExpanded={true}
        onToggle={() => {}}
      />,
      { wrapper }
    );

    expect(screen.getByText("Sub Item")).toBeInTheDocument();
  });
});
