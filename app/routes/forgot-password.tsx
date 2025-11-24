import { AuthLayout } from "../components/site/auth-layout";
import { AuthCard, AuthFooter, AuthFormError, AuthInput, AuthButton } from "../components/site/ui";
import { usePasswordReset } from "../components/site/hooks";
import { ROUTES } from "../routes.config";
import { requireGuest, useRequireGuest } from "../utils/route-guard";
import { useTranslation } from "../i18n";
import { createAuthMeta } from "../utils/auth-meta";

export function meta() {
  return createAuthMeta("Esqueceu a Senha", "Recupere sua senha da conta Boi na Nuvem");
}

export async function loader() {
  return requireGuest();
}

export default function ForgotPassword() {
  useRequireGuest();
  const t = useTranslation();

  const { email, error, isLoading, setEmail, handleSendCode } = usePasswordReset({
    onSendCode: async (email) => {
      // TODO: Implement password reset service call
      console.log("Sending reset code to:", email);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
  });

  const getErrorMessage = (errorKey: string) => {
    const errorMap: Record<string, string> = {
      emailRequired: t.common.emailRequired,
      invalidEmail: t.common.invalidEmail,
      sendCodeError: t.common.sendCodeError,
    };
    return errorMap[errorKey] || t.common.sendCodeError;
  };

  return (
    <AuthLayout>
      <AuthCard
        title="Esqueceu a senha?"
        subtitle="Digite seu email para receber um código de recuperação"
        footer={
          <AuthFooter question="Lembrou sua senha?" linkText="Entrar" linkRoute={ROUTES.LOGIN} />
        }
      >
        <form className="mt-6" onSubmit={handleSendCode}>
          <AuthFormError error={error ? getErrorMessage(error) : undefined} />

          <div className="w-full">
            <AuthInput
              type="email"
              placeholder="Email"
              aria-label={t.common.ariaLabels.email}
              className="mt-0"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={
                error === "emailRequired" || error === "invalidEmail"
                  ? getErrorMessage(error)
                  : undefined
              }
            />
          </div>

          <div className="mt-6">
            <AuthButton type="submit" variant="primary" size="md" fullWidth disabled={isLoading}>
              {isLoading ? "Enviando..." : "Enviar Código"}
            </AuthButton>
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
