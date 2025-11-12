import { COLORS } from "~/components/site/constants";

export const DASHBOARD_COLORS = {
  primary: COLORS.secondary,
  secondary: COLORS.primary,
  primaryDark: COLORS.secondaryDark,
  secondaryDark: COLORS.primaryDark,
  primaryLight: COLORS.secondaryLight,
  secondaryLight: COLORS.primaryLight,
} as const;
