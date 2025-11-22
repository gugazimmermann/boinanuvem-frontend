import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router";
import { Input, Button, Alert, Select } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { ROUTES } from "~/routes.config";
import { formatCurrency } from "~/utils/currency";
import { addSale, isAnimalSold } from "~/services/sales.service";
import { getAnimalsByCompanyId, getAnimalById } from "~/services/animals.service";
import { getWeighingsByAnimalId } from "~/services/weighings.service";
import { getBuyersByCompanyId } from "~/services/buyers.service";
import { getPropertiesByCompanyId } from "~/services/properties.service";
import type { SaleFormData, SaleItem, SaleType, PricingMode, SalePaymentMethod } from "~/types";
import {
  SaleType as SaleTypeEnum,
  PricingMode as PricingModeEnum,
  SalePaymentMethod as SalePaymentMethodEnum,
} from "~/types";
import { mockCompanies } from "~/mocks/companies";

export function meta() {
  return [
    { title: "Nova Venda - Boi na Nuvem" },
    {
      name: "description",
      content: "Registrar nova venda de animais",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "add")({ request });
}

export default function NewSale() {
  const t = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const company = mockCompanies[0];
  const companyId = company?.id || "";

  const today = new Date().toISOString().split("T")[0];

  const [animalSearch, setAnimalSearch] = useState("");

  const allAnimals = useMemo(
    () => getAnimalsByCompanyId(companyId).filter((a) => a.status === "active"),
    [companyId]
  );

  // Check for already sold animals
  const checkForSoldAnimals = (animalIds: string[]): string[] => {
    return animalIds.filter((id) => isAnimalSold(id));
  };

  const buyers = useMemo(() => getBuyersByCompanyId(companyId), [companyId]);
  const properties = useMemo(() => getPropertiesByCompanyId(companyId), [companyId]);

  const preSelectedAnimalIds = useMemo(() => {
    const state = location.state as { animalIds?: string[] } | null;
    return state?.animalIds || [];
  }, [location.state]);

  const filteredAnimals = useMemo(() => {
    if (!animalSearch.trim()) return allAnimals;
    const searchLower = animalSearch.toLowerCase();
    return allAnimals.filter(
      (animal) =>
        animal.code.toLowerCase().includes(searchLower) ||
        animal.registrationNumber.toLowerCase().includes(searchLower)
    );
  }, [allAnimals, animalSearch]);

  const [formData, setFormData] = useState<{
    propertyId: string;
    buyerId: string;
    saleDate: string;
    saleType: SaleType | "";
    pricingMode: PricingMode | "";
    paymentMethod: SalePaymentMethod | "";
    totalPrice: string;
    transportationFee: string;
    additionalFees: string;
    selectedAnimalIds: string[];
    saleItems: Array<{ animalId: string; price: string; weight: string; carcassWeight?: string }>;
    observation: string;
  }>({
    propertyId: properties[0]?.id || "",
    buyerId: "",
    saleDate: today,
    saleType: "",
    pricingMode: "",
    paymentMethod: "",
    totalPrice: "",
    transportationFee: "",
    additionalFees: "",
    selectedAnimalIds: preSelectedAnimalIds,
    saleItems: [],
    observation: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{
    title: string;
    variant: "success" | "error" | "warning" | "info";
  } | null>(null);

  // Initialize sale items when animals are selected
  useMemo(() => {
    if (formData.selectedAnimalIds.length > 0 && formData.saleItems.length === 0) {
      const items = formData.selectedAnimalIds.map((animalId) => {
        const weighings = getWeighingsByAnimalId(animalId);
        let weight = "";
        if (weighings.length > 0) {
          const sortedWeighings = weighings.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          weight = sortedWeighings[0].weight.toString();
        }
        return {
          animalId,
          price: "",
          weight,
          carcassWeight: "",
        };
      });
      setFormData((prev) => ({ ...prev, saleItems: items }));
    }
  }, [formData.selectedAnimalIds, formData.saleItems.length]);

  const showAlert = (
    title: string,
    variant: "success" | "error" | "warning" | "info" = "success"
  ) => {
    setAlertMessage({ title, variant });
    setTimeout(() => {
      setAlertMessage(null);
    }, 3000);
  };

  const handleChange = (field: keyof typeof formData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const toggleAnimalSelection = (animalId: string) => {
    // Prevent selecting already sold animals
    if (isAnimalSold(animalId)) {
      showAlert(
        t.sales?.errors?.animalAlreadySold ||
          "Este animal já foi vendido e não pode ser selecionado",
        "error"
      );
      return;
    }

    setFormData((prev) => {
      const currentIds = prev.selectedAnimalIds;
      const isSelected = currentIds.includes(animalId);
      let newIds: string[];
      let newItems = [...prev.saleItems];

      if (isSelected) {
        newIds = currentIds.filter((id) => id !== animalId);
        newItems = newItems.filter((item) => item.animalId !== animalId);
      } else {
        newIds = [...currentIds, animalId];
        const weighings = getWeighingsByAnimalId(animalId);
        let weight = "";
        if (weighings.length > 0) {
          const sortedWeighings = weighings.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          weight = sortedWeighings[0].weight.toString();
        }
        newItems.push({
          animalId,
          price: "",
          weight,
          carcassWeight: "",
        });
      }

      return { ...prev, selectedAnimalIds: newIds, saleItems: newItems };
    });
  };

  const handleSaleItemChange = (
    animalId: string,
    field: "price" | "weight" | "carcassWeight",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      saleItems: prev.saleItems.map((item) =>
        item.animalId === animalId ? { ...item, [field]: value } : item
      ),
    }));
  };

  // Calculate total price when pricing mode is total
  const handleTotalPriceChange = (value: string) => {
    setFormData((prev) => {
      const newTotalPrice = value;
      let newItems = [...prev.saleItems];

      if (
        prev.pricingMode === PricingModeEnum.TOTAL &&
        newTotalPrice &&
        prev.selectedAnimalIds.length > 0
      ) {
        const totalPriceNum =
          parseFloat(newTotalPrice.replace(/[^\d,.-]/g, "").replace(",", ".")) || 0;
        const pricePerAnimal = totalPriceNum / prev.selectedAnimalIds.length;

        newItems = prev.saleItems.map((item) => ({
          ...item,
          price: pricePerAnimal.toFixed(2),
        }));
      }

      return { ...prev, totalPrice: newTotalPrice, saleItems: newItems };
    });
  };

  // Recalculate prices when pricing mode changes
  const handlePricingModeChange = (value: PricingMode) => {
    setFormData((prev) => {
      let newItems = [...prev.saleItems];
      let newTotalPrice = prev.totalPrice;

      if (value === PricingModeEnum.TOTAL && prev.totalPrice && prev.selectedAnimalIds.length > 0) {
        const totalPriceNum =
          parseFloat(prev.totalPrice.replace(/[^\d,.-]/g, "").replace(",", ".")) || 0;
        const pricePerAnimal = totalPriceNum / prev.selectedAnimalIds.length;
        newItems = prev.saleItems.map((item) => ({
          ...item,
          price: pricePerAnimal.toFixed(2),
        }));
      } else if (value === PricingModeEnum.INDIVIDUAL) {
        // Clear individual prices when switching to individual mode
        newItems = prev.saleItems.map((item) => ({ ...item, price: "" }));
        newTotalPrice = "";
      }

      return { ...prev, pricingMode: value, saleItems: newItems, totalPrice: newTotalPrice };
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.propertyId) {
      newErrors.propertyId = t.sales?.errors?.propertyRequired || "Propriedade é obrigatória";
    }
    if (!formData.buyerId) {
      newErrors.buyerId = t.sales?.errors?.buyerRequired || "Comprador é obrigatório";
    }
    if (!formData.saleDate) {
      newErrors.saleDate = t.sales?.errors?.saleDateRequired || "Data da venda é obrigatória";
    } else {
      // Validate that sale date is not in the future
      const saleDate = new Date(formData.saleDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      if (saleDate > today) {
        newErrors.saleDate =
          t.sales?.errors?.saleDateFuture || "A data da venda não pode ser no futuro";
      }
    }
    if (!formData.saleType) {
      newErrors.saleType = t.sales?.errors?.saleTypeRequired || "Tipo de venda é obrigatório";
    }
    if (!formData.pricingMode) {
      newErrors.pricingMode =
        t.sales?.errors?.pricingModeRequired || "Modo de precificação é obrigatório";
    }
    if (!formData.paymentMethod) {
      newErrors.paymentMethod =
        t.sales?.errors?.paymentMethodRequired || "Método de pagamento é obrigatório";
    }
    if (formData.selectedAnimalIds.length === 0) {
      newErrors.selectedAnimalIds =
        t.sales?.errors?.animalsRequired || "Selecione pelo menos um animal";
    } else {
      // Check if any selected animals are already sold
      const soldAnimals = checkForSoldAnimals(formData.selectedAnimalIds);
      if (soldAnimals.length > 0) {
        newErrors.selectedAnimalIds =
          t.sales?.errors?.animalAlreadySold || "Um ou mais animais selecionados já foram vendidos";
      }
    }

    if (formData.pricingMode === PricingModeEnum.TOTAL) {
      if (!formData.totalPrice) {
        newErrors.totalPrice = t.sales?.errors?.totalPriceRequired || "Preço total é obrigatório";
      } else {
        const totalPriceNum =
          parseFloat(formData.totalPrice.replace(/[^\d,.-]/g, "").replace(",", ".")) || 0;
        if (totalPriceNum <= 0) {
          newErrors.totalPrice =
            t.sales?.errors?.totalPriceInvalid || "Preço total deve ser maior que zero";
        }
      }
    } else if (formData.pricingMode === PricingModeEnum.INDIVIDUAL) {
      for (const item of formData.saleItems) {
        if (!item.price || parseFloat(item.price.replace(/[^\d,.-]/g, "").replace(",", ".")) <= 0) {
          newErrors[`price_${item.animalId}`] =
            t.sales?.errors?.priceRequired || "Preço é obrigatório para cada animal";
        }
      }
    }

    for (const item of formData.saleItems) {
      if (!item.weight || parseFloat(item.weight) <= 0) {
        newErrors[`weight_${item.animalId}`] =
          t.sales?.errors?.weightRequired || "Peso é obrigatório para cada animal";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showAlert(
        t.sales?.errors?.validationFailed || "Por favor, corrija os erros no formulário",
        "error"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const saleItems: SaleItem[] = formData.saleItems.map((item) => ({
        animalId: item.animalId,
        price: parseFloat(item.price.replace(/[^\d,.-]/g, "").replace(",", ".")) || 0,
        weight: parseFloat(item.weight) || 0,
        carcassWeight: item.carcassWeight ? parseFloat(item.carcassWeight) : undefined,
      }));

      const totalPrice = saleItems.reduce((sum, item) => sum + item.price, 0);
      const transportationFee = formData.transportationFee
        ? parseFloat(formData.transportationFee.replace(/[^\d,.-]/g, "").replace(",", "."))
        : undefined;
      const additionalFees = formData.additionalFees
        ? parseFloat(formData.additionalFees.replace(/[^\d,.-]/g, "").replace(",", "."))
        : undefined;

      const saleData: SaleFormData = {
        companyId,
        propertyId: formData.propertyId,
        buyerId: formData.buyerId,
        saleDate: formData.saleDate,
        saleType: formData.saleType as SaleType,
        pricingMode: formData.pricingMode as PricingMode,
        paymentMethod: formData.paymentMethod as SalePaymentMethod,
        totalPrice,
        transportationFee,
        additionalFees,
        saleItems,
        observation: formData.observation || undefined,
      };

      addSale(saleData);
      showAlert(t.sales?.success?.created || "Venda registrada com sucesso", "success");
      setTimeout(() => {
        navigate(ROUTES.SALES);
      }, 1500);
    } catch {
      showAlert(t.sales?.errors?.createFailed || "Erro ao registrar venda", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotal = () => {
    const itemsTotal = formData.saleItems.reduce((sum, item) => {
      const price = parseFloat(item.price.replace(/[^\d,.-]/g, "").replace(",", ".")) || 0;
      return sum + price;
    }, 0);
    const transportation =
      parseFloat(formData.transportationFee.replace(/[^\d,.-]/g, "").replace(",", ".")) || 0;
    const additional =
      parseFloat(formData.additionalFees.replace(/[^\d,.-]/g, "").replace(",", ".")) || 0;
    return itemsTotal + transportation + additional;
  };

  return (
    <div className="space-y-6">
      {alertMessage && <Alert variant={alertMessage.variant} title={alertMessage.title} />}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t.sales?.new?.title || "Nova Venda"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t.sales?.new?.description || "Registre uma nova venda de animais"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.sales?.form?.property || "Propriedade"} <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.propertyId}
                onChange={(e) => handleChange("propertyId", e.target.value)}
                disabled={isSubmitting}
                className={errors.propertyId ? "border-red-500" : ""}
                options={[
                  { value: "", label: t.sales?.form?.selectProperty || "Selecione a propriedade" },
                  ...properties.map((property) => ({
                    value: property.id,
                    label: property.name,
                  })),
                ]}
                showPlaceholder={false}
              />
              {errors.propertyId && (
                <p className="text-red-500 text-sm mt-1">{errors.propertyId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.sales?.form?.buyer || "Comprador"} <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.buyerId}
                onChange={(e) => handleChange("buyerId", e.target.value)}
                disabled={isSubmitting}
                className={errors.buyerId ? "border-red-500" : ""}
                options={[
                  { value: "", label: t.sales?.form?.selectBuyer || "Selecione o comprador" },
                  ...buyers.map((buyer) => ({
                    value: buyer.id,
                    label: buyer.name,
                  })),
                ]}
                showPlaceholder={false}
              />
              {errors.buyerId && <p className="text-red-500 text-sm mt-1">{errors.buyerId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.sales?.form?.saleDate || "Data da Venda"} <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={formData.saleDate}
                onChange={(e) => handleChange("saleDate", e.target.value)}
                disabled={isSubmitting}
                className={errors.saleDate ? "border-red-500" : ""}
              />
              {errors.saleDate && <p className="text-red-500 text-sm mt-1">{errors.saleDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.sales?.form?.saleType || "Tipo de Venda"} <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.saleType}
                onChange={(e) => handleChange("saleType", e.target.value)}
                disabled={isSubmitting}
                className={errors.saleType ? "border-red-500" : ""}
                options={[
                  { value: "", label: t.sales?.form?.selectSaleType || "Selecione o tipo" },
                  {
                    value: SaleTypeEnum.SLAUGHTERHOUSE,
                    label: t.sales?.saleTypes?.slaughterhouse || "Frigorífico",
                  },
                  {
                    value: SaleTypeEnum.OTHER_FARM,
                    label: t.sales?.saleTypes?.otherFarm || "Outra Propriedade",
                  },
                  {
                    value: SaleTypeEnum.AUCTION,
                    label: t.sales?.saleTypes?.auction || "Leilão",
                  },
                ]}
                showPlaceholder={false}
              />
              {errors.saleType && <p className="text-red-500 text-sm mt-1">{errors.saleType}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.sales?.form?.pricingMode || "Modo de Precificação"}{" "}
                <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.pricingMode}
                onChange={(e) => handlePricingModeChange(e.target.value as PricingMode)}
                disabled={isSubmitting}
                className={errors.pricingMode ? "border-red-500" : ""}
                options={[
                  { value: "", label: t.sales?.form?.selectPricingMode || "Selecione o modo" },
                  {
                    value: PricingModeEnum.INDIVIDUAL,
                    label: t.sales?.pricingModes?.individual || "Individual",
                  },
                  {
                    value: PricingModeEnum.TOTAL,
                    label: t.sales?.pricingModes?.total || "Preço Total",
                  },
                ]}
                showPlaceholder={false}
              />
              {errors.pricingMode && (
                <p className="text-red-500 text-sm mt-1">{errors.pricingMode}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.sales?.form?.paymentMethod || "Método de Pagamento"}{" "}
                <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.paymentMethod}
                onChange={(e) => handleChange("paymentMethod", e.target.value)}
                disabled={isSubmitting}
                className={errors.paymentMethod ? "border-red-500" : ""}
                options={[
                  { value: "", label: t.sales?.form?.selectPaymentMethod || "Selecione o método" },
                  {
                    value: SalePaymentMethodEnum.CASH_FLOW,
                    label: t.sales?.paymentMethods?.cashFlow || "À Vista (Fluxo de Caixa)",
                  },
                  {
                    value: SalePaymentMethodEnum.ACCOUNTS_RECEIVABLE,
                    label: t.sales?.paymentMethods?.accountsReceivable || "A Receber",
                  },
                ]}
                showPlaceholder={false}
              />
              {errors.paymentMethod && (
                <p className="text-red-500 text-sm mt-1">{errors.paymentMethod}</p>
              )}
            </div>
          </div>

          {formData.pricingMode === PricingModeEnum.TOTAL && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.sales?.form?.totalPrice || "Preço Total"} <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.totalPrice}
                onChange={(e) => handleTotalPriceChange(e.target.value)}
                disabled={isSubmitting}
                placeholder="0,00"
                className={errors.totalPrice ? "border-red-500" : ""}
              />
              {errors.totalPrice && (
                <p className="text-red-500 text-sm mt-1">{errors.totalPrice}</p>
              )}
              {formData.selectedAnimalIds.length > 0 && formData.totalPrice && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {t.sales?.form?.pricePerAnimal || "Preço por animal"}:{" "}
                  {formatCurrency(
                    (parseFloat(formData.totalPrice.replace(/[^\d,.-]/g, "").replace(",", ".")) ||
                      0) / formData.selectedAnimalIds.length,
                    language
                  )}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.sales?.form?.transportationFee || "Taxa de Transporte"}
              </label>
              <Input
                type="text"
                value={formData.transportationFee}
                onChange={(e) => handleChange("transportationFee", e.target.value)}
                disabled={isSubmitting}
                placeholder="0,00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.sales?.form?.additionalFees || "Taxas Adicionais"}
              </label>
              <Input
                type="text"
                value={formData.additionalFees}
                onChange={(e) => handleChange("additionalFees", e.target.value)}
                disabled={isSubmitting}
                placeholder="0,00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.sales?.form?.animals || "Animais"} <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={animalSearch}
              onChange={(e) => setAnimalSearch(e.target.value)}
              placeholder={t.sales?.form?.searchAnimals || "Buscar animais..."}
              disabled={isSubmitting}
            />
            <div className="mt-2 border border-gray-300 dark:border-gray-600 rounded-md max-h-48 overflow-y-auto">
              {filteredAnimals.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 p-4">
                  {t.sales?.form?.noAnimals || "Nenhum animal encontrado"}
                </p>
              ) : (
                <div className="space-y-1 p-2">
                  {filteredAnimals.map((animal) => {
                    const isSold = isAnimalSold(animal.id);
                    return (
                      <label
                        key={animal.id}
                        className={`flex items-center space-x-3 p-2 rounded ${
                          isSold
                            ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800"
                            : formData.selectedAnimalIds.includes(animal.id)
                              ? "bg-blue-50 dark:bg-blue-900/20 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30"
                              : "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.selectedAnimalIds.includes(animal.id)}
                          onChange={() => toggleAnimalSelection(animal.id)}
                          disabled={isSubmitting || isSold}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {animal.code}
                            </span>
                            {isSold && (
                              <span className="text-xs px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded">
                                {t.sales?.form?.sold || "Vendido"}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-0">
                            {animal.registrationNumber}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
            {errors.selectedAnimalIds && (
              <p className="text-red-500 text-sm mt-1">{errors.selectedAnimalIds}</p>
            )}
          </div>

          {formData.selectedAnimalIds.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {t.sales?.form?.saleItems || "Itens da Venda"}
              </h3>
              <div className="space-y-4">
                {formData.saleItems.map((item) => {
                  const animal = getAnimalById(item.animalId);
                  return (
                    <div
                      key={item.animalId}
                      className="border border-gray-300 dark:border-gray-600 rounded-md p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {animal?.code}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                            {animal?.registrationNumber}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t.sales?.form?.weight || "Peso (kg)"}{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.weight}
                            onChange={(e) =>
                              handleSaleItemChange(item.animalId, "weight", e.target.value)
                            }
                            disabled={isSubmitting}
                            className={errors[`weight_${item.animalId}`] ? "border-red-500" : ""}
                          />
                          {errors[`weight_${item.animalId}`] && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors[`weight_${item.animalId}`]}
                            </p>
                          )}
                        </div>
                        {formData.pricingMode === PricingModeEnum.INDIVIDUAL && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              {t.sales?.form?.price || "Preço"}{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <Input
                              type="text"
                              value={item.price}
                              onChange={(e) =>
                                handleSaleItemChange(item.animalId, "price", e.target.value)
                              }
                              disabled={isSubmitting}
                              placeholder="0,00"
                              className={errors[`price_${item.animalId}`] ? "border-red-500" : ""}
                            />
                            {errors[`price_${item.animalId}`] && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors[`price_${item.animalId}`]}
                              </p>
                            )}
                          </div>
                        )}
                        {formData.pricingMode === PricingModeEnum.TOTAL && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              {t.sales?.form?.price || "Preço"}
                            </label>
                            <Input
                              type="text"
                              value={item.price}
                              disabled
                              className="bg-gray-100 dark:bg-gray-700"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {t.sales?.form?.calculatedAutomatically ||
                                "Calculado automaticamente"}
                            </p>
                          </div>
                        )}
                        {formData.saleType === SaleTypeEnum.SLAUGHTERHOUSE && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              {t.sales?.form?.carcassWeight || "Peso da Carcaça (kg)"}
                            </label>
                            <Input
                              type="number"
                              step="0.01"
                              value={item.carcassWeight || ""}
                              onChange={(e) =>
                                handleSaleItemChange(item.animalId, "carcassWeight", e.target.value)
                              }
                              disabled={isSubmitting}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.sales?.form?.observation || "Observações"}
            </label>
            <textarea
              value={formData.observation}
              onChange={(e) => handleChange("observation", e.target.value)}
              disabled={isSubmitting}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-md p-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t.sales?.form?.total || "Total"}
              </span>
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(calculateTotal(), language)}
              </span>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(ROUTES.SALES)}
              disabled={isSubmitting}
            >
              {t.common?.cancel || "Cancelar"}
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting
                ? t.common?.saving || "Salvando..."
                : t.sales?.form?.submit || "Registrar Venda"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
