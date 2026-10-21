// Personal daily targets, keyed by nutrient id. These override the generic
// RDA/AI in nutrients.ts on the /log page. Anything not listed falls back to
// the RDA. Browser-side overrides (set in the /log UI) take precedence over
// both and live in localStorage under "nutrient-db:targets".

export const defaultTargets: Record<string, number> = {
  kcal: 1800,     // cut phase, Sept 21 – Nov 1 2026
  protein: 170,   // training.md
  fiber: 35,
  sodium: 2300,   // ceiling, not a goal — the UI treats it as a limit
};

/** Nutrients where exceeding the target is bad, not good. */
export const limitIds = new Set(["kcal", "sodium", "saturated", "carbs", "fat"]);
