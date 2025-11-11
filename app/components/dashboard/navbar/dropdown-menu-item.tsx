import { type ReactNode } from "react";

interface DropdownMenuItemProps {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
}

export function DropdownMenuItem({ href = "#", onClick, children }: DropdownMenuItemProps) {
  const className =
    "block px-4 py-2 text-sm text-gray-600 dark:text-gray-300 capitalize transition-colors duration-300 transform hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer";

  if (onClick) {
    return (
      <button onClick={onClick} className={className}>
        {children}
      </button>
    );
  }

  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

