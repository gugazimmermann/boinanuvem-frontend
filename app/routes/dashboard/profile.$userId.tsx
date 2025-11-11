import { useParams, useNavigate } from "react-router";
import { UserProfile } from "~/components/dashboard/profile";
import { useTranslation } from "~/i18n";
import { ROUTES } from "~/routes.config";
import { Button } from "~/components/ui";

export function meta() {
  return [
    { title: "Perfil do Usuário - Boi na Nuvem" },
    {
      name: "description",
      content: "Visualização do perfil do usuário",
    },
  ];
}

export default function UserProfileView() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const t = useTranslation();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {t.profile.user.title}
        </h1>
        <Button
          variant="outline"
          onClick={() => navigate(ROUTES.TEAM)}
          leftIcon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          }
        >
          {t.team.title}
        </Button>
      </div>

      <UserProfile userId={userId} readOnly={true} />
    </div>
  );
}

