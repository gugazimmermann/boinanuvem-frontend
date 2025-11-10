import { Link, useLocation } from "react-router";

interface SidebarItemProps {
  label: string;
  path: string;
  icon?: string;
}

export function SidebarItem({ label, path, icon }: SidebarItemProps) {
  const location = useLocation();
  const isActive = location.pathname === path;

  const baseClasses = "flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors cursor-pointer text-sm";
  const activeClasses = "bg-blue-500 text-white";
  const inactiveClasses = "text-gray-700 hover:bg-gray-200";

  const className = `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;

  return (
    <Link to={path} className={className}>
      {icon && <span className="text-lg">{icon}</span>}
      <span className="font-medium">{label}</span>
    </Link>
  );
}

