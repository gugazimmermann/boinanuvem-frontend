import { LocationType } from "~/mocks/locations";
import { getLocationTypeColors } from "./location-type-colors";

interface LocationTypeBadgeProps {
  locationType: LocationType;
  label: string;
  className?: string;
}

/**
 * Badge component for displaying location types with unique colors.
 * Each location type has a distinct color to ensure visual distinction.
 */
export function LocationTypeBadge({ locationType, label, className = "" }: LocationTypeBadgeProps) {
  const colors = getLocationTypeColors(locationType);

  return (
    <>
      <div
        className={`inline px-3 py-1 text-sm font-normal rounded-full dark:hidden ${className}`}
        style={{
          color: colors.light.text,
          backgroundColor: colors.light.bg,
        }}
      >
        {label}
      </div>
      <div
        className={`hidden dark:inline px-3 py-1 text-sm font-normal rounded-full ${className}`}
        style={{
          color: colors.dark.text,
          backgroundColor: colors.dark.bg,
        }}
      >
        {label}
      </div>
    </>
  );
}

