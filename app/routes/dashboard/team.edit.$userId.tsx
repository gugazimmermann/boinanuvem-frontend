import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { maskPhone, maskCPF, unmaskCPF, maskCEP } from "~/components/site/utils/masks";
import { ROUTES } from "~/routes.config";
import { getUserById, updateUser } from "~/services/users.service";
import { useAuth } from "~/contexts/auth-context";
import { TeamForm, type TeamFormData } from "~/components/dashboard/forms/team-form";
import type { UserFormData } from "~/types";

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
  const user = getUserById(userId);

  useEffect(() => {
    if (currentUser && !currentUser.mainUser) {
      navigate(ROUTES.PROFILE);
    }
  }, [currentUser, navigate]);

  if (!user) {
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

    const updateData: UserFormData = {
      ...data,
      cpf: unmaskCPF(data.cpf || ""),
    };

    updateUser(userId, updateData);
    setTimeout(() => {
      navigate(ROUTES.TEAM);
    }, 1500);
  };

  return (
    <div className="space-y-6">
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
