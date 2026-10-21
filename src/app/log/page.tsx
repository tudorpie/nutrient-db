import Link from "next/link";
import {
  categories,
  nutrients,
  nutrientMap,
  formatValue,
  calcRdaPercent,
  foods,
  type Food,
} from "@/data/nutrients";
import { supplements, type Supplement } from "@/data/supplements";
import { log, type LogEntry } from "@/data/log";

export const metadata = { title: "nutrient-db · log" };

const foodMap = Object.fromEntries(foods.map((f) => [f.id, f])) as Record<string, Food>;
const suppMap = Object.fromEntries(supplements.map((s) => [s.id, s])) as Record<string, Supplement>;

interface DayItem {
  label: string;
  emoji: string;
  qty: string;
  kcal: number | null;
  protein: number | null;
  vegetarian: boolean | undefined;
  confidence?: string;
  note?: string;
}

interface DayTotals {
  date: string;
  items: DayItem[];
  /** nutrient id -> total; absent = no contributing item had a value */
  totals: Record<string, number>;
  /** nutrient id -> true if any contributing value came from a non-label source */
  estimated: Record<string, boolean>;
  /** nutrient id -> true if a contributing item had null for it (total is a floor) */
  incomplete: Record<string, boolean>;
}

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
      // Anything not transcribed from a pack label is treated as estimated (USDA generics included).
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
        vegetarian: undefined,
        note: e.note,
      });
    }
  }
  return [...byDate.values()].sort((a, b) => (a.date < b.date ? 1 : -1));
}

function pctClass(pct: number | null): string {
  if (pct === null) return "text-neutral-700";
  if (pct >= 100) return "text-[#6bc060]";
  if (pct >= 50) return "text-yellow-400";
  if (pct >= 25) return "text-orange-400";
  return "text-red-400";
}

const MACRO_IDS = ["kcal", "protein", "fat", "carbs", "fiber", "sodium"];

export default function LogPage() {
  const days = buildDays(log);

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-neutral-300 text-xs">
      <header className="px-4 py-3 border-b border-neutral-800 flex items-baseline gap-4">
        <h1 className="text-lg font-bold text-neutral-100">
          nutrient-db
          <span className="text-neutral-600 font-normal text-sm ml-2">intake log</span>
        </h1>
        <Link href="/" className="text-neutral-500 hover:text-neutral-200">
          &larr; table
        </Link>
      </header>

      {days.length === 0 && (
        <div className="p-8 text-neutral-600">No entries. Add rows to src/data/log.ts.</div>
      )}

      {days.map((day) => (
        <section key={day.date} className="border-b border-neutral-800">
          <div className="px-4 py-3 flex flex-wrap items-baseline gap-x-6 gap-y-1 bg-[#111]">
            <h2 className="text-base font-semibold text-neutral-100 tabular-nums">{day.date}</h2>
            {MACRO_IDS.map((id) => {
              const n = nutrientMap[id];
              const v = day.totals[id] ?? null;
              const pct = calcRdaPercent(v, n.rdaNum);
              return (
                <span key={id} className="tabular-nums">
                  <span className="text-neutral-500">{n.name.replace("Total ", "")} </span>
                  <span className="text-neutral-100 font-semibold">{formatValue(v)}</span>
                  <span className="text-neutral-600"> {n.unit}</span>
                  {pct !== null && (
                    <span className={`ml-1 ${pctClass(pct)}`}>{Math.round(pct)}%</span>
                  )}
                  {day.estimated[id] && (
                    <span className="text-neutral-600" title="includes estimated values">
                      ~
                    </span>
                  )}
                </span>
              );
            })}
          </div>

          <ul className="px-4 py-2 grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
            {day.items.map((it, i) => (
              <li key={i} className="flex flex-wrap items-baseline gap-2 text-neutral-400">
                <span>{it.emoji}</span>
                <span className="text-neutral-200">{it.label}</span>
                <span className="text-neutral-500 tabular-nums">{it.qty}</span>
                {it.kcal !== null && it.kcal > 0 && (
                  <span className="text-neutral-500 tabular-nums">
                    {Math.round(it.kcal)} kcal &middot; {formatValue(it.protein)} g P
                  </span>
                )}
                {it.confidence && it.confidence !== "high" && (
                  <span
                    className={`px-1 rounded text-[9px] uppercase ${
                      it.confidence === "low"
                        ? "bg-red-900/40 text-red-300"
                        : "bg-yellow-900/40 text-yellow-300"
                    }`}
                  >
                    {it.confidence}
                  </span>
                )}
                {it.vegetarian === false && (
                  <span className="px-1 rounded text-[9px] uppercase bg-red-900/40 text-red-300">
                    non-veg
                  </span>
                )}
                {it.note && <span className="text-neutral-600 italic">{it.note}</span>}
              </li>
            ))}
          </ul>

          <details className="px-4 pb-3">
            <summary className="cursor-pointer text-neutral-500 hover:text-neutral-300 select-none">
              all nutrients
            </summary>
            <div className="mt-2 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {categories.map((cat) => (
                <div key={cat.id}>
                  <div
                    className="text-[10px] font-bold uppercase tracking-wider mb-1"
                    style={{ color: cat.color }}
                  >
                    {cat.label}
                  </div>
                  <table className="w-full">
                    <tbody>
                      {nutrients
                        .filter((n) => n.category === cat.id)
                        .map((n) => {
                          const v = day.totals[n.id] ?? null;
                          const pct = calcRdaPercent(v, n.rdaNum);
                          return (
                            <tr key={n.id} className="border-b border-neutral-800/50">
                              <td className="py-0.5 pr-2" style={{ color: cat.color + "aa" }}>
                                {n.name}
                              </td>
                              <td className="py-0.5 text-right tabular-nums text-neutral-200">
                                {formatValue(v)}
                                {day.estimated[n.id] && <span className="text-neutral-600">~</span>}
                                {day.incomplete[n.id] && v !== null && (
                                  <span className="text-neutral-600">+</span>
                                )}
                              </td>
                              <td className="py-0.5 pl-1 text-neutral-600 text-[10px]">{n.unit}</td>
                              <td
                                className={`py-0.5 pl-2 text-right tabular-nums text-[10px] ${pctClass(pct)}`}
                              >
                                {pct === null ? "" : `${Math.round(pct)}%`}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </details>
        </section>
      ))}

      <footer className="px-4 py-2 text-[10px] text-neutral-600">
        ~ includes estimated (non-label) values &middot; + at least one item had no data for this
        nutrient, so the total is a floor &middot; % of RDA/AI from the main table
      </footer>
    </div>
  );
}
