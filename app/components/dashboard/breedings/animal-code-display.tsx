import type { Animal } from "~/types";

export interface AnimalCodeDisplayProps {
  animal: Animal;
  className?: string;
  showRegistration?: boolean;
}

export function AnimalCodeDisplay({
  animal,
  className = "",
  showRegistration = true,
}: AnimalCodeDisplayProps) {
  return (
    <div className={className}>
      <h2 className="font-medium text-gray-800 dark:text-gray-200">{animal.code}</h2>
      {showRegistration && (
        <p className="text-sm font-normal text-gray-600 dark:text-gray-400">
          {animal.registrationNumber}
        </p>
      )}
    </div>
  );
}
