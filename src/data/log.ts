// Intake log. One row per item consumed.
// Food rows: grams of product as eaten; totals = foods[foodId].values[n] × grams / 100.
// Supplement rows: units (capsules/tablets); totals = supplements[id].values[n] × units.
// Dates are the Europe/Bucharest calendar day the item was eaten.

export type LogEntry =
  | { date: string; foodId: string; grams: number; note?: string }
  | { date: string; supplementId: string; units: number; note?: string };

export const log: LogEntry[] = [
  // 2026-10-19 (logged 2026-10-20 00:52)
  { date: "2026-10-19", foodId: "sanovitaTofuMasline", grams: 200, note: "full pack" },
  { date: "2026-10-19", foodId: "bornWinnerSlimChocHazelnut", grams: 50, note: "full bar" },
  { date: "2026-10-19", foodId: "joxtyProteinChipsChilliLime", grams: 50, note: "full bag" },
  { date: "2026-10-19", foodId: "veraMiniKorniszony", grams: 25, note: "user estimate" },
  { date: "2026-10-19", foodId: "ribellaHummusCaramelizedGarlic", grams: 200, note: "full pack" },
  { date: "2026-10-19", foodId: "starPopcornCascaval", grams: 30, note: "user estimate" },
];
