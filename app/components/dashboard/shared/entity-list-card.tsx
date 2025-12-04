export interface EntityListItem {
  id: string;
  name: string;
  subtitle?: string;
}

export interface EntityListCardProps {
  readonly title: string;
  readonly entities: readonly EntityListItem[];
  readonly onEntityClick: (entity: EntityListItem) => void;
  readonly emptyMessage?: string;
}

/**
 * Reusable component for displaying a list of entities in a card format.
 * Used for locations, employees, service providers, etc. in movement details.
 */
export function EntityListCard({
  title,
  entities,
  onEntityClick,
  emptyMessage,
}: EntityListCardProps) {
  if (entities.length === 0 && !emptyMessage) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">{title}</h2>
      {entities.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      ) : (
        <div className="space-y-2">
          {entities.map((entity) => (
            <button
              type="button"
              key={entity.id}
              className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer w-full text-left border-0 bg-transparent"
              onClick={() => onEntityClick(entity)}
            >
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {entity.name}
                </p>
                {entity.subtitle && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">{entity.subtitle}</p>
                )}
              </div>
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
