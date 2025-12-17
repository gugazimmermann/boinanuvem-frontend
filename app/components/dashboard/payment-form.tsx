import { useState, useMemo } from "react";
import type { FormEvent } from "react";
import { loadStripe } from "@stripe/stripe-js";
import type { StripeElementsOptions } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useLanguage } from "~/contexts/language-context";
import { useTheme } from "~/contexts/theme-context";
import { createSubscriptionWithPaymentMethod } from "~/services/subscriptions.service";
import type { Plan } from "~/types/plan";
import { t } from "~/utils/translation-helpers";

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.error("VITE_STRIPE_PUBLISHABLE_KEY is not set");
}

// Load Stripe - returns a Promise
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

interface PaymentFormProps {
  readonly plan: Plan;
  readonly billingCycle: "monthly" | "annual";
  readonly onSuccess: () => void;
  readonly onError: (error: string) => void;
}

function PaymentFormContent({
  plan,
  billingCycle,
  onSuccess,
  onError,
}: Readonly<PaymentFormProps>) {
  const stripe = useStripe();
  const elements = useElements();
  const { language } = useLanguage();
  const { theme } = useTheme();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getLoadingText = (): string => {
    return t(
      language,
      "Carregando formulário de pagamento...",
      "Cargando formulario de pago...",
      "Loading payment form..."
    );
  };

  const getCardElementNotFoundError = (): string => {
    return t(
      language,
      "Elemento de cartão não encontrado",
      "Elemento de tarjeta no encontrado",
      "Card element not found"
    );
  };

  const getPaymentMethodError = (): string => {
    return t(
      language,
      "Falha ao criar método de pagamento",
      "Error al crear método de pago",
      "Failed to create payment method"
    );
  };

  const getPaymentProcessingError = (): string => {
    return t(
      language,
      "Falha ao processar pagamento",
      "Error al procesar pago",
      "Failed to process payment"
    );
  };

  const getCardDetailsLabel = (): string => {
    return t(language, "Detalhes do Cartão", "Detalles de la Tarjeta", "Card Details");
  };

  const getProcessingText = (): string => {
    return t(language, "Processando...", "Procesando...", "Processing...");
  };

  const getConfirmSubscriptionText = (): string => {
    return t(language, "Confirmar Assinatura", "Confirmar Suscripción", "Confirm Subscription");
  };

  const getButtonText = (): string => {
    return isProcessing ? getProcessingText() : getConfirmSubscriptionText();
  };

  const cardElementOptions = useMemo(
    () => ({
      style: {
        base: {
          fontSize: "16px",
          color: theme === "dark" ? "#e5e7eb" : "#424770",
          "::placeholder": {
            color: theme === "dark" ? "#6b7280" : "#aab7c4",
          },
        },
        invalid: {
          color: "#ef4444",
        },
      },
      hidePostalCode: true,
    }),
    [theme]
  );

  const handlePaymentMethodError = (pmError: unknown): void => {
    const extractErrorMessage = (err: unknown): string | null => {
      if (err instanceof Error) return err.message;
      if (typeof (err as { message?: unknown })?.message === "string") {
        return (err as { message: string }).message;
      }
      return null;
    };

    const errorMessage = extractErrorMessage(pmError) ?? getPaymentMethodError();
    setError(errorMessage);
    setIsProcessing(false);
  };

  const handlePaymentError = (err: unknown): void => {
    const errorMessage = err instanceof Error ? err.message : getPaymentProcessingError();
    setError(errorMessage);
    onError(errorMessage);
  };

  // Show loading state while Stripe is initializing
  if (!stripe || !elements) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mb-4"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{getLoadingText()}</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError(getCardElementNotFoundError());
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create payment method from card element
      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });

      if (pmError || !paymentMethod) {
        handlePaymentMethodError(pmError);
        return;
      }

      // Create subscription with payment method
      await createSubscriptionWithPaymentMethod({
        planId: plan.id,
        billingCycle,
        paymentMethodId: paymentMethod.id,
      });

      onSuccess();
    } catch (err) {
      handlePaymentError(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {getCardDetailsLabel()}
        </label>
        <div className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isProcessing}
        className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {getButtonText()}
      </button>
    </form>
  );
}

export function PaymentForm(props: Readonly<PaymentFormProps>) {
  const { theme } = useTheme();
  const { language } = useLanguage();

  const getStripeNotConfiguredMessage = (): string => {
    return t(
      language,
      "Stripe não está configurado. Por favor, entre em contato com o suporte.",
      "Stripe no está configurado. Por favor, contacte al soporte.",
      "Stripe is not configured. Please contact support."
    );
  };

  const options: StripeElementsOptions = useMemo(
    () => ({
      appearance: {
        theme: theme === "dark" ? "night" : "stripe",
        variables: {
          colorPrimary: "#2563eb",
          colorBackground: theme === "dark" ? "#1f2937" : "#ffffff",
          colorText: theme === "dark" ? "#e5e7eb" : "#1f2937",
          colorDanger: "#ef4444",
          fontFamily: "system-ui, sans-serif",
          spacingUnit: "4px",
          borderRadius: "8px",
        },
      },
    }),
    [theme]
  );

  if (!stripePublishableKey) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-sm text-red-600 dark:text-red-400">{getStripeNotConfiguredMessage()}</p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentFormContent {...props} />
    </Elements>
  );
}
