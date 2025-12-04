import { differenceInDays } from "date-fns";
import type { Weighing } from "~/types";

export interface WeighingWithCalculations extends Weighing {
  weightDiff: number | null;
  periodGMD: string | null;
}

export function calculateWeighingsWithCalculations(
  weighings: Weighing[]
): WeighingWithCalculations[] {
  const sortedWeighingsByDate = weighings.toSorted(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return sortedWeighingsByDate.map((weighing, index) => {
    const previousWeighing = sortedWeighingsByDate[index + 1];
    const weightDiff = previousWeighing ? weighing.weight - previousWeighing.weight : null;
    const daysDiff = previousWeighing
      ? differenceInDays(new Date(weighing.date), new Date(previousWeighing.date))
      : null;
    const periodGMD =
      weightDiff !== null && daysDiff !== null && daysDiff > 0
        ? (weightDiff / daysDiff).toFixed(2)
        : null;

    return {
      ...weighing,
      weightDiff,
      periodGMD,
    };
  });
}

export function calculateGMDValue(sortedWeighings: Weighing[]): string | null {
  if (sortedWeighings.length < 2) return null;
  const firstWeighing = sortedWeighings.at(-1);
  const lastWeighing = sortedWeighings[0];
  if (!firstWeighing || !lastWeighing) return null;
  const weightDiff = lastWeighing.weight - firstWeighing.weight;

  const firstDateStr = firstWeighing.date.includes("T")
    ? firstWeighing.date.split("T")[0]
    : firstWeighing.date;
  const lastDateStr = lastWeighing.date.includes("T")
    ? lastWeighing.date.split("T")[0]
    : lastWeighing.date;
  const firstDate = new Date(firstDateStr + "T00:00:00Z");
  const lastDate = new Date(lastDateStr + "T00:00:00Z");
  const daysDiff = differenceInDays(lastDate, firstDate);
  if (daysDiff === 0) return null;
  return (weightDiff / daysDiff).toFixed(2);
}
