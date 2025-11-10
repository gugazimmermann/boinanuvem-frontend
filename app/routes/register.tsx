import { useState, useCallback } from "react";
import { AuthLayout } from "../components/site/auth-layout";
import { Input, Button } from "../components/ui";
import { COLORS } from "../components/site/constants";
import { ROUTES } from "../routes.config";
import { useCNPJLookup, type CNPJData, useCEPLookup, type CEPData } from "../components/site/hooks";
import {
  mapCNPJDataToCompanyForm,
  mapCEPDataToAddressForm,
  maskCNPJ,
  maskPhone,
  maskCEP,
  unmaskCNPJ,
  unmaskCEP,
  geocodeAddress,
  buildAddressString,
  type GeocodeResult,
  type GeocodeError,
} from "../components/site/utils";

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
    razaoSocial: "",
    email: "",
    telefone: "",
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",
  });

  const [userData, setUserData] = useState({
    nome: "",
    email: "",
    telefone: "",
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",
    senha: "",
    repitaSenha: "",
  });

  const handleCNPJSuccess = useCallback((data: CNPJData) => {
    setCompanyData((prev) => {
      const mappedData = mapCNPJDataToCompanyForm(data, prev);
      return { ...mappedData, cnpj: prev.cnpj };
    });
  }, []);

  const { data: cnpjData, loading: cnpjLoading, error: cnpjError } = useCNPJLookup(
    unmaskCNPJ(companyData.cnpj),
    {
      debounceMs: 800,
      onSuccess: handleCNPJSuccess,
    }
  );

  const handleCompanyCEPSuccess = useCallback((data: CEPData) => {
    setCompanyData((prev) => {
      const mappedData = mapCEPDataToAddressForm(data, prev);
      return { ...prev, ...mappedData, cep: prev.cep };
    });
  }, []);

  const {
    data: companyCEPData,
    loading: companyCEPLoading,
    error: companyCEPError,
  } = useCEPLookup(unmaskCEP(companyData.cep), {
    debounceMs: 800,
    onSuccess: handleCompanyCEPSuccess,
  });

  const handleUserCEPSuccess = useCallback((data: CEPData) => {
    setUserData((prev) => {
      const mappedData = mapCEPDataToAddressForm(data, prev);
      return { ...prev, ...mappedData, cep: prev.cep };
    });
  }, []);

  const {
    data: userCEPData,
    loading: userCEPLoading,
    error: userCEPError,
  } = useCEPLookup(unmaskCEP(userData.cep), {
    debounceMs: 800,
    onSuccess: handleUserCEPSuccess,
  });

  const handleCompanyDataChange = (field: keyof typeof companyData, value: string) => {
    let processedValue = value;
    
    if (field === "cnpj") {
      processedValue = maskCNPJ(value);
    } else if (field === "telefone") {
      processedValue = maskPhone(value);
    } else if (field === "cep") {
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
      "razaoSocial",
      "email",
      "telefone",
      "rua",
      "bairro",
      "cidade",
      "estado",
      "cep",
    ];

    requiredFields.forEach((field) => {
      let value = companyData[field];
      
      if (field === "cnpj") {
        value = unmaskCNPJ(value);
      } else if (field === "telefone") {
        value = value.replace(/\D/g, "");
      } else if (field === "cep") {
        value = unmaskCEP(value);
      }
      
      if (!value || value.trim() === "") {
        const fieldLabels: Record<string, string> = {
          cnpj: "CNPJ",
          razaoSocial: "Razão Social",
          email: "Email",
          telefone: "Telefone",
          rua: "Rua",
          bairro: "Bairro",
          cidade: "Cidade",
          estado: "Estado",
          cep: "CEP",
        };
        errors[field] = `${fieldLabels[field]} é obrigatório`;
      }
    });

    const unmaskedCNPJ = unmaskCNPJ(companyData.cnpj);
    if (unmaskedCNPJ && unmaskedCNPJ.length !== 14) {
      errors.cnpj = "CNPJ deve ter 14 dígitos";
    }

    const unmaskedCEP = unmaskCEP(companyData.cep);
    if (unmaskedCEP && unmaskedCEP.length !== 8) {
      errors.cep = "CEP deve ter 8 dígitos";
    }

    if (companyData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(companyData.email)) {
      errors.email = "Email inválido";
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
        rua: companyData.rua,
        numero: companyData.numero,
        complemento: companyData.complemento,
        bairro: companyData.bairro,
        cidade: companyData.cidade,
        estado: companyData.estado,
        cep: companyData.cep,
      }),
      geocodeAddress({
        rua: userData.rua,
        numero: userData.numero,
        complemento: userData.complemento,
        bairro: userData.bairro,
        cidade: userData.cidade,
        estado: userData.estado,
        cep: userData.cep,
      }),
    ]);

    const companyAddress = buildAddressString({
      rua: companyData.rua,
      numero: companyData.numero,
      complemento: companyData.complemento,
      bairro: companyData.bairro,
      cidade: companyData.cidade,
      estado: companyData.estado,
      cep: companyData.cep,
    });

    const userAddress = buildAddressString({
      rua: userData.rua,
      numero: userData.numero,
      complemento: userData.complemento,
      bairro: userData.bairro,
      cidade: userData.cidade,
      estado: userData.estado,
      cep: userData.cep,
    });

    let message = "=== Coordenadas dos Endereços ===\n\n";

    message += "📍 Endereço da Empresa:\n";
    message += `${companyAddress}\n\n`;
    if ("error" in companyGeocode) {
      message += `❌ Erro: ${companyGeocode.error}\n\n`;
    } else {
      message += `✅ Latitude: ${companyGeocode.lat}\n`;
      message += `✅ Longitude: ${companyGeocode.lon}\n\n`;
    }

    message += "👤 Endereço do Usuário:\n";
    message += `${userAddress}\n\n`;
    if ("error" in userGeocode) {
      message += `❌ Erro: ${userGeocode.error}\n`;
    } else {
      message += `✅ Latitude: ${userGeocode.lat}\n`;
      message += `✅ Longitude: ${userGeocode.lon}\n`;
    }

    alert(message);
  };

  const inputClassName =
    "block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-500 bg-white border rounded-lg focus:border-blue-400 focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-blue-300";

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
                  step >= 1
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                1
              </div>
              <div
                className={`w-16 h-1 mx-2 ${
                  step >= 2 ? "bg-blue-500" : "bg-gray-200"
                }`}
              />
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 2
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-500"
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
            {step === 1
              ? "Preencha os dados da sua empresa"
              : "Preencha seus dados pessoais"}
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
                  <div className="text-sm text-blue-500 text-center">
                    Buscando dados do CNPJ...
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Input
                      type="text"
                      placeholder="CNPJ"
                      aria-label="CNPJ"
                      className="mt-0"
                      value={companyData.cnpj}
                      onChange={(e) => handleCompanyDataChange("cnpj", e.target.value)}
                      error={cnpjError || companyErrors.cnpj}
                      required
                      inputClassName={inputClassName}
                    />
                  </div>
                  <div>
                    <Input
                      type="text"
                      placeholder="Razão Social"
                      aria-label="Razão Social"
                      className="mt-0"
                      value={companyData.razaoSocial}
                      onChange={(e) => handleCompanyDataChange("razaoSocial", e.target.value)}
                      error={companyErrors.razaoSocial}
                      required
                      inputClassName={inputClassName}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Input
                      type="email"
                      placeholder="Email"
                      aria-label="Email"
                      className="mt-0"
                      value={companyData.email}
                      onChange={(e) => handleCompanyDataChange("email", e.target.value)}
                      error={companyErrors.email}
                      required
                      inputClassName={inputClassName}
                    />
                  </div>
                  <div>
                    <Input
                      type="tel"
                      placeholder="Telefone"
                      aria-label="Telefone"
                      className="mt-0"
                      value={companyData.telefone}
                      onChange={(e) => handleCompanyDataChange("telefone", e.target.value)}
                      error={companyErrors.telefone}
                      required
                      inputClassName={inputClassName}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Input
                      type="text"
                      placeholder="CEP"
                      aria-label="CEP"
                      className="mt-0"
                      value={companyData.cep}
                      onChange={(e) => handleCompanyDataChange("cep", e.target.value)}
                      error={companyCEPError || companyErrors.cep}
                      required
                      inputClassName={inputClassName}
                    />
                    {companyCEPLoading && (
                      <p className="mt-1 text-xs text-blue-500">Buscando endereço...</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <Input
                      type="text"
                      placeholder="Rua"
                      aria-label="Rua"
                      className="mt-0"
                      value={companyData.rua}
                      onChange={(e) => handleCompanyDataChange("rua", e.target.value)}
                      error={companyErrors.rua}
                      required
                      inputClassName={inputClassName}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Input
                      type="text"
                      placeholder="Número"
                      aria-label="Número"
                      className="mt-0"
                      value={companyData.numero}
                      onChange={(e) => handleCompanyDataChange("numero", e.target.value)}
                      inputClassName={inputClassName}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Input
                      type="text"
                      placeholder="Complemento"
                      aria-label="Complemento"
                      className="mt-0"
                      value={companyData.complemento}
                      onChange={(e) => handleCompanyDataChange("complemento", e.target.value)}
                      inputClassName={inputClassName}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Input
                      type="text"
                      placeholder="Bairro"
                      aria-label="Bairro"
                      className="mt-0"
                      value={companyData.bairro}
                      onChange={(e) => handleCompanyDataChange("bairro", e.target.value)}
                      error={companyErrors.bairro}
                      required
                      inputClassName={inputClassName}
                    />
                  </div>
                  <div>
                    <Input
                      type="text"
                      placeholder="Cidade"
                      aria-label="Cidade"
                      className="mt-0"
                      value={companyData.cidade}
                      onChange={(e) => handleCompanyDataChange("cidade", e.target.value)}
                      error={companyErrors.cidade}
                      required
                      inputClassName={inputClassName}
                    />
                  </div>
                  <div>
                    <Input
                      type="text"
                      placeholder="Estado"
                      aria-label="Estado"
                      className="mt-0"
                      value={companyData.estado}
                      onChange={(e) => handleCompanyDataChange("estado", e.target.value)}
                      error={companyErrors.estado}
                      required
                      inputClassName={inputClassName}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Input
                    type="text"
                    placeholder="Nome"
                    aria-label="Nome"
                    className="mt-0"
                    value={userData.nome}
                    onChange={(e) => setUserData((prev) => ({ ...prev, nome: e.target.value }))}
                    inputClassName={inputClassName}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Input
                      type="email"
                      placeholder="Email"
                      aria-label="Email"
                      className="mt-0"
                      value={userData.email}
                      onChange={(e) => setUserData((prev) => ({ ...prev, email: e.target.value }))}
                      inputClassName={inputClassName}
                    />
                  </div>
                  <div>
                    <Input
                      type="tel"
                      placeholder="Telefone"
                      aria-label="Telefone"
                      className="mt-0"
                      value={userData.telefone}
                      onChange={(e) =>
                        setUserData((prev) => ({ ...prev, telefone: maskPhone(e.target.value) }))
                      }
                      inputClassName={inputClassName}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Input
                      type="text"
                      placeholder="CEP"
                      aria-label="CEP"
                      className="mt-0"
                      value={userData.cep}
                      onChange={(e) =>
                        setUserData((prev) => ({ ...prev, cep: maskCEP(e.target.value) }))
                      }
                      error={userCEPError || undefined}
                      inputClassName={inputClassName}
                    />
                    {userCEPLoading && (
                      <p className="mt-1 text-xs text-blue-500">Buscando endereço...</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <Input
                      type="text"
                      placeholder="Rua"
                      aria-label="Rua"
                      className="mt-0"
                      value={userData.rua}
                      onChange={(e) => setUserData((prev) => ({ ...prev, rua: e.target.value }))}
                      inputClassName={inputClassName}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Input
                      type="text"
                      placeholder="Número"
                      aria-label="Número"
                      className="mt-0"
                      value={userData.numero}
                      onChange={(e) => setUserData((prev) => ({ ...prev, numero: e.target.value }))}
                      inputClassName={inputClassName}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Input
                      type="text"
                      placeholder="Complemento"
                      aria-label="Complemento"
                      className="mt-0"
                      value={userData.complemento}
                      onChange={(e) => setUserData((prev) => ({ ...prev, complemento: e.target.value }))}
                      inputClassName={inputClassName}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Input
                      type="text"
                      placeholder="Bairro"
                      aria-label="Bairro"
                      className="mt-0"
                      value={userData.bairro}
                      onChange={(e) => setUserData((prev) => ({ ...prev, bairro: e.target.value }))}
                      inputClassName={inputClassName}
                    />
                  </div>
                  <div>
                    <Input
                      type="text"
                      placeholder="Cidade"
                      aria-label="Cidade"
                      className="mt-0"
                      value={userData.cidade}
                      onChange={(e) => setUserData((prev) => ({ ...prev, cidade: e.target.value }))}
                      inputClassName={inputClassName}
                    />
                  </div>
                  <div>
                    <Input
                      type="text"
                      placeholder="Estado"
                      aria-label="Estado"
                      className="mt-0"
                      value={userData.estado}
                      onChange={(e) => setUserData((prev) => ({ ...prev, estado: e.target.value }))}
                      inputClassName={inputClassName}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Input
                      type="password"
                      placeholder="Senha"
                      aria-label="Senha"
                      className="mt-0"
                      value={userData.senha}
                      onChange={(e) => setUserData((prev) => ({ ...prev, senha: e.target.value }))}
                      showPasswordToggle
                      inputClassName={inputClassName}
                    />
                  </div>
                  <div>
                    <Input
                      type="password"
                      placeholder="Repita a Senha"
                      aria-label="Repita a Senha"
                      className="mt-0"
                      value={userData.repitaSenha}
                      onChange={(e) => setUserData((prev) => ({ ...prev, repitaSenha: e.target.value }))}
                      showPasswordToggle
                      inputClassName={inputClassName}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-6">
              {step === 2 && (
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setStep(1)}
                  className="px-6 py-2 text-sm font-medium tracking-wide capitalize transition-colors duration-300 transform rounded-lg focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-50"
                >
                  Voltar
                </Button>
              )}
              <div className={step === 1 ? "ml-auto" : "ml-auto"}>
                {step === 1 ? (
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={handleNextStep}
                    className="px-6 py-2 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-blue-500 rounded-lg hover:bg-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-50"
                  >
                    Próximo
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={handleSubmit}
                    className="px-6 py-2 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-blue-500 rounded-lg hover:bg-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-50"
                  >
                    Cadastrar
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>

        <div className="flex items-center justify-center py-4 text-center bg-gray-50">
          <span className="text-sm text-gray-600">
            Já tem uma conta?{" "}
          </span>

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

