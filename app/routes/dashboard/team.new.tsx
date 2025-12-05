import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { ROUTES, getTeamPermissionsRoute } from "~/routes.config";
import { createTeamMember } from "~/services/users.service";
import { useAuth } from "~/contexts/auth-context";
import { unmaskCPF, unmaskPhone, unmaskCEP } from "~/components/site/utils/masks";
import { TeamForm } from "~/components/dashboard/forms/team-form";
import type { UserFormData } from "~/types";
import { useAlert } from "~/hooks/use-alert";

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
  const { alertMessage, showAlert } = useAlert();

  useEffect(() => {
    if (currentUser && !currentUser.mainUser) {
      navigate(ROUTES.PROFILE);
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (data: UserFormData) => {
    try {
      // Password is not required - will be set via email invitation
      const newUser = await createTeamMember({
        ...data,
        cpf: data.cpf ? unmaskCPF(data.cpf) : undefined,
        phone: data.phone ? unmaskPhone(data.phone) : "",
        zipCode: data.zipCode ? unmaskCEP(data.zipCode) : undefined,
        // password is optional - not sent for team members
      });
      showAlert(t.team.success.added, "success");
      setTimeout(() => {
        navigate(getTeamPermissionsRoute(newUser.id));
      }, 1500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t.team.errors.addFailed;
      showAlert(errorMessage, "error");
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      {alertMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-5">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
            <p
              className={`text-sm ${
                alertMessage.variant === "error"
                  ? "text-red-600 dark:text-red-400"
                  : "text-green-600 dark:text-green-400"
              }`}
            >
              {alertMessage.title}
            </p>
          </div>
        </div>
      )}
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
