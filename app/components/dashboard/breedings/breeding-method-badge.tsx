import { useTranslation } from "~/i18n";
import type { BreedingMethod } from "~/types";
import { getBreedingMethodLabel } from "~/utils/breeding";

export interface BreedingMethodBadgeProps {
  method: BreedingMethod;
  className?: string;
}

export function BreedingMethodBadge({ method, className = "" }: BreedingMethodBadgeProps) {
  const t = useTranslation();
  const label = getBreedingMethodLabel(method, t);

  return <span className={`text-gray-700 dark:text-gray-300 ${className}`}>{label}</span>;
}
