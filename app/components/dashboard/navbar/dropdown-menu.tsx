import { type ReactNode } from "react";

interface DropdownMenuProps {
  isOpen: boolean;
  children: ReactNode;
}

export function DropdownMenu({ isOpen, children }: DropdownMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 z-20 w-56 py-2 mt-2 overflow-hidden origin-top-right bg-white rounded-md shadow-xl opacity-100 scale-100 transition-all duration-100">
      {children}
    </div>
  );
}

