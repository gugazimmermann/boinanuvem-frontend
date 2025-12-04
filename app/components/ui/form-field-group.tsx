import type { ReactNode } from "react";

interface FormFieldGroupProps {
  readonly children: ReactNode;
  readonly columns?: 1 | 2 | 3 | 4;
  readonly className?: string;
}

export function FormFieldGroup({ children, columns = 2, className = "" }: FormFieldGroupProps) {
  const getGridColsClass = () => {
    if (columns === 1) return "grid-cols-1";
    if (columns === 2) return "grid-cols-1 md:grid-cols-2";
    if (columns === 3) return "grid-cols-1 md:grid-cols-3";
    return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
  };
  const gridColsClass = getGridColsClass();

  return <div className={`grid ${gridColsClass} gap-4 ${className}`}>{children}</div>;
}
