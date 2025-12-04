import { Input } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { AnimalCodeDisplay } from "../animal-code-display";
import type { Animal } from "~/types";

export interface AnimalSelectionSectionProps {
  readonly animals: Animal[];
  readonly selectedAnimalIds: string[];
  readonly searchValue: string;
  readonly onSearchChange: (value: string) => void;
  readonly onToggleAnimal: (animalId: string) => void;
  readonly error?: string;
  readonly disabled?: boolean;
}

export function AnimalSelectionSection({
  animals,
  selectedAnimalIds,
  searchValue,
  onSearchChange,
  onToggleAnimal,
  error,
  disabled,
}: AnimalSelectionSectionProps) {
  const t = useTranslation();

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        {t.breedings.new.animalSelectionTitle}
      </h2>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t.breedings.new.animalLabel} <span className="text-red-500">*</span>
        </label>
        <Input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t.breedings.new.searchPlaceholder}
          disabled={disabled}
        />
        <div className="mt-2 border border-gray-300 dark:border-gray-600 rounded-md max-h-48 overflow-y-auto">
          {animals.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 p-4">
              {t.breedings.new.noAnimals}
            </p>
          ) : (
            <div className="space-y-1 p-2">
              {animals.map((animal) => (
                <label
                  key={animal.id}
                  className={`flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded ${
                    selectedAnimalIds.includes(animal.id) ? "bg-blue-50 dark:bg-blue-900/20" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedAnimalIds.includes(animal.id)}
                    onChange={() => onToggleAnimal(animal.id)}
                    disabled={disabled}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <AnimalCodeDisplay animal={animal} className="flex-1" />
                </label>
              ))}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
        {selectedAnimalIds.length > 0 && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {t.breedings.new.selectedAnimals(selectedAnimalIds.length)}
          </p>
        )}
      </div>
    </div>
  );
}
