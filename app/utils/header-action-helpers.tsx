import type { TableAction } from "~/components/ui";

interface CreateAddButtonActionOptions {
  label: string;
  onClick: () => void;
}

/**
 * Creates a standardized "Add" button header action with the common plus icon.
 */
export function createAddButtonAction({
  label,
  onClick,
}: CreateAddButtonActionOptions): TableAction {
  return {
    label,
    variant: "primary",
    leftIcon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    onClick,
  };
}
