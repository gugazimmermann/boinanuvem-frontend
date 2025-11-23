import { useState, useCallback } from "react";
import { AuthLayout } from "../components/site/auth-layout";
import { AuthInput, AuthButton, AuthSelect } from "../components/site/ui";
import { Alert } from "../components/ui";
import { ROUTES } from "../routes.config";
import { useCNPJLookup, type CNPJData, useCEPLookup, type CEPData } from "../components/site/hooks";
import {
  mapCNPJDataToCompanyForm,
  mapCEPDataToAddressForm,
  maskCNPJ,
  maskPhone,
  maskCEP,
  maskCPF,
  unmaskCNPJ,
  unmaskCEP,
  geocodeAddress,
  buildAddressString,
} from "../components/site/utils";
import { BRAZILIAN_STATES } from "../utils/brazilian-states";
import { useTranslation } from "../i18n/use-translation";
import { requireGuest, useRequireGuest } from "../utils/route-guard";

export function meta() {
  return [
    { title: "Cadastrar - Boi na Nuvem" },
    {
      name: "description",
      content: "Crie sua conta na Boi na Nuvem",
    },
  ];
}

export async function loader() {
  return requireGuest();
}

export default function Register() {
  useRequireGuest();
  const t = useTranslation();
  const [step, setStep] = useState<1 | 2>(1);
  const [companyErrors, setCompanyErrors] = useState<Record<string, string>>({});
  const [alertMessage, setAlertMessage] = useState<{
    title: string;
    variant: "success" | "error" | "warning" | "info";
  } | null>(null);

  const showAlert = (title: string, variant: "success" | "error" | "warning" | "info" = "info") => {
    setAlertMessage({ title, variant });
    setTimeout(() => {
      setAlertMessage(null);
    }, 5000);
  };

  const [companyData, setCompanyData] = useState({
    cnpj: "",
    companyName: "",
    email: "",
    phone: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const [userData, setUserData] = useState({
    name: "",
    cpf: "",
    email: "",
    phone: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
    password: "",
    confirmPassword: "",
  });

  const handleCNPJSuccess = useCallback((data: CNPJData) => {
    setCompanyData((prev) => {
      const mappedData = mapCNPJDataToCompanyForm(data, prev);
      return { ...mappedData, cnpj: prev.cnpj };
    });
  }, []);

  const {
    data: _cnpjData,
    loading: cnpjLoading,
    error: cnpjError,
  } = useCNPJLookup(unmaskCNPJ(companyData.cnpj), {
    debounceMs: 800,
    onSuccess: handleCNPJSuccess,
  });

  const handleCompanyZipCodeSuccess = useCallback((data: CEPData) => {
    setCompanyData((prev) => {
      const mappedData = mapCEPDataToAddressForm(data, prev);
      return { ...prev, ...mappedData, zipCode: prev.zipCode };
    });
  }, []);

  const {
    data: _companyZipCodeData,
    loading: companyZipCodeLoading,
    error: companyZipCodeError,
  } = useCEPLookup(unmaskCEP(companyData.zipCode), {
    debounceMs: 800,
    onSuccess: handleCompanyZipCodeSuccess,
  });

  const handleUserZipCodeSuccess = useCallback((data: CEPData) => {
    setUserData((prev) => {
      const mappedData = mapCEPDataToAddressForm(data, prev);
      return { ...prev, ...mappedData, zipCode: prev.zipCode };
    });
  }, []);

  const {
    data: _userZipCodeData,
    loading: userZipCodeLoading,
    error: userZipCodeError,
  } = useCEPLookup(unmaskCEP(userData.zipCode), {
    debounceMs: 800,
    onSuccess: handleUserZipCodeSuccess,
  });

  const handleCompanyDataChange = (field: keyof typeof companyData, value: string) => {
    let processedValue = value;

    if (field === "cnpj") {
      processedValue = maskCNPJ(value);
    } else if (field === "phone") {
      processedValue = maskPhone(value);
    } else if (field === "zipCode") {
      processedValue = maskCEP(value);
    }

    setCompanyData((prev) => ({ ...prev, [field]: processedValue }));
    if (companyErrors[field]) {
      setCompanyErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateCompanyData = (): boolean => {
    const errors: Record<string, string> = {};
    const requiredFields: (keyof typeof companyData)[] = [
      "cnpj",
      "companyName",
      "email",
      "phone",
      "street",
      "neighborhood",
      "city",
      "state",
      "zipCode",
    ];

    requiredFields.forEach((field) => {
      let value = companyData[field];

      if (field === "cnpj") {
        value = unmaskCNPJ(value);
      } else if (field === "phone") {
        value = value.replace(/\D/g, "");
      } else if (field === "zipCode") {
        value = unmaskCEP(value);
      }

      if (!value || value.trim() === "") {
        const fieldLabels: Record<string, string> = {
          cnpj: t.profile.company.fields.cnpj,
          companyName: t.profile.company.fields.companyName,
          email: t.profile.company.fields.email,
          phone: t.profile.company.fields.phone,
          street: t.profile.company.fields.street,
          neighborhood: t.profile.company.fields.neighborhood,
          city: t.profile.company.fields.city,
          state: t.profile.company.fields.state,
          zipCode: t.profile.company.fields.zipCode,
        };
        errors[field] = t.profile.errors.required(fieldLabels[field]);
      }
    });

    const unmaskedCNPJ = unmaskCNPJ(companyData.cnpj);
    if (unmaskedCNPJ && unmaskedCNPJ.length !== 14) {
      errors.cnpj = t.profile.errors.cnpjMustHave14Digits;
    }

    const unmaskedZipCode = unmaskCEP(companyData.zipCode);
    if (unmaskedZipCode && unmaskedZipCode.length !== 8) {
      errors.zipCode = t.profile.errors.cepMustHave8Digits;
    }

    if (companyData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(companyData.email)) {
      errors.email = t.common.invalidEmail;
    }

    setCompanyErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateCompanyData()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) {
      e.preventDefault();
    }

    const [companyGeocode, userGeocode] = await Promise.all([
      geocodeAddress({
        street: companyData.street,
        number: companyData.number,
        complement: companyData.complement,
        neighborhood: companyData.neighborhood,
        city: companyData.city,
        state: companyData.state,
        zipCode: companyData.zipCode,
      }),
      geocodeAddress({
        street: userData.street,
        number: userData.number,
        complement: userData.complement,
        neighborhood: userData.neighborhood,
        city: userData.city,
        state: userData.state,
        zipCode: userData.zipCode,
      }),
    ]);

    const companyAddress = buildAddressString({
      street: companyData.street,
      number: companyData.number,
      complement: companyData.complement,
      neighborhood: companyData.neighborhood,
      city: companyData.city,
      state: companyData.state,
      zipCode: companyData.zipCode,
    });

    const userAddress = buildAddressString({
      street: userData.street,
      number: userData.number,
      complement: userData.complement,
      neighborhood: userData.neighborhood,
      city: userData.city,
      state: userData.state,
      zipCode: userData.zipCode,
    });

    const translateError = (error: string): string => {
      if (error === "INCOMPLETE_ADDRESS") return t.common.incompleteAddress;
      if (error === "ADDRESS_NOT_FOUND") return t.common.addressNotFound;
      if (error.startsWith("REQUEST_ERROR:")) {
        const statusText = error.replace("REQUEST_ERROR:", "");
        return `${t.common.requestError}: ${statusText}`;
      }
      if (error.startsWith("UNKNOWN_ERROR:")) {
        const errorMessage = error.replace("UNKNOWN_ERROR:", "");
        return `${t.common.unknownError}: ${errorMessage}`;
      }
      if (error === "UNKNOWN_ERROR") return t.common.unknownError;
      return error;
    };

    let message = "=== Address Coordinates ===\n\n";

    message += "📍 Company Address:\n";
    message += `${companyAddress}\n\n`;
    if ("error" in companyGeocode) {
      message += `❌ Error: ${translateError(companyGeocode.error)}\n\n`;
    } else {
      message += `✅ Latitude: ${companyGeocode.lat}\n`;
      message += `✅ Longitude: ${companyGeocode.lon}\n\n`;
    }

    message += "👤 User Address:\n";
    message += `${userAddress}\n\n`;
    if ("error" in userGeocode) {
      message += `❌ Error: ${translateError(userGeocode.error)}\n`;
    } else {
      message += `✅ Latitude: ${userGeocode.lat}\n`;
      message += `✅ Longitude: ${userGeocode.lon}\n`;
    }

    showAlert(message, "info");
  };

  return (
    <AuthLayout>
      {alertMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-5">
          <Alert title={alertMessage.title} variant={alertMessage.variant} />
        </div>
      )}
      <div className="w-full max-w-2xl mx-auto overflow-hidden bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="px-6 py-4">
          <div className="flex justify-center mx-auto mb-4">
            <div className="w-auto h-7 sm:h-8 flex items-center text-2xl font-bold text-secondary dark:text-secondary-light">
              Boi na Nuvem
            </div>
          </div>

          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 1
                    ? "bg-blue-500 dark:bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                }`}
              >
                1
              </div>
              <div
                className={`w-16 h-1 mx-2 ${step >= 2 ? "bg-blue-500 dark:bg-blue-600" : "bg-gray-200 dark:bg-gray-700"}`}
              />
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 2
                    ? "bg-blue-500 dark:bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                }`}
              >
                2
              </div>
            </div>
          </div>

          <div className="mb-4 p-4 rounded-lg bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 dark:from-primary/20 dark:via-secondary/20 dark:to-primary/20 border border-primary/20 dark:border-primary/30">
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5">🎁</span>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Teste Grátis por 14 dias no Plano Avançado
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Você começará com acesso completo ao plano Avançado por 14 dias. Após esse
                  período, você poderá escolher o plano que melhor se adequa às suas necessidades e
                  começar a pagar.
                </p>
              </div>
            </div>
          </div>

          <h3 className="mt-3 text-xl font-medium text-center text-gray-600 dark:text-gray-300">
            {step === 1 ? "Dados da Empresa" : "Dados do Usuário"}
          </h3>

          <p className="mt-1 text-center text-gray-500 dark:text-gray-400">
            {step === 1 ? "Preencha os dados da sua empresa" : "Preencha seus dados pessoais"}
          </p>

          <form
            className="mt-6"
            onSubmit={(e) => {
              e.preventDefault();
              if (step === 1) {
                handleNextStep();
              } else {
                handleSubmit(e);
              }
            }}
          >
            {step === 1 ? (
              <div className="space-y-4">
                {cnpjLoading && (
                  <div className="text-sm text-blue-500 text-center">Searching CNPJ data...</div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <AuthInput
                      type="text"
                      placeholder="CNPJ"
                      aria-label={t.common.ariaLabels.cnpj}
                      className="mt-0"
                      value={companyData.cnpj}
                      onChange={(e) => handleCompanyDataChange("cnpj", e.target.value)}
                      error={cnpjError || companyErrors.cnpj}
                      required
                    />
                  </div>
                  <div>
                    <AuthInput
                      type="text"
                      placeholder="Razão Social"
                      aria-label={t.common.ariaLabels.companyName}
                      className="mt-0"
                      value={companyData.companyName}
                      onChange={(e) => handleCompanyDataChange("companyName", e.target.value)}
                      error={companyErrors.companyName}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <AuthInput
                      type="email"
                      placeholder="Email"
                      aria-label={t.common.ariaLabels.email}
                      className="mt-0"
                      value={companyData.email}
                      onChange={(e) => handleCompanyDataChange("email", e.target.value)}
                      error={companyErrors.email}
                      required
                    />
                  </div>
                  <div>
                    <AuthInput
                      type="tel"
                      placeholder="Telefone"
                      aria-label={t.common.ariaLabels.phone}
                      className="mt-0"
                      value={companyData.phone}
                      onChange={(e) => handleCompanyDataChange("phone", e.target.value)}
                      error={companyErrors.phone}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <AuthInput
                      type="text"
                      placeholder="CEP"
                      aria-label={t.common.ariaLabels.zipCode}
                      className="mt-0"
                      value={companyData.zipCode}
                      onChange={(e) => handleCompanyDataChange("zipCode", e.target.value)}
                      error={companyZipCodeError || companyErrors.zipCode}
                      required
                    />
                    {companyZipCodeLoading && (
                      <p className="mt-1 text-xs text-blue-500">{t.common.searchingAddress}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <AuthInput
                      type="text"
                      placeholder="Rua"
                      aria-label={t.common.ariaLabels.street}
                      className="mt-0"
                      value={companyData.street}
                      onChange={(e) => handleCompanyDataChange("street", e.target.value)}
                      error={companyErrors.street}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <AuthInput
                      type="text"
                      placeholder="Número"
                      aria-label={t.common.ariaLabels.number}
                      className="mt-0"
                      value={companyData.number}
                      onChange={(e) => handleCompanyDataChange("number", e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <AuthInput
                      type="text"
                      placeholder="Complemento"
                      aria-label={t.common.ariaLabels.complement}
                      className="mt-0"
                      value={companyData.complement}
                      onChange={(e) => handleCompanyDataChange("complement", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <AuthInput
                      type="text"
                      placeholder="Bairro"
                      aria-label={t.common.ariaLabels.neighborhood}
                      className="mt-0"
                      value={companyData.neighborhood}
                      onChange={(e) => handleCompanyDataChange("neighborhood", e.target.value)}
                      error={companyErrors.neighborhood}
                      required
                    />
                  </div>
                  <div>
                    <AuthInput
                      type="text"
                      placeholder="Cidade"
                      aria-label={t.common.ariaLabels.city}
                      className="mt-0"
                      value={companyData.city}
                      onChange={(e) => handleCompanyDataChange("city", e.target.value)}
                      error={companyErrors.city}
                      required
                    />
                  </div>
                  <div>
                    <AuthSelect
                      aria-label={t.common.ariaLabels.state}
                      className="mt-0"
                      value={companyData.state}
                      onChange={(e) => handleCompanyDataChange("state", e.target.value)}
                      error={companyErrors.state}
                      options={BRAZILIAN_STATES.map((state) => ({
                        value: state.code,
                        label: state.code,
                      }))}
                      required
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <AuthInput
                      type="text"
                      placeholder="Nome"
                      aria-label={t.common.ariaLabels.name}
                      className="mt-0"
                      value={userData.name}
                      onChange={(e) => setUserData((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <AuthInput
                      type="text"
                      placeholder="CPF"
                      aria-label={t.common.ariaLabels.cpf}
                      className="mt-0"
                      value={userData.cpf}
                      onChange={(e) =>
                        setUserData((prev) => ({ ...prev, cpf: maskCPF(e.target.value) }))
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <AuthInput
                      type="email"
                      placeholder="Email"
                      aria-label={t.common.ariaLabels.email}
                      className="mt-0"
                      value={userData.email}
                      onChange={(e) => setUserData((prev) => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <AuthInput
                      type="tel"
                      placeholder="Telefone"
                      aria-label={t.common.ariaLabels.phone}
                      className="mt-0"
                      value={userData.phone}
                      onChange={(e) =>
                        setUserData((prev) => ({ ...prev, phone: maskPhone(e.target.value) }))
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <AuthInput
                      type="text"
                      placeholder="CEP"
                      aria-label={t.common.ariaLabels.zipCode}
                      className="mt-0"
                      value={userData.zipCode}
                      onChange={(e) =>
                        setUserData((prev) => ({ ...prev, zipCode: maskCEP(e.target.value) }))
                      }
                      error={userZipCodeError || undefined}
                    />
                    {userZipCodeLoading && (
                      <p className="mt-1 text-xs text-blue-500">{t.common.searchingAddress}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <AuthInput
                      type="text"
                      placeholder="Rua"
                      aria-label={t.common.ariaLabels.street}
                      className="mt-0"
                      value={userData.street}
                      onChange={(e) => setUserData((prev) => ({ ...prev, street: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <AuthInput
                      type="text"
                      placeholder="Número"
                      aria-label={t.common.ariaLabels.number}
                      className="mt-0"
                      value={userData.number}
                      onChange={(e) => setUserData((prev) => ({ ...prev, number: e.target.value }))}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <AuthInput
                      type="text"
                      placeholder="Complemento"
                      aria-label={t.common.ariaLabels.complement}
                      className="mt-0"
                      value={userData.complement}
                      onChange={(e) =>
                        setUserData((prev) => ({ ...prev, complement: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <AuthInput
                      type="text"
                      placeholder="Bairro"
                      aria-label={t.common.ariaLabels.neighborhood}
                      className="mt-0"
                      value={userData.neighborhood}
                      onChange={(e) =>
                        setUserData((prev) => ({ ...prev, neighborhood: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <AuthInput
                      type="text"
                      placeholder="Cidade"
                      aria-label={t.common.ariaLabels.city}
                      className="mt-0"
                      value={userData.city}
                      onChange={(e) => setUserData((prev) => ({ ...prev, city: e.target.value }))}
                    />
                  </div>
                  <div>
                    <AuthSelect
                      aria-label={t.common.ariaLabels.state}
                      className="mt-0"
                      value={userData.state}
                      onChange={(e) => setUserData((prev) => ({ ...prev, state: e.target.value }))}
                      options={BRAZILIAN_STATES.map((state) => ({
                        value: state.code,
                        label: state.code,
                      }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <AuthInput
                      type="password"
                      placeholder="Senha"
                      aria-label="Senha"
                      className="mt-0"
                      value={userData.password}
                      onChange={(e) =>
                        setUserData((prev) => ({ ...prev, password: e.target.value }))
                      }
                      showPasswordToggle
                    />
                  </div>
                  <div>
                    <AuthInput
                      type="password"
                      placeholder="Repita a Senha"
                      aria-label="Repita a Senha"
                      className="mt-0"
                      value={userData.confirmPassword}
                      onChange={(e) =>
                        setUserData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                      }
                      showPasswordToggle
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-6">
              {step === 2 && (
                <AuthButton type="button" variant="outline" size="md" onClick={() => setStep(1)}>
                  Voltar
                </AuthButton>
              )}
              <div className={step === 1 ? "ml-auto" : "ml-auto"}>
                {step === 1 ? (
                  <AuthButton type="button" variant="primary" size="md" onClick={handleNextStep}>
                    Próximo
                  </AuthButton>
                ) : (
                  <AuthButton
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={() => handleSubmit()}
                  >
                    Cadastrar
                  </AuthButton>
                )}
              </div>
            </div>
          </form>
        </div>

        <div className="flex items-center justify-center py-4 text-center bg-gray-50 dark:bg-gray-900">
          <span className="text-sm text-gray-600 dark:text-gray-400">Já tem uma conta? </span>

          <a
            href={ROUTES.LOGIN}
            className="mx-2 text-sm font-bold text-blue-500 dark:text-blue-400 hover:underline transition-colors cursor-pointer"
          >
            Entrar
          </a>
        </div>
      </div>
    </AuthLayout>
  );
}
