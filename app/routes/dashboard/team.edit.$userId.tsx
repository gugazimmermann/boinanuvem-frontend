import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "~/components/ui";
import { useTranslation } from "~/i18n";
import {
  maskPhone,
  maskCPF,
  unmaskCPF,
  maskCEP,
  unmaskPhone,
  unmaskCEP,
} from "~/components/site/utils/masks";
import { ROUTES } from "~/routes.config";
import { getTeamMembers, updateTeamMember, type FullUserProfile } from "~/services/users.service";
import { useAuth } from "~/contexts/auth-context";
import { TeamForm, type TeamFormData } from "~/components/dashboard/forms/team-form";
import type { UserFormData } from "~/types";
import { useAlert } from "~/hooks/use-alert";

export function meta() {
  return [
    { title: "Editar Membro - Boi na Nuvem" },
    {
      name: "description",
      content: "Editar membro da equipe",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const { requireMainUser } = await import("~/utils/route-guard");
  return requireMainUser()({ request });
}

export default function EditTeamMember() {
  const t = useTranslation();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const { currentUser } = useAuth();
  const { alertMessage, showAlert } = useAlert();
  const [user, setUser] = useState<FullUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentUser && !currentUser.mainUser) {
      navigate(ROUTES.PROFILE);
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    const loadUser = async () => {
      if (!userId) return;
      setIsLoading(true);
      try {
        const members = await getTeamMembers();
        const foundUser = members.find((m) => m.id === userId);
        if (foundUser) {
          setUser(foundUser);
        } else {
          showAlert(
            (t.team.errors as { userNotFound?: string }).userNotFound || t.team.errors.updateFailed,
            "error"
          );
          setTimeout(() => {
            navigate(ROUTES.TEAM);
          }, 2000);
        }
      } catch (error) {
        console.error("Failed to load team member:", error);
        showAlert(t.team.errors.updateFailed, "error");
        setTimeout(() => {
          navigate(ROUTES.TEAM);
        }, 2000);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [userId, navigate, showAlert, t]);

  if (isLoading || !user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-gray-500 dark:text-gray-400">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  const initialData: Partial<TeamFormData> = {
    name: user.name || "",
    cpf: user.cpf ? maskCPF(user.cpf) : "",
    email: user.email || "",
    phone: user.phone ? maskPhone(user.phone) : "",
    password: "",
    confirmPassword: "",
    street: user.street || "",
    number: user.number || "",
    complement: user.complement || "",
    neighborhood: user.neighborhood || "",
    city: user.city || "",
    state: user.state || "",
    zipCode: user.zipCode ? maskCEP(user.zipCode) : "",
  };

  const handleSubmit = async (data: UserFormData) => {
    if (!userId) return;

    try {
      const updateData: UserFormData = {
        ...data,
        cpf: data.cpf ? unmaskCPF(data.cpf) : undefined,
        phone: data.phone ? unmaskPhone(data.phone) : "",
        zipCode: data.zipCode ? unmaskCEP(data.zipCode) : undefined,
      };

      await updateTeamMember(userId, updateData);
      showAlert(t.team.success.updated, "success");
      setTimeout(() => {
        navigate(ROUTES.TEAM);
      }, 1500);
    } catch (error) {
      console.error("Failed to update team member:", error);
      showAlert(t.team.errors.updateFailed, "error");
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
            {t.team.editModal.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t.team.editModal.description}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate(ROUTES.TEAM)}>
          {t.team.new.back}
        </Button>
      </div>

      <TeamForm
        initialData={initialData}
        isEdit={true}
        onSubmit={handleSubmit}
        onSuccess={() => {}}
        onCancel={() => navigate(ROUTES.TEAM)}
        successMessage={t.team.success.updated}
        errorMessage={t.team.errors.updateFailed}
      />
    </div>
  );
}
