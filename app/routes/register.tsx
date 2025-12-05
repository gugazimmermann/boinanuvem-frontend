import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { AuthLayout } from "../components/site/auth-layout";
import { AuthCard, AuthFooter, AuthButton, AddressForm } from "../components/site/ui";
import { Input, Alert } from "../components/ui";
import { StepIndicator } from "../components/site/step-indicator";
import { ROUTES } from "../routes.config";
import { authService } from "../services/auth.service";
import { useCNPJLookup, type CNPJData, useCEPLookup, type CEPData } from "../components/site/hooks";
import {
  mapCNPJDataToCompanyForm,
  mapCEPDataToAddressForm,
  maskCNPJ,
  maskPhone,
  maskCPF,
  unmaskCNPJ,
  unmaskCEP,
  unmaskPhone,
  unmaskCPF,
  geocodeAddress,
} from "../components/site/utils";
import { useTranslation } from "../i18n/use-translation";
import { requireGuest, useRequireGuest } from "../utils/route-guard";
import { createSEOMeta } from "../utils/seo-meta";
import { isValidEmail } from "../utils/email-validation";
import type { AddressFormData } from "~/types";

export function meta() {
  return createSEOMeta({
    title: "Cadastrar",
    description:
      "Crie sua conta na Boi na Nuvem e comece a gerenciar sua fazenda de gado de corte com tecnologia de ponta. Teste grátis por 14 dias.",
    url: "/cadastrar",
    noindex: true,
  });
}

export function links() {
  return [{ rel: "canonical", href: "https://boinanuvem.com.br/cadastrar" }];
}

export async function loader() {
  return requireGuest();
}

interface CompanyData extends AddressFormData {
  cnpj: string;
  companyName: string;
  email: string;
  phone: string;
  [key: string]: string | undefined;
}

