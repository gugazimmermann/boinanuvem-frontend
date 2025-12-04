import { StatusBadge } from "~/components/ui";
import type { ReactNode } from "react";

interface EntityDetailHeaderProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly status?: {
    readonly label: string;
    readonly variant: "success" | "default" | "danger" | "warning" | "info" | "primary";
  };
  readonly actions?: ReactNode;
}

export function EntityDetailHeader({ title, subtitle, status, actions }: EntityDetailHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
          {status && (
            <StatusBadge
              label={status.label}
              variant={status.variant === "primary" ? "default" : status.variant}
            />
          )}
        </div>
        {subtitle && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
