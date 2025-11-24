import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { Input, Button, Alert, Select } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { ROUTES, getSaleViewRoute } from "~/routes.config";
import { formatCurrency } from "~/utils/currency";
import { getSaleById, updateSale, isAnimalSold } from "~/services/sales.service";
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
    { title: "Editar Venda - Boi na Nuvem" },
    {
      name: "description",
      content: "Editar venda de animais",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "edit")({ request });
}

export default function EditSale() {
  const t = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { saleId } = useParams<{ saleId: string }>();
  const sale = getSaleById(saleId);
  const company = mockCompanies[0];
  const companyId = company?.id || "";

  const [animalSearch, setAnimalSearch] = useState("");

  const allAnimals = useMemo(
    () =>
      getAnimalsByCompanyId(companyId).filter((a) => a.status === "active" || a.status === "sold"),
    [companyId]
  );

  const checkForSoldAnimals = (animalIds: string[], currentSaleAnimalIds: string[]): string[] => {
    return animalIds.filter((id) => {
      if (currentSaleAnimalIds.includes(id)) return false;
      return isAnimalSold(id);
    });
  };

  const buyers = useMemo(() => getBuyersByCompanyId(companyId), [companyId]);
  const properties = useMemo(() => getPropertiesByCompanyId(companyId), [companyId]);

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
    fees: Array<{ id: string; name: string; amount: string }>;
    selectedAnimalIds: string[];
    saleItems: Array<{ animalId: string; price: string; weight: string; carcassWeight?: string }>;
    observation: string;
  }>({
    propertyId: "",
    buyerId: "",
    saleDate: "",
    saleType: "",
    pricingMode: "",
    paymentMethod: "",
    totalPrice: "",
    fees: [],
    selectedAnimalIds: [],
    saleItems: [],
    observation: "",
  });

  useEffect(() => {
    if (sale) {
      const fees =
        sale.fees && sale.fees.length > 0
          ? sale.fees.map((fee) => ({
              id: fee.id,
              name: fee.name,
              amount: fee.amount.toString(),
            }))
          : (() => {
              const legacyFees: Array<{ id: string; name: string; amount: string }> = [];
              if (sale.transportationFee) {
                legacyFees.push({
                  id: `fee-${Date.now()}-transport`,
                  name: "Taxa de Transporte",
                  amount: sale.transportationFee.toString(),
                });
              }
              if (sale.additionalFees) {
                legacyFees.push({
                  id: `fee-${Date.now()}-additional`,
                  name: "Taxas Adicionais",
                  amount: sale.additionalFees.toString(),
                });
              }
              return legacyFees;
            })();

      setFormData({
        propertyId: sale.propertyId,
        buyerId: sale.buyerId,
        saleDate: sale.saleDate,
        saleType: sale.saleType,
        pricingMode: sale.pricingMode,
        paymentMethod: sale.paymentMethod,
        totalPrice: sale.totalPrice.toString(),
        fees,
        selectedAnimalIds: sale.saleItems.map((item) => item.animalId),
        saleItems: sale.saleItems.map((item) => ({
          animalId: item.animalId,
          price: item.price.toString(),
          weight: item.weight.toString(),
          carcassWeight: item.carcassWeight?.toString() || "",
        })),
        observation: sale.observation || "",
      });
    }
  }, [sale]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{
    title: string;
    variant: "success" | "error" | "warning" | "info";
  } | null>(null);

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
    const currentSaleAnimalIds = sale?.saleItems.map((item) => item.animalId) || [];

    if (isAnimalSold(animalId) && !currentSaleAnimalIds.includes(animalId)) {
      showAlert(t.sales.errors.animalAlreadySold, "error");
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
        const existingItem = prev.saleItems.find((item) => item.animalId === animalId);
        if (!existingItem) {
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

  const handlePricingModeChange = (value: PricingMode) => {
    setFormData((prev) => {
      let newItems = [...prev.saleItems];
      const newTotalPrice = prev.totalPrice;

      if (value === PricingModeEnum.TOTAL && prev.totalPrice && prev.selectedAnimalIds.length > 0) {
        const totalPriceNum =
          parseFloat(prev.totalPrice.replace(/[^\d,.-]/g, "").replace(",", ".")) || 0;
        const pricePerAnimal = totalPriceNum / prev.selectedAnimalIds.length;
        newItems = prev.saleItems.map((item) => ({
          ...item,
          price: pricePerAnimal.toFixed(2),
        }));
      }

      return { ...prev, pricingMode: value, saleItems: newItems, totalPrice: newTotalPrice };
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.propertyId) {
      newErrors.propertyId = t.sales.errors.propertyRequired;
    }
    if (!formData.buyerId) {
      newErrors.buyerId = t.sales.errors.buyerRequired;
    }
    if (!formData.saleDate) {
      newErrors.saleDate = t.sales.errors.saleDateRequired;
    } else {
      const saleDate = new Date(formData.saleDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (saleDate > today) {
        newErrors.saleDate = t.sales.errors.saleDateFuture;
      }
    }
    if (!formData.saleType) {
      newErrors.saleType = t.sales.errors.saleTypeRequired;
    }
    if (!formData.pricingMode) {
      newErrors.pricingMode = t.sales.errors.pricingModeRequired;
    }
    if (!formData.paymentMethod) {
      newErrors.paymentMethod = t.sales.errors.paymentMethodRequired;
    }
    if (formData.selectedAnimalIds.length === 0) {
      newErrors.selectedAnimalIds = t.sales.errors.animalsRequired;
    } else {
      const currentSaleAnimalIds = sale?.saleItems.map((item) => item.animalId) || [];
      const soldAnimals = checkForSoldAnimals(formData.selectedAnimalIds, currentSaleAnimalIds);
      if (soldAnimals.length > 0) {
        newErrors.selectedAnimalIds = t.sales.errors.animalAlreadySold;
      }
    }

    if (formData.pricingMode === PricingModeEnum.TOTAL) {
      if (!formData.totalPrice) {
        newErrors.totalPrice = t.sales.errors.totalPriceRequired;
      } else {
        const totalPriceNum =
          parseFloat(formData.totalPrice.replace(/[^\d,.-]/g, "").replace(",", ".")) || 0;
        if (totalPriceNum <= 0) {
          newErrors.totalPrice = t.sales.errors.totalPriceInvalid;
        }
      }
    } else if (formData.pricingMode === PricingModeEnum.INDIVIDUAL) {
      for (const item of formData.saleItems) {
        if (!item.price || parseFloat(item.price.replace(/[^\d,.-]/g, "").replace(",", ".")) <= 0) {
          newErrors[`price_${item.animalId}`] = t.sales.errors.priceRequired;
        }
      }
    }

    for (const item of formData.saleItems) {
      if (!item.weight || parseFloat(item.weight) <= 0) {
        newErrors[`weight_${item.animalId}`] = t.sales.errors.weightRequired;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sale) return;

    if (!validateForm()) {
      showAlert(t.sales.errors.validationFailed, "error");
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
      const fees = formData.fees
        .filter((fee) => fee.name.trim() && fee.amount)
        .map((fee) => ({
          id: fee.id,
          name: fee.name.trim(),
          amount: parseFloat(fee.amount.replace(/[^\d,.-]/g, "").replace(",", ".")) || 0,
        }));

      const saleData: Partial<SaleFormData> = {
        propertyId: formData.propertyId,
        buyerId: formData.buyerId,
        saleDate: formData.saleDate,
        saleType: formData.saleType as SaleType,
        pricingMode: formData.pricingMode as PricingMode,
        paymentMethod: formData.paymentMethod as SalePaymentMethod,
        totalPrice,
        fees: fees.length > 0 ? fees : undefined,
        saleItems,
        observation: formData.observation || undefined,
      };

      const success = updateSale(sale.id, saleData);
      if (success) {
        showAlert(t.sales.success.updated, "success");
        setTimeout(() => {
          navigate(getSaleViewRoute(sale.id));
        }, 1500);
      } else {
        showAlert(t.sales.errors.updateFailed, "error");
      }
    } catch {
      showAlert(t.sales.errors.updateFailed, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addFee = () => {
    setFormData((prev) => ({
      ...prev,
      fees: [
        ...prev.fees,
        {
          id: `fee-${Date.now()}-${Math.random()}`,
          name: "",
          amount: "",
        },
      ],
    }));
  };

  const removeFee = (feeId: string) => {
    setFormData((prev) => ({
      ...prev,
      fees: prev.fees.filter((fee) => fee.id !== feeId),
    }));
  };

  const updateFee = (feeId: string, field: "name" | "amount", value: string) => {
    setFormData((prev) => ({
      ...prev,
      fees: prev.fees.map((fee) => (fee.id === feeId ? { ...fee, [field]: value } : fee)),
    }));
  };

  const calculateTotal = () => {
    const itemsTotal = formData.saleItems.reduce((sum, item) => {
      const price = parseFloat(item.price.replace(/[^\d,.-]/g, "").replace(",", ".")) || 0;
      return sum + price;
    }, 0);
    const feesTotal = formData.fees.reduce((sum, fee) => {
      const amount = parseFloat(fee.amount.replace(/[^\d,.-]/g, "").replace(",", ".")) || 0;
      return sum + amount;
    }, 0);
    return itemsTotal + feesTotal;
  };

  if (!sale) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 mb-4">{t.sales.notFound}</p>
          <Button variant="outline" onClick={() => navigate(ROUTES.SALES)}>
            {t.common.back}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {alertMessage && <Alert variant={alertMessage.variant} title={alertMessage.title} />}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.sales.edit.title}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{t.sales.edit.description}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.sales.form.property} <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.propertyId}
                onChange={(e) => handleChange("propertyId", e.target.value)}
                disabled={isSubmitting}
                className={errors.propertyId ? "border-red-500" : ""}
                options={[
                  { value: "", label: t.sales.form.selectProperty },
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
                {t.sales.form.buyer} <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.buyerId}
                onChange={(e) => handleChange("buyerId", e.target.value)}
                disabled={isSubmitting}
                className={errors.buyerId ? "border-red-500" : ""}
                options={[
                  { value: "", label: t.sales.form.selectBuyer },
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
                {t.sales.form.saleDate} <span className="text-red-500">*</span>
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
                {t.sales.form.saleType} <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.saleType}
                onChange={(e) => handleChange("saleType", e.target.value)}
                disabled={isSubmitting}
                className={errors.saleType ? "border-red-500" : ""}
                options={[
                  { value: "", label: t.sales.form.selectSaleType },
                  {
                    value: SaleTypeEnum.SLAUGHTERHOUSE,
                    label: t.sales.saleTypes.slaughterhouse,
                  },
                  {
                    value: SaleTypeEnum.OTHER_FARM,
                    label: t.sales.saleTypes.otherFarm,
                  },
                  {
                    value: SaleTypeEnum.AUCTION,
                    label: t.sales.saleTypes.auction,
                  },
                ]}
                showPlaceholder={false}
              />
              {errors.saleType && <p className="text-red-500 text-sm mt-1">{errors.saleType}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.sales.form.pricingMode} <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.pricingMode}
                onChange={(e) => handlePricingModeChange(e.target.value as PricingMode)}
                disabled={isSubmitting}
                className={errors.pricingMode ? "border-red-500" : ""}
                options={[
                  { value: "", label: t.sales.form.selectPricingMode },
                  {
                    value: PricingModeEnum.INDIVIDUAL,
                    label: t.sales.pricingModes.individual,
                  },
                  {
                    value: PricingModeEnum.TOTAL,
                    label: t.sales.pricingModes.total,
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
                {t.sales.form.paymentMethod} <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.paymentMethod}
                onChange={(e) => handleChange("paymentMethod", e.target.value)}
                disabled={isSubmitting}
                className={errors.paymentMethod ? "border-red-500" : ""}
                options={[
                  { value: "", label: t.sales.form.selectPaymentMethod },
                  {
                    value: SalePaymentMethodEnum.CASH_FLOW,
                    label: t.sales.paymentMethods.cashFlow,
                  },
                  {
                    value: SalePaymentMethodEnum.ACCOUNTS_RECEIVABLE,
                    label: t.sales.paymentMethods.accountsReceivable,
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
                {t.sales.form.totalPrice} <span className="text-red-500">*</span>
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
                  {t.sales.form.pricePerAnimal}:{" "}
                  {formatCurrency(
                    (parseFloat(formData.totalPrice.replace(/[^\d,.-]/g, "").replace(",", ".")) ||
                      0) / formData.selectedAnimalIds.length,
                    language
                  )}
                </p>
              )}
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.sales.form.fees}
              </label>
              <Button
                type="button"
                variant="outline"
                onClick={addFee}
                disabled={isSubmitting}
                className="text-sm"
              >
                + {t.sales.form.addFee}
              </Button>
            </div>
            {formData.fees.length > 0 && (
              <div className="space-y-3">
                {formData.fees.map((fee) => (
                  <div
                    key={fee.id}
                    className="grid grid-cols-1 md:grid-cols-[2fr_1fr_auto] gap-3 items-end"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t.sales.form.feeName}
                      </label>
                      <Input
                        type="text"
                        value={fee.name}
                        onChange={(e) => updateFee(fee.id, "name", e.target.value)}
                        disabled={isSubmitting}
                        placeholder={t.sales.form.feeNamePlaceholder}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t.sales.form.feeAmount}
                      </label>
                      <Input
                        type="text"
                        value={fee.amount}
                        onChange={(e) => updateFee(fee.id, "amount", e.target.value)}
                        disabled={isSubmitting}
                        placeholder="0,00"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeFee(fee.id)}
                      disabled={isSubmitting}
                      className="mb-0"
                    >
                      {t.common.remove}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.sales.form.animals} <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={animalSearch}
              onChange={(e) => setAnimalSearch(e.target.value)}
              placeholder={t.sales.form.searchAnimals}
              disabled={isSubmitting}
            />
            <div className="mt-2 border border-gray-300 dark:border-gray-600 rounded-md max-h-48 overflow-y-auto">
              {filteredAnimals.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 p-4">
                  {t.sales.form.noAnimals}
                </p>
              ) : (
                <div className="space-y-1 p-2">
                  {filteredAnimals.map((animal) => {
                    const currentSaleAnimalIds = sale?.saleItems.map((item) => item.animalId) || [];
                    const isSold =
                      isAnimalSold(animal.id) && !currentSaleAnimalIds.includes(animal.id);
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
                                {t.sales.form.sold}
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
                {t.sales.form.saleItems}
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
                            {t.sales.form.weight} <span className="text-red-500">*</span>
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
                              {t.sales.form.price} <span className="text-red-500">*</span>
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
                              {t.sales.form.price}
                            </label>
                            <Input
                              type="text"
                              value={item.price}
                              disabled
                              className="bg-gray-100 dark:bg-gray-700"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {t.sales.form.calculatedAutomatically}
                            </p>
                          </div>
                        )}
                        {formData.saleType === SaleTypeEnum.SLAUGHTERHOUSE && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              {t.sales.form.carcassWeight}
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
              {t.sales.form.observation}
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
                {t.sales.form.total}
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
              onClick={() => navigate(getSaleViewRoute(sale.id))}
              disabled={isSubmitting}
            >
              {t.common.cancel}
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? t.common.saving : t.sales.form.update}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
