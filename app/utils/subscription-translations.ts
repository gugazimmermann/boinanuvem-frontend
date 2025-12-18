import { t } from "~/utils/translation-helpers";

/**
 * Consolidated subscription-related translation helpers
 * Reduces duplication across subscription-card.tsx, subscription.tsx, subscription.payment.tsx, and payment-form.tsx
 */

// Billing cycle translations
export function getBillingCycleLabel(language: string): string {
  return t(language, "Ciclo de cobrança:", "Ciclo de facturación:", "Billing cycle:");
}

export function getMonthlyLabel(language: string): string {
  return t(language, "Mensal", "Mensual", "Monthly");
}

export function getAnnualLabel(language: string): string {
  return t(language, "Anual", "Anual", "Annual");
}

export function getBillingCycleText(language: string, billingCycle: "monthly" | "annual"): string {
  return billingCycle === "monthly" ? getMonthlyLabel(language) : getAnnualLabel(language);
}

export function getPeriodText(language: string, billingCycle: "monthly" | "annual"): string {
  if (billingCycle === "monthly") {
    return t(language, "mês", "mes", "month");
  }
  return t(language, "ano", "año", "year");
}

export function getMonthSuffix(language: string): string {
  return t(language, " / mês", " / mes", " / month");
}

export function getYearSuffix(language: string): string {
  return t(language, " / ano", " / año", " / year");
}

export function getPriceSuffix(language: string, billingCycle: "monthly" | "annual"): string {
  return billingCycle === "monthly" ? getMonthSuffix(language) : getYearSuffix(language);
}

// Status labels
export function getStatusLabel(language: string, status: string): string {
  const labels: Record<string, string> = {
    active: t(language, "Ativa", "Activa", "Active"),
    cancelled: t(language, "Cancelada", "Cancelada", "Cancelled"),
    expired: t(language, "Expirada", "Expirada", "Expired"),
    past_due: t(language, "Atrasada", "Atrasada", "Past Due"),
    unpaid: t(language, "Não Paga", "No Pagada", "Unpaid"),
  };
  return labels[status] || status;
}

// Date labels
export function getStartDateLabel(language: string): string {
  return t(language, "Início:", "Inicio:", "Start date:");
}

export function getEndDateLabel(language: string): string {
  return t(language, "Fim:", "Fin:", "End date:");
}

export function getPriceLabel(language: string): string {
  return t(language, "Valor:", "Valor:", "Price:");
}

// Button and action text
export function getBackText(language: string): string {
  return t(language, "Voltar", "Volver", "Back");
}

export function getManageSubscriptionText(language: string): string {
  return t(language, "Gerenciar Assinatura", "Gestionar Suscripción", "Manage Subscription");
}

export function getOpeningText(language: string): string {
  return t(language, "Abrindo...", "Abriendo...", "Opening...");
}

export function getManageButtonText(language: string): string {
  return getManageSubscriptionText(language);
}

export function getOpeningButtonText(language: string): string {
  return getOpeningText(language);
}

export function getCancelSubscriptionText(language: string): string {
  return t(language, "Cancelar Assinatura", "Cancelar Suscripción", "Cancel Subscription");
}

export function getCancelSubscriptionTitle(language: string): string {
  return t(language, "Cancelar Assinatura", "Cancelar Suscripción", "Cancel Subscription");
}

export function getCancelQuestionText(language: string): string {
  return t(
    language,
    "Como você deseja cancelar sua assinatura?",
    "¿Cómo deseas cancelar tu suscripción?",
    "How would you like to cancel your subscription?"
  );
}

export function getCancellingText(language: string): string {
  return t(language, "Cancelando...", "Cancelando...", "Cancelling...");
}

export function getConfirmCancellationText(language: string): string {
  return t(language, "Confirmar Cancelamento", "Confirmar Cancelación", "Confirm Cancellation");
}

export function getCancelButtonText(language: string): string {
  return getConfirmCancellationText(language);
}

export function getCancellingButtonText(language: string): string {
  return getCancellingText(language);
}

// Cancel dialog options
export function getEndOfPeriodTitle(language: string): string {
  return t(language, "No final do período", "Al final del período", "At end of period");
}

export function getEndOfPeriodDescription(language: string): string {
  return t(
    language,
    "Continue usando até o final do período pago",
    "Continúa usando hasta el final del período pagado",
    "Continue using until the end of the paid period"
  );
}

export function getEndOfPeriodAriaLabel(language: string): string {
  if (language === "pt") {
    return "No final do período: Continue usando até o final do período pago";
  }
  if (language === "es") {
    return "Al final del período: Continúa usando hasta el final del período pagado";
  }
  return "At end of period: Continue using until the end of the paid period";
}

export function getImmediatelyTitle(language: string): string {
  return t(language, "Imediatamente", "Inmediatamente", "Immediately");
}

export function getImmediatelyDescription(language: string): string {
  return t(
    language,
    "Cancelar agora e parar o acesso imediatamente",
    "Cancelar ahora y detener el acceso inmediatamente",
    "Cancel now and stop access immediately"
  );
}

export function getImmediatelyAriaLabel(language: string): string {
  if (language === "pt") {
    return "Imediatamente: Cancelar agora e parar o acesso imediatamente";
  }
  if (language === "es") {
    return "Inmediatamente: Cancelar ahora y detener el acceso inmediatamente";
  }
  return "Immediately: Cancel now and stop access immediately";
}

