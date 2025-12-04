import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormPageLayout } from "../form-page-layout";
import * as FixedAlertComponent from "../fixed-alert";

vi.mock("../fixed-alert", () => ({
  FixedAlert: vi.fn(
    ({ alertMessage }: { alertMessage: { title: string; variant: string } | null }) =>
      alertMessage ? <div data-testid="fixed-alert">Alert</div> : null
  ),
}));

describe("FormPageLayout", () => {
  it("should render with title", () => {
    render(<FormPageLayout title="Test Form">Content</FormPageLayout>);
    expect(screen.getByText("Test Form")).toBeInTheDocument();
  });

  it("should render with description", () => {
    render(
      <FormPageLayout title="Test Form" description="Form description">
        Content
      </FormPageLayout>
    );
    expect(screen.getByText("Form description")).toBeInTheDocument();
  });

  it("should not render description when not provided", () => {
    render(<FormPageLayout title="Test Form">Content</FormPageLayout>);
    expect(screen.queryByText(/description/i)).not.toBeInTheDocument();
  });

  it("should render with alert", () => {
    const alert = { title: "Alert", variant: "success" as const };
    render(
      <FormPageLayout title="Test Form" alert={alert}>
        Content
      </FormPageLayout>
    );
    expect(screen.getByTestId("fixed-alert")).toBeInTheDocument();
  });

  it("should render with backButton", () => {
    const handleBack = vi.fn();
    render(
      <FormPageLayout title="Test Form" backButton={{ label: "Back", onClick: handleBack }}>
        Content
      </FormPageLayout>
    );
    expect(screen.getByRole("button", { name: "Back" })).toBeInTheDocument();
  });

  it("should call backButton onClick when clicked", async () => {
    const handleBack = vi.fn();
    const user = userEvent.setup();
    render(
      <FormPageLayout title="Test Form" backButton={{ label: "Back", onClick: handleBack }}>
        Content
      </FormPageLayout>
    );
    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(handleBack).toHaveBeenCalledTimes(1);
  });

  it("should disable backButton when disabled is true", () => {
    const handleBack = vi.fn();
    render(
      <FormPageLayout
        title="Test Form"
        backButton={{ label: "Back", onClick: handleBack, disabled: true }}
      >
        Content
      </FormPageLayout>
    );
    expect(screen.getByRole("button", { name: "Back" })).toBeDisabled();
  });

  it("should render with headerActions", () => {
    render(
      <FormPageLayout title="Test Form" headerActions={<button>Action</button>}>
        Content
      </FormPageLayout>
    );
    expect(screen.getByRole("button", { name: "Action" })).toBeInTheDocument();
  });

  it("should render with footer cancel and submit buttons", () => {
    const handleCancel = vi.fn();
    render(
      <FormPageLayout
        title="Test Form"
        footer={{
          cancelButton: { label: "Cancel", onClick: handleCancel },
          submitButton: { label: "Submit", isLoading: false },
        }}
      >
        Content
      </FormPageLayout>
    );
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
  });

  it("should call cancelButton onClick when clicked", async () => {
    const handleCancel = vi.fn();
    const user = userEvent.setup();
    render(
      <FormPageLayout
        title="Test Form"
        footer={{
          cancelButton: { label: "Cancel", onClick: handleCancel },
          submitButton: { label: "Submit", isLoading: false },
        }}
      >
        Content
      </FormPageLayout>
    );
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  it("should disable cancelButton when disabled is true", () => {
    const handleCancel = vi.fn();
    render(
      <FormPageLayout
        title="Test Form"
        footer={{
          cancelButton: { label: "Cancel", onClick: handleCancel, disabled: true },
          submitButton: { label: "Submit", isLoading: false },
        }}
      >
        Content
      </FormPageLayout>
    );
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  });

  it("should show loading label when submitButton isLoading is true", () => {
    render(
      <FormPageLayout
        title="Test Form"
        footer={{
          submitButton: { label: "Submit", isLoading: true, loadingLabel: "Loading..." },
        }}
      >
        Content
      </FormPageLayout>
    );
    expect(screen.getByRole("button", { name: "Loading..." })).toBeInTheDocument();
  });

  it("should show default loading text when isLoading is true and loadingLabel not provided", () => {
    render(
      <FormPageLayout
        title="Test Form"
        footer={{
          submitButton: { label: "Submit", isLoading: true },
        }}
      >
        Content
      </FormPageLayout>
    );
    expect(screen.getByRole("button", { name: "Carregando..." })).toBeInTheDocument();
  });

  it("should disable submitButton when disabled is true", () => {
    render(
      <FormPageLayout
        title="Test Form"
        footer={{
          submitButton: { label: "Submit", disabled: true, isLoading: false },
        }}
      >
        Content
      </FormPageLayout>
    );
    expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled();
  });

  it("should disable submitButton when isLoading is true", () => {
    render(
      <FormPageLayout
        title="Test Form"
        footer={{
          submitButton: { label: "Submit", isLoading: true },
        }}
      >
        Content
      </FormPageLayout>
    );
    expect(screen.getByRole("button", { name: "Carregando..." })).toBeDisabled();
  });

  it("should render children", () => {
    render(
      <FormPageLayout title="Test Form">
        <input data-testid="child-input" />
      </FormPageLayout>
    );
    expect(screen.getByTestId("child-input")).toBeInTheDocument();
  });

  it("should apply custom formWrapperClassName", () => {
    const { container } = render(
      <FormPageLayout title="Test Form" formWrapperClassName="custom-class">
        Content
      </FormPageLayout>
    );
    const wrapper = container.querySelector(".custom-class");
    expect(wrapper).toBeInTheDocument();
  });

  it("should not render footer when not provided", () => {
    render(<FormPageLayout title="Test Form">Content</FormPageLayout>);
    expect(screen.queryByRole("button", { name: /submit|cancel/i })).not.toBeInTheDocument();
  });

  it("should not render cancelButton when not provided in footer", () => {
    render(
      <FormPageLayout
        title="Test Form"
        footer={{
          submitButton: { label: "Submit", isLoading: false },
        }}
      >
        Content
      </FormPageLayout>
    );
    expect(screen.queryByRole("button", { name: "Cancel" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
  });

  it("should pass alert to FixedAlert component", () => {
    vi.clearAllMocks();
    const alert = { title: "Test Alert", variant: "error" as const };
    render(
      <FormPageLayout title="Test Form" alert={alert}>
        Content
      </FormPageLayout>
    );
    expect(FixedAlertComponent.FixedAlert).toHaveBeenCalled();
    const callArgs = vi.mocked(FixedAlertComponent.FixedAlert).mock.calls[0];
    expect(callArgs?.[0]?.alertMessage?.title).toBe("Test Alert");
    expect(callArgs?.[0]?.alertMessage?.variant).toBe("error");
  });
});
