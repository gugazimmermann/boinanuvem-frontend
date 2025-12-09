import {
  forwardRef,
  type ButtonHTMLAttributes,
  type AnchorHTMLAttributes,
  type ReactNode,
} from "react";
import { DASHBOARD_COLORS } from "../dashboard/utils/colors";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "success"
  | "warning"
  | "danger";
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

interface ButtonAsButtonProps
  extends BaseButtonProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> {
  href?: never;
  form?: string;
}

interface ButtonAsLinkProps
  extends BaseButtonProps,
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children"> {
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
  const base = ["text-white"].join(" ");

  switch (variant) {
    case "primary":
      return base;
    case "secondary":
      return ["bg-gray-600", "text-white", "hover:bg-gray-500", "focus:ring-gray-300"].join(" ");
    case "outline":
      return ["border-2", "bg-transparent"].join(" ");
    case "ghost":
      return ["bg-transparent"].join(" ");
    case "success":
      return ["bg-green-600", "text-white", "hover:bg-green-500", "focus:ring-green-300"].join(" ");
    case "warning":
      return ["bg-yellow-600", "text-white", "hover:bg-yellow-500", "focus:ring-yellow-300"].join(
        " "
      );
    case "danger":
      return ["bg-red-600", "text-white", "hover:bg-red-500", "focus:ring-red-300"].join(" ");
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
    case "success":
      return {
        backgroundColor: "#16a34a",
        "--hover-bg": "#15803d",
        "--focus-ring": "#86efac",
      } as React.CSSProperties & { "--hover-bg"?: string; "--focus-ring"?: string };
    case "warning":
      return {
        backgroundColor: "#ca8a04",
        "--hover-bg": "#a16207",
        "--focus-ring": "#fde047",
      } as React.CSSProperties & { "--hover-bg"?: string; "--focus-ring"?: string };
    case "danger":
      return {
        backgroundColor: "#dc2626",
        "--hover-bg": "#b91c1c",
        "--focus-ring": "#fca5a5",
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
            const hoverBg = variantStyle["--hover-bg"];
            if (hoverBg) {
              e.currentTarget.style.backgroundColor = hoverBg;
            }
          }}
          onMouseLeave={(e) => {
            if (variant === "primary") {
              e.currentTarget.style.backgroundColor = DASHBOARD_COLORS.primary;
            } else if (variant === "success") {
              e.currentTarget.style.backgroundColor = "#16a34a";
            } else if (variant === "warning") {
              e.currentTarget.style.backgroundColor = "#ca8a04";
            } else if (variant === "danger") {
              e.currentTarget.style.backgroundColor = "#dc2626";
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
          const hoverBg = variantStyle["--hover-bg"];
          if (hoverBg) {
            e.currentTarget.style.backgroundColor = hoverBg;
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
