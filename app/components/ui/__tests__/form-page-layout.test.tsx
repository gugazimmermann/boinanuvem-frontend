import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormPageLayout } from "../form-page-layout";
import type { AlertMessage } from "~/hooks/use-alert";

describe("FormPageLayout", () => {
  it("should render title", () => {
    render(<FormPageLayout title="Test Form">Content</FormPageLayout>);
    expect(screen.getByText("Test Form")).toBeInTheDocument();
  });

  it("should render description when provided", () => {
    render(
      <FormPageLayout title="Test" description="Form description">
        Content
      </FormPageLayout>
    );
    expect(screen.getByText("Form description")).toBeInTheDocument();
  });

  it("should not render description when not provided", () => {
    render(<FormPageLayout title="Test">Content</FormPageLayout>);
    expect(screen.queryByText(/description/i)).not.toBeInTheDocument();
  });

  it("should render children", () => {
    render(
      <FormPageLayout title="Test">
        <div data-testid="form-content">Form Content</div>
      </FormPageLayout>
    );
    expect(screen.getByTestId("form-content")).toBeInTheDocument();
  });

  it("should render alert when provided", () => {
    const alert: AlertMessage = {
      title: "Success",
      variant: "success",
    };
    render(
      <FormPageLayout title="Test" alert={alert}>
        Content
      </FormPageLayout>
    );
    expect(screen.getByText("Success")).toBeInTheDocument();
  });

  it("should not render alert when null", () => {
    render(
      <FormPageLayout title="Test" alert={null}>
        Content
      </FormPageLayout>
    );
    expect(screen.queryByText(/success/i)).not.toBeInTheDocument();
  });

  it("should render back button when provided", () => {
    const onBack = vi.fn();
    render(
      <FormPageLayout title="Test" backButton={{ label: "Back", onClick: onBack }}>
        Content
      </FormPageLayout>
    );
    expect(screen.getByRole("button", { name: /back/i })).toBeInTheDocument();
  });

  it("should call back button onClick when clicked", async () => {
    const onBack = vi.fn();
    const user = userEvent.setup();
    render(
      <FormPageLayout title="Test" backButton={{ label: "Back", onClick: onBack }}>
        Content
      </FormPageLayout>
    );
    await user.click(screen.getByRole("button", { name: /back/i }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("should disable back button when disabled", () => {
    render(
      <FormPageLayout title="Test" backButton={{ label: "Back", onClick: vi.fn(), disabled: true }}>
        Content
      </FormPageLayout>
    );
    expect(screen.getByRole("button", { name: /back/i })).toBeDisabled();
  });

  it("should render header actions", () => {
    render(
      <FormPageLayout title="Test" headerActions={<button>Action</button>}>
        Content
      </FormPageLayout>
    );
    expect(screen.getByRole("button", { name: /action/i })).toBeInTheDocument();
  });

  it("should render footer with submit button", () => {
    render(
      <FormPageLayout
        title="Test"
        footer={{
          submitButton: {
            label: "Submit",
            isLoading: false,
          },
        }}
      >
        Content
      </FormPageLayout>
    );
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });

  it("should render footer with cancel button when provided", () => {
    const onCancel = vi.fn();
    render(
      <FormPageLayout
        title="Test"
        footer={{
          cancelButton: {
            label: "Cancel",
            onClick: onCancel,
          },
          submitButton: {
            label: "Submit",
            isLoading: false,
          },
        }}
      >
        Content
      </FormPageLayout>
    );
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("should call cancel button onClick when clicked", async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(
      <FormPageLayout
        title="Test"
        footer={{
          cancelButton: {
            label: "Cancel",
            onClick: onCancel,
          },
          submitButton: {
            label: "Submit",
            isLoading: false,
          },
        }}
      >
        Content
      </FormPageLayout>
    );
    await user.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("should disable cancel button when disabled", () => {
    render(
      <FormPageLayout
        title="Test"
        footer={{
          cancelButton: {
            label: "Cancel",
            onClick: vi.fn(),
            disabled: true,
          },
          submitButton: {
            label: "Submit",
            isLoading: false,
          },
        }}
      >
        Content
      </FormPageLayout>
    );
    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
  });

  it("should show loading label when isLoading is true", () => {
    render(
      <FormPageLayout
        title="Test"
        footer={{
          submitButton: {
            label: "Submit",
            loadingLabel: "Saving...",
            isLoading: true,
          },
        }}
      >
        Content
      </FormPageLayout>
    );
    expect(screen.getByText("Saving...")).toBeInTheDocument();
  });

  it("should show default loading label when isLoading is true and loadingLabel not provided", () => {
    render(
      <FormPageLayout
        title="Test"
        footer={{
          submitButton: {
            label: "Submit",
            isLoading: true,
          },
        }}
      >
        Content
      </FormPageLayout>
    );
    expect(screen.getByText("Carregando...")).toBeInTheDocument();
  });

  it("should disable submit button when isLoading is true", () => {
    render(
      <FormPageLayout
        title="Test"
        footer={{
          submitButton: {
            label: "Submit",
            isLoading: true,
          },
        }}
      >
        Content
      </FormPageLayout>
    );
    const submitButton = screen.getByRole("button", { name: /carregando/i });
    expect(submitButton).toBeDisabled();
  });

  it("should disable submit button when disabled is true", () => {
    render(
      <FormPageLayout
        title="Test"
        footer={{
          submitButton: {
            label: "Submit",
            disabled: true,
            isLoading: false,
          },
        }}
      >
        Content
      </FormPageLayout>
    );
    const submitButton = screen.getByRole("button", { name: /submit/i });
    expect(submitButton).toBeDisabled();
  });

  it("should apply custom formWrapperClassName", () => {
    const { container } = render(
      <FormPageLayout title="Test" formWrapperClassName="custom-class">
        Content
      </FormPageLayout>
    );
    const wrapper = container.querySelector(".custom-class");
    expect(wrapper).toBeInTheDocument();
  });

  it("should have submit button type submit", () => {
    render(
      <FormPageLayout
        title="Test"
        footer={{
          submitButton: {
            label: "Submit",
            isLoading: false,
          },
        }}
      >
        Content
      </FormPageLayout>
    );
    const submitButton = screen.getByRole("button", { name: /submit/i });
    expect(submitButton).toHaveAttribute("type", "submit");
  });
});
