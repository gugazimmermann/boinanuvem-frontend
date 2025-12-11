import { Input } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { AnimalCodeDisplay } from "../animal-code-display";
import type { Animal, Birth } from "~/types";

export interface NaturalBreedingSectionProps {
  readonly bulls: Animal[];
  readonly birthsMap?: Map<string, Birth | undefined>;
  readonly selectedBullId: string;
  readonly searchValue: string;
  readonly onSearchChange: (value: string) => void;
  readonly onBullSelect: (bullId: string) => void;
  readonly error?: string;
  readonly disabled?: boolean;
}

export function NaturalBreedingSection({
  bulls,
  birthsMap,
  selectedBullId,
  searchValue,
  onSearchChange,
  onBullSelect,
  error,
  disabled,
}: NaturalBreedingSectionProps) {
  const t = useTranslation();

  return (
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {t.breedings.new.bullLabel} <span className="text-red-500">*</span>
      </label>
      <Input
        type="text"
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={t.breedings.new.bullSearchPlaceholder}
        disabled={disabled}
      />
      <div className="mt-2 border border-gray-300 dark:border-gray-600 rounded-md max-h-48 overflow-y-auto">
        {bulls.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 p-4">{t.breedings.new.noBulls}</p>
        ) : (
          <div className="space-y-1 p-2">
            {bulls.map((bull) => {
              const birth = birthsMap?.get(bull.id);
              const breedText = birth?.breed ? t.animals.breeds[birth.breed] || birth.breed : "";
              return (
                <label
                  key={bull.id}
                  className={`flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded ${
                    selectedBullId === bull.id ? "bg-blue-50 dark:bg-blue-900/20" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="bullId"
                    checked={selectedBullId === bull.id}
                    onChange={() => onBullSelect(bull.id)}
                    disabled={disabled}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <div className="flex-1">
                    <AnimalCodeDisplay animal={bull} />
                    {breedText && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                        ({breedText})
                      </span>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
      {selectedBullId && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {t.breedings.new.bullSelected}
        </p>
      )}
    </div>
  );
}
