import { forwardRef, type ButtonHTMLAttributes, type AnchorHTMLAttributes, type ReactNode } from "react";
import { DASHBOARD_COLORS } from "../dashboard/utils/colors";

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

const getVariantStyles = (variant: ButtonVariant) => {
  const base = [
    "text-white",
  ].join(" ");
  
  switch (variant) {
    case "primary":
      return base;
    case "secondary":
      return [
        "bg-gray-600",
        "text-white",
        "hover:bg-gray-500",
        "focus:ring-gray-300",
      ].join(" ");
    case "outline":
      return [
        "border-2",
        "bg-transparent",
      ].join(" ");
    case "ghost":
      return [
        "bg-transparent",
      ].join(" ");
    default:
      return base;
  }
};

const getVariantStyle = (variant: ButtonVariant) => {
  switch (variant) {
    case "primary":
      return {
        backgroundColor: DASHBOARD_COLORS.primary,
        "--hover-bg": DASHBOARD_COLORS.primaryDark,
        "--focus-ring": DASHBOARD_COLORS.primaryLight,
      } as React.CSSProperties & { "--hover-bg"?: string; "--focus-ring"?: string };
    case "outline":
      return {
        borderColor: DASHBOARD_COLORS.primary,
        color: DASHBOARD_COLORS.primary,
        "--hover-bg": `${DASHBOARD_COLORS.primaryLight}20`,
        "--focus-ring": DASHBOARD_COLORS.primaryLight,
      } as React.CSSProperties & { "--hover-bg"?: string; "--focus-ring"?: string };
    case "ghost":
      return {
        color: DASHBOARD_COLORS.primary,
        "--hover-bg": `${DASHBOARD_COLORS.primaryLight}20`,
        "--focus-ring": DASHBOARD_COLORS.primaryLight,
      } as React.CSSProperties & { "--hover-bg"?: string; "--focus-ring"?: string };
    default:
      return {};
  }
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
    const variantStyle = getVariantStyle(variant);
    
    const combinedClassName = [
      baseStyles,
      getVariantStyles(variant),
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
          style={variantStyle}
          onMouseEnter={(e) => {
            if (variantStyle["--hover-bg"]) {
              e.currentTarget.style.backgroundColor = variantStyle["--hover-bg"] as string;
            }
          }}
          onMouseLeave={(e) => {
            if (variant === "primary") {
              e.currentTarget.style.backgroundColor = DASHBOARD_COLORS.primary;
            } else {
              e.currentTarget.style.backgroundColor = "";
            }
          }}
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
        style={variantStyle}
        onMouseEnter={(e) => {
          if (variantStyle["--hover-bg"]) {
            e.currentTarget.style.backgroundColor = variantStyle["--hover-bg"] as string;
          }
        }}
        onMouseLeave={(e) => {
          if (variant === "primary") {
            e.currentTarget.style.backgroundColor = DASHBOARD_COLORS.primary;
          } else {
            e.currentTarget.style.backgroundColor = "";
          }
        }}
        {...(props as ButtonAsButtonProps)}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = "Button";

