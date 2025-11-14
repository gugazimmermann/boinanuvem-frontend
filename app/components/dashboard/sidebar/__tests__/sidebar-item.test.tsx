import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { SidebarItem } from "../sidebar-item";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter initialEntries={["/dashboard"]}>{children}</MemoryRouter>
);

describe("SidebarItem", () => {
  it("should render sidebar item", () => {
    render(<SidebarItem label="Test Item" path="/test" />, { wrapper });
    expect(screen.getByText("Test Item")).toBeInTheDocument();
  });

  it("should render with icon", () => {
    render(<SidebarItem label="Test Item" path="/test" icon="📊" />, { wrapper });
    expect(screen.getByText("📊")).toBeInTheDocument();
  });

  it("should render as link when no subItems", () => {
    render(<SidebarItem label="Test Item" path="/test" />, { wrapper });
    const link = screen.getByText("Test Item").closest("a");
    expect(link).toHaveAttribute("href", "/test");
  });

  it("should expand when clicked with subItems", async () => {
    const user = userEvent.setup();
    const subItems = [
      { label: "Sub Item 1", path: "/test/sub1" },
      { label: "Sub Item 2", path: "/test/sub2" },
    ];

    render(<SidebarItem label="Test Item" path="/test" subItems={subItems} />, { wrapper });

    const item = screen.getByText("Test Item").closest("div");
    if (item) {
      await user.click(item);
      expect(screen.getByText("Sub Item 1")).toBeInTheDocument();
      expect(screen.getByText("Sub Item 2")).toBeInTheDocument();
    }
  });

  it("should render subItems when expanded", async () => {
    const user = userEvent.setup();
    const subItems = [{ label: "Sub Item", path: "/test/sub" }];

    render(<SidebarItem label="Test Item" path="/test" subItems={subItems} />, { wrapper });

    const item = screen.getByText("Test Item").closest("div");
    if (item) {
      await user.click(item);
      expect(screen.getByText("Sub Item")).toBeInTheDocument();
    }
  });
});
