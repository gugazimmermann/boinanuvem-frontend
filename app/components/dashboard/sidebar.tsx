import { Link, useLocation } from "react-router";
import { ROUTES } from "../../routes.config";

interface SidebarItem {
  label: string;
  path: string;
  icon?: string;
}

const sidebarItems: SidebarItem[] = [
  { label: "Dashboard", path: ROUTES.DASHBOARD, icon: "📊" },
  { label: "Propriedades", path: "#", icon: "🏡" },
  { label: "Animais", path: "#", icon: "🐄" },
  { label: "Pastos", path: "#", icon: "🌾" },
  { label: "Relatórios", path: "#", icon: "📈" },
  { label: "Configurações", path: "#", icon: "⚙️" },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="p-4">
        <nav className="space-y-2">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                  ${
                    isActive
                      ? "bg-blue-500 text-white"
                      : "text-gray-700 hover:bg-gray-200"
                  }
                `}
              >
                {item.icon && <span className="text-xl">{item.icon}</span>}
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

