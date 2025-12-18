import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button, FixedAlert } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { useAuth } from "~/contexts/auth-context";
import { AcquisitionFormLayout } from "~/components/dashboard/records/acquisition-form-layout";
import { AcquisitionItemForm } from "~/components/dashboard/records/acquisition-item-form";
import { getAcquisitionViewRoute, ROUTES } from "~/routes.config";
import {
  getAcquisitionById,
  updateAcquisition,
  calculateAcquisitionCostPerArroba,
} from "~/services/acquisitions.service";
import { getSuppliers } from "~/services/suppliers.service";
import { getProperties } from "~/services/properties.service";
import { getAnimalById } from "~/services/animals.service";
import { formatCurrency as formatCurrencyDisplay } from "~/utils/formatting";
import type {
  Supplier,
  Property,
  AcquisitionItem,
  Acquisition,
  Animal,
  AcquisitionFormData,
  AnimalBreed,
} from "~/types";
import { PricingMode, AcquisitionPaymentMethod, BirthPurity } from "~/types";
import { useAlert } from "~/hooks/use-alert";
import { useAcquisitionForm, type AcquisitionItemFormData } from "~/hooks/use-acquisition-form";
import {
  getAcquisitionNewTranslation,
  getAcquisitionErrorTranslation,
  getAcquisitionSuccessTranslation,
} from "~/utils/acquisition-translations";

export function meta() {
  return [
    { title: "Editar Aquisição - Boi na Nuvem" },
    { name: "description", content: "Editar aquisição" },
  ];
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "edit")({ request });
}

