import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { CompanyProfile, UserProfile } from "~/components/dashboard/profile";
import { useTranslation } from "~/i18n";
import { DASHBOARD_COLORS } from "~/components/dashboard/utils/colors";
import { useAuth } from "~/contexts/auth-context";

export function meta() {
  return [
    { title: "Perfil - Boi na Nuvem" },
    {
      name: "description",
      content: "Gerenciamento de perfil do usuário e empresa",
    },
  ];
}

export default function Profile() {
  const t = useTranslation();
  const { currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const isMainUser = currentUser?.mainUser === true;

  const defaultTab = isMainUser ? "company" : "user";
  const activeTab: "company" | "user" =
    tabParam === "user" || tabParam === "company" ? tabParam : defaultTab;

  useEffect(() => {
    if (!isMainUser && activeTab === "company") {
      setSearchParams({ tab: "user" });
    }
  }, [isMainUser, activeTab, setSearchParams]);

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t.profile.title}</h1>

      <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8" aria-label={t.common.ariaLabels.tabs}>
          {isMainUser && (
            <button
              onClick={() => {
                setSearchParams({ tab: "company" });
              }}
              className={`
                py-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer
                ${
                  activeTab === "company"
                    ? "dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }
              `}
              style={
                activeTab === "company"
                  ? { borderColor: DASHBOARD_COLORS.primary, color: DASHBOARD_COLORS.primary }
                  : undefined
              }
            >
              {t.profile.tabs.company}
            </button>
          )}
          <button
            onClick={() => {
              setSearchParams({ tab: "user" });
            }}
            className={`
              py-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer
              ${
                activeTab === "user"
                  ? "dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }
            `}
            style={
              activeTab === "user"
                ? { borderColor: DASHBOARD_COLORS.primary, color: DASHBOARD_COLORS.primary }
                : undefined
            }
          >
            {t.profile.tabs.user}
          </button>
        </nav>
      </div>

      <div>{activeTab === "company" ? <CompanyProfile /> : <UserProfile />}</div>
    </div>
  );
}
