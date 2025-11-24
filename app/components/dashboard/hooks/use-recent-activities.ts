import { useMemo } from "react";
import type { Animal, Birth, Breeding, Weighing, CashFlow, Sale } from "~/types";
import type { useTranslation } from "~/i18n";

interface Activity {
  type: string;
  date: string;
  title: string;
  icon: string;
  color: string;
}

interface UseRecentActivitiesOptions {
  animals: Animal[];
  births: Birth[];
  weighings: Weighing[];
  breedings: Breeding[];
  cashFlowData: CashFlow[];
  sales: Sale[];
  t: ReturnType<typeof useTranslation>;
  limit?: number;
}

export function useRecentActivities(options: UseRecentActivitiesOptions): Activity[] {
  const { animals, births, weighings, breedings, cashFlowData, sales, t, limit = 10 } = options;

  return useMemo(() => {
    const activityList: Activity[] = [];

    animals.forEach((animal) => {
      activityList.push({
        type: "animal",
        date: animal.createdAt || new Date().toISOString(),
        title: t.dashboard.recentActivities.newAnimalRegistered,
        icon: "🐄",
        color: "blue",
      });
    });

    births.forEach((birth) => {
      activityList.push({
        type: "birth",
        date: birth.birthDate,
        title: t.dashboard.recentActivities.newBirthRegistered,
        icon: "👶",
        color: "purple",
      });
    });

    weighings.forEach((weighing) => {
      activityList.push({
        type: "weighing",
        date: weighing.date,
        title: t.dashboard.recentActivities.newWeighingRegistered,
        icon: "⚖️",
        color: "teal",
      });
    });

    breedings.forEach((breeding) => {
      activityList.push({
        type: "breeding",
        date: breeding.date,
        title: t.dashboard.recentActivities.newBreedingRegistered,
        icon: "💑",
        color: "pink",
      });
    });

    cashFlowData.forEach((transaction) => {
      activityList.push({
        type: "transaction",
        date: transaction.date,
        title: t.dashboard.recentActivities.newTransactionRegistered,
        icon: transaction.type === "income" ? "💰" : "💸",
        color: transaction.type === "income" ? "green" : "red",
      });
    });

    sales.forEach((sale) => {
      activityList.push({
        type: "sale",
        date: sale.saleDate,
        title: t.dashboard.recentActivities.newSaleRegistered,
        icon: "💵",
        color: "green",
      });
    });

    return activityList
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }, [animals, births, weighings, breedings, cashFlowData, sales, t, limit]);
}
