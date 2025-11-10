import { type ReactNode } from "react";
import { COLORS } from "../constants";

type ButtonVariant = "primary" | "secondary" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  fullWidth?: boolean;
}

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

export function Button({
  children,
  href,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  fullWidth = false,
}: ButtonProps) {
  const baseStyles = "rounded-full transition font-medium text-center";
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

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${displayStyle} ${className}`.trim();

  if (href) {
    return (
      <a href={href} className={combinedClassName} style={variantColorStyle}>
        {children}
      </a>
    );
  }

  return (
    <button
      onClick={onClick}
      className={combinedClassName}
      style={variantColorStyle}
    >
      {children}
    </button>
  );
}

