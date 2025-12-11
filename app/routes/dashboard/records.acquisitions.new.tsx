import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { Input, Select, Button, FixedAlert } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { ROUTES } from "~/routes.config";
import { formatCurrency } from "~/utils/currency";
import { addAcquisition, calculateAcquisitionCostPerArroba } from "~/services/acquisitions.service";
import { getSuppliers } from "~/services/suppliers.service";
import { getProperties } from "~/services/properties.service";
import type { Supplier, Property, AcquisitionFormData, AcquisitionItem } from "~/types";
import { getBirthByAnimalId, calculatePurity } from "~/services/births.service";
import {
  PricingMode,
  AcquisitionPaymentMethod,
  AnimalBreed,
  PricingMode as PricingModeEnum,
  AcquisitionPaymentMethod as AcquisitionPaymentMethodEnum,
} from "~/types";
import { useAuth } from "~/contexts/auth-context";

type AcquisitionItemFormData = {
  animalId: string;
  code: string;
  registrationNumber: string;
  price: string;
  weight: string;
  breed: string;
  gender: "male" | "female" | "";
  birthDate: string;
  motherId: string;
  fatherId: string;
  motherRegistrationNumber: string;
  fatherRegistrationNumber: string;
  purity?: string;
  birthObservation: string;
};
import { useAlert } from "~/hooks/use-alert";
import { FeeManager } from "~/components/dashboard/records/fee-manager";

const ARROBA_KG = 30;

