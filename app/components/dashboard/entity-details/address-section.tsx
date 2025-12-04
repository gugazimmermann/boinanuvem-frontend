interface AddressSectionProps {
  readonly street?: string;
  readonly number?: string;
  readonly complement?: string;
  readonly neighborhood?: string;
  readonly city?: string;
  readonly state?: string;
  readonly zipCode?: string;
  readonly translationKeys: {
    readonly street: string;
    readonly complement: string;
    readonly neighborhood: string;
    readonly cityState: string;
    readonly zipCode: string;
  };
}

export function AddressSection({
  street,
  number,
  complement,
  neighborhood,
  city,
  state,
  zipCode,
  translationKeys,
}: AddressSectionProps) {
  if (!street && !city) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-1 w-12 bg-green-500 rounded-full"></div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {translationKeys.street}
        </h2>
      </div>
      <div className="space-y-4">
        {street && (
          <div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {translationKeys.street}
            </p>
            <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
              {street}
              {number ? `, ${number}` : ""}
            </p>
          </div>
        )}
        {complement && (
          <div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {translationKeys.complement}
            </p>
            <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{complement}</p>
          </div>
        )}
        {neighborhood && (
          <div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {translationKeys.neighborhood}
            </p>
            <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{neighborhood}</p>
          </div>
        )}
        {(city || state) && (
          <div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {translationKeys.cityState}
            </p>
            <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
              {city || ""}
              {city && state ? ", " : ""}
              {state || ""}
            </p>
          </div>
        )}
        {zipCode && (
          <div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {translationKeys.zipCode}
            </p>
            <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{zipCode}</p>
          </div>
        )}
      </div>
    </div>
  );
}
