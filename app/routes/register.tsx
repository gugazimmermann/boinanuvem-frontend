import { useState, useCallback } from "react";
import { AuthLayout } from "../components/site/auth-layout";
import { AuthInput, AuthButton, AuthSelect } from "../components/site/ui";
import { COLORS } from "../components/site/constants";
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

export function meta() {
  return [
    { title: "Cadastrar - Boi na Nuvem" },
    {
      name: "description",
      content: "Crie sua conta na Boi na Nuvem",
    },
  ];
}

export default function Register() {
  const [step, setStep] = useState<1 | 2>(1);
  const [companyErrors, setCompanyErrors] = useState<Record<string, string>>({});

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
          cnpj: "CNPJ",
          companyName: "Razão Social",
          email: "Email",
          phone: "Telefone",
          street: "Rua",
          neighborhood: "Bairro",
          city: "Cidade",
          state: "Estado",
          zipCode: "CEP",
        };
        errors[field] = `${fieldLabels[field]} is required`;
      }
    });

    const unmaskedCNPJ = unmaskCNPJ(companyData.cnpj);
    if (unmaskedCNPJ && unmaskedCNPJ.length !== 14) {
      errors.cnpj = "CNPJ must have 14 digits";
    }

    const unmaskedZipCode = unmaskCEP(companyData.zipCode);
    if (unmaskedZipCode && unmaskedZipCode.length !== 8) {
      errors.zipCode = "CEP must have 8 digits";
    }

    if (companyData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(companyData.email)) {
      errors.email = "Invalid email";
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

    let message = "=== Address Coordinates ===\n\n";

    message += "📍 Company Address:\n";
    message += `${companyAddress}\n\n`;
    if ("error" in companyGeocode) {
      message += `❌ Error: ${companyGeocode.error}\n\n`;
    } else {
      message += `✅ Latitude: ${companyGeocode.lat}\n`;
      message += `✅ Longitude: ${companyGeocode.lon}\n\n`;
    }

    message += "👤 User Address:\n";
    message += `${userAddress}\n\n`;
    if ("error" in userGeocode) {
      message += `❌ Error: ${userGeocode.error}\n`;
    } else {
      message += `✅ Latitude: ${userGeocode.lat}\n`;
      message += `✅ Longitude: ${userGeocode.lon}\n`;
    }

    alert(message);
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-2xl mx-auto overflow-hidden bg-white rounded-lg shadow-md">
        <div className="px-6 py-4">
          <div className="flex justify-center mx-auto mb-4">
            <div
              className="w-auto h-7 sm:h-8 flex items-center text-2xl font-bold"
              style={{ color: COLORS.secondary }}
            >
              Boi na Nuvem
            </div>
          </div>

          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 1 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                1
              </div>
              <div className={`w-16 h-1 mx-2 ${step >= 2 ? "bg-blue-500" : "bg-gray-200"}`} />
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 2 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                2
              </div>
            </div>
          </div>

          <h3 className="mt-3 text-xl font-medium text-center text-gray-600">
            {step === 1 ? "Dados da Empresa" : "Dados do Usuário"}
          </h3>

          <p className="mt-1 text-center text-gray-500">
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
                      aria-label="CNPJ"
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
                      aria-label="Razão Social"
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
                      aria-label="Email"
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
                      aria-label="Telefone"
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
                      aria-label="CEP"
                      className="mt-0"
                      value={companyData.zipCode}
                      onChange={(e) => handleCompanyDataChange("zipCode", e.target.value)}
                      error={companyZipCodeError || companyErrors.zipCode}
                      required
                    />
                    {companyZipCodeLoading && (
                      <p className="mt-1 text-xs text-blue-500">Searching address...</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <AuthInput
                      type="text"
                      placeholder="Rua"
                      aria-label="Rua"
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
                      aria-label="Número"
                      className="mt-0"
                      value={companyData.number}
                      onChange={(e) => handleCompanyDataChange("number", e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <AuthInput
                      type="text"
                      placeholder="Complemento"
                      aria-label="Complemento"
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
                      aria-label="Bairro"
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
                      aria-label="Cidade"
                      className="mt-0"
                      value={companyData.city}
                      onChange={(e) => handleCompanyDataChange("city", e.target.value)}
                      error={companyErrors.city}
                      required
                    />
                  </div>
                  <div>
                    <AuthSelect
                      aria-label="Estado"
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
                      aria-label="Nome"
                      className="mt-0"
                      value={userData.name}
                      onChange={(e) => setUserData((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <AuthInput
                      type="text"
                      placeholder="CPF"
                      aria-label="CPF"
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
                      aria-label="Email"
                      className="mt-0"
                      value={userData.email}
                      onChange={(e) => setUserData((prev) => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <AuthInput
                      type="tel"
                      placeholder="Telefone"
                      aria-label="Telefone"
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
                      aria-label="CEP"
                      className="mt-0"
                      value={userData.zipCode}
                      onChange={(e) =>
                        setUserData((prev) => ({ ...prev, zipCode: maskCEP(e.target.value) }))
                      }
                      error={userZipCodeError || undefined}
                    />
                    {userZipCodeLoading && (
                      <p className="mt-1 text-xs text-blue-500">Searching address...</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <AuthInput
                      type="text"
                      placeholder="Rua"
                      aria-label="Rua"
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
                      aria-label="Número"
                      className="mt-0"
                      value={userData.number}
                      onChange={(e) => setUserData((prev) => ({ ...prev, number: e.target.value }))}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <AuthInput
                      type="text"
                      placeholder="Complemento"
                      aria-label="Complemento"
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
                      aria-label="Bairro"
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
                      aria-label="Cidade"
                      className="mt-0"
                      value={userData.city}
                      onChange={(e) => setUserData((prev) => ({ ...prev, city: e.target.value }))}
                    />
                  </div>
                  <div>
                    <AuthSelect
                      aria-label="Estado"
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

        <div className="flex items-center justify-center py-4 text-center bg-gray-50">
          <span className="text-sm text-gray-600">Já tem uma conta? </span>

          <a
            href={ROUTES.LOGIN}
            className="mx-2 text-sm font-bold text-blue-500 hover:underline transition-colors cursor-pointer"
          >
            Entrar
          </a>
        </div>
      </div>
    </AuthLayout>
  );
}