export function meta() {
  return [
    { title: "Nova Aquisição - Boi na Nuvem" },
    {
      name: "description",
      content: "Registrar nova aquisição de animais",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "add")({ request });
}

export default function NewAcquisition() {
  const t = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const companyId = currentUser?.companyId || "";

  const today = new Date().toISOString().split("T")[0];

  const feeIdCounter = useRef(0);
  const [supplierSearch, setSupplierSearch] = useState("");

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [suppliersData, propertiesData] = await Promise.all([
          getSuppliers(),
          getProperties(),
        ]);
        // Filter by companyId
        setSuppliers(suppliersData.filter((sup) => sup.companyId === companyId));
        setProperties(propertiesData.filter((prop) => prop.companyId === companyId));
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };
    fetchData();
  }, [companyId]);

  const filteredSuppliers = useMemo(() => {
    if (!supplierSearch.trim()) return suppliers;
    const searchLower = supplierSearch.toLowerCase();
    return suppliers.filter(
      (supplier) =>
        supplier.code?.toLowerCase().includes(searchLower) ||
        supplier.name.toLowerCase().includes(searchLower) ||
        supplier.cnpj?.toLowerCase().includes(searchLower) ||
        supplier.cpf?.toLowerCase().includes(searchLower)
    );
  }, [suppliers, supplierSearch]);

  const [formData, setFormData] = useState<{
    propertyId: string;
    supplierId: string;
    acquisitionDate: string;
    pricingMode: PricingMode | "";
    paymentMethod: AcquisitionPaymentMethod | "";
    totalPrice: string;
    fees: Array<{ id: string; name: string; amount: string }>;
    selectedAnimalIds: string[];
    acquisitionItems: Array<{
      animalId: string;
      code: string;
      registrationNumber: string;
      price: string;
      weight: string;
      breed: string;
      gender: "male" | "female" | "";
      birthDate: string;
      motherId: string;
      fatherId: string;
      motherRegistrationNumber: string;
      fatherRegistrationNumber: string;
      purity?: string;
      birthObservation: string;
    }>;
    observation: string;
  }>({
    propertyId: properties[0]?.id || "",
    supplierId: "",
    acquisitionDate: today,
    pricingMode: "",
    paymentMethod: "",
    totalPrice: "",
    fees: [],
    selectedAnimalIds: [],
    acquisitionItems: [],
    observation: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { alertMessage, showAlert } = useAlert();

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

  const addNewAnimalItem = () => {
    const newItem = {
      animalId: "",
      code: "",
      registrationNumber: "",
      price: "",
      weight: "",
      breed: "",
      gender: "" as "male" | "female" | "",
      birthDate: "",
      motherId: "",
      fatherId: "",
      motherRegistrationNumber: "",
      fatherRegistrationNumber: "",
      birthObservation: "",
    };
    setFormData((prev) => ({
      ...prev,
      acquisitionItems: [...prev.acquisitionItems, newItem],
    }));
  };

  const removeAnimalItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      acquisitionItems: prev.acquisitionItems.filter((_, i) => i !== index),
    }));
  };

  const handleAcquisitionItemChange = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const newItems = [...prev.acquisitionItems];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, acquisitionItems: newItems };
    });
  };

  const handleTotalPriceChange = (value: string) => {
    setFormData((prev) => {
      const newTotalPrice = value;
      let newItems = [...prev.acquisitionItems];

      if (
        prev.pricingMode === PricingModeEnum.TOTAL &&
        newTotalPrice &&
        prev.acquisitionItems.length > 0
      ) {
        const totalPriceNum =
          Number.parseFloat(newTotalPrice.replaceAll(/[^\d,.-]/g, "").replaceAll(",", ".")) || 0;
        const pricePerAnimal = totalPriceNum / prev.acquisitionItems.length;

        newItems = prev.acquisitionItems.map((item) => ({
          ...item,
          price: pricePerAnimal.toFixed(2),
        }));
      }

      return { ...prev, totalPrice: newTotalPrice, acquisitionItems: newItems };
    });
  };

  const handlePricingModeChange = (value: PricingMode) => {
    setFormData((prev) => {
      let newItems = [...prev.acquisitionItems];
      let newTotalPrice = prev.totalPrice;

      if (value === PricingModeEnum.TOTAL && prev.totalPrice && prev.acquisitionItems.length > 0) {
        const totalPriceNum =
          Number.parseFloat(prev.totalPrice.replaceAll(/[^\d,.-]/g, "").replaceAll(",", ".")) || 0;
        const pricePerAnimal = totalPriceNum / prev.acquisitionItems.length;
        newItems = prev.acquisitionItems.map((item) => ({
          ...item,
          price: pricePerAnimal.toFixed(2),
        }));
      } else if (value === PricingModeEnum.INDIVIDUAL) {
        newItems = prev.acquisitionItems.map((item) => ({ ...item, price: "" }));
        newTotalPrice = "";
      }

      return { ...prev, pricingMode: value, acquisitionItems: newItems, totalPrice: newTotalPrice };
    });
  };

  const getError = (key: string, fallback: string): string => {
    return (
      (((t.acquisitions as Record<string, unknown>)?.errors as Record<string, unknown>)?.[
        key
      ] as string) || fallback
    );
  };

  const validateBasicFields = (newErrors: Record<string, string>): void => {
    if (!formData.propertyId) {
      newErrors.propertyId = getError("propertyRequired", "Propriedade é obrigatória");
    }
    if (!formData.supplierId) {
      newErrors.supplierId = getError("supplierRequired", "Fornecedor é obrigatório");
    }
    if (!formData.acquisitionDate) {
      newErrors.acquisitionDate = getError(
        "acquisitionDateRequired",
        "Data da aquisição é obrigatória"
      );
    }
    if (!formData.pricingMode) {
      newErrors.pricingMode = getError("pricingModeRequired", "Modo de precificação é obrigatório");
    }
    if (!formData.paymentMethod) {
      newErrors.paymentMethod = getError(
        "paymentMethodRequired",
        "Método de pagamento é obrigatório"
      );
    }
    if (formData.acquisitionItems.length === 0) {
      newErrors.acquisitionItems = getError("animalsRequired", "Adicione pelo menos um animal");
    }
  };

  const validateAcquisitionItem = (
    item: AcquisitionItemFormData,
    index: number,
    newErrors: Record<string, string>
  ): void => {
    if (!item.code?.trim()) {
      newErrors[`code_${index}`] = t.profile.errors.required(t.animals.table.code);
    }
    if (!item.registrationNumber?.trim()) {
      newErrors[`registrationNumber_${index}`] = t.profile.errors.required(
        t.animals.new.registrationNumberLabel
      );
    }
    if (!item.weight || Number.parseFloat(item.weight) <= 0) {
      newErrors[`weight_${index}`] = getError("weightRequired", "Peso é obrigatório");
    }
    if (!item.breed?.trim()) {
      newErrors[`breed_${index}`] = t.profile.errors.required(t.acquisitions.new.breedLabel);
    }
    if (!item.gender?.trim()) {
      newErrors[`gender_${index}`] = t.profile.errors.required(t.acquisitions.new.genderLabel);
    }
  };

  const validatePricing = (newErrors: Record<string, string>): void => {
    if (formData.pricingMode === PricingModeEnum.TOTAL) {
      if (formData.totalPrice) {
        const totalPriceNum =
          Number.parseFloat(formData.totalPrice.replaceAll(/[^\d,.-]/g, "").replaceAll(",", ".")) ||
          0;
        if (totalPriceNum <= 0) {
          newErrors.totalPrice = getError(
            "totalPriceInvalid",
            "Preço total deve ser maior que zero"
          );
        }
      } else {
        newErrors.totalPrice = getError("totalPriceRequired", "Preço total é obrigatório");
      }
    }
  };

  const validateIndividualPricing = (
    item: AcquisitionItemFormData,
    index: number,
    newErrors: Record<string, string>
  ): void => {
    if (formData.pricingMode === PricingModeEnum.INDIVIDUAL) {
      if (
        !item.price ||
        Number.parseFloat(item.price.replaceAll(/[^\d,.-]/g, "").replaceAll(",", ".")) <= 0
      ) {
        newErrors[`price_${index}`] = getError(
          "priceRequired",
          "Preço é obrigatório para cada animal"
        );
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    validateBasicFields(newErrors);

    for (let index = 0; index < formData.acquisitionItems.length; index++) {
      const item = formData.acquisitionItems[index];
      validateAcquisitionItem(item, index, newErrors);
      validateIndividualPricing(item, index, newErrors);
    }

    validatePricing(newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateItemPrice = (item: (typeof formData.acquisitionItems)[0]): number => {
    if (formData.pricingMode === PricingModeEnum.TOTAL) {
      const totalPriceNum =
        Number.parseFloat(formData.totalPrice.replaceAll(/[^\d,.-]/g, "").replaceAll(",", ".")) ||
        0;
      return totalPriceNum / formData.acquisitionItems.length;
    }
    return Number.parseFloat(item.price.replaceAll(/[^\d,.-]/g, "").replaceAll(",", ".")) || 0;
  };

  const calculateItemPurity = async (item: (typeof formData.acquisitionItems)[0]) => {
    const hasParentInfo =
      item.motherId ||
      item.fatherId ||
      item.motherRegistrationNumber ||
      item.fatherRegistrationNumber;

    if (!hasParentInfo) {
      return undefined;
    }

    const motherBirth = item.motherId ? await getBirthByAnimalId(item.motherId) : undefined;
    const fatherBirth = item.fatherId ? await getBirthByAnimalId(item.fatherId) : undefined;
    const motherBreed = motherBirth?.breed;
    const fatherBreed = fatherBirth?.breed;
    return calculatePurity(motherBirth, fatherBirth, motherBreed, fatherBreed);
  };

  const processAcquisitionItem = async (
    item: (typeof formData.acquisitionItems)[0]
  ): Promise<AcquisitionItem & { code?: string; registrationNumber?: string }> => {
    const purity = await calculateItemPurity(item);
    const price = calculateItemPrice(item);
    const weight = Number.parseFloat(item.weight) || 0;

    // Backend will create the animal automatically, so we pass code/registrationNumber instead of animalId
    return {
      animalId: "", // Empty string since backend creates the animal
      code: item.code,
      registrationNumber: item.registrationNumber,
      price,
      weight,
      costPerArroba: calculateAcquisitionCostPerArroba(weight, price),
      breed: item.breed ? (item.breed as AnimalBreed) : undefined,
      gender: item.gender || undefined,
      birthDate: item.birthDate || undefined,
      motherId: item.motherId || undefined,
      fatherId: item.fatherId || undefined,
      motherRegistrationNumber: item.motherRegistrationNumber || undefined,
      fatherRegistrationNumber: item.fatherRegistrationNumber || undefined,
      purity: purity || undefined,
      birthObservation: item.birthObservation || undefined,
    };
  };

  const processFees = () => {
    return formData.fees
      .filter((fee) => fee.name.trim() && fee.amount)
      .map((fee) => ({
        id: fee.id,
        name: fee.name.trim(),
        amount: Number.parseFloat(fee.amount.replaceAll(/[^\d,.-]/g, "").replaceAll(",", ".")) || 0,
      }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showAlert(
        (((t.acquisitions as Record<string, unknown>)?.errors as Record<string, unknown>)
          ?.validationFailed as string) || "Por favor, corrija os erros no formulário",
        "error"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const acquisitionItems = await Promise.all(
        formData.acquisitionItems.map((item) => processAcquisitionItem(item))
      );
      const totalPrice = acquisitionItems.reduce((sum, item) => sum + item.price, 0);
      const fees = processFees();

      const acquisitionData: AcquisitionFormData & {
        acquisitionItems: Array<AcquisitionItem & { code?: string; registrationNumber?: string }>;
      } = {
        companyId,
        propertyId: formData.propertyId,
        supplierId: formData.supplierId,
        acquisitionDate: formData.acquisitionDate,
        pricingMode: formData.pricingMode as PricingMode,
        paymentMethod: formData.paymentMethod as AcquisitionPaymentMethod,
        totalPrice,
        fees: fees.length > 0 ? fees : undefined,
        acquisitionItems,
        observation: formData.observation || undefined,
      };

      await addAcquisition(acquisitionData);
      showAlert(
        (((t.acquisitions as Record<string, unknown>)?.success as Record<string, unknown>)
          ?.created as string) || "Aquisição registrada com sucesso",
        "success"
      );
      setTimeout(() => {
        navigate(ROUTES.ACQUISITIONS);
      }, 1500);
    } catch (error) {
      console.error("Error adding acquisition:", error);
      showAlert(
        (((t.acquisitions as Record<string, unknown>)?.errors as Record<string, unknown>)
          ?.createFailed as string) || "Erro ao registrar aquisição",
        "error"
      );
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
          id: `fee-${Date.now()}-${++feeIdCounter.current}`,
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
    const itemsTotal = formData.acquisitionItems.reduce((sum, item) => {
      const price =
        Number.parseFloat(item.price.replaceAll(/[^\d,.-]/g, "").replaceAll(",", ".")) || 0;
      return sum + price;
    }, 0);
    const feesTotal = formData.fees.reduce((sum, fee) => {
      const amount =
        Number.parseFloat(fee.amount.replaceAll(/[^\d,.-]/g, "").replaceAll(",", ".")) || 0;
      return sum + amount;
    }, 0);
    return itemsTotal + feesTotal;
  };

  return (
    <div className="space-y-8">
      <FixedAlert alertMessage={alertMessage} />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t.acquisitions?.new?.title || "Nova Aquisição"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t.acquisitions?.new?.description || "Registre uma nova aquisição de animais"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {((t.acquisitions?.new as Record<string, unknown>)?.property as string) ||
                  "Propriedade"}{" "}
                <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.propertyId}
                onChange={(e) => handleChange("propertyId", e.target.value)}
                disabled={isSubmitting}
                className={errors.propertyId ? "border-red-500" : ""}
                options={[
                  {
                    value: "",
                    label:
                      ((t.acquisitions?.new as Record<string, unknown>)
                        ?.selectProperty as string) || "Selecione a propriedade",
                  },
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
                {((t.acquisitions?.new as Record<string, unknown>)?.supplier as string) ||
                  "Fornecedor"}{" "}
                <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={supplierSearch}
                onChange={(e) => setSupplierSearch(e.target.value)}
                placeholder={
                  ((t.acquisitions?.new as Record<string, unknown>)?.searchSupplier as string) ||
                  "Buscar fornecedor..."
                }
                disabled={isSubmitting}
                className="mb-2"
              />
              <Select
                value={formData.supplierId}
                onChange={(e) => handleChange("supplierId", e.target.value)}
                disabled={isSubmitting}
                className={errors.supplierId ? "border-red-500" : ""}
                options={[
                  {
                    value: "",
                    label:
                      ((t.acquisitions?.new as Record<string, unknown>)
                        ?.selectSupplier as string) || "Selecione o fornecedor",
                  },
                  ...filteredSuppliers.map((supplier) => ({
                    value: supplier.id,
                    label: `${supplier.code} | ${supplier.name}`,
                  })),
                ]}
                showPlaceholder={false}
              />
              {errors.supplierId && (
                <p className="text-red-500 text-sm mt-1">{errors.supplierId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {((t.acquisitions?.new as Record<string, unknown>)?.acquisitionDate as string) ||
                  "Data da Aquisição"}{" "}
                <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={formData.acquisitionDate}
                onChange={(e) => handleChange("acquisitionDate", e.target.value)}
                disabled={isSubmitting}
                className={errors.acquisitionDate ? "border-red-500" : ""}
              />
              {errors.acquisitionDate && (
                <p className="text-red-500 text-sm mt-1">{errors.acquisitionDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {((t.acquisitions?.new as Record<string, unknown>)?.pricingMode as string) ||
                  "Modo de Precificação"}{" "}
                <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.pricingMode}
                onChange={(e) => handlePricingModeChange(e.target.value as PricingMode)}
                disabled={isSubmitting}
                className={errors.pricingMode ? "border-red-500" : ""}
                options={[
                  {
                    value: "",
                    label:
                      ((t.acquisitions?.new as Record<string, unknown>)
                        ?.selectPricingMode as string) || "Selecione o modo",
                  },
                  {
                    value: PricingModeEnum.INDIVIDUAL,
                    label:
                      ((
                        (t.acquisitions as Record<string, unknown>)?.pricingModes as Record<
                          string,
                          unknown
                        >
                      )?.individual as string) || "Individual",
                  },
                  {
                    value: PricingModeEnum.TOTAL,
                    label:
                      ((
                        (t.acquisitions as Record<string, unknown>)?.pricingModes as Record<
                          string,
                          unknown
                        >
                      )?.total as string) || "Preço Total",
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
                {((t.acquisitions?.new as Record<string, unknown>)?.paymentMethod as string) ||
                  "Método de Pagamento"}{" "}
                <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.paymentMethod}
                onChange={(e) => handleChange("paymentMethod", e.target.value)}
                disabled={isSubmitting}
                className={errors.paymentMethod ? "border-red-500" : ""}
                options={[
                  {
                    value: "",
                    label:
                      ((t.acquisitions?.new as Record<string, unknown>)
                        ?.selectPaymentMethod as string) || "Selecione o método",
                  },
                  {
                    value: AcquisitionPaymentMethodEnum.CASH_FLOW,
                    label:
                      ((
                        (t.acquisitions as Record<string, unknown>)?.paymentMethods as Record<
                          string,
                          unknown
                        >
                      )?.cashFlow as string) || "À Vista (Fluxo de Caixa)",
                  },
                  {
                    value: AcquisitionPaymentMethodEnum.ACCOUNTS_PAYABLE,
                    label:
                      ((
                        (t.acquisitions as Record<string, unknown>)?.paymentMethods as Record<
                          string,
                          unknown
                        >
                      )?.accountsPayable as string) || "A Pagar",
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
                {((t.acquisitions?.new as Record<string, unknown>)?.totalPrice as string) ||
                  "Preço Total"}{" "}
                <span className="text-red-500">*</span>
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
              {formData.acquisitionItems.length > 0 && formData.totalPrice && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {((t.acquisitions?.new as Record<string, unknown>)?.pricePerAnimal as string) ||
                    "Preço por animal"}
                  :{" "}
                  {formatCurrency(
                    (Number.parseFloat(
                      formData.totalPrice.replaceAll(/[^\d,.-]/g, "").replaceAll(",", ".")
                    ) || 0) / formData.acquisitionItems.length,
                    language
                  )}
                </p>
              )}
            </div>
          )}

          <FeeManager
            fees={formData.fees}
            onAddFee={addFee}
            onRemoveFee={removeFee}
            onUpdateFee={updateFee}
            disabled={isSubmitting}
            feesLabel={
              ((t.acquisitions?.new as Record<string, unknown>)?.fees as string) ||
              "Taxas e Encargos"
            }
            addFeeLabel={
              ((t.acquisitions?.new as Record<string, unknown>)?.addFee as string) ||
              "Adicionar Taxa"
            }
            feeNameLabel={
              ((t.acquisitions?.new as Record<string, unknown>)?.feeName as string) ||
              "Nome da Taxa"
            }
            feeNamePlaceholder={
              ((t.acquisitions?.new as Record<string, unknown>)?.feeNamePlaceholder as string) ||
              "Ex: Taxa de Transporte"
            }
            feeAmountLabel={
              ((t.acquisitions?.new as Record<string, unknown>)?.feeAmount as string) || "Valor"
            }
          />

          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {((t.acquisitions?.new as Record<string, unknown>)?.animals as string) || "Animais"}{" "}
                <span className="text-red-500">*</span>
              </label>
              <Button
                type="button"
                variant="outline"
                onClick={addNewAnimalItem}
                disabled={isSubmitting}
              >
                {((t.acquisitions?.new as Record<string, unknown>)?.addAnimal as string) ||
                  "+ Adicionar Animal"}
              </Button>
            </div>
            {errors.acquisitionItems && (
              <p className="text-red-500 text-sm mb-2">{errors.acquisitionItems}</p>
            )}

            {formData.acquisitionItems.length > 0 && (
              <div className="space-y-4">
                {formData.acquisitionItems.map((item, index) => {
                  const weight = Number.parseFloat(item.weight) || 0;
                  const price =
                    Number.parseFloat(
                      item.price.replaceAll(/[^\d,.-]/g, "").replaceAll(",", ".")
                    ) || 0;
                  const costPerArroba =
                    weight > 0 ? calculateAcquisitionCostPerArroba(weight, price) : 0;
                  const itemKey =
                    item.code || item.registrationNumber || item.animalId || `item-${index}`;

                  return (
                    <div
                      key={itemKey}
                      className="border border-gray-300 dark:border-gray-600 rounded-md p-4"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          {((t.acquisitions?.new as Record<string, unknown>)?.animal as string) ||
                            "Animal"}{" "}
                          {index + 1}
                        </h4>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => removeAnimalItem(index)}
                          disabled={isSubmitting}
                        >
                          {t.common.remove || "Remover"}
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t.animals.table.code} <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="text"
                            value={item.code}
                            onChange={(e) =>
                              handleAcquisitionItemChange(index, "code", e.target.value)
                            }
                            disabled={isSubmitting}
                            className={errors[`code_${index}`] ? "border-red-500" : ""}
                          />
                          {errors[`code_${index}`] && (
                            <p className="text-red-500 text-sm mt-1">{errors[`code_${index}`]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t.animals.new.registrationNumberLabel}{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="text"
                            value={item.registrationNumber}
                            onChange={(e) =>
                              handleAcquisitionItemChange(
                                index,
                                "registrationNumber",
                                e.target.value
                              )
                            }
                            disabled={isSubmitting}
                            className={
                              errors[`registrationNumber_${index}`] ? "border-red-500" : ""
                            }
                          />
                          {errors[`registrationNumber_${index}`] && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors[`registrationNumber_${index}`]}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {((t.acquisitions?.new as Record<string, unknown>)?.weight as string) ||
                              "Peso (kg)"}{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.weight}
                            onChange={(e) =>
                              handleAcquisitionItemChange(index, "weight", e.target.value)
                            }
                            disabled={isSubmitting}
                            className={errors[`weight_${index}`] ? "border-red-500" : ""}
                          />
                          {errors[`weight_${index}`] && (
                            <p className="text-red-500 text-sm mt-1">{errors[`weight_${index}`]}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t.acquisitions.new.breedLabel} <span className="text-red-500">*</span>
                          </label>
                          <Select
                            value={item.breed}
                            onChange={(e) =>
                              handleAcquisitionItemChange(index, "breed", e.target.value)
                            }
                            disabled={isSubmitting}
                            className={errors[`breed_${index}`] ? "border-red-500" : ""}
                            options={[
                              { value: "", label: "-" },
                              ...Object.values(AnimalBreed).map((breed) => ({
                                value: breed,
                                label: t.animals.breeds[breed] || breed,
                              })),
                            ]}
                            showPlaceholder={false}
                          />
                          {errors[`breed_${index}`] && (
                            <p className="text-red-500 text-sm mt-1">{errors[`breed_${index}`]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t.acquisitions.new.genderLabel} <span className="text-red-500">*</span>
                          </label>
                          <Select
                            value={item.gender}
                            onChange={(e) =>
                              handleAcquisitionItemChange(index, "gender", e.target.value)
                            }
                            disabled={isSubmitting}
                            className={errors[`gender_${index}`] ? "border-red-500" : ""}
                            options={[
                              { value: "", label: "-" },
                              { value: "male", label: t.animals.gender.male },
                              { value: "female", label: t.animals.gender.female },
                            ]}
                            showPlaceholder={false}
                          />
                          {errors[`gender_${index}`] && (
                            <p className="text-red-500 text-sm mt-1">{errors[`gender_${index}`]}</p>
                          )}
                        </div>

                        {formData.pricingMode === PricingModeEnum.INDIVIDUAL && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              {((t.acquisitions?.new as Record<string, unknown>)
                                ?.price as string) || "Preço"}{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <Input
                              type="text"
                              value={item.price}
                              onChange={(e) =>
                                handleAcquisitionItemChange(index, "price", e.target.value)
                              }
                              disabled={isSubmitting}
                              placeholder="0,00"
                              className={errors[`price_${index}`] ? "border-red-500" : ""}
                            />
                            {errors[`price_${index}`] && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors[`price_${index}`]}
                              </p>
                            )}
                          </div>
                        )}

                        {formData.pricingMode === PricingModeEnum.TOTAL && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              {((t.acquisitions?.new as Record<string, unknown>)
                                ?.price as string) || "Preço"}
                            </label>
                            <Input
                              type="text"
                              value={item.price}
                              disabled
                              className="bg-gray-100 dark:bg-gray-700"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {((t.acquisitions?.new as Record<string, unknown>)
                                ?.calculatedAutomatically as string) || "Calculado automaticamente"}
                            </p>
                          </div>
                        )}
                      </div>

                      {weight > 0 && price > 0 && (
                        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            <strong>
                              {((t.acquisitions?.new as Record<string, unknown>)
                                ?.costPerArroba as string) || "Custo por Arroba"}
                              :
                            </strong>{" "}
                            {formatCurrency(costPerArroba, language)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {((t.acquisitions?.new as Record<string, unknown>)
                              ?.weightInArrobas as string) || "Peso em arrobas"}
                            : {(weight / ARROBA_KG).toFixed(2)}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t.acquisitions.new.birthDateLabel}
                          </label>
                          <Input
                            type="date"
                            value={item.birthDate}
                            onChange={(e) =>
                              handleAcquisitionItemChange(index, "birthDate", e.target.value)
                            }
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {((t.acquisitions?.new as Record<string, unknown>)?.observation as string) ||
                "Observações"}
            </label>
            <textarea
              value={formData.observation}
              onChange={(e) => handleChange("observation", e.target.value)}
              disabled={isSubmitting}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
            />
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {((t.acquisitions?.new as Record<string, unknown>)?.total as string) || "Total"}:{" "}
              {formatCurrency(calculateTotal(), language)}
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(ROUTES.ACQUISITIONS)}
                disabled={isSubmitting}
              >
                {t.common.cancel}
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting
                  ? t.common.loading || "Salvando..."
                  : t.acquisitions?.new?.addButton || "Registrar Aquisição"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
