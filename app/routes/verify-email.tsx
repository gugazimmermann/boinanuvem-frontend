import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { AuthLayout } from "../components/site/auth-layout";
import { AuthCard, AuthFooter, AuthButton } from "../components/site/ui";
import { authService } from "../services/auth.service";
import { ROUTES } from "../routes.config";
import { requireGuest, useRequireGuest } from "../utils/route-guard";
import { createSEOMeta } from "../utils/seo-meta";

export function meta() {
  return createSEOMeta({
    title: "Verificar Email",
    description: "Verifique seu endereço de email para ativar sua conta Boi na Nuvem.",
    url: "/verificar-email",
    noindex: true,
  });
}

export function links() {
  return [{ rel: "canonical", href: "https://boinanuvem.com.br/verificar-email" }];
}

export async function loader() {
  return requireGuest();
}

export default function VerifyEmail() {
  useRequireGuest();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyEmail = async (token: string) => {
    setIsVerifying(true);
    setError(null);

    try {
      await authService.verifyEmail(token);
      setIsSuccess(true);
      setTimeout(() => {
        navigate(ROUTES.LOGIN);
      }, 2000);
    } catch {
      setError("Erro ao verificar email. O token pode estar expirado ou inválido.");
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      verifyEmail(token);
    } else {
      setError("Token não encontrado. Por favor, use o link enviado por email.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <AuthLayout>
      <AuthCard
        title="Verificar Email"
        subtitle="Verificando seu endereço de email..."
        footer={
          <AuthFooter question="Já tem uma conta?" linkText="Entrar" linkRoute={ROUTES.LOGIN} />
        }
      >
        <div className="mt-6">
          {isVerifying && (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Verificando seu email...
              </p>
            </div>
          )}

          {isSuccess && (
            <div className="mb-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-200">
                Email verificado com sucesso! Redirecionando para o login...
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-800 dark:text-red-200 mb-4">{error}</p>
              <AuthButton
                variant="primary"
                size="md"
                fullWidth
                onClick={() => navigate(ROUTES.LOGIN)}
              >
                Ir para Login
              </AuthButton>
            </div>
          )}
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
