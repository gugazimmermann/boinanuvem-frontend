import { type ReactNode } from "react";
import { Link } from "react-router";

interface DropdownMenuItemProps {
  readonly href?: string;
  readonly onClick?: () => void;
  readonly children: ReactNode;
}

export function DropdownMenuItem({ href, onClick, children }: DropdownMenuItemProps) {
  const className =
    "block w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-300 capitalize transition-colors duration-300 transform hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-left";

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  if (href) {
    return (
      <Link to={href} onClick={handleClick} className={className}>
        {children}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {children}
      </button>
    );
  }

  return <div className={className}>{children}</div>;
}
