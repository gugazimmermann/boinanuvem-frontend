import { type ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  color?: string;
  className?: string;
}

export function Badge({ children, color, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-sm font-medium text-white ${className}`}
      style={color ? { backgroundColor: color } : undefined}
    >
      {children}
    </span>
  );
}

