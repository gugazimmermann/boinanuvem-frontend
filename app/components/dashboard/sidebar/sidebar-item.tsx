import { Link, useLocation } from "react-router";
import { DASHBOARD_COLORS } from "../utils/colors";

interface SidebarSubItemProps {
  readonly label: string;
  readonly path: string;
  readonly icon?: string;
}

interface SidebarItemProps {
  readonly label: string;
  readonly path: string;
  readonly icon?: string;
  readonly subItems?: SidebarSubItemProps[];
  readonly isExpanded?: boolean;
  readonly onToggle?: () => void;
  readonly onItemClick?: () => void;
}

interface SidebarSubItemPropsWithCallback extends SidebarSubItemProps {
  readonly onItemClick?: () => void;
}

function SidebarSubItem({ label, path, icon, onItemClick }: SidebarSubItemPropsWithCallback) {
  const location = useLocation();
  const isActive = location.pathname === path;

  const baseClasses =
    "flex items-center space-x-2 px-3 py-2 pl-8 rounded-lg transition-colors cursor-pointer text-sm";
  const activeClasses = "text-white";
  const inactiveClasses =
    "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800";

  const className = `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
  const activeStyle = isActive ? { backgroundColor: DASHBOARD_COLORS.primary } : undefined;

  const handleClick = () => {
    if (onItemClick) {
      onItemClick();
    }
  };

  return (
    <Link to={path} className={className} style={activeStyle} onClick={handleClick}>
      {icon && <span className="text-lg">{icon}</span>}
      <span className="font-medium">{label}</span>
    </Link>
  );
}

export function SidebarItem({
  label,
  path,
  icon,
  subItems,
  isExpanded,
  onToggle,
  onItemClick,
}: SidebarItemProps) {
  const location = useLocation();

  const hasActiveSubItem = subItems?.some((subItem) => location.pathname === subItem.path);
  const isActive = location.pathname === path || hasActiveSubItem;

  const baseClasses =
    "flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors cursor-pointer text-sm";
  const activeClasses = "text-white";
  const inactiveClasses =
    "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800";

  const className = `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
  const activeStyle = isActive ? { backgroundColor: DASHBOARD_COLORS.primary } : undefined;

  const handleItemClick = onItemClick;

  if (subItems && subItems.length > 0) {
    return (
      <div data-testid={`sidebar-item-${label}`} data-expanded={isExpanded ? "true" : "false"}>
        <button
          type="button"
          className={className}
          style={activeStyle}
          onClick={onToggle}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onToggle?.();
            }
          }}
        >
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
        </button>
        {isExpanded && (
          <div className="mt-1 space-y-1">
            {subItems.map((subItem) => (
              <SidebarSubItem
                key={subItem.path}
                label={subItem.label}
                path={subItem.path}
                icon={subItem.icon}
                onItemClick={onItemClick}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      to={path}
      className={className}
      style={activeStyle}
      onClick={handleItemClick}
      data-testid={`sidebar-item-${label}`}
    >
      {icon && <span className="text-lg">{icon}</span>}
      <span className="font-medium">{label}</span>
    </Link>
  );
}
