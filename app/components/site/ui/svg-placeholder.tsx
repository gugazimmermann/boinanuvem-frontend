import { COLORS } from "../constants";

interface SVGPlaceholderProps {
  width?: number;
  height?: number;
  label?: string;
  variant?: "hero" | "service" | "blog" | "faq";
  index?: number;
  className?: string;
}

export function SVGPlaceholder({
  width = 600,
  height = 400,
  label,
  variant = "service",
  index = 0,
  className = "",
}: SVGPlaceholderProps) {
  const variants = {
    hero: (
      <svg viewBox={`0 0 ${width} ${height}`} className={`w-full h-auto ${className}`}>
        <rect width={width} height={height} fill={COLORS.bgLightSecondary} />
        <circle
          cx={width * 0.5}
          cy={height * 0.4}
          r={width * 0.13}
          fill={COLORS.primary}
          opacity="0.3"
        />
        <circle
          cx={width * 0.33}
          cy={height * 0.6}
          r={width * 0.1}
          fill={COLORS.secondary}
          opacity="0.3"
        />
        <circle
          cx={width * 0.67}
          cy={height * 0.6}
          r={width * 0.12}
          fill={COLORS.primary}
          opacity="0.2"
        />
        {label && (
          <text
            x={width / 2}
            y={height / 2}
            textAnchor="middle"
            fill="#666"
            fontSize="20"
            fontFamily="Arial"
          >
            {label}
          </text>
        )}
      </svg>
    ),
    service: (
      <svg viewBox={`0 0 ${width} ${height}`} className={`w-full h-auto rounded-2xl ${className}`}>
        <rect width={width} height={height} fill={COLORS.bgLight} />
        <rect
          x={width * 0.08}
          y={height * 0.125}
          width={width * 0.83}
          height={height * 0.75}
          rx="10"
          fill={COLORS.bgLightSecondary}
        />
        <rect
          x={width * 0.17}
          y={height * 0.25}
          width={width * 0.25}
          height={height * 0.25}
          rx="5"
          fill={COLORS.primary}
          opacity="0.3"
        />
        <rect
          x={width * 0.5}
          y={height * 0.25}
          width={width * 0.25}
          height={height * 0.25}
          rx="5"
          fill={COLORS.secondary}
          opacity="0.3"
        />
        <rect
          x={width * 0.33}
          y={height * 0.55}
          width={width * 0.33}
          height={height * 0.2}
          rx="5"
          fill={COLORS.primary}
          opacity="0.2"
        />
        {(label || index !== undefined) && (
          <text
            x={width / 2}
            y={height / 2}
            textAnchor="middle"
            fill="#999"
            fontSize="18"
            fontFamily="Arial"
          >
            {label || `Service ${(index ?? 0) + 1}`}
          </text>
        )}
      </svg>
    ),
    blog: (
      <svg viewBox={`0 0 ${width} ${height}`} className={`w-full h-auto rounded-lg ${className}`}>
        <rect width={width} height={height} fill={COLORS.bgLight} />
        <rect
          x={width * 0.05}
          y={height * 0.08}
          width={width * 0.9}
          height={height * 0.84}
          rx="5"
          fill={COLORS.bgLightSecondary}
        />
        <circle
          cx={width / 2}
          cy={height / 2}
          r={width * 0.1}
          fill={COLORS.primary}
          opacity="0.3"
        />
        {(label || index !== undefined) && (
          <text
            x={width / 2}
            y={height / 2 + 10}
            textAnchor="middle"
            fill="#999"
            fontSize="14"
            fontFamily="Arial"
          >
            {label || `Blog ${(index ?? 0) + 1}`}
          </text>
        )}
      </svg>
    ),
    faq: (
      <svg viewBox={`0 0 ${width} ${height}`} className={`w-full h-auto ${className}`}>
        <rect width={width} height={height} fill={COLORS.bgLight} />
        <circle
          cx={width * 0.5}
          cy={height * 0.4}
          r={width * 0.16}
          fill={COLORS.secondary}
          opacity="0.3"
        />
        <circle
          cx={width * 0.3}
          cy={height * 0.6}
          r={width * 0.1}
          fill={COLORS.primary}
          opacity="0.3"
        />
        <circle
          cx={width * 0.7}
          cy={height * 0.6}
          r={width * 0.12}
          fill={COLORS.secondary}
          opacity="0.2"
        />
        {label && (
          <text
            x={width / 2}
            y={height / 2}
            textAnchor="middle"
            fill="#999"
            fontSize="20"
            fontFamily="Arial"
          >
            {label}
          </text>
        )}
      </svg>
    ),
  };

  return variants[variant];
}
