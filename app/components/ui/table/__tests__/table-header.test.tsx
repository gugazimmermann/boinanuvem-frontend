import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TableHeader } from "../table-header";
import type { TableHeaderProps } from "../types";

describe("TableHeader", () => {
  it("should render title", () => {
    const props: TableHeaderProps = {
      title: "Test Table",
    };
    render(<TableHeader {...props} />);
    expect(screen.getByText("Test Table")).toBeInTheDocument();
  });

  it("should render description", () => {
    const props: TableHeaderProps = {
      title: "Test Table",
      description: "Table description",
    };
    render(<TableHeader {...props} />);
    expect(screen.getByText("Table description")).toBeInTheDocument();
  });

  it("should render badge with primary variant", () => {
    const props: TableHeaderProps = {
      title: "Test Table",
      badge: {
        label: "New",
        variant: "primary",
      },
    };
    render(<TableHeader {...props} />);
    expect(screen.getByText("New")).toBeInTheDocument();
    const badge = screen.getByText("New");
    expect(badge).toHaveClass("bg-blue-100");
  });

  it("should render badge with secondary variant", () => {
    const props: TableHeaderProps = {
      title: "Test Table",
      badge: {
        label: "Secondary",
        variant: "secondary",
      },
    };
    render(<TableHeader {...props} />);
    const badge = screen.getByText("Secondary");
    expect(badge).toHaveClass("bg-gray-100");
  });

  it("should render badge with success variant", () => {
    const props: TableHeaderProps = {
      title: "Test Table",
      badge: {
        label: "Success",
        variant: "success",
      },
    };
    render(<TableHeader {...props} />);
    const badge = screen.getByText("Success");
    expect(badge).toHaveClass("bg-emerald-100/60");
  });

  it("should render badge with warning variant", () => {
    const props: TableHeaderProps = {
      title: "Test Table",
      badge: {
        label: "Warning",
        variant: "warning",
      },
    };
    render(<TableHeader {...props} />);
    const badge = screen.getByText("Warning");
    expect(badge).toHaveClass("bg-yellow-100");
  });

  it("should render badge with danger variant", () => {
    const props: TableHeaderProps = {
      title: "Test Table",
      badge: {
        label: "Danger",
        variant: "danger",
      },
    };
    render(<TableHeader {...props} />);
    const badge = screen.getByText("Danger");
    expect(badge).toHaveClass("bg-red-100");
  });

  it("should render actions", () => {
    const action1 = {
      label: "Add",
      onClick: vi.fn(),
    };
    const action2 = {
      label: "Export",
      onClick: vi.fn(),
    };
    const props: TableHeaderProps = {
      title: "Test Table",
      actions: [action1, action2],
    };
    render(<TableHeader {...props} />);
    expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /export/i })).toBeInTheDocument();
  });

  it("should call action onClick when clicked", async () => {
    const onClick = vi.fn();
    const props: TableHeaderProps = {
      title: "Test Table",
      actions: [
        {
          label: "Add",
          onClick,
        },
      ],
    };
    const user = userEvent.setup();
    render(<TableHeader {...props} />);
    await user.click(screen.getByRole("button", { name: /add/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("should render action with leftIcon", () => {
    const icon = <span data-testid="left-icon">Icon</span>;
    const props: TableHeaderProps = {
      title: "Test Table",
      actions: [
        {
          label: "Add",
          onClick: vi.fn(),
          leftIcon: icon,
        },
      ],
    };
    render(<TableHeader {...props} />);
    expect(screen.getByTestId("left-icon")).toBeInTheDocument();
  });

  it("should render action with rightIcon", () => {
    const icon = <span data-testid="right-icon">Icon</span>;
    const props: TableHeaderProps = {
      title: "Test Table",
      actions: [
        {
          label: "Add",
          onClick: vi.fn(),
          rightIcon: icon,
        },
      ],
    };
    render(<TableHeader {...props} />);
    expect(screen.getByTestId("right-icon")).toBeInTheDocument();
  });

  it("should render action with icon (fallback to leftIcon)", () => {
    const icon = <span data-testid="icon">Icon</span>;
    const props: TableHeaderProps = {
      title: "Test Table",
      actions: [
        {
          label: "Add",
          onClick: vi.fn(),
          icon,
        },
      ],
    };
    render(<TableHeader {...props} />);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("should use default variant for actions", () => {
    const props: TableHeaderProps = {
      title: "Test Table",
      actions: [
        {
          label: "Add",
          onClick: vi.fn(),
        },
      ],
    };
    render(<TableHeader {...props} />);
    const button = screen.getByRole("button", { name: /add/i });
    expect(button).toHaveClass("border-2");
  });

  it("should not render actions when actions array is empty", () => {
    const props: TableHeaderProps = {
      title: "Test Table",
      actions: [],
    };
    render(<TableHeader {...props} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
