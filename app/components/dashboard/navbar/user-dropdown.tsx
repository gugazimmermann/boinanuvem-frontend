import { useState, useEffect, useRef } from "react";
import { AvatarButton } from "./avatar-button";
import { DropdownMenu } from "./dropdown-menu";
import { UserInfo } from "./user-info";
import { DropdownMenuItem } from "./dropdown-menu-item";
import { ThemeToggleMenuItem } from "./theme-toggle-menu-item";
import { LanguageSelectorMenuItem } from "./language-selector-menu-item";
import { ROUTES } from "../../../routes.config";
import { useTranslation } from "~/i18n";
import type { TranslationKey } from "~/i18n";

interface MenuItem {
  label: string;
  href?: string;
  onClick?: () => void;
  divider?: boolean;
}

interface UserDropdownProps {
  name?: string;
  email?: string;
  initial?: string;
  menuItems?: MenuItem[];
}

const createMenuItems = (t: TranslationKey): MenuItem[] => [
  { label: t.userDropdown.companyProfile, href: `${ROUTES.PROFILE}?tab=company` },
  { label: t.userDropdown.userProfile, href: `${ROUTES.PROFILE}?tab=user` },
  { label: t.userDropdown.team },
  { divider: true },
  { label: t.userDropdown.help },
  { label: t.userDropdown.logout, href: ROUTES.HOME },
];

export function UserDropdown({
  name = "User",
  email = "user@example.com",
  initial = "U",
  menuItems,
}: UserDropdownProps) {
  const t = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const items = menuItems || createMenuItems(t);

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
      <AvatarButton onClick={() => setIsOpen(!isOpen)} isOpen={isOpen} initial={initial} />
      <DropdownMenu isOpen={isOpen}>
        <UserInfo name={name} email={email} initial={initial} />
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

