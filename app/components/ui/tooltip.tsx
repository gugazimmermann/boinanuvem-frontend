/* eslint-disable react-hooks/refs -- cloneElement may receive refs but we don't access them */
import {
  useState,
  useId,
  useRef,
  useCallback,
  useEffect,
  isValidElement,
  cloneElement,
} from "react";

interface TooltipProps {
  readonly content: string;
  readonly children: React.ReactNode;
  readonly position?: "top" | "bottom";
}

// Check if a React element is an interactive element (button, input, etc.)
function isInteractiveElement(element: React.ReactElement): boolean {
  const interactiveTags = ["button", "input", "select", "textarea", "a"];
  const interactiveRoles = ["button", "link", "menuitem", "option", "tab"];

  if (typeof element.type === "string") {
    return interactiveTags.includes(element.type.toLowerCase());
  }

  const props = element.props as { role?: string };
  const role = props?.role;
  return role ? interactiveRoles.includes(role) : false;
}

export function Tooltip({ content, children, position = "top" }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipId = useId();
  const isKeyboardToggledRef = useRef(false);
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if child is a single interactive element
  const childIsInteractive = isValidElement(children) && isInteractiveElement(children);

  const positionClasses =
    position === "top" ? "bottom-full left-1/2 mb-2" : "top-full left-1/2 mt-2";

  const arrowClasses =
    position === "top" ? "bottom-0 -mb-3 transform rotate-45" : "top-0 -mt-3 transform rotate-45";

  // Ensure tooltip stays visible when keyboard-toggled
  // This runs after render to catch cases where blur might have interfered
  useEffect(() => {
    if (isKeyboardToggledRef.current && !isVisible) {
      // Force tooltip to be visible if keyboard-toggled
      // Use setTimeout to avoid synchronous setState in effect
      const timeout = setTimeout(() => {
        if (isKeyboardToggledRef.current && !isVisible) {
          setIsVisible(true);
        }
      }, 0);
      return () => clearTimeout(timeout);
    }
  }, [isVisible]);

  const clearBlurTimeout = useCallback(() => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    clearBlurTimeout();
    isKeyboardToggledRef.current = false;
    setIsVisible(true);
  }, [clearBlurTimeout]);

  const handleMouseLeave = useCallback(() => {
    clearBlurTimeout();
    isKeyboardToggledRef.current = false;
    setIsVisible(false);
  }, [clearBlurTimeout]);

  const handleFocus = useCallback(() => {
    clearBlurTimeout();
    // Only show on focus if not keyboard-toggled (keyboard toggle handles its own visibility)
    if (!isKeyboardToggledRef.current) {
      setIsVisible(true);
    }
  }, [clearBlurTimeout]);

  const handleBlur = useCallback(() => {
    clearBlurTimeout();

    // Don't hide if keyboard-toggled - use a small delay to check
    // This allows keyboard events to complete first
    blurTimeoutRef.current = setTimeout(() => {
      if (!isKeyboardToggledRef.current) {
        setIsVisible(false);
      }
      blurTimeoutRef.current = null;
    }, 100);
  }, [clearBlurTimeout]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();

        clearBlurTimeout();

        // Toggle visibility - set ref FIRST (synchronously) to prevent blur from hiding
        setIsVisible((prev) => {
          const toggled = !prev;
          // Set ref immediately when toggling ON
          isKeyboardToggledRef.current = toggled;
          return toggled;
        });
      } else if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();

        clearBlurTimeout();
        isKeyboardToggledRef.current = false;
        setIsVisible(false);
      }
    },
    [clearBlurTimeout]
  );

  // When child is interactive, clone it to add tooltip handlers and wrap in a div
  if (childIsInteractive && isValidElement(children)) {
    const childProps = children.props as {
      onMouseEnter?: (e: React.MouseEvent) => void;
      onMouseLeave?: (e: React.MouseEvent) => void;
      onFocus?: (e: React.FocusEvent) => void;
      onBlur?: (e: React.FocusEvent) => void;
      onKeyDown?: (e: React.KeyboardEvent) => void;
      [key: string]: unknown;
    };
    const enhancedChild = cloneElement(children, {
      "aria-describedby": isVisible ? tooltipId : undefined,
      onMouseEnter: (e: React.MouseEvent) => {
        handleMouseEnter();
        childProps.onMouseEnter?.(e);
      },
      onMouseLeave: (e: React.MouseEvent) => {
        handleMouseLeave();
        childProps.onMouseLeave?.(e);
      },
      onFocus: (e: React.FocusEvent) => {
        handleFocus();
        childProps.onFocus?.(e);
      },
      onBlur: (e: React.FocusEvent) => {
        handleBlur();
        childProps.onBlur?.(e);
      },
      onKeyDown: (e: React.KeyboardEvent) => {
        handleKeyDown(e);
        childProps.onKeyDown?.(e);
      },
    } as React.HTMLAttributes<HTMLElement> & { "aria-describedby"?: string });

    return (
      <div className="relative inline-block">
        {enhancedChild}
        {isVisible && (
          <div
            id={tooltipId}
            role="tooltip"
            className={`absolute z-50 w-64 max-w-xs p-3 text-sm text-gray-600 bg-white rounded-lg shadow-lg dark:shadow-none shadow-gray-200 dark:bg-gray-800 dark:text-white -translate-x-1/2 ${positionClasses} pointer-events-none`}
          >
            <span className="block wrap-break-word">{content}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-6 h-6 absolute -translate-x-1/2 left-1/2 ${arrowClasses} text-white dark:text-gray-800 fill-current`}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M20 3H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1z"></path>
            </svg>
          </div>
        )}
      </div>
    );
  }

  // When child is not interactive, use a proper button element for accessibility
  return (
    <button
      type="button"
      className="relative inline-block bg-transparent border-0 p-0 cursor-pointer"
      aria-describedby={isVisible ? tooltipId : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    >
      {children}
      {isVisible && (
        <div
          id={tooltipId}
          role="tooltip"
          className={`absolute z-50 w-64 max-w-xs p-3 text-sm text-gray-600 bg-white rounded-lg shadow-lg dark:shadow-none shadow-gray-200 dark:bg-gray-800 dark:text-white -translate-x-1/2 ${positionClasses} pointer-events-none`}
        >
          <span className="block wrap-break-word">{content}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`w-6 h-6 absolute -translate-x-1/2 left-1/2 ${arrowClasses} text-white dark:text-gray-800 fill-current`}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M20 3H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1z"></path>
          </svg>
        </div>
      )}
    </button>
  );
}
