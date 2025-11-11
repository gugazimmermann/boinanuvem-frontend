import { useState, useEffect, useRef } from "react";
import { AvatarButton } from "./avatar-button";
import { DropdownMenu } from "./dropdown-menu";
import { UserInfo } from "./user-info";
import { DropdownMenuItem } from "./dropdown-menu-item";
import { ROUTES } from "../../../routes.config";

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

const defaultMenuItems: MenuItem[] = [
  { label: "Ver perfil" },
  { label: "Configurações" },
  { label: "Atalhos de teclado" },
  { divider: true },
  { label: "Perfil da empresa" },
  { label: "Equipe" },
  { label: "Convidar colegas" },
  { divider: true },
  { label: "Ajuda" },
  { label: "Sair", href: ROUTES.HOME },
];

export function UserDropdown({
  name = "Usuário",
  email = "usuario@exemplo.com",
  initial = "U",
  menuItems = defaultMenuItems,
}: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
        {menuItems.map((item, index) =>
          item.divider ? (
            <hr key={index} className="border-gray-200 dark:border-gray-700" />
          ) : (
            <DropdownMenuItem key={index} href={item.href} onClick={item.onClick}>
              {item.label}
            </DropdownMenuItem>
          )
        )}
      </DropdownMenu>
    </div>
  );
}

