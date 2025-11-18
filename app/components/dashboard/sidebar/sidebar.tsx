import { useState } from "react";
import { useLocation } from "react-router";
import { SidebarItem } from "./sidebar-item";
import { SIDEBAR_ITEMS } from "./sidebar-constants";
import { useTranslation } from "~/i18n";

export function Sidebar() {
  const t = useTranslation();
  const location = useLocation();

  // Initialize expanded state: expand the item that has an active sub-item
  const getInitialExpandedItem = () => {
    for (const item of SIDEBAR_ITEMS) {
      if (item.subItems?.some((subItem) => location.pathname === subItem.path)) {
        return item.translationKey;
      }
    }
    return null;
  };

  const [expandedItemKey, setExpandedItemKey] = useState<string | null>(getInitialExpandedItem);

  const handleToggle = (translationKey: string) => {
    setExpandedItemKey((current) => (current === translationKey ? null : translationKey));
  };

  const translatedItems = SIDEBAR_ITEMS.map((item) => ({
    ...item,
    label: t.sidebar[item.translationKey],
    subItems: item.subItems?.map((subItem) => ({
      ...subItem,
      label: t.sidebar[subItem.translationKey],
    })),
  }));

  return (
    <aside className="w-48 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-[calc(100vh-3rem)] overflow-y-auto">
      <div className="p-2">
        <nav className="space-y-1">
          {translatedItems.map((item) => (
            <SidebarItem
              key={item.translationKey}
              translationKey={item.translationKey}
              label={item.label}
              path={item.path}
              icon={item.icon}
              subItems={item.subItems}
              isExpanded={item.subItems ? expandedItemKey === item.translationKey : undefined}
              onToggle={item.subItems ? () => handleToggle(item.translationKey) : undefined}
            />
          ))}
        </nav>
      </div>
    </aside>
  );
}
