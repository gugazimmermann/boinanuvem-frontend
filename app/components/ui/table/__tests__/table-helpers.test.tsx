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
import { COLORS } from "~/components/site/constants";

describe("StatusBadge", () => {
  it("should render with label", () => {
    render(<StatusBadge label="Active" />);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("should render with default variant", () => {
    const { container } = render(<StatusBadge label="Default" />);
    const badge = container.querySelector("div");
    expect(badge).toHaveClass("text-gray-500");
  });

  it("should render with success variant and apply success style", () => {
    const { container } = render(<StatusBadge label="Success" variant="success" />);
    const badge = container.querySelector("div");
    const styles = window.getComputedStyle(badge!);
    expect(badge).toHaveStyle({
      backgroundColor: COLORS.primary,
    });
    expect(styles.color).toContain("255");
    expect(badge).not.toHaveClass("text-gray-500");
  });

  it("should render with warning variant", () => {
    const { container } = render(<StatusBadge label="Warning" variant="warning" />);
    const badge = container.querySelector("div");
    expect(badge).toHaveClass("text-yellow-600");
    expect(badge).toHaveClass("bg-yellow-100");
  });

  it("should render with danger variant", () => {
    const { container } = render(<StatusBadge label="Danger" variant="danger" />);
    const badge = container.querySelector("div");
    expect(badge).toHaveClass("text-red-600");
    expect(badge).toHaveClass("bg-red-100");
  });

  it("should render with info variant", () => {
    const { container } = render(<StatusBadge label="Info" variant="info" />);
    const badge = container.querySelector("div");
    expect(badge).toHaveClass("text-blue-600");
    expect(badge).toHaveClass("bg-blue-100");
  });
});

describe("ProgressBar", () => {
  it("should render with value and max", () => {
    const { container } = render(<ProgressBar value={50} max={100} />);
    const bar = container.querySelector("div[style*='width']");
    expect(bar).toHaveStyle({ width: "50%" });
  });

  it("should calculate percentage correctly", () => {
    const { container } = render(<ProgressBar value={25} max={100} />);
    const bar = container.querySelector("div[style*='width']");
    expect(bar).toHaveStyle({ width: "25%" });
  });

  it("should handle value greater than max (clamp to 100%)", () => {
    const { container } = render(<ProgressBar value={150} max={100} />);
    const bar = container.querySelector("div[style*='width']");
    expect(bar).toHaveStyle({ width: "100%" });
  });

  it("should handle value less than 0 (clamp to 0%)", () => {
    const { container } = render(<ProgressBar value={-10} max={100} />);
    const bar = container.querySelector("div[style*='width']");
    expect(bar).toHaveStyle({ width: "0%" });
  });

  it("should handle zero value", () => {
    const { container } = render(<ProgressBar value={0} max={100} />);
    const bar = container.querySelector("div[style*='width']");
    expect(bar).toHaveStyle({ width: "0%" });
  });

  it("should handle max value", () => {
    const { container } = render(<ProgressBar value={100} max={100} />);
    const bar = container.querySelector("div[style*='width']");
    expect(bar).toHaveStyle({ width: "100%" });
  });

  it("should use default max of 100", () => {
    const { container } = render(<ProgressBar value={50} />);
    const bar = container.querySelector("div[style*='width']");
    expect(bar).toHaveStyle({ width: "50%" });
  });

  it("should apply custom className", () => {
    const { container } = render(<ProgressBar value={50} className="custom-class" />);
    const wrapper = container.querySelector("div.w-48");
    expect(wrapper).toHaveClass("custom-class");
  });

  it("should apply custom barClassName", () => {
    const { container } = render(<ProgressBar value={50} barClassName="custom-bar" />);
    const bar = container.querySelector("div[style*='width']");
    expect(bar).toHaveClass("custom-bar");
  });

  it("should handle custom max value", () => {
    const { container } = render(<ProgressBar value={50} max={200} />);
    const bar = container.querySelector("div[style*='width']");
    expect(bar).toHaveStyle({ width: "25%" });
  });
});

describe("UserAvatars", () => {
  const mockUsers = [
    { name: "Alice" },
    { name: "Bob" },
    { name: "Charlie" },
    { name: "David" },
    { name: "Eve" },
  ];

  it("should render users up to maxVisible", () => {
    render(<UserAvatars users={mockUsers} maxVisible={3} />);
    expect(screen.getByAltText("Alice")).toBeInTheDocument();
    expect(screen.getByAltText("Bob")).toBeInTheDocument();
    expect(screen.getByAltText("Charlie")).toBeInTheDocument();
    expect(screen.queryByAltText("David")).not.toBeInTheDocument();
  });

  it("should show remaining count when users exceed maxVisible", () => {
    render(<UserAvatars users={mockUsers} maxVisible={3} />);
    expect(screen.getByText("+2")).toBeInTheDocument();
  });

  it("should not show remaining count when users are within maxVisible", () => {
    render(<UserAvatars users={mockUsers.slice(0, 3)} maxVisible={4} />);
    expect(screen.queryByText(/\+/)).not.toBeInTheDocument();
  });

  it("should use default maxVisible of 4", () => {
    render(<UserAvatars users={mockUsers} />);
    expect(screen.getByText("+1")).toBeInTheDocument();
  });

  it("should handle empty users array", () => {
    const { container } = render(<UserAvatars users={[]} />);
    const wrapper = container.querySelector("div.flex");
    expect(wrapper?.children).toHaveLength(0);
  });

  it("should use avatar URL when provided", () => {
    const usersWithAvatar = [{ name: "Alice", avatar: "https://example.com/avatar.jpg" }];
    render(<UserAvatars users={usersWithAvatar} />);
    const img = screen.getByAltText("Alice");
    expect(img).toHaveAttribute("src", "https://example.com/avatar.jpg");
  });

  it("should generate avatar URL when not provided", () => {
    render(<UserAvatars users={[{ name: "John Doe" }]} />);
    const img = screen.getByAltText("John Doe");
    const src = img.getAttribute("src");
    expect(src).toContain("ui-avatars.com");
    expect(src).toContain(encodeURIComponent("John Doe"));
  });

  it("should apply small size class", () => {
    const { container } = render(<UserAvatars users={[{ name: "Alice" }]} size="sm" />);
    const img = container.querySelector("img");
    expect(img).toHaveClass("w-5", "h-5");
  });

  it("should apply medium size class (default)", () => {
    const { container } = render(<UserAvatars users={[{ name: "Alice" }]} />);
    const img = container.querySelector("img");
    expect(img).toHaveClass("w-6", "h-6");
  });

  it("should apply large size class", () => {
    const { container } = render(<UserAvatars users={[{ name: "Alice" }]} size="lg" />);
    const img = container.querySelector("img");
    expect(img).toHaveClass("w-8", "h-8");
  });

  it("should apply size class to remaining count badge", () => {
    render(<UserAvatars users={mockUsers} maxVisible={3} size="lg" />);
    const badge = screen.getByText("+2");
    const badgeContainer = badge.closest("div.flex.items-center.justify-center");
    expect(badgeContainer).toHaveClass("w-8", "h-8");
  });

  it("should handle exactly maxVisible users", () => {
    render(<UserAvatars users={mockUsers.slice(0, 4)} maxVisible={4} />);
    expect(screen.queryByText(/\+/)).not.toBeInTheDocument();
  });

  it("should handle more than maxVisible users", () => {
    render(<UserAvatars users={mockUsers} maxVisible={2} />);
    expect(screen.getByText("+3")).toBeInTheDocument();
  });
});

describe("ActionButton", () => {
  it("should render button", () => {
    const onClick = vi.fn();
    render(<ActionButton onClick={onClick} />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("should call onClick when clicked", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<ActionButton onClick={onClick} />);
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("should render default icon when no icon provided", () => {
    const { container } = render(<ActionButton onClick={vi.fn()} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should render custom icon when provided", () => {
    const customIcon = <span data-testid="custom-icon">Icon</span>;
    render(<ActionButton onClick={vi.fn()} icon={customIcon} />);
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    const svg = screen.queryByRole("img", { hidden: true });
    expect(svg).not.toBeInTheDocument();
  });

  it("should use label as aria-label when provided", () => {
    render(<ActionButton onClick={vi.fn()} label="Edit item" />);
    const button = screen.getByRole("button", { name: "Edit item" });
    expect(button).toHaveAttribute("aria-label", "Edit item");
  });

  it("should use default aria-label when label not provided", () => {
    render(<ActionButton onClick={vi.fn()} />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "Actions");
  });

  it("should apply custom className", () => {
    const { container } = render(<ActionButton onClick={vi.fn()} className="custom-class" />);
    const button = container.querySelector("button");
    expect(button).toHaveClass("custom-class");
  });
});

describe("TableActionButtons", () => {
  it("should render view button when onView is provided", () => {
    const onView = vi.fn();
    render(<TableActionButtons onView={onView} />);
    expect(screen.getByRole("button", { name: "View" })).toBeInTheDocument();
  });

  it("should render edit button when onEdit is provided", () => {
    const onEdit = vi.fn();
    render(<TableActionButtons onEdit={onEdit} />);
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
  });

  it("should render delete button when onDelete is provided", () => {
    const onDelete = vi.fn();
    render(<TableActionButtons onDelete={onDelete} />);
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("should call onView when view button is clicked", async () => {
    const onView = vi.fn();
    const user = userEvent.setup();
    render(<TableActionButtons onView={onView} />);
    await user.click(screen.getByRole("button", { name: "View" }));
    expect(onView).toHaveBeenCalledTimes(1);
  });

  it("should call onEdit when edit button is clicked and stop propagation", async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();
    const parentClick = vi.fn();

    render(
      <div onClick={parentClick}>
        <TableActionButtons onEdit={onEdit} />
      </div>
    );

    const editButton = screen.getByRole("button", { name: "Edit" });
    const stopPropagationSpy = vi.spyOn(MouseEvent.prototype, "stopPropagation");

    await user.click(editButton);

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(stopPropagationSpy).toHaveBeenCalled();
    expect(parentClick).not.toHaveBeenCalled();

    stopPropagationSpy.mockRestore();
  });

  it("should call onDelete when delete button is clicked and stop propagation", async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    const parentClick = vi.fn();

    render(
      <div onClick={parentClick}>
        <TableActionButtons onDelete={onDelete} />
      </div>
    );

    const deleteButton = screen.getByRole("button", { name: "Delete" });
    const stopPropagationSpy = vi.spyOn(MouseEvent.prototype, "stopPropagation");

    await user.click(deleteButton);

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(stopPropagationSpy).toHaveBeenCalled();
    expect(parentClick).not.toHaveBeenCalled();

    stopPropagationSpy.mockRestore();
  });

  it("should not render view button when canView is false", () => {
    const onView = vi.fn();
    render(<TableActionButtons onView={onView} canView={false} />);
    expect(screen.queryByRole("button", { name: "View" })).not.toBeInTheDocument();
  });

  it("should not render edit button when canEdit is false", () => {
    const onEdit = vi.fn();
    render(<TableActionButtons onEdit={onEdit} canEdit={false} />);
    expect(screen.queryByRole("button", { name: "Edit" })).not.toBeInTheDocument();
  });

  it("should not render delete button when canDelete is false", () => {
    const onDelete = vi.fn();
    render(<TableActionButtons onDelete={onDelete} canDelete={false} />);
    expect(screen.queryByRole("button", { name: "Delete" })).not.toBeInTheDocument();
  });

  it("should render all buttons when all handlers are provided", () => {
    const onView = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(<TableActionButtons onView={onView} onEdit={onEdit} onDelete={onDelete} />);
    expect(screen.getByRole("button", { name: "View" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(<TableActionButtons onView={vi.fn()} className="custom-class" />);
    const wrapper = container.querySelector("div.flex");
    expect(wrapper).toHaveClass("custom-class");
  });

  it("should use default canView, canEdit, canDelete as true", () => {
    const onView = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(<TableActionButtons onView={onView} onEdit={onEdit} onDelete={onDelete} />);
    expect(screen.getByRole("button", { name: "View" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });
});