// Error messages
export function getCancelError(language: string): string {
  return t(
    language,
    "Falha ao cancelar assinatura",
    "Error al cancelar suscripción",
    "Failed to cancel subscription"
  );
}

export function getPortalError(language: string): string {
  return t(language, "Falha ao abrir portal", "Error al abrir portal", "Failed to open portal");
}

// Subscription page translations
export function getLoadingPlansText(language: string): string {
  return t(language, "Carregando planos...", "Cargando planes...", "Loading plans...");
}

export function getLoadPlansError(language: string): string {
  return t(language, "Falha ao carregar planos", "Error al cargar planes", "Failed to load plans");
}

export function getChoosePlanTitle(language: string): string {
  return t(language, "Escolha seu Plano", "Elige tu Plan", "Choose Your Plan");
}

export function getChoosePlanDescription(language: string): string {
  return t(
    language,
    "Selecione o plano que melhor se adequa às necessidades da sua propriedade",
    "Selecciona el plan que mejor se adapte a las necesidades de tu propiedad",
    "Select the plan that best fits your property's needs"
  );
}

export function getMostPopularText(language: string): string {
  return t(language, "Mais Popular", "Más Popular", "Most Popular");
}

export function getPerPeriodText(language: string, period: string): string {
  return t(language, `por ${period}`, `por ${period}`, `per ${period}`);
}

export function getSaveText(language: string, amount: string): string {
  return t(language, `Economize ${amount}`, `Ahorra ${amount}`, `Save ${amount}`);
}

export function getPlanLimitsTitle(language: string): string {
  return t(language, "Limites do Plano:", "Límites del Plan:", "Plan Limits:");
}

export function getAllFeaturesTitle(language: string): string {
  return t(language, "Todas as Funcionalidades:", "Todas las Funcionalidades:", "All Features:");
}

export function getAllFeaturesDescription(language: string): string {
  return t(
    language,
    "Todos os planos incluem as mesmas funcionalidades",
    "Todos los planes incluyen las mismas funcionalidades",
    "All plans include the same features"
  );
}

export function getSubscribeNowText(language: string): string {
  return t(language, "Assinar Agora →", "Suscribirse Ahora →", "Subscribe Now →");
}

export function getBackToPaymentsText(language: string): string {
  return t(language, "← Voltar para Pagamentos", "← Volver a Pagos", "← Back to Payments");
}

// Payment page translations
export function getPlanNotSelectedError(language: string): string {
  return t(language, "Plano não selecionado", "Plan no seleccionado", "Plan not selected");
}

export function getPlanNotFoundError(language: string): string {
  return t(language, "Plano não encontrado", "Plan no encontrado", "Plan not found");
}

export function getLoadPlanError(language: string): string {
  return t(language, "Falha ao carregar plano", "Error al cargar plan", "Failed to load plan");
}

export function getCompletePaymentTitle(language: string): string {
  return t(language, "Complete seu Pagamento", "Completa tu Pago", "Complete Your Payment");
}

export function getCompletePaymentDescription(language: string): string {
  return t(
    language,
    "Insira os detalhes do seu cartão para finalizar a assinatura",
    "Ingresa los detalles de tu tarjeta para finalizar la suscripción",
    "Enter your card details to complete the subscription"
  );
}

export function getPlanSummaryTitle(language: string): string {
  return t(language, "Resumo do Plano", "Resumen del Plan", "Plan Summary");
}

export function getPlanLabel(language: string): string {
  return t(language, "Plano:", "Plan:", "Plan:");
}

export function getBackToPlansText(language: string): string {
  return t(language, "← Voltar para Planos", "← Volver a Planes", "← Back to Plans");
}

// Payment form translations
export function getLoadingPaymentFormText(language: string): string {
  return t(
    language,
    "Carregando formulário de pagamento...",
    "Cargando formulario de pago...",
    "Loading payment form..."
  );
}

export function getCardElementNotFoundError(language: string): string {
  return t(
    language,
    "Elemento de cartão não encontrado",
    "Elemento de tarjeta no encontrado",
    "Card element not found"
  );
}

export function getPaymentMethodError(language: string): string {
  return t(
    language,
    "Falha ao criar método de pagamento",
    "Error al crear método de pago",
    "Failed to create payment method"
  );
}

export function getPaymentProcessingError(language: string): string {
  return t(
    language,
    "Falha ao processar pagamento",
    "Error al procesar pago",
    "Failed to process payment"
  );
}

export function getCardDetailsLabel(language: string): string {
  return t(language, "Detalhes do Cartão", "Detalles de la Tarjeta", "Card Details");
}

export function getProcessingText(language: string): string {
  return t(language, "Processando...", "Procesando...", "Processing...");
}

export function getConfirmSubscriptionText(language: string): string {
  return t(language, "Confirmar Assinatura", "Confirmar Suscripción", "Confirm Subscription");
}

export function getPaymentButtonText(language: string): string {
  return getConfirmSubscriptionText(language);
}

export function getProcessingButtonText(language: string): string {
  return getProcessingText(language);
}

export function getStripeNotConfiguredMessage(language: string): string {
  return t(
    language,
    "Stripe não está configurado. Por favor, entre em contato com o suporte.",
    "Stripe no está configurado. Por favor, contacte al soporte.",
    "Stripe is not configured. Please contact support."
  );
}
