"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { categories, nutrients, nutrientMap, formatValue } from "@/data/nutrients";
import { defaultTargets, limitIds } from "@/data/targets";

export interface DayItem {
  label: string;
  emoji: string;
  qty: string;
  kcal: number | null;
  protein: number | null;
  vegetarian?: boolean;
  confidence?: string;
  note?: string;
}

export interface DayTotals {
  date: string;
  items: DayItem[];
  totals: Record<string, number>;
  estimated: Record<string, boolean>;
  incomplete: Record<string, boolean>;
}

const STORAGE_KEY = "nutrient-db:targets";
const MACRO_IDS = ["kcal", "protein", "fat", "carbs", "fiber", "sodium"];

// localStorage as an external store: the raw string is the snapshot (stable
// identity between writes), parsed once per change below. Server snapshot is
// null so SSR and the first client render agree (no overrides, no % yet).
const CHANGE_EVENT = "nutrient-db:targets-changed";

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(CHANGE_EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(CHANGE_EVENT, cb);
  };
}

function getSnapshot(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function getServerSnapshot(): string | null {
  return null;
}

function parseOverrides(raw: string | null): Record<string, number> {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, number>;
  } catch {
    return {};
  }
}

function saveOverrides(o: Record<string, number>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(o));
  } catch {
    /* private mode etc. — overrides just won't persist */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function pctClass(pct: number | null, isLimit: boolean): string {
  if (pct === null) return "text-neutral-700";
  if (isLimit) {
    if (pct > 110) return "text-red-400";
    if (pct > 90) return "text-yellow-400";
    return "text-[#6bc060]";
  }
  if (pct >= 100) return "text-[#6bc060]";
  if (pct >= 50) return "text-yellow-400";
  if (pct >= 25) return "text-orange-400";
  return "text-red-400";
}

export default function LogView({ days }: { days: DayTotals[] }) {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const loaded = raw !== null;
  const overrides = useMemo(() => parseOverrides(raw), [raw]);
  const [editing, setEditing] = useState(false);

  // Effective target: browser override > targets.ts > RDA from the table.
  const target = useMemo(() => {
    const t: Record<string, number | null> = {};
    for (const n of nutrients) {
      t[n.id] = overrides[n.id] ?? defaultTargets[n.id] ?? n.rdaNum;
    }
    return t;
  }, [overrides]);

  const source = (id: string): "you" | "file" | "rda" =>
    overrides[id] !== undefined ? "you" : defaultTargets[id] !== undefined ? "file" : "rda";

  function setTarget(id: string, raw: string) {
    const next = { ...overrides };
    const v = parseFloat(raw);
    if (raw.trim() === "" || Number.isNaN(v)) delete next[id];
    else next[id] = v;
    saveOverrides(next);
  }

  function resetAll() {
    saveOverrides({});
  }

  const pct = (id: string, v: number | null): number | null => {
    const t = target[id];
    if (v === null || t === null || t === undefined || t === 0) return null;
    return (v / t) * 100;
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-neutral-300 text-xs">
      <header className="px-4 py-3 border-b border-neutral-800 flex flex-wrap items-baseline gap-4">
        <h1 className="text-lg font-bold text-neutral-100">
          nutrient-db
          <span className="text-neutral-600 font-normal text-sm ml-2">intake log</span>
        </h1>
        <Link href="/" className="text-neutral-500 hover:text-neutral-200">
          &larr; table
        </Link>
        <button
          onClick={() => setEditing((e) => !e)}
          className="ml-auto px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-800 text-neutral-400 hover:text-neutral-200"
        >
          {editing ? "done" : "targets"}
        </button>
      </header>

      {editing && (
        <section className="px-4 py-3 border-b border-neutral-800 bg-[#111]">
          <div className="flex items-baseline gap-4 mb-2">
            <span className="text-neutral-400">
              Daily targets. Blank = fall back to targets.ts, then RDA. Saved in this browser only.
            </span>
            <button onClick={resetAll} className="text-neutral-500 hover:text-red-300">
              reset all
            </button>
          </div>
          <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {categories.map((cat) => (
              <div key={cat.id}>
                <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: cat.color }}>
                  {cat.label}
                </div>
                {nutrients
                  .filter((n) => n.category === cat.id)
                  .map((n) => {
                    const src = source(n.id);
                    return (
                      <div key={n.id} className="flex items-center gap-2 py-0.5">
                        <span className="w-32 truncate" style={{ color: cat.color + "aa" }}>
                          {n.name}
                        </span>
                        <input
                          type="number"
                          inputMode="decimal"
                          step="any"
                          placeholder={target[n.id] === null ? "—" : String(target[n.id])}
                          value={overrides[n.id] ?? ""}
                          onChange={(e) => setTarget(n.id, e.target.value)}
                          className="w-20 bg-[#141414] border border-neutral-800 rounded px-1.5 py-0.5 text-right tabular-nums text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-neutral-600"
                        />
                        <span className="text-neutral-600 text-[10px] w-12">{n.unit}</span>
                        <span
                          className={`text-[9px] uppercase ${
                            src === "you" ? "text-[#6bc060]" : src === "file" ? "text-yellow-500" : "text-neutral-700"
                          }`}
                        >
                          {src}
                        </span>
                        {limitIds.has(n.id) && <span className="text-[9px] text-neutral-600">limit</span>}
                      </div>
                    );
                  })}
              </div>
            ))}
          </div>
        </section>
      )}

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
              const p = loaded ? pct(id, v) : null;
              return (
                <span key={id} className="tabular-nums">
                  <span className="text-neutral-500">{n.name.replace("Total ", "")} </span>
                  <span className="text-neutral-100 font-semibold">{formatValue(v)}</span>
                  <span className="text-neutral-600"> {n.unit}</span>
                  {p !== null && (
                    <span className={`ml-1 ${pctClass(p, limitIds.has(id))}`}>{Math.round(p)}%</span>
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
                      it.confidence === "low" ? "bg-red-900/40 text-red-300" : "bg-yellow-900/40 text-yellow-300"
                    }`}
                  >
                    {it.confidence}
                  </span>
                )}
                {it.vegetarian === false && (
                  <span className="px-1 rounded text-[9px] uppercase bg-red-900/40 text-red-300">non-veg</span>
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
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: cat.color }}>
                    {cat.label}
                  </div>
                  <table className="w-full">
                    <tbody>
                      {nutrients
                        .filter((n) => n.category === cat.id)
                        .map((n) => {
                          const v = day.totals[n.id] ?? null;
                          const p = loaded ? pct(n.id, v) : null;
                          return (
                            <tr key={n.id} className="border-b border-neutral-800/50">
                              <td className="py-0.5 pr-2" style={{ color: cat.color + "aa" }}>
                                {n.name}
                              </td>
                              <td className="py-0.5 text-right tabular-nums text-neutral-200">
                                {formatValue(v)}
                                {day.estimated[n.id] && <span className="text-neutral-600">~</span>}
                                {day.incomplete[n.id] && v !== null && <span className="text-neutral-600">+</span>}
                              </td>
                              <td className="py-0.5 pl-1 text-neutral-600 text-[10px]">{n.unit}</td>
                              <td className="py-0.5 pl-2 text-right tabular-nums text-[10px] text-neutral-600">
                                / {target[n.id] === null ? "—" : formatValue(target[n.id])}
                              </td>
                              <td className={`py-0.5 pl-2 text-right tabular-nums text-[10px] ${pctClass(p, limitIds.has(n.id))}`}>
                                {p === null ? "" : `${Math.round(p)}%`}
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
        % of target (yours &rsaquo; targets.ts &rsaquo; RDA) &middot; limits colour red when exceeded &middot; ~ includes
        estimated (non-label) values &middot; + at least one item had no data for this nutrient, so the total is a floor
      </footer>
    </div>
  );
}
