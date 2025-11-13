import { type ReactNode, type CSSProperties } from "react";

interface SectionProps {
  children: ReactNode;
  id?: string;
  className?: string;
  backgroundColor?: string;
  style?: CSSProperties;
  padding?: "sm" | "md" | "lg";
}

const paddingStyles = {
  sm: "py-8 md:py-12",
  md: "py-12 md:py-16",
  lg: "py-16 md:py-24",
};

export function Section({
  children,
  id,
  className = "",
  backgroundColor,
  style,
  padding = "lg",
}: SectionProps) {
  const sectionStyle: CSSProperties = {
    ...(backgroundColor ? { backgroundColor } : {}),
    ...style,
  };

  return (
    <section
      id={id}
      className={`${paddingStyles[padding]} ${className}`}
      style={Object.keys(sectionStyle).length > 0 ? sectionStyle : undefined}
    >
      <div className="container mx-auto px-4 max-w-7xl">{children}</div>
    </section>
  );
}
