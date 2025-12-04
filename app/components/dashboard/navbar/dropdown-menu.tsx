import { type ReactNode } from "react";

interface DropdownMenuProps {
  readonly isOpen: boolean;
  readonly children: ReactNode;
}

export function DropdownMenu({ isOpen, children }: DropdownMenuProps) {
  if (isOpen === false) return null;

  return (
    <div className="absolute right-0 z-20 w-56 py-1 mt-2 overflow-hidden origin-top-right bg-white dark:bg-gray-800 rounded-md shadow-xl dark:shadow-2xl border border-gray-200 dark:border-gray-700 opacity-100 scale-100 transition-all duration-100">
      {children}
    </div>
  );
}
