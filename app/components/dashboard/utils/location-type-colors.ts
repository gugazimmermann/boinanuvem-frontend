import { LocationType } from "~/types";

/**
 * Color mapping for each location type.
 * Each type has a unique color to ensure visual distinction.
 * Colors are defined as [textColor, backgroundColor] for light mode and [textColor, backgroundColor] for dark mode.
 */
export const LOCATION_TYPE_COLORS: Record<
  LocationType,
  {
    light: { text: string; bg: string };
    dark: { text: string; bg: string };
  }
> = {
  [LocationType.PASTURE]: {
    light: { text: "#16a34a", bg: "#dcfce7" }, // green-600, green-100
    dark: { text: "#4ade80", bg: "rgba(16, 185, 129, 0.2)" }, // green-400, green-900/20
  },
  [LocationType.BARN]: {
    light: { text: "#2563eb", bg: "#dbeafe" }, // blue-600, blue-100
    dark: { text: "#60a5fa", bg: "rgba(37, 99, 235, 0.2)" }, // blue-400, blue-900/20
  },
  [LocationType.STORAGE]: {
    light: { text: "#7c3aed", bg: "#ede9fe" }, // violet-600, violet-100
    dark: { text: "#a78bfa", bg: "rgba(124, 58, 237, 0.2)" }, // violet-400, violet-900/20
  },
  [LocationType.CORRAL]: {
    light: { text: "#ea580c", bg: "#ffedd5" }, // orange-600, orange-100
    dark: { text: "#fb923c", bg: "rgba(234, 88, 12, 0.2)" }, // orange-400, orange-900/20
  },
  [LocationType.SILO]: {
    light: { text: "#0891b2", bg: "#cffafe" }, // cyan-600, cyan-100
    dark: { text: "#22d3ee", bg: "rgba(8, 145, 178, 0.2)" }, // cyan-400, cyan-900/20
  },
  [LocationType.FIELD]: {
    light: { text: "#059669", bg: "#d1fae5" }, // emerald-600, emerald-100
    dark: { text: "#34d399", bg: "rgba(5, 150, 105, 0.2)" }, // emerald-400, emerald-900/20
  },
  [LocationType.PADDOCK]: {
    light: { text: "#65a30d", bg: "#f7fee7" }, // lime-600, lime-100
    dark: { text: "#a3e635", bg: "rgba(101, 163, 13, 0.2)" }, // lime-400, lime-900/20
  },
  [LocationType.FEEDLOT]: {
    light: { text: "#dc2626", bg: "#fee2e2" }, // red-600, red-100
    dark: { text: "#f87171", bg: "rgba(220, 38, 38, 0.2)" }, // red-400, red-900/20
  },
  [LocationType.SEMI_FEEDLOT]: {
    light: { text: "#d97706", bg: "#fef3c7" }, // amber-600, amber-100
    dark: { text: "#fbbf24", bg: "rgba(217, 119, 6, 0.2)" }, // amber-400, amber-900/20
  },
  [LocationType.MILKING_PARLOR]: {
    light: { text: "#0284c7", bg: "#e0f2fe" }, // sky-600, sky-100
    dark: { text: "#38bdf8", bg: "rgba(2, 132, 199, 0.2)" }, // sky-400, sky-900/20
  },
  [LocationType.WAREHOUSE]: {
    light: { text: "#6b7280", bg: "#f3f4f6" }, // gray-500, gray-100
    dark: { text: "#9ca3af", bg: "rgba(107, 114, 128, 0.2)" }, // gray-400, gray-900/20
  },
  [LocationType.GARAGE]: {
    light: { text: "#475569", bg: "#f1f5f9" }, // slate-600, slate-100
    dark: { text: "#94a3b8", bg: "rgba(71, 85, 105, 0.2)" }, // slate-400, slate-900/20
  },
  [LocationType.OFFICE]: {
    light: { text: "#0369a1", bg: "#e0f2fe" }, // sky-700, sky-100
    dark: { text: "#0ea5e9", bg: "rgba(3, 105, 161, 0.2)" }, // sky-500, sky-900/20
  },
  [LocationType.RESIDENCE]: {
    light: { text: "#9333ea", bg: "#f3e8ff" }, // purple-600, purple-100
    dark: { text: "#c084fc", bg: "rgba(147, 51, 234, 0.2)" }, // purple-400, purple-900/20
  },
  [LocationType.OTHER]: {
    light: { text: "#64748b", bg: "#f8fafc" }, // slate-500, slate-50
    dark: { text: "#cbd5e1", bg: "rgba(100, 116, 139, 0.2)" }, // slate-300, slate-900/20
  },
};

/**
 * Gets the color configuration for a given location type.
 * @param locationType - The location type
 * @returns The color configuration for light and dark modes
 */
export function getLocationTypeColors(locationType: LocationType) {
  return LOCATION_TYPE_COLORS[locationType] || LOCATION_TYPE_COLORS[LocationType.OTHER];
}
