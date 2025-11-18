import { useMemo, useState } from "react";
import { useLocation } from "react-router";
import { SidebarItem } from "./sidebar-item";
import { SIDEBAR_ITEMS } from "./sidebar-constants";
import { useTranslation } from "~/i18n";
import { usePermissions } from "~/utils/permissions";
import { getRoutePermission } from "~/utils/route-permissions";
import type { UserPermissions } from "~/types/permissions";

export function Sidebar() {
  const t = useTranslation();
  const location = useLocation();
  const { canView } = usePermissions();

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

  // Filter sidebar items based on permissions
  const filteredItems = useMemo(() => {
    return SIDEBAR_ITEMS.filter((item) => {
      // Dashboard is always visible
      if (item.translationKey === "dashboard") {
        return true;
      }

      // Filter sub-items based on view permissions
      if (item.subItems && item.subItems.length > 0) {
        const visibleSubItems = item.subItems.filter((subItem) => {
          // Check if route has permission mapping
          const permissionPath = getRoutePermission(subItem.path);
          if (!permissionPath) {
            return true; // Allow routes not in permission map
          }

          const [section, ...resourceParts] = permissionPath.split(".");
          const resource = resourceParts.join(".");
          return canView(section as keyof UserPermissions, resource);
        });

        // Only show parent item if it has at least one visible sub-item
        return visibleSubItems.length > 0;
      }

      // For items without sub-items, check permission directly
      const permissionPath = getRoutePermission(item.path);
      if (!permissionPath) {
        return true; // Allow routes not in permission map
      }

      const [section, ...resourceParts] = permissionPath.split(".");
      const resource = resourceParts.join(".");
      return canView(section as keyof UserPermissions, resource);
    }).map((item) => {
      // Filter sub-items for items that have them
      if (item.subItems && item.subItems.length > 0) {
        const visibleSubItems = item.subItems.filter((subItem) => {
          const permissionPath = getRoutePermission(subItem.path);
          if (!permissionPath) {
            return true;
          }

          const [section, ...resourceParts] = permissionPath.split(".");
          const resource = resourceParts.join(".");
          return canView(section as keyof UserPermissions, resource);
        });

        return {
          ...item,
          subItems: visibleSubItems,
        };
      }

      return item;
    });
  }, [canView]);

  const translatedItems = filteredItems.map((item) => ({
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
