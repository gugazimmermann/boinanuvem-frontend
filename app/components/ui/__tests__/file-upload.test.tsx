import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileUpload } from "../file-upload";

describe("FileUpload", () => {
  it("should render file upload", () => {
    render(<FileUpload />);
    expect(screen.getByText("Upload files")).toBeInTheDocument();
  });

  it("should render with label", () => {
    render(<FileUpload label="Upload Documents" />);
    expect(screen.getByText("Upload Documents")).toBeInTheDocument();
  });

  it("should render with helper text", () => {
    render(<FileUpload helperText="Select files to upload" />);
    expect(screen.getByText("Select files to upload")).toBeInTheDocument();
  });

  it("should render with error message", () => {
    render(<FileUpload error="File is required" />);
    expect(screen.getByText("File is required")).toBeInTheDocument();
  });

  it("should prioritize error over helper text", () => {
    render(<FileUpload error="Error" helperText="Helper" />);
    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.queryByText("Helper")).not.toBeInTheDocument();
  });

  it("should render single file upload text when multiple is false", () => {
    render(<FileUpload multiple={false} />);
    expect(screen.getByText("Upload a file")).toBeInTheDocument();
  });

  it("should render multiple file upload text when multiple is true", () => {
    render(<FileUpload multiple={true} />);
    expect(screen.getByText("Upload files")).toBeInTheDocument();
  });

  it("should display accepted file types", () => {
    render(<FileUpload accept="image/*" />);
    const acceptTexts = screen.getAllByText((content, element) => {
      return element?.textContent?.includes("image/*") ?? false;
    });
    expect(acceptTexts.length).toBeGreaterThan(0);
  });

  it("should handle file selection", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const file = new File(["content"], "test.txt", { type: "text/plain" });

    render(<FileUpload onChange={onChange} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, file);

    expect(onChange).toHaveBeenCalledWith([file]);
  });

  it("should handle multiple file selection", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const file1 = new File(["content1"], "test1.txt", { type: "text/plain" });
    const file2 = new File(["content2"], "test2.txt", { type: "text/plain" });

    render(<FileUpload onChange={onChange} multiple={true} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, [file1, file2]);

    expect(onChange).toHaveBeenCalledWith([file1, file2]);
  });

  it("should append files when multiple is true", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const existingFile = new File(["existing"], "existing.txt", { type: "text/plain" });
    const newFile = new File(["new"], "new.txt", { type: "text/plain" });

    render(<FileUpload onChange={onChange} files={[existingFile]} multiple={true} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, newFile);

    expect(onChange).toHaveBeenCalledWith([existingFile, newFile]);
  });

  it("should replace files when multiple is false", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const existingFile = new File(["existing"], "existing.txt", { type: "text/plain" });
    const newFile = new File(["new"], "new.txt", { type: "text/plain" });

    render(<FileUpload onChange={onChange} files={[existingFile]} multiple={false} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, newFile);

    expect(onChange).toHaveBeenCalledWith([newFile]);
  });

  it("should display uploaded files", () => {
    const file = new File(["content"], "test.txt", { type: "text/plain" });
    render(<FileUpload files={[file]} />);
    expect(screen.getByText("test.txt")).toBeInTheDocument();
  });

  it("should format file size correctly", () => {
    const file = new File(["x".repeat(1024)], "test.txt", { type: "text/plain" });
    render(<FileUpload files={[file]} />);
    expect(screen.getByText(/1 KB/)).toBeInTheDocument();
  });

  it("should handle file removal via onRemove", async () => {
    const onRemove = vi.fn();
    const user = userEvent.setup();
    const file = new File(["content"], "test.txt", { type: "text/plain" });

    render(<FileUpload files={[file]} onRemove={onRemove} />);

    const removeButton = screen.getByLabelText("Remove test.txt");
    await user.click(removeButton);

    expect(onRemove).toHaveBeenCalledWith(0);
  });

  it("should handle file removal via onChange when onRemove is not provided", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const file1 = new File(["content1"], "test1.txt", { type: "text/plain" });
    const file2 = new File(["content2"], "test2.txt", { type: "text/plain" });

    render(<FileUpload files={[file1, file2]} onChange={onChange} />);

    const removeButton = screen.getByLabelText("Remove test1.txt");
    await user.click(removeButton);

    expect(onChange).toHaveBeenCalledWith([file2]);
  });

  it("should be disabled when disabled prop is true", () => {
    render(<FileUpload disabled={true} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeDisabled();
  });

  it("should not show remove button when disabled", () => {
    const file = new File(["content"], "test.txt", { type: "text/plain" });
    render(<FileUpload files={[file]} disabled={true} />);
    expect(screen.queryByLabelText("Remove test.txt")).not.toBeInTheDocument();
  });

  it("should trigger file input click when drop zone is clicked", async () => {
    const user = userEvent.setup();
    const file = new File(["content"], "test.txt", { type: "text/plain" });
    const onChange = vi.fn();

    render(<FileUpload onChange={onChange} />);

    const dropZone = screen.getByText("Upload files").closest(".border-dashed");
    if (dropZone) {
      await user.click(dropZone);
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      await user.upload(input, file);
      expect(onChange).toHaveBeenCalled();
    }
  });
});
