import { Input } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { AnimalCodeDisplay } from "../animal-code-display";
import type { Animal } from "~/types";

export interface AIBreedingSectionProps {
  readonly selectedAnimalIds: string[];
  readonly animalsMap: Map<string, Animal>;
  readonly attemptNumbers: Record<string, number>;
  readonly semenCode: string;
  readonly onSemenCodeChange: (value: string) => void;
  readonly onAttemptNumberChange: (animalId: string, value: string) => void;
  readonly errors: Record<string, string>;
  readonly disabled?: boolean;
}

export function AIBreedingSection({
  selectedAnimalIds,
  animalsMap,
  attemptNumbers,
  semenCode,
  onSemenCodeChange,
  onAttemptNumberChange,
  errors,
  disabled,
}: AIBreedingSectionProps) {
  const t = useTranslation();

  return (
    <div className="mt-4 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t.breedings.new.semenCodeLabel} <span className="text-red-500">*</span>
        </label>
        <Input
          type="text"
          value={semenCode}
          onChange={(e) => onSemenCodeChange(e.target.value)}
          error={errors.semenCode}
          disabled={disabled}
          placeholder={t.breedings.new.semenCodePlaceholder}
          required
        />
      </div>

      {selectedAnimalIds.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t.breedings.new.attemptNumberLabel} <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2 border border-gray-300 dark:border-gray-600 rounded-md p-4 max-h-48 overflow-y-auto">
            {selectedAnimalIds.map((animalId) => {
              const animal = animalsMap.get(animalId);
              if (!animal) return null;
              return (
                <div key={animalId} className="flex items-center space-x-3">
                  <AnimalCodeDisplay animal={animal} className="flex-1" />
                  <Input
                    type="number"
                    min="1"
                    value={attemptNumbers[animalId] || ""}
                    onChange={(e) => onAttemptNumberChange(animalId, e.target.value)}
                    error={errors[`attemptNumber_${animalId}`]}
                    disabled={disabled}
                    className="w-24"
                    required
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
