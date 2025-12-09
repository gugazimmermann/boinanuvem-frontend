import { useNavigate } from "react-router";
import { AuthLayout } from "../components/site/auth-layout";
import { AuthFooter } from "../components/site/ui";
import { PasswordForm } from "../components/site/password-form";
import { authService } from "../services/auth.service";
import { ROUTES } from "../routes.config";
import { requireGuest, useRequireGuest } from "../utils/route-guard";
import { createSEOMeta } from "../utils/seo-meta";

export function meta() {
  return createSEOMeta({
    title: "Nova Senha",
    description:
      "Defina uma nova senha para sua conta Boi na Nuvem. Digite o código recebido e sua nova senha.",
    url: "/nova-senha",
    noindex: true,
  });
}

export function links() {
  return [{ rel: "canonical", href: "https://boinanuvem.com.br/nova-senha" }];
}

export async function loader() {
  return requireGuest();
}

export default function NewPassword() {
  useRequireGuest();
  const navigate = useNavigate();

  return (
    <AuthLayout>
      <PasswordForm
        mode="reset"
        title="Nova Senha"
        subtitle="Digite o código recebido e sua nova senha"
        footer={
          <AuthFooter
            question="Não recebeu o código?"
            linkText="Reenviar"
            linkRoute={ROUTES.FORGOT_PASSWORD}
          />
        }
        onSubmit={async (token, password) => {
          await authService.resetPassword(token, password);
        }}
        onSuccess={() => {
          navigate(ROUTES.LOGIN);
        }}
        errorMessages={{
          tokenRequired: "Token de redefinição é obrigatório",
        }}
        successMessage="Senha redefinida com sucesso! Redirecionando para o login..."
        loadingLabel="Redefinindo..."
        submitLabel="Redefinir Senha"
      />
    </AuthLayout>
  );
}
