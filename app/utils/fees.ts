import type { Fee } from "~/types";

export function calculateTotalFees(fees?: Fee[]): number {
  if (!fees || fees.length === 0) return 0;
  return fees.reduce((sum, fee) => sum + fee.amount, 0);
}

export function migrateLegacyFees(
  transportationFee?: number,
  additionalFees?: number,
  handlingFee?: number
): Fee[] {
  const fees: Fee[] = [];

  if (transportationFee && transportationFee > 0) {
    fees.push({
      id: `fee-${Date.now()}-transport`,
      name: "Taxa de Transporte",
      amount: transportationFee,
    });
  }

  if (additionalFees && additionalFees > 0) {
    fees.push({
      id: `fee-${Date.now()}-additional`,
      name: "Taxas Adicionais",
      amount: additionalFees,
    });
  }

  if (handlingFee && handlingFee > 0) {
    fees.push({
      id: `fee-${Date.now()}-handling`,
      name: "Taxa de Manejo",
      amount: handlingFee,
    });
  }

  return fees;
}

export function getTotalFees(
  fees?: Fee[],
  transportationFee?: number,
  additionalFees?: number,
  handlingFee?: number
): number {
  if (fees && fees.length > 0) {
    return calculateTotalFees(fees);
  }

  return (transportationFee || 0) + (additionalFees || 0) + (handlingFee || 0);
}
