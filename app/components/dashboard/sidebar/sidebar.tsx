import { SidebarItem } from "./sidebar-item";
import { SIDEBAR_ITEMS } from "./sidebar-constants";
import { useTranslation } from "~/i18n";

export function Sidebar() {
  const t = useTranslation();
  
  const translatedItems = SIDEBAR_ITEMS.map((item) => ({
    ...item,
    label: t.sidebar[item.translationKey],
  }));

  return (
    <aside className="w-48 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-[calc(100vh-3rem)] overflow-y-auto">
      <div className="p-2">
        <nav className="space-y-1">
          {translatedItems.map((item) => (
            <SidebarItem
              key={item.path}
              label={item.label}
              path={item.path}
              icon={item.icon}
            />
          ))}
        </nav>
      </div>
    </aside>
  );
}

