import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { AvatarButton } from "./avatar-button";
import { DropdownMenu } from "./dropdown-menu";
import { UserInfo } from "./user-info";
import { DropdownMenuItem } from "./dropdown-menu-item";
import { ThemeToggleMenuItem } from "./theme-toggle-menu-item";
import { LanguageSelectorMenuItem } from "./language-selector-menu-item";
import { ROUTES } from "../../../routes.config";
import { useTranslation } from "~/i18n";
import type { TranslationKey } from "~/i18n";
import { useAuth } from "~/contexts/auth-context";
import type { TeamUser } from "~/types";

type MenuItem =
  | {
      label: string;
      href?: string;
      onClick?: () => void;
      divider?: false;
    }
  | {
      divider: true;
    };

interface UserDropdownProps {
  name?: string;
  email?: string;
  initial?: string;
  menuItems?: MenuItem[];
}

const createMenuItems = (
  t: TranslationKey,
  onLogout: () => void,
  currentUser: TeamUser | null
): MenuItem[] => {
  const isMainUser = currentUser?.mainUser === true;
  const items: MenuItem[] = [];

  if (isMainUser) {
    items.push({ label: t.userDropdown.companyProfile, href: `${ROUTES.PROFILE}?tab=company` });
  }

  items.push({ label: t.userDropdown.userProfile, href: `${ROUTES.PROFILE}?tab=user` });

  if (isMainUser) {
    items.push({ label: t.userDropdown.team, href: ROUTES.TEAM });
  }

  items.push({ divider: true });
  items.push({ label: t.userDropdown.help, href: ROUTES.HELP });
  items.push({ divider: true });
  items.push({ label: t.userDropdown.logout, onClick: onLogout });

  return items;
};

const getInitials = (name: string): string => {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "U";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export function UserDropdown({ name, email, initial, menuItems }: UserDropdownProps) {
  const t = useTranslation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const displayName = name || currentUser?.name || t.common.defaultUser;
  const displayEmail = email || currentUser?.email || t.common.defaultEmail;
  const displayInitial = initial || getInitials(displayName);

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
    setIsOpen(false);
  };

  const items = menuItems || createMenuItems(t as TranslationKey, handleLogout, currentUser);

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

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <AvatarButton onClick={() => setIsOpen(!isOpen)} isOpen={isOpen} initial={displayInitial} />
      <DropdownMenu isOpen={isOpen}>
        <UserInfo name={displayName} email={displayEmail} initial={displayInitial} />
        <hr className="border-gray-200 dark:border-gray-700" />
        <ThemeToggleMenuItem />
        <LanguageSelectorMenuItem />
        <hr className="border-gray-200 dark:border-gray-700" />
        {items.map((item, index) =>
          item.divider ? (
            <hr key={index} className="border-gray-200 dark:border-gray-700" />
          ) : (
            <DropdownMenuItem
              key={index}
              href={item.href}
              onClick={item.onClick || (item.href ? () => setIsOpen(false) : undefined)}
            >
              {item.label}
            </DropdownMenuItem>
          )
        )}
      </DropdownMenu>
    </div>
  );
}
