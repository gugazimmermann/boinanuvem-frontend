import {
  forwardRef,
  type ButtonHTMLAttributes,
  type AnchorHTMLAttributes,
  type ReactNode,
} from "react";
import { COLORS } from "../constants";

type ButtonVariant = "primary" | "secondary" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface BaseButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  fullWidth?: boolean;
}

interface ButtonAsButtonProps
  extends BaseButtonProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> {
  href?: never;
}

interface ButtonAsLinkProps
  extends BaseButtonProps,
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children"> {
  href: string;
}

type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

const variantStyles: Record<ButtonVariant, string> = {
  primary: "text-white hover:opacity-90",
  secondary: "text-white hover:opacity-90",
  outline: "border-2 hover:opacity-80",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (
    {
      children,
      href,
      variant = "primary",
      size = "md",
      className = "",
      fullWidth = false,
      ...props
    },
    ref
  ) => {
    const baseStyles = "rounded-full transition font-medium text-center cursor-pointer";
    const displayStyle = fullWidth ? "block w-full" : "inline-block";

    const variantColorStyle =
      variant === "primary"
        ? { backgroundColor: COLORS.primary }
        : variant === "secondary"
          ? { backgroundColor: COLORS.secondary }
          : {
              borderColor: COLORS.secondary,
              color: COLORS.secondary,
              backgroundColor: COLORS.bgLightTertiary,
            };

    const combinedClassName =
      `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${displayStyle} ${className}`.trim();

    if (href) {
      const { href: _, ...anchorProps } = props as ButtonAsLinkProps;
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={combinedClassName}
          style={variantColorStyle}
          {...anchorProps}
        >
          {children}
        </a>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={combinedClassName}
        style={variantColorStyle}
        {...(props as ButtonAsButtonProps)}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