interface UserData extends AddressFormData {
  name: string;
  cpf: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export default function Register() {
  useRequireGuest();
  const navigate = useNavigate();
  const t = useTranslation();
  const [step, setStep] = useState<1 | 2>(1);
  const [companyErrors, setCompanyErrors] = useState<Partial<Record<keyof CompanyData, string>>>(
    {}
  );
  const [userErrors, setUserErrors] = useState<Partial<Record<keyof UserData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const [companyData, setCompanyData] = useState<CompanyData>({
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

  const [userData, setUserData] = useState<UserData>({
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

  const handleCompanyDataChange = (field: keyof CompanyData, value: string) => {
    let processedValue = value;

    if (field === "cnpj") {
      processedValue = maskCNPJ(value);
    } else if (field === "phone") {
      processedValue = maskPhone(value);
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
    const errors: Partial<Record<keyof CompanyData, string>> = {};
    const requiredFields: (keyof CompanyData)[] = [
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

    for (const field of requiredFields) {
      let value = companyData[field];
      value ??= "";

      if (field === "cnpj") {
        value = unmaskCNPJ(value);
      } else if (field === "phone") {
        value = value.replaceAll(/\D/g, "");
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
    }

    const unmaskedCNPJ = unmaskCNPJ(companyData.cnpj);
    if (unmaskedCNPJ && unmaskedCNPJ.length !== 14) {
      errors.cnpj = t.profile.errors.cnpjMustHave14Digits;
    }

    const unmaskedZipCode = unmaskCEP(companyData.zipCode);
    if (unmaskedZipCode && unmaskedZipCode.length !== 8) {
      errors.zipCode = t.profile.errors.cepMustHave8Digits;
    }

    if (companyData.email && !isValidEmail(companyData.email)) {
      errors.email = t.common.invalidEmail;
    }

    setCompanyErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateUserData = (): boolean => {
    const errors: Partial<Record<keyof UserData, string>> = {};
    const requiredFields: (keyof UserData)[] = [
      "name",
      "cpf",
      "email",
      "phone",
      "password",
      "confirmPassword",
    ];

    for (const field of requiredFields) {
      const value = userData[field];
      if (!value || value.trim() === "") {
        const fieldLabels: Record<string, string> = {
          name: t.common.ariaLabels.name,
          cpf: t.common.ariaLabels.cpf,
          email: t.common.ariaLabels.email,
          phone: t.common.ariaLabels.phone,
          password: "Senha",
          confirmPassword: "Confirmar Senha",
        };
        errors[field] = t.profile.errors.required(fieldLabels[field]);
      }
    }

    if (userData.email && !isValidEmail(userData.email)) {
      errors.email = t.common.invalidEmail;
    }

    if (userData.password && userData.password.length < 6) {
      errors.password = t.common.passwordMinLength;
    }

    if (
      userData.password &&
      userData.confirmPassword &&
      userData.password !== userData.confirmPassword
    ) {
      errors.confirmPassword = "As senhas não coincidem";
    }

    // Validate CPF format
    if (userData.cpf && userData.cpf.trim() !== "") {
      const unmaskedCPF = unmaskCPF(userData.cpf);
      if (unmaskedCPF.length !== 11) {
        errors.cpf = t.profile.errors.cpfMustHave11Digits;
      }
    }

    setUserErrors(errors);
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

    // Validate both company and user data
    const isCompanyValid = validateCompanyData();
    const isUserValid = validateUserData();

    if (!isCompanyValid || !isUserValid) {
      if (!isCompanyValid) {
        setStep(1);
      }
      return;
    }

    setIsSubmitting(true);
    setAlertMessage(null);

    try {
      // Geocode addresses to get coordinates (optional)
      const [companyGeocode] = await Promise.all([
        geocodeAddress({
          street: companyData.street,
          number: companyData.number,
          complement: companyData.complement,
          neighborhood: companyData.neighborhood,
          city: companyData.city,
          state: companyData.state,
          zipCode: companyData.zipCode,
        }),
        userData.street || userData.city
          ? geocodeAddress({
              street: userData.street,
              number: userData.number,
              complement: userData.complement,
              neighborhood: userData.neighborhood,
              city: userData.city,
              state: userData.state,
              zipCode: userData.zipCode,
            })
          : Promise.resolve({ error: "No address provided" }),
      ]);

      // Transform form data to match RegisterCompanyDto
      const registerData = {
        // Company data
        cnpj: unmaskCNPJ(companyData.cnpj),
        companyName: companyData.companyName,
        email: companyData.email,
        phone: unmaskPhone(companyData.phone),
        street: companyData.street,
        number: companyData.number,
        complement: companyData.complement || undefined,
        neighborhood: companyData.neighborhood,
        city: companyData.city,
        state: companyData.state.toUpperCase(),
        zipCode: unmaskCEP(companyData.zipCode),
        // Add coordinates if geocoding was successful
        latitude: "error" in companyGeocode ? undefined : Number.parseFloat(companyGeocode.lat),
        longitude: "error" in companyGeocode ? undefined : Number.parseFloat(companyGeocode.lon),
        // User data
        userName: userData.name,
        userCpf: userData.cpf ? unmaskCPF(userData.cpf) : undefined,
        userEmail: userData.email,
        userPhone: unmaskPhone(userData.phone),
        userPassword: userData.password,
        // Optional user address (if different from company)
        userStreet: userData.street || undefined,
        userNumber: userData.number || undefined,
        userComplement: userData.complement || undefined,
        userNeighborhood: userData.neighborhood || undefined,
        userCity: userData.city || undefined,
        userState: userData.state ? userData.state.toUpperCase() : undefined,
        userZipCode: userData.zipCode ? unmaskCEP(userData.zipCode) : undefined,
      };

      await authService.registerCompany(registerData);

      showAlert(
        "Cadastro realizado com sucesso! Verifique seu email para ativar sua conta.",
        "success"
      );

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate(ROUTES.LOGIN);
      }, 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao cadastrar";
      showAlert(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      {alertMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-5">
          <Alert title={alertMessage.title} variant={alertMessage.variant} />
        </div>
      )}
      <AuthCard
        maxWidth="2xl"
        title={step === 1 ? "Dados da Empresa" : "Dados do Usuário"}
        subtitle={step === 1 ? "Preencha os dados da sua empresa" : "Preencha seus dados pessoais"}
        footer={
          <AuthFooter question="Já tem uma conta?" linkText="Entrar" linkRoute={ROUTES.LOGIN} />
        }
      >
        <StepIndicator currentStep={step} totalSteps={2} />

        <div className="mb-4 p-4 rounded-lg bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 dark:from-primary/20 dark:via-secondary/20 dark:to-primary/20 border border-primary/20 dark:border-primary/30">
          <div className="flex items-start gap-3">
            <span className="text-2xl mt-0.5">🎁</span>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                Teste Grátis por 14 dias no Plano Avançado
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Você começará com acesso completo ao plano Avançado por 14 dias. Após esse período,
                você poderá escolher o plano que melhor se adequa às suas necessidades e começar a
                pagar.
              </p>
            </div>
          </div>
        </div>

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
                  <Input
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
                  <Input
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
                  <Input
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
                  <Input
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

              <AddressForm
                data={companyData}
                onChange={(field, value) => handleCompanyDataChange(field, value)}
                errors={companyErrors}
                zipCodeError={companyZipCodeError || undefined}
                zipCodeLoading={companyZipCodeLoading}
                onZipCodeSuccess={handleCompanyZipCodeSuccess}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    type="text"
                    placeholder="Nome"
                    aria-label={t.common.ariaLabels.name}
                    className="mt-0"
                    value={userData.name}
                    onChange={(e) => {
                      setUserData((prev) => ({ ...prev, name: e.target.value }));
                      if (userErrors.name) {
                        setUserErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors.name;
                          return newErrors;
                        });
                      }
                    }}
                    error={userErrors.name}
                    required
                  />
                </div>
                <div>
                  <Input
                    type="text"
                    placeholder="000.000.000-00"
                    aria-label={t.common.ariaLabels.cpf}
                    className="mt-0"
                    value={userData.cpf}
                    onChange={(e) => {
                      setUserData((prev) => ({ ...prev, cpf: maskCPF(e.target.value) }));
                      if (userErrors.cpf) {
                        setUserErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors.cpf;
                          return newErrors;
                        });
                      }
                    }}
                    error={userErrors.cpf}
                    required
                    maxLength={14}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    type="email"
                    placeholder="Email"
                    aria-label={t.common.ariaLabels.email}
                    className="mt-0"
                    value={userData.email}
                    onChange={(e) => {
                      setUserData((prev) => ({ ...prev, email: e.target.value }));
                      if (userErrors.email) {
                        setUserErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors.email;
                          return newErrors;
                        });
                      }
                    }}
                    error={userErrors.email}
                    required
                  />
                </div>
                <div>
                  <Input
                    type="tel"
                    placeholder="Telefone"
                    aria-label={t.common.ariaLabels.phone}
                    className="mt-0"
                    value={userData.phone}
                    onChange={(e) => {
                      setUserData((prev) => ({ ...prev, phone: maskPhone(e.target.value) }));
                      if (userErrors.phone) {
                        setUserErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors.phone;
                          return newErrors;
                        });
                      }
                    }}
                    error={userErrors.phone}
                    required
                  />
                </div>
              </div>

              <AddressForm
                data={userData}
                onChange={(field, value) => setUserData((prev) => ({ ...prev, [field]: value }))}
                zipCodeError={userZipCodeError || undefined}
                zipCodeLoading={userZipCodeLoading}
                onZipCodeSuccess={handleUserZipCodeSuccess}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    type="password"
                    placeholder="Senha"
                    aria-label="Senha"
                    className="mt-0"
                    value={userData.password}
                    onChange={(e) => {
                      setUserData((prev) => ({ ...prev, password: e.target.value }));
                      if (userErrors.password) {
                        setUserErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors.password;
                          return newErrors;
                        });
                      }
                    }}
                    error={userErrors.password}
                    showPasswordToggle
                    required
                  />
                </div>
                <div>
                  <Input
                    type="password"
                    placeholder="Repita a Senha"
                    aria-label="Repita a Senha"
                    className="mt-0"
                    value={userData.confirmPassword}
                    onChange={(e) => {
                      setUserData((prev) => ({ ...prev, confirmPassword: e.target.value }));
                      if (userErrors.confirmPassword) {
                        setUserErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors.confirmPassword;
                          return newErrors;
                        });
                      }
                    }}
                    error={userErrors.confirmPassword}
                    showPasswordToggle
                    required
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
            <div className="ml-auto">
              {step === 1 ? (
                <AuthButton type="button" variant="primary" size="md" onClick={handleNextStep}>
                  Próximo
                </AuthButton>
              ) : (
                <AuthButton type="submit" variant="primary" size="md" disabled={isSubmitting}>
                  {isSubmitting ? "Cadastrando..." : "Cadastrar"}
                </AuthButton>
              )}
            </div>
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
