import { Input, Button } from "~/components/ui";
import { useTranslation } from "~/i18n";
import type { FeeItem } from "~/types/records";

export interface FeeManagerProps {
  readonly fees: FeeItem[];
  readonly onAddFee: () => void;
  readonly onRemoveFee: (feeId: string) => void;
  readonly onUpdateFee: (feeId: string, field: "name" | "amount", value: string) => void;
  readonly disabled?: boolean;
  readonly feesLabel?: string;
  readonly addFeeLabel?: string;
  readonly feeNameLabel?: string;
  readonly feeNamePlaceholder?: string;
  readonly feeAmountLabel?: string;
  readonly feeAmountPlaceholder?: string;
}

export function FeeManager({
  fees,
  onAddFee,
  onRemoveFee,
  onUpdateFee,
  disabled = false,
  feesLabel,
  addFeeLabel,
  feeNameLabel,
  feeNamePlaceholder,
  feeAmountLabel,
  feeAmountPlaceholder,
}: FeeManagerProps) {
  const t = useTranslation();

  const defaultFeesLabel = feesLabel || t.sales?.form?.fees || "Taxas e Encargos";
  const defaultAddFeeLabel = addFeeLabel || t.sales?.form?.addFee || "Adicionar Taxa";
  const defaultFeeNameLabel = feeNameLabel || t.sales?.form?.feeName || "Nome da Taxa";
  const defaultFeeNamePlaceholder =
    feeNamePlaceholder || t.sales?.form?.feeNamePlaceholder || "Ex: Taxa de Transporte";
  const defaultFeeAmountLabel = feeAmountLabel || t.sales?.form?.feeAmount || "Valor";
  const defaultFeeAmountPlaceholder = feeAmountPlaceholder || "0,00";

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {defaultFeesLabel}
        </label>
        <Button
          type="button"
          variant="outline"
          onClick={onAddFee}
          disabled={disabled}
          className="text-sm"
        >
          + {defaultAddFeeLabel}
        </Button>
      </div>
      {fees.length > 0 && (
        <div className="space-y-3">
          {fees.map((fee) => (
            <div
              key={fee.id}
              className="grid grid-cols-1 md:grid-cols-[2fr_1fr_auto] gap-3 items-end"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {defaultFeeNameLabel}
                </label>
                <Input
                  type="text"
                  value={fee.name}
                  onChange={(e) => onUpdateFee(fee.id, "name", e.target.value)}
                  disabled={disabled}
                  placeholder={defaultFeeNamePlaceholder}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {defaultFeeAmountLabel}
                </label>
                <Input
                  type="text"
                  value={fee.amount}
                  onChange={(e) => onUpdateFee(fee.id, "amount", e.target.value)}
                  disabled={disabled}
                  placeholder={defaultFeeAmountPlaceholder}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => onRemoveFee(fee.id)}
                disabled={disabled}
                className="mb-0"
              >
                {t.common?.remove || "Remover"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
