import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TablePagination } from "../table-pagination";

describe("TablePagination", () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 5,
    onPageChange: vi.fn(),
  };

  it("should return null when totalPages is 1", () => {
    const { container } = render(<TablePagination {...defaultProps} totalPages={1} />);
    expect(container.firstChild).toBeNull();
  });

  it("should render pagination controls", () => {
    render(<TablePagination {...defaultProps} />);
    expect(screen.getByText(/anterior|previous/i)).toBeInTheDocument();
    expect(screen.getByText(/Próximo|Next/i)).toBeInTheDocument();
  });

  it("should render page numbers for pages less than 10", () => {
    render(<TablePagination {...defaultProps} totalPages={5} />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("should call onPageChange when page number is clicked", async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    render(<TablePagination {...defaultProps} onPageChange={onPageChange} />);

    const pageButton = screen.getByText("2");
    await user.click(pageButton);

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("should call onPageChange when previous button is clicked", async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    render(<TablePagination {...defaultProps} currentPage={2} onPageChange={onPageChange} />);

    const prevButton = screen.getByText(/anterior|previous/i).closest("button");
    if (prevButton) {
      await user.click(prevButton);
      expect(onPageChange).toHaveBeenCalledWith(1);
    }
  });

  it("should call onPageChange when next button is clicked", async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    render(<TablePagination {...defaultProps} currentPage={2} onPageChange={onPageChange} />);

    const nextButton = screen.getByText(/Próximo|Next/i).closest("button");
    if (nextButton) {
      await user.click(nextButton);
      expect(onPageChange).toHaveBeenCalledWith(3);
    }
  });

  it("should disable previous button on first page", () => {
    render(<TablePagination {...defaultProps} currentPage={1} />);
    const prevButton = screen.getByText(/anterior|previous/i).closest("button");
    expect(prevButton).toBeDisabled();
  });

  it("should disable next button on last page", () => {
    render(<TablePagination {...defaultProps} currentPage={5} totalPages={5} />);
    const nextButton = screen.getByText(/Próximo|Next/i).closest("button");
    expect(nextButton).toBeDisabled();
  });

  it("should highlight current page", () => {
    render(<TablePagination {...defaultProps} currentPage={3} />);
    const currentPageButton = screen.getByText("3").closest("button");
    expect(currentPageButton?.className).toContain("bg-blue-100");
  });

  it("should render ellipsis for large page counts", () => {
    render(<TablePagination {...defaultProps} currentPage={5} totalPages={20} />);
    const ellipsis = screen.getAllByText("...");
    expect(ellipsis.length).toBeGreaterThan(0);
  });

  it("should apply slim styling when slim is true", () => {
    const { container } = render(<TablePagination {...defaultProps} slim={true} />);
    const pagination = container.querySelector(".mt-2");
    expect(pagination).toBeInTheDocument();
  });
});
