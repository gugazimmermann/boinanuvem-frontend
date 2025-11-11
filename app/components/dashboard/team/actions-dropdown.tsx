import { useState, useRef, useEffect } from "react";
import { useTranslation } from "~/i18n";
import type { TeamUser } from "~/routes/dashboard/team";

interface ActionsDropdownProps {
  user: TeamUser;
  onView: (user: TeamUser) => void;
  onEdit: (user: TeamUser) => void;
  onDelete: (user: TeamUser) => void;
}

export function ActionsDropdown({ user, onView, onEdit, onDelete }: ActionsDropdownProps) {
  const t = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleView = () => {
    onView(user);
    setIsOpen(false);
  };

  const handleEdit = () => {
    onEdit(user);
    setIsOpen(false);
  };

  const handleDelete = () => {
    onDelete(user);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors cursor-pointer"
        title={t.team.table.actions}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-20 w-48 py-1 mt-2 overflow-hidden origin-top-right bg-white dark:bg-gray-800 rounded-md shadow-xl dark:shadow-2xl border border-gray-200 dark:border-gray-700">
          <button
            onClick={handleView}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300 transform hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            {t.team.viewUser}
          </button>
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300 transform hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            {t.team.editUser}
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 transition-colors duration-300 transform hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            {t.team.deleteUser}
          </button>
        </div>
      )}
    </div>
  );
}

