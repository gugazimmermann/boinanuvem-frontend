import { type ReactNode } from "react";
import { COLORS } from "../constants";

interface HeadingProps {
  readonly children: ReactNode;
  readonly level?: 1 | 2 | 3 | 4;
  readonly color?: "primary" | "secondary" | "dark" | "custom";
  readonly customColor?: string;
  readonly className?: string;
  readonly highlight?: string;
  readonly highlightColor?: string;
}

const levelStyles = {
  1: "text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight",
  2: "text-4xl md:text-5xl font-bold tracking-tight",
  3: "text-3xl md:text-4xl font-bold",
  4: "text-xl font-bold",
};

const colorMap = {
  primary: COLORS.primary,
  secondary: COLORS.secondary,
  dark: COLORS.textDark,
  custom: "",
};

export function Heading({
  children,
  level = 2,
  color = "secondary",
  customColor,
  className = "",
  highlight,
  highlightColor = COLORS.primary,
}: HeadingProps) {
  type HeadingTag = "h1" | "h2" | "h3" | "h4";
  const Tag = `h${level}` as HeadingTag;
  const textColor = customColor || colorMap[color];

  const content =
    highlight && typeof children === "string"
      ? children.split(highlight).map((part, index, array) => (
          <span key={`${part}-${index}`}>
            {part}
            {index < array.length - 1 && <span style={{ color: highlightColor }}>{highlight}</span>}
          </span>
        ))
      : children;

  return (
    <Tag
      className={`${levelStyles[level]} ${className}`}
      style={textColor ? { color: textColor } : undefined}
    >
      {content}
    </Tag>
  );
}
