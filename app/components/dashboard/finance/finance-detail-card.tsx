import type { ReactNode } from "react";
import { StatusBadge } from "~/components/ui";
import { formatDate, formatCurrency } from "~/utils/formatting";
import type { Language } from "~/types";

export interface DetailField {
  label: string;
  value: string | number | ReactNode;
  condition?: boolean;
  type?: "text" | "currency" | "date" | "status" | "badge";
  currencyType?: "income" | "expense";
  statusVariant?: "success" | "danger" | "warning" | "default";
}

export interface FinanceDetailCardProps {
  fields: DetailField[];
  language?: Language;
}

export function FinanceDetailCard({ fields, language = "pt" }: FinanceDetailCardProps) {
  const renderValue = (field: DetailField) => {
    if (field.condition === false) return null;

    switch (field.type) {
      case "currency":
        return (
          <p
            className={`text-lg font-semibold ${
              field.currencyType === "income"
                ? "text-green-600 dark:text-green-400"
                : field.currencyType === "expense"
                  ? "text-red-600 dark:text-red-400"
                  : "text-gray-900 dark:text-gray-100"
            }`}
          >
            {typeof field.value === "number" ? formatCurrency(field.value, language) : field.value}
          </p>
        );
      case "date":
        return (
          <p className="text-gray-900 dark:text-gray-100">
            {typeof field.value === "string" ? formatDate(field.value, language) : field.value}
          </p>
        );
      case "status":
      case "badge":
        return (
          <StatusBadge label={String(field.value)} variant={field.statusVariant || "default"} />
        );
      default:
        return <p className="text-gray-900 dark:text-gray-100">{field.value}</p>;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map((field, index) => {
          if (field.condition === false) return null;
          return (
            <div key={index}>
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
