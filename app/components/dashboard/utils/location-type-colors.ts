import { LocationType } from "~/types";

export const LOCATION_TYPE_COLORS: Record<
  LocationType,
  {
    light: { text: string; bg: string };
    dark: { text: string; bg: string };
  }
> = {
  [LocationType.PASTURE]: {
    light: { text: "#16a34a", bg: "#dcfce7" },
    dark: { text: "#4ade80", bg: "rgba(16, 185, 129, 0.2)" },
  },
  [LocationType.BARN]: {
    light: { text: "#2563eb", bg: "#dbeafe" },
    dark: { text: "#60a5fa", bg: "rgba(37, 99, 235, 0.2)" },
  },
  [LocationType.STORAGE]: {
    light: { text: "#7c3aed", bg: "#ede9fe" },
    dark: { text: "#a78bfa", bg: "rgba(124, 58, 237, 0.2)" },
  },
  [LocationType.CORRAL]: {
    light: { text: "#ea580c", bg: "#ffedd5" },
    dark: { text: "#fb923c", bg: "rgba(234, 88, 12, 0.2)" },
  },
  [LocationType.SILO]: {
    light: { text: "#0891b2", bg: "#cffafe" },
    dark: { text: "#22d3ee", bg: "rgba(8, 145, 178, 0.2)" },
  },
  [LocationType.FIELD]: {
    light: { text: "#059669", bg: "#d1fae5" },
    dark: { text: "#34d399", bg: "rgba(5, 150, 105, 0.2)" },
  },
  [LocationType.PADDOCK]: {
    light: { text: "#65a30d", bg: "#f7fee7" },
    dark: { text: "#a3e635", bg: "rgba(101, 163, 13, 0.2)" },
  },
  [LocationType.FEEDLOT]: {
    light: { text: "#dc2626", bg: "#fee2e2" },
    dark: { text: "#f87171", bg: "rgba(220, 38, 38, 0.2)" },
  },
  [LocationType.SEMI_FEEDLOT]: {
    light: { text: "#d97706", bg: "#fef3c7" },
    dark: { text: "#fbbf24", bg: "rgba(217, 119, 6, 0.2)" },
  },
  [LocationType.MILKING_PARLOR]: {
    light: { text: "#0284c7", bg: "#e0f2fe" },
    dark: { text: "#38bdf8", bg: "rgba(2, 132, 199, 0.2)" },
  },
  [LocationType.WAREHOUSE]: {
    light: { text: "#6b7280", bg: "#f3f4f6" },
    dark: { text: "#9ca3af", bg: "rgba(107, 114, 128, 0.2)" },
  },
  [LocationType.GARAGE]: {
    light: { text: "#475569", bg: "#f1f5f9" },
    dark: { text: "#94a3b8", bg: "rgba(71, 85, 105, 0.2)" },
  },
  [LocationType.OFFICE]: {
    light: { text: "#0369a1", bg: "#e0f2fe" },
    dark: { text: "#0ea5e9", bg: "rgba(3, 105, 161, 0.2)" },
  },
  [LocationType.RESIDENCE]: {
    light: { text: "#9333ea", bg: "#f3e8ff" },
    dark: { text: "#c084fc", bg: "rgba(147, 51, 234, 0.2)" },
  },
  [LocationType.OTHER]: {
    light: { text: "#64748b", bg: "#f8fafc" },
    dark: { text: "#cbd5e1", bg: "rgba(100, 116, 139, 0.2)" },
  },
};

export function getLocationTypeColors(locationType: LocationType) {
  return LOCATION_TYPE_COLORS[locationType] || LOCATION_TYPE_COLORS[LocationType.OTHER];
}
