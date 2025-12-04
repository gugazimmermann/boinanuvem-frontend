interface EmptyStateConfigOptions {
  title: string;
  descriptionWithSearch: (search: string) => string;
  descriptionWithoutSearch: string;
  searchValue: string;
  onClearSearch: () => void;
  clearSearchLabel: string;
  onAddNew: () => void;
  addNewLabel: string;
}

/**
 * Creates a standardized empty state configuration for tables.
 */
export function createEmptyStateConfig({
  title,
  descriptionWithSearch,
  descriptionWithoutSearch,
  searchValue,
  onClearSearch,
  clearSearchLabel,
  onAddNew,
  addNewLabel,
}: EmptyStateConfigOptions) {
  return {
    title,
    description: searchValue ? descriptionWithSearch(searchValue) : descriptionWithoutSearch,
    onClearSearch,
    clearSearchLabel,
    onAddNew,
    addNewLabel,
  };
}
