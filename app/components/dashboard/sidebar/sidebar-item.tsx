import { useState } from "react";
import { Link, useLocation } from "react-router";
import { DASHBOARD_COLORS } from "../utils/colors";

interface SidebarSubItemProps {
  label: string;
  path: string;
  icon?: string;
}

interface SidebarItemProps {
  label: string;
  path: string;
  icon?: string;
  subItems?: SidebarSubItemProps[];
}

function SidebarSubItem({ label, path, icon }: SidebarSubItemProps) {
  const location = useLocation();
  const isActive = location.pathname === path;

  const baseClasses =
    "flex items-center space-x-2 px-3 py-2 pl-8 rounded-lg transition-colors cursor-pointer text-sm";
  const activeClasses = "text-white";
  const inactiveClasses =
    "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800";

  const className = `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
  const activeStyle = isActive ? { backgroundColor: DASHBOARD_COLORS.primary } : undefined;

  return (
    <Link to={path} className={className} style={activeStyle}>
      {icon && <span className="text-lg">{icon}</span>}
      <span className="font-medium">{label}</span>
    </Link>
  );
}

export function SidebarItem({ label, path, icon, subItems }: SidebarItemProps) {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(() => {
    if (!subItems) return false;
    return subItems.some((subItem) => location.pathname === subItem.path);
  });

  const hasActiveSubItem = subItems?.some((subItem) => location.pathname === subItem.path);
  const isActive = location.pathname === path || hasActiveSubItem;

  const baseClasses =
    "flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors cursor-pointer text-sm";
  const activeClasses = "text-white";
  const inactiveClasses =
    "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800";

  const className = `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
  const activeStyle = isActive ? { backgroundColor: DASHBOARD_COLORS.primary } : undefined;

  if (subItems && subItems.length > 0) {
    return (
      <div>
        <div className={className} style={activeStyle} onClick={() => setIsExpanded(!isExpanded)}>
          {icon && <span className="text-lg">{icon}</span>}
          <span className="font-medium flex-1">{label}</span>
          <svg
            className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
        {isExpanded && (
          <div className="mt-1 space-y-1">
            {subItems.map((subItem) => (
              <SidebarSubItem
                key={subItem.path}
                label={subItem.label}
                path={subItem.path}
                icon={subItem.icon}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link to={path} className={className} style={activeStyle}>
      {icon && <span className="text-lg">{icon}</span>}
      <span className="font-medium">{label}</span>
    </Link>
  );
}
