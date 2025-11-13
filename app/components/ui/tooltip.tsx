import { useState } from "react";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute z-50 flex items-center justify-center w-48 p-3 text-gray-600 bg-white rounded-lg shadow-lg dark:shadow-none shadow-gray-200 dark:bg-gray-800 dark:text-white -translate-x-1/2 top-full left-1/2 mt-2 pointer-events-none">
          <span className="truncate">{content}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 absolute rotate-45 -translate-x-1/2 left-1/2 top-0 -mt-3 transform text-white dark:text-gray-800 fill-current"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M20 3H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1z"></path>
          </svg>
        </div>
      )}
    </div>
  );
}
