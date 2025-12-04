import type { ReactNode } from "react";

interface InfoField {
  readonly label: string;
  readonly value: string | ReactNode;
}

interface EntityInfoSectionProps {
  readonly title: string;
  readonly fields: InfoField[];
  readonly color?: "blue" | "green" | "purple" | "orange" | "teal";
}

const colorClasses = {
  blue: "bg-blue-500",
  green: "bg-green-500",
  purple: "bg-purple-500",
  orange: "bg-orange-500",
  teal: "bg-teal-500",
};

export function EntityInfoSection({ title, fields, color = "blue" }: EntityInfoSectionProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
      <div className="flex items-center gap-3 mb-6">
        <div className={`h-1 w-12 ${colorClasses[color]} rounded-full`}></div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
      </div>
      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.label}>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{field.label}</p>
            <div className="text-sm text-gray-900 dark:text-gray-100 mt-1">{field.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
