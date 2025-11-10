import { forwardRef, type ButtonHTMLAttributes, type AnchorHTMLAttributes, type ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface BaseButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

interface ButtonAsButtonProps extends BaseButtonProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> {
  href?: never;
}

interface ButtonAsLinkProps extends BaseButtonProps, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children"> {
  href: string;
}

type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

const baseStyles = [
  "flex",
  "items-center",
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
  "focus:ring-opacity-80",
  "disabled:opacity-50",
  "disabled:cursor-not-allowed",
].join(" ");

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    "bg-blue-600",
    "text-white",
    "hover:bg-blue-500",
    "focus:ring-blue-300",
  ].join(" "),
  secondary: [
    "bg-gray-600",
    "text-white",
    "hover:bg-gray-500",
    "focus:ring-gray-300",
  ].join(" "),
  outline: [
    "border-2",
    "border-blue-600",
    "text-blue-600",
    "bg-transparent",
    "hover:bg-blue-50",
    "focus:ring-blue-300",
  ].join(" "),
  ghost: [
    "text-blue-600",
    "bg-transparent",
    "hover:bg-blue-50",
    "focus:ring-blue-300",
  ].join(" "),
};

const sizeStyles: Record<ButtonSize, { padding: string; icon: string; text: string }> = {
  sm: {
    padding: "px-3 py-1.5",
    icon: "w-4 h-4",
    text: "text-sm",
  },
  md: {
    padding: "px-4 py-2",
    icon: "w-5 h-5",
    text: "text-base",
  },
  lg: {
    padding: "px-6 py-3",
    icon: "w-6 h-6",
    text: "text-lg",
  },
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
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    const sizeConfig = sizeStyles[size];
    const widthStyle = fullWidth ? "w-full justify-center" : "";
    
    const combinedClassName = [
      baseStyles,
      variantStyles[variant],
      sizeConfig.padding,
      sizeConfig.text,
      widthStyle,
      className,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    const iconClassName = `${sizeConfig.icon} mx-1`;

    const content = (
      <>
        {leftIcon && <span className={iconClassName}>{leftIcon}</span>}
        <span className="mx-1">{children}</span>
        {rightIcon && <span className={iconClassName}>{rightIcon}</span>}
      </>
    );

    if (href) {
      const { href: _, ...anchorProps } = props as ButtonAsLinkProps;
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={combinedClassName}
          {...anchorProps}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={combinedClassName}
        {...(props as ButtonAsButtonProps)}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = "Button";

