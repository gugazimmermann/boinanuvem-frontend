import { useMemo, useCallback, useState, useEffect } from "react";
import { getEmployees } from "~/services/employees.service";
import { getServiceProviders } from "~/services/service-providers.service";
import { getProperties } from "~/services/properties.service";
import { getSuppliers } from "~/services/suppliers.service";
import { getBuyers } from "~/services/buyers.service";
import type {
  Employee,
  ServiceProvider,
  Property,
  Supplier,
  Buyer,
  CashFlowFormData,
  AccountsPayableFormData,
  AccountsReceivableFormData,
  AccountsPayableStatus,
  AccountsReceivableStatus,
} from "~/types";
import { CashFlowCategory, PaymentMethod } from "~/types";
import { useBaseForm } from "./use-base-form";

export type FinanceTransactionType = "cash-flow" | "accounts-payable" | "accounts-receivable";

function getAmountValue(amount: unknown): string {
  if (typeof amount === "string") return amount;
  if (amount == null) return "";
  if (typeof amount === "object") return "";
  // Explicitly handle remaining primitive types
  if (
    typeof amount === "number" ||
    typeof amount === "boolean" ||
    typeof amount === "bigint" ||
    typeof amount === "symbol"
  ) {
    return String(amount);
  }
  return "";
}

function validateDescription(
  description: unknown,
  label: string,
  getRequiredError: (label: string) => string
): string | undefined {
  if (!description || (typeof description === "string" && !description.trim())) {
    return getRequiredError(label);
  }
  return undefined;
}

function validateAmount(
  amount: unknown,
  label: string,
  getRequiredError: (label: string) => string
): string | undefined {
  const amountValue = getAmountValue(amount);
  if (!amountValue || Number.parseFloat(amountValue) <= 0) {
    return getRequiredError(label);
  }
  return undefined;
}

function validateDateOrDueDate(
  transactionType: FinanceTransactionType,
  data: Record<string, unknown>,
  dateLabel: string | undefined,
  dueDateLabel: string | undefined,
  getRequiredError: (label: string) => string
): string | undefined {
  if (transactionType === "cash-flow") {
    const cashFlowData = data as unknown as CashFlowFormState;
    if (!cashFlowData.date && dateLabel) {
      return getRequiredError(dateLabel);
    }
  } else {
    const apData = data as unknown as AccountsPayableFormState | AccountsReceivableFormState;
    if (!apData.dueDate && dueDateLabel) {
      return getRequiredError(dueDateLabel);
    }
  }
  return undefined;
}

function validatePropertyId(
  propertyId: unknown,
  label: string,
  getRequiredError: (label: string) => string
): string | undefined {
  if (!propertyId) {
    return getRequiredError(label);
  }
  return undefined;
}

export interface BaseFinanceFormData {
  amount: string;
  description: string;
  category: CashFlowCategory;
  paymentMethod: PaymentMethod;
  referenceNumber: string;
  bankAccountId: string;
  propertyId: string;
}

export interface CashFlowFormState extends BaseFinanceFormData {
  type: "income" | "expense";
  date: string;
  paymentDate: string;
  supplierId: string;
  buyerId: string;
  employeeId: string;
  serviceProviderId: string;
  observation?: string;
}

export interface AccountsPayableFormState extends BaseFinanceFormData {
  supplierId: string;
  employeeId: string;
  serviceProviderId: string;
  dueDate: string;
  status: AccountsPayableStatus;
  paidDate: string;
  paidAmount: string;
  observation?: string;
}

export interface AccountsReceivableFormState extends BaseFinanceFormData {
  buyerId: string;
  dueDate: string;
  status: AccountsReceivableStatus;
  paidDate: string;
  paidAmount: string;
  observation?: string;
}

export type FinanceFormState =
  | CashFlowFormState
  | AccountsPayableFormState
  | AccountsReceivableFormState;

export interface UseFinanceTransactionFormOptions {
  transactionType: FinanceTransactionType;
  companyId: string;
  initialData?: Partial<FinanceFormState>;
  translationKeys: {
    descriptionLabel: string;
    amountLabel: string;
    dateLabel?: string;
    dueDateLabel?: string;
    propertyLabel: string;
  };
  translation: {
    profile: { errors: { required: (label: string) => string } };
  };
  onSubmit: (data: CashFlowFormData | AccountsPayableFormData | AccountsReceivableFormData) => void;
  onSuccess?: () => void;
  successMessage: string;
  errorMessage: string;
}

