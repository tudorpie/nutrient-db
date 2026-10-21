import { nutrients, foods, type Food } from "@/data/nutrients";
import { supplements, type Supplement } from "@/data/supplements";
import { log, type LogEntry } from "@/data/log";
import LogView, { type DayTotals } from "@/components/LogView";

export const metadata = { title: "nutrient-db · log" };

const foodMap = Object.fromEntries(foods.map((f) => [f.id, f])) as Record<string, Food>;
const suppMap = Object.fromEntries(supplements.map((s) => [s.id, s])) as Record<string, Supplement>;

// Pure aggregation, done at build time. Totals = Σ values × grams/100 (foods)
// or Σ values × units (supplements). Targets and % are applied client-side
// so the user can override them.
function buildDays(entries: LogEntry[]): DayTotals[] {
  const byDate = new Map<string, DayTotals>();
  for (const e of entries) {
    let day = byDate.get(e.date);
    if (!day) {
      day = { date: e.date, items: [], totals: {}, estimated: {}, incomplete: {} };
      byDate.set(e.date, day);
    }
    if ("foodId" in e) {
      const f = foodMap[e.foodId];
      if (!f) throw new Error(`log: unknown foodId ${e.foodId}`);
      const k = e.grams / 100;
      // Anything not transcribed from a pack label counts as estimated (USDA generics included).
      const isEst = f.source !== "label";
      for (const n of nutrients) {
        const v = f.values[n.id];
        if (v === null || v === undefined) {
          day.incomplete[n.id] = true;
          continue;
        }
        day.totals[n.id] = (day.totals[n.id] ?? 0) + v * k;
        if (isEst) day.estimated[n.id] = true;
      }
      day.items.push({
        label: f.name,
        emoji: f.emoji,
        qty: `${e.grams} g`,
        kcal: f.values.kcal == null ? null : f.values.kcal * k,
        protein: f.values.protein == null ? null : f.values.protein * k,
        vegetarian: f.vegetarian,
        confidence: f.confidence,
        note: e.note,
      });
    } else {
      const s = suppMap[e.supplementId];
      if (!s) throw new Error(`log: unknown supplementId ${e.supplementId}`);
      for (const [id, v] of Object.entries(s.values)) {
        day.totals[id] = (day.totals[id] ?? 0) + v * e.units;
      }
      day.items.push({
        label: s.name,
        emoji: s.kind === "pharmaceutical" ? "\u{1F48A}" : "\u{1F9EA}",
        qty: `${e.units} × ${s.unit}`,
        kcal: 0,
        protein: 0,
        note: e.note,
      });
    }
  }
  return [...byDate.values()].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export default function LogPage() {
  return <LogView days={buildDays(log)} />;
}
