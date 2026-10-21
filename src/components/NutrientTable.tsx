"use client";

import { useState, useMemo, Fragment } from "react";
import Link from "next/link";
import {
  categories,
  categoryMap,
  nutrients,
  foods as allFoods,
  formatValue,
  calcRdaPercent,
  type CategoryId,
  type Food,
} from "@/data/nutrients";

export default function NutrientTable() {
  const [activeCategories, setActiveCategories] = useState<Set<CategoryId>>(
    new Set(categories.map((c) => c.id))
  );
  const [activeFoods, setActiveFoods] = useState<Set<string>>(
    new Set(allFoods.map((f) => f.id))
  );
  const [search, setSearch] = useState("");
  const [sortNutrient, setSortNutrient] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(false);
  const [showRda, setShowRda] = useState(false);
  const [rdaThreshold, setRdaThreshold] = useState(25);

  const filteredNutrients = useMemo(() => {
    return nutrients.filter((n) => {
      if (!activeCategories.has(n.category)) return false;
      if (search && !n.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [activeCategories, search]);

  const visibleFoods: Food[] = useMemo(() => {
    const selected = allFoods.filter((f) => activeFoods.has(f.id));
    if (!sortNutrient) return selected;
    return [...selected].sort((a, b) => {
      const va = a.values[sortNutrient] ?? -Infinity;
      const vb = b.values[sortNutrient] ?? -Infinity;
      return sortAsc ? va - vb : vb - va;
    });
  }, [activeFoods, sortNutrient, sortAsc]);

  function toggleCategory(id: CategoryId) {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleFood(id: string) {
    setActiveFoods((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSort(nutrientId: string) {
    if (sortNutrient === nutrientId) {
      setSortAsc(!sortAsc);
    } else {
      setSortNutrient(nutrientId);
      setSortAsc(false);
    }
  }

  function selectAllFoods() {
    setActiveFoods(new Set(allFoods.map((f) => f.id)));
  }

  function clearAllFoods() {
    setActiveFoods(new Set());
  }

  function rdaBadge(pct: number | null) {
    if (pct === null) return null;
    const rounded = Math.round(pct);
    let cls = "text-[10px] ml-1 px-1 py-0.5 rounded font-bold ";
    if (pct >= 50) cls += "bg-orange-500/30 text-orange-300";
    else if (pct >= rdaThreshold) cls += "bg-yellow-500/20 text-yellow-300";
    else cls += "bg-white/5 text-neutral-500";
    return <span className={cls}>{rounded}%</span>;
  }

  function cellColor(pct: number | null): string {
    if (pct === null) return "";
    if (pct >= 50) return "bg-orange-500/10";
    if (pct >= rdaThreshold) return "bg-yellow-500/5";
    return "";
  }

  // Group nutrients by category for rendering category headers
  const groupedNutrients = useMemo(() => {
    const groups: { categoryId: CategoryId; nutrients: typeof filteredNutrients }[] = [];
    let currentCat: CategoryId | null = null;
    let currentGroup: typeof filteredNutrients = [];

    for (const n of filteredNutrients) {
      if (n.category !== currentCat) {
        if (currentGroup.length > 0 && currentCat) {
          groups.push({ categoryId: currentCat, nutrients: currentGroup });
        }
        currentCat = n.category;
        currentGroup = [n];
      } else {
        currentGroup.push(n);
      }
    }
    if (currentGroup.length > 0 && currentCat) {
      groups.push({ categoryId: currentCat, nutrients: currentGroup });
    }
    return groups;
  }, [filteredNutrients]);

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-neutral-300 flex flex-col">
      {/* Header */}
      <header className="px-4 pt-6 pb-4 border-b border-neutral-800">
        <h1 className="text-xl font-bold text-neutral-100 tracking-tight mb-1">
          nutrient-db
          <span className="text-neutral-600 font-normal text-sm ml-2">
            per 100 g
          </span>
          <Link href="/log" className="text-neutral-500 hover:text-neutral-200 font-normal text-sm ml-4">
            intake log &rarr;
          </Link>
        </h1>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mt-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => toggleCategory(cat.id)}
              className="px-3 py-1 rounded text-xs font-semibold transition-all border"
              style={{
                borderColor: activeCategories.has(cat.id) ? cat.color : "transparent",
                backgroundColor: activeCategories.has(cat.id) ? cat.color + "18" : "#1a1a1a",
                color: activeCategories.has(cat.id) ? cat.color : "#666",
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Food toggles */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          <button
            onClick={selectAllFoods}
            className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            ALL
          </button>
          <button
            onClick={clearAllFoods}
            className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            NONE
          </button>
          {allFoods.map((f) => (
            <button
              key={f.id}
              onClick={() => toggleFood(f.id)}
              className="px-2 py-0.5 rounded text-[10px] transition-all"
              style={{
                backgroundColor: activeFoods.has(f.id) ? "#2a2a2a" : "#141414",
                color: activeFoods.has(f.id) ? "#ddd" : "#444",
              }}
            >
              {f.emoji} {f.name}
            </button>
          ))}
        </div>

        {/* Controls row */}
        <div className="flex flex-wrap items-center gap-3 mt-3">
          <input
            type="text"
            placeholder="Search nutrients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#141414] border border-neutral-800 rounded px-3 py-1.5 text-xs text-neutral-300 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 w-56"
          />
          <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
            <button
              onClick={() => setShowRda(!showRda)}
              className="w-8 h-4 rounded-full transition-colors relative"
              style={{ backgroundColor: showRda ? "#6bc060" : "#333" }}
            >
              <span
                className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all"
                style={{ left: showRda ? "17px" : "2px" }}
              />
            </button>
            <span className={showRda ? "text-[#6bc060]" : "text-neutral-500"}>
              % RDA
            </span>
          </label>
          {showRda && (
            <label className="flex items-center gap-2 text-xs text-neutral-500">
              Threshold
              <input
                type="range"
                min={5}
                max={100}
                value={rdaThreshold}
                onChange={(e) => setRdaThreshold(Number(e.target.value))}
                className="w-20 accent-yellow-500"
              />
              <span className="text-yellow-400 w-8">{rdaThreshold}%</span>
            </label>
          )}
        </div>
      </header>

      {/* Table */}
      <div className="flex-1 overflow-auto relative">
        <table className="w-full border-collapse text-xs">
          <thead className="sticky top-0 z-20">
            <tr className="bg-[#111]">
              <th className="sticky left-0 z-30 bg-[#111] text-left px-3 py-2 text-neutral-500 font-medium border-b border-r border-neutral-800 min-w-[200px]">
                Nutrient
              </th>
              <th className="px-2 py-2 text-neutral-600 font-medium border-b border-neutral-800 min-w-[50px]">
                Unit
              </th>
              <th className="px-2 py-2 text-neutral-600 font-medium border-b border-neutral-800 min-w-[70px]">
                RDA / AI
              </th>
              {visibleFoods.map((f) => (
                <th
                  key={f.id}
                  className="px-2 py-2 text-neutral-400 font-medium border-b border-neutral-800 min-w-[90px] whitespace-nowrap"
                >
                  <span className="mr-1">{f.emoji}</span>
                  <span className="text-[10px]">{f.name}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groupedNutrients.map((group) => {
              const cat = categoryMap[group.categoryId];
              return (
                <Fragment key={group.categoryId}>
                  {/* Category header row */}
                  <tr>
                    <td
                      colSpan={3 + visibleFoods.length}
                      className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border-b border-neutral-800"
                      style={{ color: cat.color, backgroundColor: cat.color + "08" }}
                    >
                      {cat.label}
                    </td>
                  </tr>
                  {group.nutrients.map((n) => (
                    <tr
                      key={n.id}
                      className="hover:bg-white/[0.02] transition-colors border-b border-neutral-800/50"
                    >
                      <td
                        className="sticky left-0 z-10 bg-[#0c0c0c] px-3 py-1.5 font-medium border-r border-neutral-800 cursor-pointer hover:text-white transition-colors"
                        style={{ color: cat.color + "cc" }}
                        onClick={() => handleSort(n.id)}
                        title={`Sort by ${n.name}`}
                      >
                        {n.name}
                        {sortNutrient === n.id && (
                          <span className="ml-1 text-neutral-500">
                            {sortAsc ? "\u25b2" : "\u25bc"}
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-1.5 text-neutral-600 text-center">
                        {n.unit}
                      </td>
                      <td className="px-2 py-1.5 text-neutral-600 text-center text-[10px]">
                        {n.rda}
                      </td>
                      {visibleFoods.map((f) => {
                        const v = f.values[n.id] ?? null;
                        const pct = calcRdaPercent(v, n.rdaNum);
                        return (
                          <td
                            key={f.id}
                            className={`px-2 py-1.5 text-right tabular-nums ${cellColor(showRda ? pct : null)}`}
                          >
                            <span className={v === null ? "text-neutral-700" : "text-neutral-300"}>
                              {formatValue(v)}
                            </span>
                            {showRda && rdaBadge(pct)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </Fragment>
              );
            })}
          </tbody>
        </table>
        {filteredNutrients.length === 0 && (
          <div className="text-center text-neutral-600 py-12 text-sm">
            No nutrients match your filters.
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="px-4 py-2 border-t border-neutral-800 text-[10px] text-neutral-600 flex justify-between">
        <span>
          {filteredNutrients.length} nutrients x {visibleFoods.length} foods
        </span>
        <span>
          Values per 100 g | RDA = Recommended Dietary Allowance | AI = Adequate Intake | * = combined EPA+DHA | &dagger; = supplemental dose target
        </span>
      </footer>
    </div>
  );
}