export function useFinanceTransactionForm<T extends FinanceFormState>({
  transactionType,
  companyId,
  initialData,
  translationKeys,
  translation: t,
  onSubmit,
  onSuccess,
  successMessage,
  errorMessage,
}: UseFinanceTransactionFormOptions) {
  const getInitialFormData = (): T => {
    const base = {
      amount: "",
      description: "",
      category: CashFlowCategory.FEED,
      paymentMethod: PaymentMethod.CASH,
      referenceNumber: "",
      bankAccountId: "",
      propertyId: "",
    };

    if (transactionType === "cash-flow") {
      return {
        ...base,
        type: "income" as const,
        date: new Date().toISOString().split("T")[0],
        paymentDate: "",
        supplierId: "",
        buyerId: "",
        employeeId: "",
        serviceProviderId: "",
        category: CashFlowCategory.CATTLE_SALES,
        ...initialData,
      } as T;
    } else if (transactionType === "accounts-payable") {
      return {
        ...base,
        supplierId: "",
        employeeId: "",
        serviceProviderId: "",
        dueDate: "",
        status: "unpaid" as AccountsPayableStatus,
        paidDate: "",
        paidAmount: "",
        ...initialData,
      } as T;
    } else {
      return {
        ...base,
        buyerId: "",
        dueDate: "",
        status: "unpaid" as AccountsReceivableStatus,
        paidDate: "",
        paidAmount: "",
        category: CashFlowCategory.CATTLE_SALES,
        ...initialData,
      } as T;
    }
  };

  const baseForm = useBaseForm({
    initialData: getInitialFormData() as unknown as Record<string, unknown>,
    onSubmit: onSubmit as unknown as (data: Record<string, unknown>) => void | Promise<void>,
    onSuccess,
    successMessage,
    errorMessage,
    validate: (data) => {
      const newErrors: Record<string, string> = {};

      const descriptionError = validateDescription(
        data.description,
        translationKeys.descriptionLabel,
        t.profile.errors.required
      );
      if (descriptionError) {
        newErrors.description = descriptionError;
      }

      const amountError = validateAmount(
        data.amount,
        translationKeys.amountLabel,
        t.profile.errors.required
      );
      if (amountError) {
        newErrors.amount = amountError;
      }

      const dateError = validateDateOrDueDate(
        transactionType,
        data,
        translationKeys.dateLabel,
        translationKeys.dueDateLabel,
        t.profile.errors.required
      );
      if (dateError) {
        if (transactionType === "cash-flow") {
          newErrors.date = dateError;
        } else {
          newErrors.dueDate = dateError;
        }
      }

      const propertyIdError = validatePropertyId(
        data.propertyId,
        translationKeys.propertyLabel,
        t.profile.errors.required
      );
      if (propertyIdError) {
        newErrors.propertyId = propertyIdError;
      }

      return Object.keys(newErrors).length === 0 ? true : newErrors;
    },
    transformData: (data): Record<string, unknown> => {
      let submitData: CashFlowFormData | AccountsPayableFormData | AccountsReceivableFormData;

      if (transactionType === "cash-flow") {
        const cashFlowData = data as unknown as CashFlowFormState;
        submitData = {
          companyId,
          type: cashFlowData.type,
          amount: Number.parseFloat(cashFlowData.amount),
          date: cashFlowData.date,
          description: cashFlowData.description,
          category: cashFlowData.category,
          paymentMethod: cashFlowData.paymentMethod,
          status: "completed" as const,
          supplierId: cashFlowData.supplierId || undefined,
          buyerId: cashFlowData.buyerId || undefined,
          employeeId: cashFlowData.employeeId || undefined,
          serviceProviderId: cashFlowData.serviceProviderId || undefined,
          paymentDate: cashFlowData.paymentDate || undefined,
          referenceNumber: cashFlowData.referenceNumber || undefined,
          bankAccountId: cashFlowData.bankAccountId || undefined,
          propertyId: cashFlowData.propertyId,
        };
      } else if (transactionType === "accounts-payable") {
        const apData = data as unknown as AccountsPayableFormState;
        submitData = {
          companyId,
          supplierId: apData.supplierId || undefined,
          employeeId: apData.employeeId || undefined,
          serviceProviderId: apData.serviceProviderId || undefined,
          amount: Number.parseFloat(apData.amount),
          dueDate: apData.dueDate,
          description: apData.description,
          category: apData.category || undefined,
          paymentMethod: apData.paymentMethod || undefined,
          status: apData.status,
          paidDate: apData.paidDate || undefined,
          paidAmount: apData.paidAmount ? Number.parseFloat(apData.paidAmount) : undefined,
          referenceNumber: apData.referenceNumber || undefined,
          bankAccountId: apData.bankAccountId || undefined,
          propertyId: apData.propertyId,
        };
      } else {
        const arData = data as unknown as AccountsReceivableFormState;
        submitData = {
          companyId,
          buyerId: arData.buyerId || undefined,
          amount: Number.parseFloat(arData.amount),
          dueDate: arData.dueDate,
          description: arData.description,
          category: arData.category || undefined,
          paymentMethod: arData.paymentMethod || undefined,
          status: arData.status,
          paidDate: arData.paidDate || undefined,
          paidAmount: arData.paidAmount ? Number.parseFloat(arData.paidAmount) : undefined,
          referenceNumber: arData.referenceNumber || undefined,
          bankAccountId: arData.bankAccountId || undefined,
          propertyId: arData.propertyId,
        };
      }

      return submitData as unknown as Record<string, unknown>;
    },
  });

  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [allServiceProviders, setAllServiceProviders] = useState<ServiceProvider[]>([]);
  const [allSuppliers, setAllSuppliers] = useState<Supplier[]>([]);
  const [allBuyers, setAllBuyers] = useState<Buyer[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (companyId) {
        try {
          const [employeesData, serviceProvidersData, suppliersData, buyersData, propertiesData] =
            await Promise.all([
              getEmployees(),
              getServiceProviders(),
              getSuppliers(),
              getBuyers(),
              getProperties(),
            ]);
          // Filter by companyId
          setAllEmployees(employeesData.filter((emp) => emp.companyId === companyId));
          setAllServiceProviders(serviceProvidersData.filter((sp) => sp.companyId === companyId));
          setAllSuppliers(suppliersData.filter((sup) => sup.companyId === companyId));
          setAllBuyers(buyersData.filter((buy) => buy.companyId === companyId));
          setProperties(propertiesData.filter((prop) => prop.companyId === companyId));
        } catch (error) {
          console.error("Failed to load data:", error);
        }
      }
    };
    fetchData();
  }, [companyId]);

  const handleChange = useCallback(
    (field: keyof T, value: string) => {
      baseForm.setFormData((prev) => {
        const newData = { ...prev, [field]: value };

        if (field === "propertyId") {
          if (transactionType === "cash-flow") {
            (newData as unknown as CashFlowFormState).supplierId = "";
            (newData as unknown as CashFlowFormState).buyerId = "";
            (newData as unknown as CashFlowFormState).employeeId = "";
            (newData as unknown as CashFlowFormState).serviceProviderId = "";
          } else if (transactionType === "accounts-payable") {
            (newData as unknown as AccountsPayableFormState).supplierId = "";
            (newData as unknown as AccountsPayableFormState).employeeId = "";
            (newData as unknown as AccountsPayableFormState).serviceProviderId = "";
          } else {
            (newData as unknown as AccountsReceivableFormState).buyerId = "";
          }
        }

        if (transactionType === "cash-flow" && field === "type" && value === "income") {
          (newData as unknown as CashFlowFormState).serviceProviderId = "";
        }

        if (
          transactionType === "cash-flow" &&
          field === "type" &&
          value === "income" &&
          (newData as unknown as CashFlowFormState).category !== CashFlowCategory.CATTLE_SALES
        ) {
          (newData as unknown as CashFlowFormState).category = CashFlowCategory.CATTLE_SALES;
        }

        if (
          transactionType === "cash-flow" &&
          field === "type" &&
          value === "expense" &&
          (newData as unknown as CashFlowFormState).category !== CashFlowCategory.FEED
        ) {
          (newData as unknown as CashFlowFormState).category = CashFlowCategory.FEED;
        }

        if (
          transactionType === "cash-flow" &&
          field === "category" &&
          value !== CashFlowCategory.LABOR
        ) {
          (newData as unknown as CashFlowFormState).employeeId = "";
        }

        return newData;
      });
      baseForm.handleChange(String(field), String(value));
    },
    [baseForm, transactionType]
  );

  const employees = useMemo(() => {
    const propertyId = baseForm.formData.propertyId as string | undefined;
    if (!propertyId) return allEmployees;
    return allEmployees.filter((emp) => emp.propertyIds?.includes(propertyId));
  }, [allEmployees, baseForm.formData.propertyId]);

  const serviceProviders = useMemo(() => {
    const propertyId = baseForm.formData.propertyId as string | undefined;
    if (!propertyId) return allServiceProviders;
    return allServiceProviders.filter((sp) => sp.propertyIds?.includes(propertyId));
  }, [allServiceProviders, baseForm.formData.propertyId]);

  const suppliers = useMemo(() => {
    const propertyId = baseForm.formData.propertyId as string | undefined;
    if (!propertyId) return allSuppliers;
    return allSuppliers.filter((sup) => sup.propertyIds?.includes(propertyId));
  }, [allSuppliers, baseForm.formData.propertyId]);

  const buyers = useMemo(() => {
    const propertyId = baseForm.formData.propertyId as string | undefined;
    if (!propertyId) return allBuyers;
    return allBuyers.filter((buy) => buy.propertyIds?.includes(propertyId));
  }, [allBuyers, baseForm.formData.propertyId]);

  // properties are now loaded via useEffect above

  const validate = useCallback((): boolean => {
    const result = baseForm.errors;
    return Object.keys(result).length === 0;
  }, [baseForm.errors]);

  return {
    formData: baseForm.formData,
    errors: baseForm.errors,
    isSubmitting: baseForm.isSubmitting,
    alertMessage: baseForm.alertMessage,
    properties,
    employees,
    serviceProviders,
    suppliers,
    buyers,
    handleChange,
    validate,
    handleSubmit: baseForm.handleSubmit,
    showAlert: baseForm.showAlert,
  };
}
