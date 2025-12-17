import { t } from "~/utils/translation-helpers";

export function subscriptionConfirmedTitle(language: string): string {
  return t(
    language,
    "Assinatura Confirmada!",
    "¡Suscripción Confirmada!",
    "Subscription Confirmed!"
  );
}

export function subscriptionConfirmedMessage(language: string): string {
  return t(
    language,
    "Sua assinatura foi confirmada com sucesso. Você será redirecionado para a página de pagamentos em instantes.",
    "Tu suscripción ha sido confirmada con éxito. Serás redirigido a la página de pagos en un momento.",
    "Your subscription has been confirmed successfully. You will be redirected to the payments page shortly."
  );
}

export function goToPaymentsText(language: string): string {
  return t(language, "Ir para Pagamentos", "Ir a Pagos", "Go to Payments");
}

export function backText(language: string): string {
  return t(language, "Voltar", "Volver", "Back");
}

export function loadingText(language: string): string {
  return t(language, "Carregando...", "Cargando...", "Loading...");
}
