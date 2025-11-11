import { forwardRef, type ButtonHTMLAttributes, type AnchorHTMLAttributes, type ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface BaseButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  fullWidth?: boolean;
}

interface ButtonAsButtonProps extends BaseButtonProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> {
  href?: never;
}

interface ButtonAsLinkProps extends BaseButtonProps, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children"> {
  href: string;
}

type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

const baseStyles = [
  "font-medium",
  "tracking-wide",
  "capitalize",
  "transition-colors",
  "duration-300",
  "transform",
  "rounded-lg",
  "cursor-pointer",
  "focus:outline-none",
  "focus:ring",
  "focus:ring-opacity-50",
  "disabled:opacity-50",
  "disabled:cursor-not-allowed",
].join(" ");

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    "bg-blue-500",
    "text-white",
    "hover:bg-blue-400",
    "focus:ring-blue-300",
  ].join(" "),
  secondary: [
    "bg-gray-500",
    "text-white",
    "hover:bg-gray-400",
    "focus:ring-gray-300",
  ].join(" "),
  outline: [
    "border-2",
    "border-blue-500",
    "text-blue-500",
    "bg-transparent",
    "hover:bg-blue-50",
    "focus:ring-blue-300",
  ].join(" "),
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-1.5 text-xs",
  md: "px-6 py-2 text-sm",
  lg: "px-8 py-3 text-base",
};

export const AuthButton = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
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
    const widthStyle = fullWidth ? "w-full" : "";
    
    const combinedClassName = [
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      widthStyle,
      className,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    if (href) {
      const { href: _, ...anchorProps } = props as ButtonAsLinkProps;
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={combinedClassName}
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
        {...(props as ButtonAsButtonProps)}
      >
        {children}
      </button>
    );
  }
);

AuthButton.displayName = "AuthButton";

