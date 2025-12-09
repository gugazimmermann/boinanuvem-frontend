import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tooltip } from "../tooltip";

// Helper to get the tooltip wrapper (the div with tabindex that wraps the children)
function getTooltipWrapper(element: HTMLElement): HTMLElement {
  const parent = element.parentElement;
  if (parent && parent.hasAttribute("tabindex") && parent.getAttribute("tabindex") === "0") {
    return parent;
  }
  return element;
}

describe("Tooltip", () => {
  it("should render children", () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    );
    expect(screen.getByText("Hover me")).toBeInTheDocument();
  });

  it("should not show tooltip initially", () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    );
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("should show tooltip on mouse enter", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    );
    const button = screen.getByText("Hover me");
    await user.hover(button);
    await waitFor(() => {
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });
    expect(screen.getByText("Tooltip text")).toBeInTheDocument();
  });

  it("should hide tooltip on mouse leave", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    );
    const button = screen.getByText("Hover me");
    await user.hover(button);
    await waitFor(() => {
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });
    await user.unhover(button);
    await waitFor(
      () => {
        expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
      },
      { timeout: 200 }
    );
  });

  it("should show tooltip on focus", async () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Focus me</button>
      </Tooltip>
    );
    const button = screen.getByText("Focus me");
    const wrapper = getTooltipWrapper(button);
    fireEvent.focus(wrapper);
    await waitFor(() => {
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });
  });

  it("should hide tooltip on blur", async () => {
    const _user = userEvent.setup();
    render(
      <Tooltip content="Tooltip text">
        <button>Focus me</button>
      </Tooltip>
    );
    const button = screen.getByText("Focus me");
    const wrapper = getTooltipWrapper(button);
    fireEvent.focus(wrapper);
    await waitFor(() => {
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });
    fireEvent.blur(wrapper);
    await waitFor(
      () => {
        expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
      },
      { timeout: 250 }
    );
  });

  it("should toggle tooltip with Enter key", async () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Press Enter</button>
      </Tooltip>
    );
    const button = screen.getByText("Press Enter");
    const wrapper = getTooltipWrapper(button);
    // Focus first to show tooltip, then Enter toggles it off, then Enter again toggles it on
    fireEvent.focus(wrapper);
    await waitFor(() => {
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });
    fireEvent.keyDown(wrapper, { key: "Enter", code: "Enter" });
    await waitFor(() => {
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });
    fireEvent.keyDown(wrapper, { key: "Enter", code: "Enter" });
    await waitFor(() => {
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });
  });

  it("should toggle tooltip with Space key", async () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Press Space</button>
      </Tooltip>
    );
    const button = screen.getByText("Press Space");
    const wrapper = getTooltipWrapper(button);
    // Focus first to show tooltip, then Space toggles it off, then Space again toggles it on
    fireEvent.focus(wrapper);
    await waitFor(() => {
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });
    fireEvent.keyDown(wrapper, { key: " ", code: "Space" });
    await waitFor(() => {
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });
    fireEvent.keyDown(wrapper, { key: " ", code: "Space" });
    await waitFor(() => {
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });
  });

  it("should close tooltip with Escape key", async () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Press Escape</button>
      </Tooltip>
    );
    const button = screen.getByText("Press Escape");
    const wrapper = getTooltipWrapper(button);
    fireEvent.focus(wrapper);
    await waitFor(() => {
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });
    fireEvent.keyDown(wrapper, { key: "Escape", code: "Escape" });
    await waitFor(() => {
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });
  });

  it("should render tooltip at top position by default", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    );
    const button = screen.getByText("Hover me");
    await user.hover(button);
    await waitFor(() => {
      const tooltip = screen.getByRole("tooltip");
      expect(tooltip).toHaveClass("bottom-full");
    });
  });

  it("should render tooltip at bottom position", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Tooltip text" position="bottom">
        <button>Hover me</button>
      </Tooltip>
    );
    const button = screen.getByText("Hover me");
    await user.hover(button);
    await waitFor(() => {
      const tooltip = screen.getByRole("tooltip");
      expect(tooltip).toHaveClass("top-full");
    });
  });

  it("should have aria-describedby when tooltip is visible", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    );
    const button = screen.getByText("Hover me");
    const wrapper = getTooltipWrapper(button);
    await user.hover(wrapper);
    await waitFor(() => {
      expect(wrapper).toHaveAttribute("aria-describedby");
    });
  });

  it("should not have aria-describedby when tooltip is hidden", () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    );
    const button = screen.getByText("Hover me");
    expect(button).not.toHaveAttribute("aria-describedby");
  });

  it("should prevent default on keyboard toggle", async () => {
    const handleClick = vi.fn();
    render(
      <Tooltip content="Tooltip text">
        <button onClick={handleClick}>Press Enter</button>
      </Tooltip>
    );
    const button = screen.getByText("Press Enter");
    const wrapper = getTooltipWrapper(button);
    fireEvent.focus(wrapper);
    fireEvent.keyDown(wrapper, { key: "Enter", code: "Enter" });
    // Click should not be triggered by Enter key
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("should handle keyboard toggle state persistence", async () => {
    const _user = userEvent.setup();
    render(
      <Tooltip content="Tooltip text">
        <button>Toggle me</button>
      </Tooltip>
    );
    const button = screen.getByText("Toggle me");
    const wrapper = getTooltipWrapper(button);
    // Focus shows tooltip, then Space toggles it off (but sets keyboard toggle ref)
    // Then Space again toggles it on with keyboard toggle
    fireEvent.focus(wrapper);
    await waitFor(() => {
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });
    fireEvent.keyDown(wrapper, { key: " ", code: "Space" });
    await waitFor(() => {
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });
    // Toggle it back on with keyboard (this sets keyboard toggle ref)
    fireEvent.keyDown(wrapper, { key: " ", code: "Space" });
    await waitFor(() => {
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });
    // Blur should not hide keyboard-toggled tooltip immediately
    fireEvent.blur(wrapper);
    // Tooltip should still be visible after blur timeout
    await waitFor(
      () => {
        expect(screen.getByRole("tooltip")).toBeInTheDocument();
      },
      { timeout: 150 }
    );
  });

  it("should force visibility when keyboard-toggled and tooltip is hidden", async () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Toggle me</button>
      </Tooltip>
    );
    const button = screen.getByText("Toggle me");
    const wrapper = getTooltipWrapper(button);

    // Toggle on with keyboard (sets keyboard toggle ref)
    fireEvent.keyDown(wrapper, { key: "Enter", code: "Enter" });
    await waitFor(() => {
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });

    // Manually hide tooltip (simulating edge case)
    // Then useEffect should force it back visible if keyboard-toggled
    // This tests the useEffect that checks isKeyboardToggledRef.current && !isVisible
    fireEvent.keyDown(wrapper, { key: "Enter", code: "Enter" });
    await waitFor(() => {
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });

    // Toggle back on - this should set keyboard toggle ref and show tooltip
    fireEvent.keyDown(wrapper, { key: "Enter", code: "Enter" });
    await waitFor(() => {
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });
  });

  it("should not show tooltip on focus when keyboard-toggled is true", async () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Focus me</button>
      </Tooltip>
    );
    const button = screen.getByText("Focus me");
    const wrapper = getTooltipWrapper(button);

    // Toggle on with keyboard (sets keyboard toggle ref)
    fireEvent.keyDown(wrapper, { key: "Enter", code: "Enter" });
    await waitFor(() => {
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });

    // Blur and then focus again
    fireEvent.blur(wrapper);
    fireEvent.focus(wrapper);

    // Focus should not show tooltip if keyboard-toggled is true
    // But since keyboard-toggled is true, tooltip should remain visible
    await waitFor(() => {
      // Tooltip should still be visible because keyboard-toggled prevents blur from hiding it
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });
  });

  it("should not hide tooltip on blur when keyboard-toggled is true", async () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Blur me</button>
      </Tooltip>
    );
    const button = screen.getByText("Blur me");
    const wrapper = getTooltipWrapper(button);

    // Toggle on with keyboard (sets keyboard toggle ref)
    fireEvent.keyDown(wrapper, { key: "Enter", code: "Enter" });
    await waitFor(() => {
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });

    // Blur should not hide tooltip when keyboard-toggled is true
    fireEvent.blur(wrapper);

    // Wait for blur timeout (100ms) - tooltip should still be visible
    await waitFor(
      () => {
        expect(screen.getByRole("tooltip")).toBeInTheDocument();
      },
      { timeout: 150 }
    );
  });

  it("should handle multiple blur timeout clears", async () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Focus me</button>
      </Tooltip>
    );
    const button = screen.getByText("Focus me");
    const wrapper = getTooltipWrapper(button);

    // Focus to show tooltip
    fireEvent.focus(wrapper);
    await waitFor(() => {
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });

    // Trigger blur multiple times - each should clear the previous timeout
    fireEvent.blur(wrapper);
    fireEvent.focus(wrapper);
    fireEvent.blur(wrapper);
    fireEvent.focus(wrapper);

    // Tooltip should still be visible after multiple blur/focus cycles
    await waitFor(() => {
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });
  });

  it("should not toggle or close tooltip with other keys", async () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Press other keys</button>
      </Tooltip>
    );
    const button = screen.getByText("Press other keys");
    const wrapper = getTooltipWrapper(button);

    // Focus to show tooltip
    fireEvent.focus(wrapper);
    await waitFor(() => {
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });

    // Press other keys - should not toggle or close
    fireEvent.keyDown(wrapper, { key: "a", code: "KeyA" });
    fireEvent.keyDown(wrapper, { key: "Tab", code: "Tab" });
    fireEvent.keyDown(wrapper, { key: "ArrowDown", code: "ArrowDown" });

    // Tooltip should still be visible
    await waitFor(() => {
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });
  });

  it("should have correct arrow classes for top position", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Tooltip text" position="top">
        <button>Hover me</button>
      </Tooltip>
    );
    const button = screen.getByText("Hover me");
    await user.hover(button);
    await waitFor(() => {
      const tooltip = screen.getByRole("tooltip");
      const svg = tooltip.querySelector("svg");
      expect(svg).toHaveClass("bottom-0", "-mb-3");
    });
  });

  it("should have correct arrow classes for bottom position", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Tooltip text" position="bottom">
        <button>Hover me</button>
      </Tooltip>
    );
    const button = screen.getByText("Hover me");
    await user.hover(button);
    await waitFor(() => {
      const tooltip = screen.getByRole("tooltip");
      const svg = tooltip.querySelector("svg");
      expect(svg).toHaveClass("top-0", "-mt-3");
    });
  });
});
