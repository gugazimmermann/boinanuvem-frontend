import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button, FixedAlert } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { ROUTES } from "~/routes.config";
import { parseCurrency } from "~/utils/currency-mask";
import { addAcquisition, calculateAcquisitionCostPerArroba } from "~/services/acquisitions.service";
import { getSuppliers } from "~/services/suppliers.service";
import { getProperties } from "~/services/properties.service";
import type { Supplier, Property, AcquisitionFormData, AcquisitionItem } from "~/types";
import {
  PricingMode,
  PricingMode as PricingModeEnum,
  AcquisitionPaymentMethod,
  AnimalBreed,
  BirthPurity,
} from "~/types";
import { useAuth } from "~/contexts/auth-context";
import { useAlert } from "~/hooks/use-alert";
import { AcquisitionFormLayout } from "~/components/dashboard/records/acquisition-form-layout";
import { AcquisitionItemForm } from "~/components/dashboard/records/acquisition-item-form";
import { useAcquisitionForm, type AcquisitionItemFormData } from "~/hooks/use-acquisition-form";
import {
  getAcquisitionNewTranslation,
  getAcquisitionErrorTranslation,
} from "~/utils/acquisition-translations";

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
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { alertMessage, showAlert } = useAlert();

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

  const {
    formData,
    setFormData,
    handleAcquisitionItemChange,
    addNewAnimalItem,
    removeAnimalItem,
    handleTotalPriceChange,
    handlePricingModeChange,
    addFee,
    removeFee,
    updateFee,
    calculateItemPrice,
    processFees,
    feesTotal,
    itemsTotal: _itemsTotal,
    totalWithFees,
  } = useAcquisitionForm({
    initialFormData: {
      propertyId: properties[0]?.id || "",
      supplierId: "",
      acquisitionDate: today,
      pricingMode: "",
      paymentMethod: "",
      totalPrice: "",
      fees: [],
      acquisitionItems: [],
      observation: "",
    },
    language,
    allowAddItems: true,
  });

  // Update propertyId when properties load
  useEffect(() => {
    if (properties.length > 0 && !formData.propertyId) {
      setFormData((prev) => ({ ...prev, propertyId: properties[0].id }));
    }
  }, [properties, formData.propertyId, setFormData]);

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

  const getError = (key: string, fallback: string): string => {
    return getAcquisitionErrorTranslation(t, key, fallback);
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
        const totalPriceNum = parseCurrency(formData.totalPrice, language);
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
      if (!item.price || parseCurrency(item.price, language) <= 0) {
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

  const processAcquisitionItem = async (
    item: (typeof formData.acquisitionItems)[0]
  ): Promise<AcquisitionItem & { code?: string; registrationNumber?: string }> => {
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
      purity: item.purity ? (item.purity as BirthPurity) : undefined,
      birthObservation: item.birthObservation || undefined,
    };
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

  const translations = {
    property: getAcquisitionNewTranslation(t, "property", "Propriedade"),
    selectProperty: getAcquisitionNewTranslation(t, "selectProperty", "Selecione a propriedade"),
    supplier: getAcquisitionNewTranslation(t, "supplier", "Fornecedor"),
    searchSupplier: getAcquisitionNewTranslation(t, "searchSupplier", "Buscar fornecedor..."),
    selectSupplier: getAcquisitionNewTranslation(t, "selectSupplier", "Selecione o fornecedor"),
    acquisitionDate: getAcquisitionNewTranslation(t, "acquisitionDate", "Data da Aquisição"),
    pricingMode: getAcquisitionNewTranslation(t, "pricingMode", "Modo de Precificação"),
    selectPricingMode: getAcquisitionNewTranslation(t, "selectPricingMode", "Selecione o modo"),
    paymentMethod: getAcquisitionNewTranslation(t, "paymentMethod", "Método de Pagamento"),
    selectPaymentMethod: getAcquisitionNewTranslation(
      t,
      "selectPaymentMethod",
      "Selecione o método"
    ),
    pricingModes: {
      individual:
        (((t.acquisitions as Record<string, unknown>)?.pricingModes as Record<string, unknown>)
          ?.individual as string) || "Individual",
      total:
        (((t.acquisitions as Record<string, unknown>)?.pricingModes as Record<string, unknown>)
          ?.total as string) || "Preço Total",
    },
    paymentMethods: {
      cashFlow:
        (((t.acquisitions as Record<string, unknown>)?.paymentMethods as Record<string, unknown>)
          ?.cashFlow as string) || "À Vista (Fluxo de Caixa)",
      accountsPayable:
        (((t.acquisitions as Record<string, unknown>)?.paymentMethods as Record<string, unknown>)
          ?.accountsPayable as string) || "A Pagar",
    },
    totalPrice: getAcquisitionNewTranslation(t, "totalPrice", "Preço Total"),
    pricePerAnimal: getAcquisitionNewTranslation(t, "pricePerAnimal", "Preço por animal"),
    fees: getAcquisitionNewTranslation(t, "fees", "Taxas e Encargos"),
    addFee: getAcquisitionNewTranslation(t, "addFee", "Adicionar Taxa"),
    feeName: getAcquisitionNewTranslation(t, "feeName", "Nome da Taxa"),
    feeNamePlaceholder: getAcquisitionNewTranslation(
      t,
      "feeNamePlaceholder",
      "Ex: Taxa de Transporte"
    ),
    feeAmount: getAcquisitionNewTranslation(t, "feeAmount", "Valor"),
    observation: getAcquisitionNewTranslation(t, "observation", "Observações"),
    total: getAcquisitionNewTranslation(t, "total", "Total"),
    cancel: t.common.cancel,
  };

  const itemTranslations = {
    animal: getAcquisitionNewTranslation(t, "animal", "Animal"),
    code: t.animals.table.code,
    registrationNumber: t.animals.new.registrationNumberLabel,
    weight: getAcquisitionNewTranslation(t, "weight", "Peso (kg)"),
    breed: t.acquisitions.new.breedLabel,
    purity: t.animals.table.purity || "Pureza",
    gender: t.acquisitions.new.genderLabel,
    birthDate: t.acquisitions.new.birthDateLabel,
    price: getAcquisitionNewTranslation(t, "price", "Preço"),
    costPerArroba: getAcquisitionNewTranslation(t, "costPerArroba", "Custo por Arroba"),
    weightInArrobas: getAcquisitionNewTranslation(t, "weightInArrobas", "Peso em arrobas"),
    calculatedAutomatically: getAcquisitionNewTranslation(
      t,
      "calculatedAutomatically",
      "Calculado automaticamente"
    ),
    remove: t.common.remove || "Remover",
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
          <AcquisitionFormLayout
            formData={formData}
            properties={properties}
            suppliers={suppliers}
            errors={errors}
            isSubmitting={isSubmitting}
            totalWithFees={totalWithFees}
            feesTotal={feesTotal}
            language={language}
            onPropertyChange={(value) => handleChange("propertyId", value)}
            onSupplierChange={(value) => handleChange("supplierId", value)}
            onDateChange={(value) => handleChange("acquisitionDate", value)}
            onPricingModeChange={handlePricingModeChange}
            onPaymentMethodChange={(value) => handleChange("paymentMethod", value)}
            onTotalPriceChange={handleTotalPriceChange}
            onObservationChange={(value) => handleChange("observation", value)}
            onAddFee={addFee}
            onRemoveFee={removeFee}
            onUpdateFee={updateFee}
            onCancel={() => navigate(ROUTES.ACQUISITIONS)}
            onSubmit={handleSubmit}
            submitButtonText={
              isSubmitting
                ? t.common.loading || "Salvando..."
                : t.acquisitions?.new?.addButton || "Registrar Aquisição"
            }
            translations={translations}
          />

          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {getAcquisitionNewTranslation(t, "animals", "Animais")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <Button
                type="button"
                variant="outline"
                onClick={addNewAnimalItem}
                disabled={isSubmitting}
              >
                {getAcquisitionNewTranslation(t, "addAnimal", "+ Adicionar Animal")}
              </Button>
            </div>
            {errors.acquisitionItems && (
              <p className="text-red-500 text-sm mb-2">{errors.acquisitionItems}</p>
            )}

            {formData.acquisitionItems.length > 0 && (
              <div className="space-y-4">
                {formData.acquisitionItems.map((item, index) => (
                  <AcquisitionItemForm
                    key={item.uiId}
                    item={item}
                    index={index}
                    pricingMode={formData.pricingMode}
                    isSubmitting={isSubmitting}
                    errors={errors}
                    onItemChange={handleAcquisitionItemChange}
                    onRemove={removeAnimalItem}
                    mode="new"
                    translations={itemTranslations}
                  />
                ))}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
