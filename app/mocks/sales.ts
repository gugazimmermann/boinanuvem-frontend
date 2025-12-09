import type { Sale, SaleFormData } from "~/types";
import { SaleType, PricingMode, SalePaymentMethod } from "~/types";
import { mockAnimals } from "./animals";
import { mockBuyers } from "./buyers";
import { getWeighingsByAnimalId } from "~/services/weighings.service";

const ID_PREFIX = "sa0e8400-e29b-41d4-a716";

function generateSaleId(index: number): string {
  const base = 446655440100 + index;
  return `${ID_PREFIX}-${base.toString().padStart(12, "0")}`;
}

export type { Sale, SaleFormData };

const COMPANY_ID = "550e8400-e29b-41d4-a716-446655440000";

const sales: Sale[] = [];

function initializeSales(): void {
  const availableAnimals = mockAnimals.filter(
    (animal) => animal.status === "active" && animal.companyId === COMPANY_ID
  );

  const animalsToSell = availableAnimals.filter((_, index) => index % 7 === 0).slice(0, 20);

  let saleIndex = 0;

  for (
    let i = 0;
    i < animalsToSell.length;
    i += Math.random() < 0.6 ? 1 : Math.floor(Math.random() * 3) + 2
  ) {
    const animalsInSale = animalsToSell.slice(
      i,
      Math.min(
        i + (Math.random() < 0.6 ? 1 : Math.floor(Math.random() * 3) + 2),
        animalsToSell.length
      )
    );

    if (animalsInSale.length === 0) continue;

    const firstAnimal = animalsInSale[0];
    const propertyId = firstAnimal.propertyId;

    const buyer = mockBuyers.find((b) => b.propertyIds.includes(propertyId)) || mockBuyers[0];

    const saleTypeOptions = [SaleType.SLAUGHTERHOUSE, SaleType.OTHER_FARM, SaleType.AUCTION];
    const saleType = saleTypeOptions[saleIndex % saleTypeOptions.length];

    const pricingMode =
      animalsInSale.length > 1 && Math.random() < 0.5 ? PricingMode.TOTAL : PricingMode.INDIVIDUAL;

    const paymentMethod =
      Math.random() < 0.6 ? SalePaymentMethod.CASH_FLOW : SalePaymentMethod.ACCOUNTS_RECEIVABLE;

    const saleDate = new Date();
    saleDate.setMonth(saleDate.getMonth() - Math.floor(Math.random() * 12));
    const saleDateStr = saleDate.toISOString().split("T")[0];

    const saleItems = animalsInSale.map((animal) => {
      const weighings = getWeighingsByAnimalId(animal.id);
      let weight = 400;
      if (weighings && weighings.length > 0) {
        const sortedWeighings = weighings.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        weight = sortedWeighings[0].weight;
      }

      let pricePerKg = 8.5;
      if (saleType === SaleType.SLAUGHTERHOUSE) {
        pricePerKg = 8.0 + Math.random() * 1.5;
      } else if (saleType === SaleType.AUCTION) {
        pricePerKg = 9.0 + Math.random() * 2.0;
      } else {
        pricePerKg = 7.5 + Math.random() * 1.5;
      }

      const price = weight * pricePerKg;

      return {
        animalId: animal.id,
        price,
        weight,
        carcassWeight: saleType === SaleType.SLAUGHTERHOUSE ? weight * 0.55 : undefined,
      };
    });

    const totalPrice = saleItems.reduce((sum, item) => sum + item.price, 0);
    const transportationFee =
      Math.random() < 0.5 ? Math.floor(Math.random() * 500) + 200 : undefined;
    const additionalFees = Math.random() < 0.3 ? Math.floor(Math.random() * 300) + 100 : undefined;

    sales.push({
      id: generateSaleId(saleIndex),
      companyId: COMPANY_ID,
      propertyId,
      buyerId: buyer.id,
      saleDate: saleDateStr,
      saleType,
      pricingMode,
      paymentMethod,
      totalPrice,
      transportationFee,
      additionalFees,
      saleItems,
      observation:
        saleType === SaleType.SLAUGHTERHOUSE
          ? "Venda para abate"
          : saleType === SaleType.AUCTION
            ? "Venda em leilão"
            : "Venda para outra propriedade",
      createdAt: saleDateStr,
    });

    saleIndex++;
  }
}

initializeSales();

export const mockSales: Sale[] = sales;
export { initializeSales };
