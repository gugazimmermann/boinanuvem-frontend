import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  StatusBadge,
  ProgressBar,
  UserAvatars,
  ActionButton,
  TableActionButtons,
} from "../table-helpers";

vi.mock("../../site/constants", () => ({
  COLORS: {
    primary: "#3b82f6",
  },
}));

describe("StatusBadge", () => {
  it("should render label", () => {
    render(<StatusBadge label="Active" />);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("should render with default variant", () => {
    const { container } = render(<StatusBadge label="Default" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass("text-gray-500");
  });

  it("should render with success variant", () => {
    const { container } = render(<StatusBadge label="Success" variant="success" />);
    const badge = container.firstChild as HTMLElement;
    const styles = window.getComputedStyle(badge);
    expect(styles.color).toMatch(/white|rgb\(255,\s*255,\s*255\)/i);
    // The backgroundColor is set via inline style as COLORS.primary (#3b82f6)
    // The browser may convert it to different formats (rgb, oklch, etc.)
    // Check that the inline style is set (it should be #3b82f6 or converted format)
    expect(badge.style.backgroundColor).toBeTruthy();
    // Verify it's the primary color - check if it's the hex value or a converted format
    const bgColor = badge.style.backgroundColor;
    expect(bgColor).toMatch(/#3b82f6|rgb\(59,\s*130,\s*246\)|oklch/i);
  });

  it("should render with warning variant", () => {
    const { container } = render(<StatusBadge label="Warning" variant="warning" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass("text-yellow-600");
  });

  it("should render with danger variant", () => {
    const { container } = render(<StatusBadge label="Danger" variant="danger" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass("text-red-600");
  });

  it("should render with info variant", () => {
    const { container } = render(<StatusBadge label="Info" variant="info" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass("text-blue-600");
  });
});

describe("ProgressBar", () => {
  it("should render progress bar", () => {
    const { container } = render(<ProgressBar value={50} />);
    const bar = container.querySelector(".bg-blue-500");
    expect(bar).toBeInTheDocument();
  });

  it("should calculate percentage correctly", () => {
    const { container } = render(<ProgressBar value={50} max={100} />);
    const bar = container.querySelector('[style*="width: 50%"]');
    expect(bar).toBeTruthy();
  });

  it("should handle value greater than max", () => {
    render(<ProgressBar value={150} max={100} />);
    const bar = document.querySelector('[style*="width: 100%"]');
    expect(bar).toBeTruthy();
  });

  it("should handle negative value", () => {
    render(<ProgressBar value={-10} max={100} />);
    const bar = document.querySelector('[style*="width: 0%"]');
    expect(bar).toBeTruthy();
  });

  it("should apply custom className", () => {
    const { container } = render(<ProgressBar value={50} className="custom-class" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("custom-class");
  });

  it("should apply custom barClassName", () => {
    render(<ProgressBar value={50} barClassName="custom-bar-class" />);
    const bar = document.querySelector(".custom-bar-class");
    expect(bar).toBeInTheDocument();
  });
});

describe("UserAvatars", () => {
  const mockUsers = [
    { name: "John Doe", avatar: "https://example.com/john.jpg" },
    { name: "Jane Smith", avatar: "https://example.com/jane.jpg" },
    { name: "Bob Johnson" },
  ];

  it("should render user avatars", () => {
    render(<UserAvatars users={mockUsers} />);
    const images = screen.getAllByRole("img");
    expect(images.length).toBeGreaterThan(0);
  });

  it("should show remaining count when users exceed maxVisible", () => {
    const manyUsers = Array.from({ length: 10 }, (_, i) => ({ name: `User ${i}` }));
    render(<UserAvatars users={manyUsers} maxVisible={4} />);
    expect(screen.getByText("+6")).toBeInTheDocument();
  });

  it("should not show remaining count when users are within maxVisible", () => {
    render(<UserAvatars users={mockUsers} maxVisible={5} />);
    expect(screen.queryByText(/\+/)).not.toBeInTheDocument();
  });

  it("should render with small size", () => {
    render(<UserAvatars users={mockUsers} size="sm" />);
    const images = screen.getAllByRole("img");
    expect(images[0]).toHaveClass("w-5", "h-5");
  });

  it("should render with medium size by default", () => {
    render(<UserAvatars users={mockUsers} />);
    const images = screen.getAllByRole("img");
    expect(images[0]).toHaveClass("w-6", "h-6");
  });

  it("should render with large size", () => {
    render(<UserAvatars users={mockUsers} size="lg" />);
    const images = screen.getAllByRole("img");
    expect(images[0]).toHaveClass("w-8", "h-8");
  });

  it("should use custom avatar URL when provided", () => {
    render(<UserAvatars users={mockUsers} />);
    const image = screen.getByAltText("John Doe");
    expect(image).toHaveAttribute("src", "https://example.com/john.jpg");
  });

  it("should generate avatar URL when not provided", () => {
    render(<UserAvatars users={[{ name: "Test User" }]} />);
    const image = screen.getByAltText("Test User");
    expect(image).toHaveAttribute("src", expect.stringContaining("ui-avatars.com"));
  });
});

describe("ActionButton", () => {
  it("should render button", () => {
    const onClick = vi.fn();
    render(<ActionButton onClick={onClick} />);
    const button = screen.getByRole("button", { name: /actions/i });
    expect(button).toBeInTheDocument();
  });

  it("should call onClick when clicked", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<ActionButton onClick={onClick} />);
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("should render custom icon", () => {
    const onClick = vi.fn();
    const customIcon = <span data-testid="custom-icon">Icon</span>;
    render(<ActionButton onClick={onClick} icon={customIcon} />);
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("should render default icon when icon not provided", () => {
    const onClick = vi.fn();
    const { container } = render(<ActionButton onClick={onClick} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should use custom label for aria-label", () => {
    const onClick = vi.fn();
    render(<ActionButton onClick={onClick} label="Custom Action" />);
    const button = screen.getByRole("button", { name: /custom action/i });
    expect(button).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const onClick = vi.fn();
    render(<ActionButton onClick={onClick} className="custom-class" />);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("custom-class");
  });
});

describe("TableActionButtons", () => {
  it("should render view button when onView is provided", async () => {
    const onView = vi.fn();
    const user = userEvent.setup();
    render(<TableActionButtons onView={onView} />);
    const viewButton = screen.getByRole("button", { name: /view/i });
    expect(viewButton).toBeInTheDocument();
    await user.click(viewButton);
    expect(onView).toHaveBeenCalledTimes(1);
  });

  it("should render edit button when onEdit is provided", async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();
    render(<TableActionButtons onEdit={onEdit} />);
    const editButton = screen.getByRole("button", { name: /edit/i });
    expect(editButton).toBeInTheDocument();
    await user.click(editButton);
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it("should render delete button when onDelete is provided", async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    render(<TableActionButtons onDelete={onDelete} />);
    const deleteButton = screen.getByRole("button", { name: /delete/i });
    expect(deleteButton).toBeInTheDocument();
    await user.click(deleteButton);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("should not render view button when canView is false", () => {
    render(<TableActionButtons onView={vi.fn()} canView={false} />);
    expect(screen.queryByRole("button", { name: /view/i })).not.toBeInTheDocument();
  });

  it("should not render edit button when canEdit is false", () => {
    render(<TableActionButtons onEdit={vi.fn()} canEdit={false} />);
    expect(screen.queryByRole("button", { name: /edit/i })).not.toBeInTheDocument();
  });

  it("should not render delete button when canDelete is false", () => {
    render(<TableActionButtons onDelete={vi.fn()} canDelete={false} />);
    expect(screen.queryByRole("button", { name: /delete/i })).not.toBeInTheDocument();
  });

  it("should stop propagation on edit click", async () => {
    const onEdit = vi.fn();
    const onRowClick = vi.fn();
    const user = userEvent.setup();
    render(
      <div onClick={onRowClick}>
        <TableActionButtons onEdit={onEdit} />
      </div>
    );
    const editButton = screen.getByRole("button", { name: /edit/i });
    await user.click(editButton);
    expect(onEdit).toHaveBeenCalled();
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it("should stop propagation on delete click", async () => {
    const onDelete = vi.fn();
    const onRowClick = vi.fn();
    const user = userEvent.setup();
    render(
      <div onClick={onRowClick}>
        <TableActionButtons onDelete={onDelete} />
      </div>
    );
    const deleteButton = screen.getByRole("button", { name: /delete/i });
    await user.click(deleteButton);
    expect(onDelete).toHaveBeenCalled();
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it("should apply custom className", () => {
    const { container } = render(<TableActionButtons className="custom-class" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("custom-class");
  });
});
