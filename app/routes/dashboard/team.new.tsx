import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { ROUTES, getTeamPermissionsRoute } from "~/routes.config";
import { addUser } from "~/services/users.service";
import { useAuth } from "~/contexts/auth-context";
import { unmaskCPF } from "~/components/site/utils/masks";
import { TeamForm } from "~/components/dashboard/forms/team-form";
import type { UserFormData } from "~/types";

export function meta() {
  return [
    { title: "Adicionar Membro - Boi na Nuvem" },
    {
      name: "description",
      content: "Adicionar novo membro à equipe",
    },
  ];
}

export default function NewTeamMember() {
  const t = useTranslation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser && !currentUser.mainUser) {
      navigate(ROUTES.PROFILE);
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (data: UserFormData) => {
    if (!data.password) {
      throw new Error("Password is required");
    }
    const newUser = addUser({
      ...data,
      cpf: unmaskCPF(data.cpf || ""),
      password: data.password,
    });
    setTimeout(() => {
      navigate(getTeamPermissionsRoute(newUser.id));
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t.team.addModal.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t.team.new.description}</p>
        </div>
        <Button variant="outline" onClick={() => navigate(ROUTES.TEAM)}>
          {t.team.new.back}
        </Button>
      </div>

      <TeamForm
        onSubmit={handleSubmit}
        onSuccess={() => {}}
        onCancel={() => navigate(ROUTES.TEAM)}
        successMessage={t.team.success.added}
        errorMessage={t.team.errors.addFailed}
      />
    </div>
  );
}
