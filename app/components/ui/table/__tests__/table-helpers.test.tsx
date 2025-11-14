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

describe("table-helpers", () => {
  describe("StatusBadge", () => {
    it("should render badge with label", () => {
      render(<StatusBadge label="Active" />);
      expect(screen.getByText("Active")).toBeInTheDocument();
    });

    it("should render success variant", () => {
      render(<StatusBadge label="Success" variant="success" />);
      const badge = screen.getByText("Success");
      expect(badge).toBeInTheDocument();
    });

    it("should render warning variant", () => {
      render(<StatusBadge label="Warning" variant="warning" />);
      const badge = screen.getByText("Warning");
      expect(badge.className).toContain("text-yellow-600");
    });

    it("should render danger variant", () => {
      render(<StatusBadge label="Danger" variant="danger" />);
      const badge = screen.getByText("Danger");
      expect(badge.className).toContain("text-red-600");
    });

    it("should render info variant", () => {
      render(<StatusBadge label="Info" variant="info" />);
      const badge = screen.getByText("Info");
      expect(badge.className).toContain("text-blue-600");
    });

    it("should render default variant", () => {
      render(<StatusBadge label="Default" variant="default" />);
      const badge = screen.getByText("Default");
      expect(badge.className).toContain("text-gray-500");
    });
  });

  describe("ProgressBar", () => {
    it("should render progress bar", () => {
      const { container } = render(<ProgressBar value={50} />);
      const progressBar = container.querySelector(".bg-blue-200");
      expect(progressBar).toBeInTheDocument();
    });

    it("should calculate percentage correctly", () => {
      const { container } = render(<ProgressBar value={50} max={100} />);
      const fill = container.querySelector(".bg-blue-500");
      expect(fill).toHaveStyle({ width: "50%" });
    });

    it("should handle custom max value", () => {
      const { container } = render(<ProgressBar value={25} max={50} />);
      const fill = container.querySelector(".bg-blue-500");
      expect(fill).toHaveStyle({ width: "50%" });
    });

    it("should clamp value to 0-100%", () => {
      const { container: container1 } = render(<ProgressBar value={150} />);
      const fill1 = container1.querySelector(".bg-blue-500");
      expect(fill1).toHaveStyle({ width: "100%" });

      const { container: container2 } = render(<ProgressBar value={-10} />);
      const fill2 = container2.querySelector(".bg-blue-500");
      expect(fill2).toHaveStyle({ width: "0%" });
    });

    it("should apply custom className", () => {
      const { container } = render(<ProgressBar value={50} className="custom-class" />);
      const progressBar = container.querySelector(".custom-class");
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe("UserAvatars", () => {
    const users = [{ name: "John Doe" }, { name: "Jane Smith" }, { name: "Bob Johnson" }];

    it("should render user avatars", () => {
      render(<UserAvatars users={users} />);
      const images = document.querySelectorAll("img");
      expect(images.length).toBe(3);
    });

    it("should limit visible users", () => {
      const manyUsers = Array.from({ length: 10 }, (_, i) => ({ name: `User ${i}` }));
      render(<UserAvatars users={manyUsers} maxVisible={4} />);
      const images = document.querySelectorAll("img");
      expect(images.length).toBe(4);
    });

    it("should show remaining count", () => {
      const manyUsers = Array.from({ length: 10 }, (_, i) => ({ name: `User ${i}` }));
      render(<UserAvatars users={manyUsers} maxVisible={4} />);
      expect(screen.getByText("+6")).toBeInTheDocument();
    });

    it("should apply size classes", () => {
      const { container } = render(<UserAvatars users={users} size="sm" />);
      const image = container.querySelector("img");
      expect(image?.className).toContain("w-5 h-5");
    });
  });

  describe("ActionButton", () => {
    it("should render action button", () => {
      render(<ActionButton onClick={vi.fn()} />);
      const button = screen.getByLabelText("Actions");
      expect(button).toBeInTheDocument();
    });

    it("should call onClick when clicked", async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();
      render(<ActionButton onClick={onClick} />);

      const button = screen.getByLabelText("Actions");
      await user.click(button);

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("should render custom icon", () => {
      const icon = <span data-testid="custom-icon">⚙️</span>;
      render(<ActionButton onClick={vi.fn()} icon={icon} />);
      expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    });

    it("should render with custom label", () => {
      render(<ActionButton onClick={vi.fn()} label="Settings" />);
      expect(screen.getByLabelText("Settings")).toBeInTheDocument();
    });
  });

  describe("TableActionButtons", () => {
    it("should render view button", async () => {
      const onView = vi.fn();
      const user = userEvent.setup();
      render(<TableActionButtons onView={onView} />);

      const viewButton = screen.getByLabelText("View");
      await user.click(viewButton);

      expect(onView).toHaveBeenCalledTimes(1);
    });

    it("should render edit button", async () => {
      const onEdit = vi.fn();
      const user = userEvent.setup();
      render(<TableActionButtons onEdit={onEdit} />);

      const editButton = screen.getByLabelText("Edit");
      await user.click(editButton);

      expect(onEdit).toHaveBeenCalledTimes(1);
    });

    it("should render delete button", async () => {
      const onDelete = vi.fn();
      const user = userEvent.setup();
      render(<TableActionButtons onDelete={onDelete} />);

      const deleteButton = screen.getByLabelText("Delete");
      await user.click(deleteButton);

      expect(onDelete).toHaveBeenCalledTimes(1);
    });

    it("should render all action buttons", () => {
      render(<TableActionButtons onView={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />);
      expect(screen.getByLabelText("View")).toBeInTheDocument();
      expect(screen.getByLabelText("Edit")).toBeInTheDocument();
      expect(screen.getByLabelText("Delete")).toBeInTheDocument();
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

      const editButton = screen.getByLabelText("Edit");
      await user.click(editButton);

      expect(onEdit).toHaveBeenCalledTimes(1);
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

      const deleteButton = screen.getByLabelText("Delete");
      await user.click(deleteButton);

      expect(onDelete).toHaveBeenCalledTimes(1);
      expect(onRowClick).not.toHaveBeenCalled();
    });
  });
});
