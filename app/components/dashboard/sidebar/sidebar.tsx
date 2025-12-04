import { useMemo, useState } from "react";
import { useLocation } from "react-router";
import { SidebarItem } from "./sidebar-item";
import { SIDEBAR_ITEMS } from "./sidebar-constants";
import { useTranslation } from "~/i18n";
import { usePermissions } from "~/utils/permissions";
import { getRoutePermission } from "~/utils/route-permissions";
import type { UserPermissions } from "~/types/permissions";

interface SidebarProps {
  readonly isOpen?: boolean;
  readonly onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const t = useTranslation();
  const location = useLocation();
  const { canView } = usePermissions();

  const getInitialExpandedItem = () => {
    for (const item of SIDEBAR_ITEMS) {
      if (item.subItems?.some((subItem: { path: string }) => location.pathname === subItem.path)) {
        return item.translationKey;
      }
    }
    return null;
  };

  const [expandedItemKey, setExpandedItemKey] = useState<string | null>(getInitialExpandedItem);

  const handleToggle = (translationKey: string) => {
    setExpandedItemKey((current) => (current === translationKey ? null : translationKey));
  };

  const filteredItems = useMemo(() => {
    return SIDEBAR_ITEMS.filter((item) => {
      if (item.translationKey === "dashboard") {
        return true;
      }

      if (item.subItems && item.subItems.length > 0) {
        const visibleSubItems = item.subItems.filter(
          (subItem: { path: string; translationKey: string }) => {
            const permissionPath = getRoutePermission(subItem.path);
            if (!permissionPath) {
              return true;
            }

            const [section, ...resourceParts] = permissionPath.split(".");
            const resource = resourceParts.join(".");
            return canView(section as keyof UserPermissions, resource);
          }
        );

        return visibleSubItems.length > 0;
      }

      const permissionPath = getRoutePermission(item.path);
      if (!permissionPath) {
        return true;
      }

      const [section, ...resourceParts] = permissionPath.split(".");
      const resource = resourceParts.join(".");
      return canView(section as keyof UserPermissions, resource);
    }).map((item) => {
      if (item.subItems && item.subItems.length > 0) {
        const visibleSubItems = item.subItems.filter(
          (subItem: { path: string; translationKey: string }) => {
            const permissionPath = getRoutePermission(subItem.path);
            if (!permissionPath) {
              return true;
            }

            const [section, ...resourceParts] = permissionPath.split(".");
            const resource = resourceParts.join(".");
            return canView(section as keyof UserPermissions, resource);
          }
        );

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
    subItems: item.subItems?.map(
      (subItem: { translationKey: string; path: string; icon?: string }) => ({
        ...subItem,
        label: t.sidebar[subItem.translationKey as keyof typeof t.sidebar],
      })
    ),
  }));

  return (
    <aside
      className={`
        fixed sm:static
        top-12 left-0
        w-48 h-[calc(100vh-3rem)]
        bg-gray-50 dark:bg-gray-900
        border-r border-gray-200 dark:border-gray-800
        overflow-y-auto
        z-50 sm:z-auto
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"}
      `}
    >
      <div className="p-2">
        <nav className="space-y-1">
          {translatedItems.map((item) => (
            <SidebarItem
              key={item.translationKey}
              label={item.label}
              path={item.path}
              icon={item.icon}
              subItems={item.subItems?.map(
                (subItem: { label: string; path: string; icon?: string }) => ({
                  label: subItem.label,
                  path: subItem.path,
                  icon: subItem.icon,
                })
              )}
              isExpanded={item.subItems ? expandedItemKey === item.translationKey : undefined}
              onToggle={item.subItems ? () => handleToggle(item.translationKey) : undefined}
              onItemClick={onClose}
            />
          ))}
        </nav>
      </div>
    </aside>
  );
}
