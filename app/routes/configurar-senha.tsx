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
    title: "Configurar Senha",
    description:
      "Configure sua senha para acessar sua conta no Boi na Nuvem. Esta ação também verificará seu email.",
    url: "/configurar-senha",
    noindex: true,
  });
}

export function links() {
  return [{ rel: "canonical", href: "https://boinanuvem.com.br/configurar-senha" }];
}

export async function loader() {
  return requireGuest();
}

export default function SetupPassword() {
  useRequireGuest();
  const navigate = useNavigate();

  return (
    <AuthLayout>
      <PasswordForm
        mode="setup"
        title="Configurar Senha"
        subtitle="Configure sua senha para acessar sua conta. Esta ação também verificará seu email automaticamente."
        footer={
          <AuthFooter
            question="Já tem uma conta?"
            linkText="Fazer login"
            linkRoute={ROUTES.LOGIN}
          />
        }
        onSubmit={async (token, password) => {
          await authService.setupPassword(token, password);
        }}
        onSuccess={() => {
          navigate(ROUTES.LOGIN);
        }}
        errorMessages={{
          tokenRequired: "Token é obrigatório",
          setupPasswordError: "Erro ao configurar senha. Tente novamente.",
        }}
        successMessage="Senha configurada e email verificado com sucesso! Redirecionando para o login..."
        loadingLabel="Configurando..."
        submitLabel="Configurar Senha"
      />
    </AuthLayout>
  );
}
