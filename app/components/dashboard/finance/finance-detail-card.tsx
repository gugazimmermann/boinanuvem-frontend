import { type ReactNode, isValidElement } from "react";
import { StatusBadge } from "~/components/ui";
import { formatDate, formatCurrency } from "~/utils/formatting";
import type { Language } from "~/types";

export interface DetailField {
  readonly label: string;
  readonly value: string | number | ReactNode;
  readonly condition?: boolean;
  readonly type?: "text" | "currency" | "date" | "status" | "badge";
  readonly currencyType?: "income" | "expense";
  readonly statusVariant?: "success" | "danger" | "warning" | "default";
}

export interface FinanceDetailCardProps {
  readonly fields: DetailField[];
  readonly language?: Language;
}

export function FinanceDetailCard({ fields, language = "pt" }: FinanceDetailCardProps) {
  const renderValue = (field: DetailField) => {
    if (field.condition === false) return null;

    switch (field.type) {
      case "currency": {
        let currencyClassName = "text-gray-900 dark:text-gray-100";
        if (field.currencyType === "income") {
          currencyClassName = "text-green-600 dark:text-green-400";
        } else if (field.currencyType === "expense") {
          currencyClassName = "text-red-600 dark:text-red-400";
        }
        return (
          <p className={`text-lg font-semibold ${currencyClassName}`}>
            {typeof field.value === "number" ? formatCurrency(field.value, language) : field.value}
          </p>
        );
      }
      case "date":
        return (
          <p className="text-gray-900 dark:text-gray-100">
            {typeof field.value === "string" ? formatDate(field.value, language) : field.value}
          </p>
        );
      case "status":
      case "badge": {
        const labelValue =
          typeof field.value === "string" || typeof field.value === "number"
            ? String(field.value)
            : "[object Object]";
        return <StatusBadge label={labelValue} variant={field.statusVariant || "default"} />;
      }
      default:
        // If value is a React element, use div wrapper; otherwise use p tag
        if (isValidElement(field.value)) {
          return <div className="text-gray-900 dark:text-gray-100">{field.value}</div>;
        }
        return <p className="text-gray-900 dark:text-gray-100">{field.value}</p>;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map((field) => {
          if (field.condition === false) return null;
          const getFieldKeyValue = () => {
            if (typeof field.value === "string") return field.value;
            if (typeof field.value === "number") return field.value;
            return "node";
          };
          const fieldKey = `${field.label}-${getFieldKeyValue()}`;
          return (
            <div key={fieldKey}>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {field.label}
              </label>
              {renderValue(field)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
