import { AuthLayout } from "../components/site/auth-layout";
import { AuthCard, AuthFooter, AuthFormError, AuthInput, AuthButton } from "../components/site/ui";
import { usePasswordReset } from "../components/site/hooks";
import { ROUTES } from "../routes.config";
import { requireGuest, useRequireGuest } from "../utils/route-guard";
import { useTranslation } from "../i18n";
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
  const t = useTranslation();

  const {
    code,
    newPassword,
    confirmPassword,
    error,
    isLoading,
    setCode,
    setNewPassword,
    setConfirmPassword,
    handleResetPassword,
  } = usePasswordReset({
    onResetPassword: async (code, _newPassword) => {
      // TODO: Implement password reset service call
      console.log("Resetting password with code:", code);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
  });

  const getErrorMessage = (errorKey: string) => {
    const errorMap: Record<string, string> = {
      codeRequired: t.common.codeRequired,
      passwordRequired: t.common.passwordRequired,
      passwordMinLength: t.common.passwordMinLength,
      passwordMismatch: t.common.passwordMismatch,
      resetPasswordError: t.common.resetPasswordError,
    };
    return errorMap[errorKey] || t.common.resetPasswordError;
  };

  return (
    <AuthLayout>
      <AuthCard
        title="Nova Senha"
        subtitle="Digite o código recebido e sua nova senha"
        footer={
          <AuthFooter
            question="Não recebeu o código?"
            linkText="Reenviar"
            linkRoute={ROUTES.FORGOT_PASSWORD}
          />
        }
      >
        <form className="mt-6" onSubmit={handleResetPassword}>
          <AuthFormError error={error ? getErrorMessage(error) : undefined} />

          <div className="w-full">
            <AuthInput
              type="text"
              placeholder="Código de verificação"
              aria-label="Código de verificação"
              className="mt-0"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              error={error === "codeRequired" ? t.common.codeRequired : undefined}
            />
          </div>

          <div className="w-full mt-4">
            <AuthInput
              type="password"
              placeholder="Nova senha"
              aria-label="Nova senha"
              className="mt-0"
              showPasswordToggle
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={
                error === "passwordRequired" || error === "passwordMinLength"
                  ? getErrorMessage(error)
                  : undefined
              }
            />
          </div>

          <div className="w-full mt-4">
            <AuthInput
              type="password"
              placeholder="Repetir senha"
              aria-label="Repetir senha"
              className="mt-0"
              showPasswordToggle
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={error === "passwordMismatch" ? t.common.passwordMismatch : undefined}
            />
          </div>

          <div className="mt-6">
            <AuthButton type="submit" variant="primary" size="md" fullWidth disabled={isLoading}>
              {isLoading ? "Redefinindo..." : "Redefinir Senha"}
            </AuthButton>
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
