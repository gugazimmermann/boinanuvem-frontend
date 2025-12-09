import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TablePagination } from "../table-pagination";

describe("TablePagination", () => {
  it("should return null when totalPages is 1", () => {
    const { container } = render(
      <TablePagination currentPage={1} totalPages={1} onPageChange={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("should render pagination when totalPages > 1", () => {
    render(<TablePagination currentPage={1} totalPages={5} onPageChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: /anterior/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /próximo/i })).toBeInTheDocument();
  });

  it("should render all page numbers when totalPages <= 10", () => {
    render(<TablePagination currentPage={1} totalPages={5} onPageChange={vi.fn()} />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("should highlight active page", () => {
    render(<TablePagination currentPage={3} totalPages={5} onPageChange={vi.fn()} />);
    const activeButton = screen.getByText("3").closest("button");
    expect(activeButton).toHaveClass("bg-blue-100/60");
  });

  it("should call onPageChange when page number is clicked", async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    render(<TablePagination currentPage={1} totalPages={5} onPageChange={onPageChange} />);
    await user.click(screen.getByText("2"));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("should call onPageChange when previous button is clicked", async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    render(<TablePagination currentPage={2} totalPages={5} onPageChange={onPageChange} />);
    await user.click(screen.getByRole("button", { name: /anterior/i }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("should call onPageChange when next button is clicked", async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    render(<TablePagination currentPage={2} totalPages={5} onPageChange={onPageChange} />);
    await user.click(screen.getByRole("button", { name: /próximo/i }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("should disable previous button on first page", () => {
    render(<TablePagination currentPage={1} totalPages={5} onPageChange={vi.fn()} />);
    const prevButton = screen.getByRole("button", { name: /anterior/i });
    expect(prevButton).toBeDisabled();
  });

  it("should disable next button on last page", () => {
    render(<TablePagination currentPage={5} totalPages={5} onPageChange={vi.fn()} />);
    const nextButton = screen.getByRole("button", { name: /próximo/i });
    expect(nextButton).toBeDisabled();
  });

  it("should render ellipsis for large page counts", () => {
    render(<TablePagination currentPage={1} totalPages={20} onPageChange={vi.fn()} />);
    const ellipsis = screen.getAllByText("...");
    expect(ellipsis.length).toBeGreaterThan(0);
  });

  it("should render page numbers for start position (currentPage <= 4)", () => {
    render(<TablePagination currentPage={2} totalPages={20} onPageChange={vi.fn()} />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("should render page numbers for end position (currentPage >= totalPages - 3)", () => {
    render(<TablePagination currentPage={18} totalPages={20} onPageChange={vi.fn()} />);
    expect(screen.getByText("18")).toBeInTheDocument();
    expect(screen.getByText("19")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
  });

  it("should render page numbers for middle position", () => {
    render(<TablePagination currentPage={10} totalPages={20} onPageChange={vi.fn()} />);
    expect(screen.getByText("9")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("11")).toBeInTheDocument();
  });

  it("should apply slim mode styles", () => {
    render(<TablePagination currentPage={1} totalPages={5} onPageChange={vi.fn()} slim />);
    const prevButton = screen.getByRole("button", { name: /anterior/i });
    expect(prevButton).toHaveClass("px-3", "py-1.5", "text-xs");
  });

  it("should not call onPageChange when previous is disabled and clicked", async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    render(<TablePagination currentPage={1} totalPages={5} onPageChange={onPageChange} />);
    const prevButton = screen.getByRole("button", { name: /anterior/i });
    await user.click(prevButton);
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it("should not call onPageChange when next is disabled and clicked", async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    render(<TablePagination currentPage={5} totalPages={5} onPageChange={onPageChange} />);
    const nextButton = screen.getByRole("button", { name: /próximo/i });
    await user.click(nextButton);
    expect(onPageChange).not.toHaveBeenCalled();
  });
});