export default function EditAcquisition() {
  const t = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { acquisitionId } = useParams<{ acquisitionId: string }>();
  const { currentUser } = useAuth();
  const companyId = currentUser?.companyId || "";
  const { alertMessage, showAlert } = useAlert();

  const today = new Date().toISOString().split("T")[0];
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadedAcquisition, setLoadedAcquisition] = useState<Acquisition | null>(null);
  const [initialFormData, setInitialFormData] = useState<{
    propertyId: string;
    supplierId: string;
    acquisitionDate: string;
    pricingMode: PricingMode | "";
    paymentMethod: AcquisitionPaymentMethod | "";
    totalPrice: string;
    fees: Array<{ id: string; name: string; amount: string }>;
    acquisitionItems: AcquisitionItemFormData[];
    observation: string;
  } | null>(null);

  const {
    formData,
    setFormData,
    handleAcquisitionItemChange,
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
    initialFormData: initialFormData || {
      propertyId: "",
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
    allowAddItems: false, // Edit mode doesn't allow adding new items
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!acquisitionId) return;
      setIsLoading(true);
      try {
        const [suppliersData, propertiesData, acq] = await Promise.all([
          getSuppliers(),
          getProperties(),
          getAcquisitionById(acquisitionId),
        ]);

        setSuppliers(suppliersData.filter((sup) => sup.companyId === companyId));
        setProperties(propertiesData.filter((prop) => prop.companyId === companyId));

        if (!acq) {
          setLoadedAcquisition(null);
          return;
        }

        setLoadedAcquisition(acq);

        const animalIds = (acq.acquisitionItems || [])
          .map((it) => it.animalId)
          .filter((id): id is string => id !== undefined && id !== null && id !== "");

        const animalResults = await Promise.all(
          animalIds.map(async (id) => {
            const animal = await getAnimalById(id);
            return [id, animal] as const;
          })
        );

        const animalsById = new Map<string, Animal>(
          animalResults.filter((result): result is [string, Animal] => {
            const [, animal] = result;
            return animal !== undefined && animal !== null;
          })
        );

        const loadedFormData = {
          propertyId: acq.propertyId,
          supplierId: acq.supplierId,
          acquisitionDate: acq.acquisitionDate?.split("T")[0] || acq.acquisitionDate,
          pricingMode: acq.pricingMode,
          paymentMethod: acq.paymentMethod,
          totalPrice: formatCurrencyDisplay(acq.totalPrice, language),
          fees:
            acq.fees?.map((fee) => ({
              id: fee.id,
              name: fee.name,
              amount: formatCurrencyDisplay(fee.amount, language),
            })) || [],
          acquisitionItems: (acq.acquisitionItems || []).map((item, index) => {
            const animal = animalsById.get(item.animalId);
            const gender: "male" | "female" | "" =
              item.gender === "male" || item.gender === "female" ? item.gender : "";
            return {
              uiId: `acq-item-${item.animalId || "item"}-${index}`,
              animalId: item.animalId,
              code: animal?.code || "",
              registrationNumber: animal?.registrationNumber || "",
              price: formatCurrencyDisplay(item.price, language),
              weight: String(item.weight ?? ""),
              breed: item.breed || "",
              gender,
              birthDate: item.birthDate || "",
              motherId: item.motherId || "",
              fatherId: item.fatherId || "",
              motherRegistrationNumber: item.motherRegistrationNumber || "",
              fatherRegistrationNumber: item.fatherRegistrationNumber || "",
              purity: item.purity,
              birthObservation: item.birthObservation || "",
            };
          }),
          observation: acq.observation || "",
        };

        setInitialFormData(loadedFormData);
      } catch (error) {
        console.error("Failed to load acquisition for edit:", error);
        showAlert(
          getAcquisitionErrorTranslation(t, "loadFailed", "Erro ao carregar aquisição"),
          "error"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [acquisitionId, companyId, showAlert, t, language, setFormData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acquisitionId || !loadedAcquisition) return;

    setIsSubmitting(true);

    try {
      const acquisitionItems: AcquisitionItem[] = formData.acquisitionItems.map((item) => {
        const price = calculateItemPrice(item);
        const weight = Number.parseFloat(item.weight) || 0;

        return {
          animalId: item.animalId,
          price,
          weight,
          costPerArroba: calculateAcquisitionCostPerArroba(weight, price),
          breed: item.breed ? (item.breed as AnimalBreed) : undefined,
          gender:
            item.gender && (item.gender === "male" || item.gender === "female")
              ? item.gender
              : undefined,
          birthDate: item.birthDate || undefined,
          motherId: item.motherId || undefined,
          fatherId: item.fatherId || undefined,
          motherRegistrationNumber: item.motherRegistrationNumber || undefined,
          fatherRegistrationNumber: item.fatherRegistrationNumber || undefined,
          purity: item.purity ? (item.purity as BirthPurity) : undefined,
          birthObservation: item.birthObservation || undefined,
        };
      });

      const fees = processFees();
      const totalPrice = acquisitionItems.reduce((sum, item) => sum + item.price, 0);

      type AcquisitionFormDataWithItems = AcquisitionFormData & {
        acquisitionItems: Array<AcquisitionItem & { code?: string; registrationNumber?: string }>;
      };
      const updateData: Partial<AcquisitionFormDataWithItems> = {
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

      const success = await updateAcquisition(acquisitionId, updateData);
      if (!success) {
        throw new Error("Failed to update acquisition");
      }

      showAlert(
        getAcquisitionSuccessTranslation(t, "updated", "Aquisição atualizada com sucesso"),
        "success"
      );
      setTimeout(() => {
        navigate(getAcquisitionViewRoute(acquisitionId));
      }, 1200);
    } catch (error) {
      console.error("Error updating acquisition:", error);
      showAlert(
        getAcquisitionErrorTranslation(t, "updateFailed", "Erro ao atualizar aquisição"),
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t.common.loading || "Carregando..."}</p>
        </div>
      </div>
    );
  }

  if (!loadedAcquisition) {
    return (
      <div className="space-y-8">
        <FixedAlert alertMessage={alertMessage} />
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t.acquisitions?.notFound || "Aquisição não encontrada"}
          </p>
          <Button variant="outline" onClick={() => navigate(ROUTES.ACQUISITIONS)}>
            {t.common?.back || "Voltar"}
          </Button>
        </div>
      </div>
    );
  }

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
            {t.acquisitions?.edit?.title || "Editar Aquisição"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t.acquisitions?.edit?.description || "Atualize os dados da aquisição"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <AcquisitionFormLayout
            formData={formData}
            properties={properties}
            suppliers={suppliers}
            errors={{}}
            isSubmitting={isSubmitting}
            totalWithFees={totalWithFees}
            feesTotal={feesTotal}
            language={language}
            onPropertyChange={(value) => setFormData((prev) => ({ ...prev, propertyId: value }))}
            onSupplierChange={(value) => setFormData((prev) => ({ ...prev, supplierId: value }))}
            onDateChange={(value) => setFormData((prev) => ({ ...prev, acquisitionDate: value }))}
            onPricingModeChange={handlePricingModeChange}
            onPaymentMethodChange={(value) =>
              setFormData((prev) => ({ ...prev, paymentMethod: value }))
            }
            onTotalPriceChange={handleTotalPriceChange}
            onObservationChange={(value) =>
              setFormData((prev) => ({ ...prev, observation: value }))
            }
            onAddFee={addFee}
            onRemoveFee={removeFee}
            onUpdateFee={updateFee}
            onCancel={() => navigate(getAcquisitionViewRoute(acquisitionId!))}
            onSubmit={handleSubmit}
            submitButtonText={
              isSubmitting ? t.common.loading || "Salvando..." : t.common.save || "Salvar"
            }
            translations={translations}
          />

          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {getAcquisitionNewTranslation(t, "animals", "Animais")}{" "}
                <span className="text-red-500">*</span>
              </label>
            </div>

            {formData.acquisitionItems.length > 0 && (
              <div className="space-y-4">
                {formData.acquisitionItems.map((item, index) => (
                  <AcquisitionItemForm
                    key={item.uiId}
                    item={item}
                    index={index}
                    pricingMode={formData.pricingMode}
                    isSubmitting={isSubmitting}
                    errors={{}}
                    onItemChange={handleAcquisitionItemChange}
                    onRemove={removeAnimalItem}
                    mode="edit"
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
