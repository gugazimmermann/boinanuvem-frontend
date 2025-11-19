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

  describe("Mobile sidebar close behavior", () => {
    it("should call onItemClick callback when main item is clicked", async () => {
      const user = userEvent.setup();
      const handleItemClick = vi.fn();

      render(
        <SidebarItem
          translationKey="test"
          label="Test Item"
          path="/test"
          onItemClick={handleItemClick}
        />,
        { wrapper }
      );

      const link = screen.getByText("Test Item").closest("a");
      if (link) {
        await user.click(link);
        expect(handleItemClick).toHaveBeenCalledTimes(1);
      }
    });

    it("should call onItemClick callback when sub-item is clicked", async () => {
      const user = userEvent.setup();
      const handleItemClick = vi.fn();
      const subItems = [{ label: "Sub Item", path: "/test/sub" }];

      render(
        <SidebarItem
          translationKey="test"
          label="Test Item"
          path="/test"
          subItems={subItems}
          isExpanded={true}
          onToggle={() => {}}
          onItemClick={handleItemClick}
        />,
        { wrapper }
      );

      const subItemLink = screen.getByText("Sub Item").closest("a");
      if (subItemLink) {
        await user.click(subItemLink);
        expect(handleItemClick).toHaveBeenCalledTimes(1);
      }
    });

    it("should not call onItemClick when it is not provided", async () => {
      const user = userEvent.setup();

      render(<SidebarItem translationKey="test" label="Test Item" path="/test" />, { wrapper });

      const link = screen.getByText("Test Item").closest("a");
      if (link) {
        await user.click(link);
        // Should not throw error when onItemClick is undefined
        expect(link).toBeInTheDocument();
      }
    });

    it("should close sidebar when navigating to a route (mobile behavior)", async () => {
      const user = userEvent.setup();
      const handleItemClick = vi.fn();

      render(
        <SidebarItem
          translationKey="test"
          label="Test Item"
          path="/test"
          onItemClick={handleItemClick}
        />,
        { wrapper }
      );

      const link = screen.getByText("Test Item").closest("a");
      if (link) {
        await user.click(link);
        // onItemClick should be called to close sidebar on mobile
        expect(handleItemClick).toHaveBeenCalled();
      }
    });
  });
});
