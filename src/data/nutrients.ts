export type CategoryId = "macro" | "vitamin" | "mineral" | "fattyAcid" | "extra";

export interface Category {
  id: CategoryId;
  label: string;
  color: string;
}

export const categories: Category[] = [
  { id: "macro", label: "Macronutrients", color: "#e87040" },
  { id: "vitamin", label: "Vitamins", color: "#dba320" },
  { id: "mineral", label: "Minerals", color: "#50a0d0" },
  { id: "fattyAcid", label: "Fatty Acids", color: "#d05090" },
  { id: "extra", label: "Bioactives & Extras", color: "#6bc060" },
];

export const categoryMap = Object.fromEntries(
  categories.map((c) => [c.id, c])
) as Record<CategoryId, Category>;

export interface Nutrient {
  id: string;
  name: string;
  unit: string;
  category: CategoryId;
  rda: string; // raw RDA string for display
  rdaNum: number | null; // parsed numeric value for % calc
}

function parseRda(raw: string): number | null {
  if (raw === "\u2014" || raw === "") return null;
  // Strip non-numeric except dots and dashes, split on dash, take last number
  const nums = raw.replace(/[^0-9.]/g, " ").trim().split(/\s+/).filter(Boolean);
  if (nums.length === 0) return null;
  return parseFloat(nums[nums.length - 1]);
}

const nutrientDefs: [string, string, string, CategoryId, string][] = [
  // Macros
  ["kcal", "Energy", "kcal", "macro", "~2200"],
  ["protein", "Protein", "g", "macro", "50\u201360"],
  ["fat", "Total Fat", "g", "macro", "44\u201378"],
  ["carbs", "Carbohydrates", "g", "macro", "250\u2013350"],
  ["fiber", "Fiber", "g", "macro", "30\u201338"],
  // Vitamins
  ["vitA", "Vitamin A", "\u00b5g RAE", "vitamin", "900"],
  ["vitB1", "B1 (Thiamine)", "mg", "vitamin", "1.2"],
  ["vitB2", "B2 (Riboflavin)", "mg", "vitamin", "1.3"],
  ["vitB3", "B3 (Niacin)", "mg NE", "vitamin", "16"],
  ["vitB5", "B5 (Pantothenic)", "mg", "vitamin", "5"],
  ["vitB6", "B6 (Pyridoxine)", "mg", "vitamin", "1.3"],
  ["vitB7", "B7 (Biotin)", "\u00b5g", "vitamin", "30"],
  ["vitB9", "B9 (Folate)", "\u00b5g DFE", "vitamin", "400"],
  ["vitB12", "B12 (Cobalamin)", "\u00b5g", "vitamin", "2.4"],
  ["vitC", "Vitamin C", "mg", "vitamin", "90"],
  ["vitD", "Vitamin D", "\u00b5g (IU)", "vitamin", "15"],
  ["vitE", "Vitamin E", "mg \u03b1-TE", "vitamin", "15"],
  ["vitK", "Vitamin K", "\u00b5g", "vitamin", "120"],
  // Minerals
  ["calcium", "Calcium", "mg", "mineral", "1000"],
  ["iron", "Iron", "mg", "mineral", "8\u201318"],
  ["magnesium", "Magnesium", "mg", "mineral", "400\u2013420"],
  ["zinc", "Zinc", "mg", "mineral", "11"],
  ["selenium", "Selenium", "\u00b5g", "mineral", "55"],
  ["potassium", "Potassium", "mg", "mineral", "2600\u20133400"],
  ["phosphorus", "Phosphorus", "mg", "mineral", "700"],
  ["copper", "Copper", "mg", "mineral", "0.9"],
  ["manganese", "Manganese", "mg", "mineral", "2.3"],
  ["iodine", "Iodine", "\u00b5g", "mineral", "150"],
  ["chromium", "Chromium", "\u00b5g", "mineral", "35"],
  ["sodium", "Sodium", "mg", "mineral", "<2300"],
  // Fatty Acids
  ["epa", "EPA (20:5n-3)", "mg", "fattyAcid", "250\u2013500*"],
  ["dha", "DHA (22:6n-3)", "mg", "fattyAcid", "250\u2013500*"],
  ["ala", "ALA (18:3n-3)", "mg", "fattyAcid", "1100\u20131600"],
  ["omega6", "Total Omega-6", "mg", "fattyAcid", "11000\u201317000"],
  ["saturated", "Saturated Fat", "g", "fattyAcid", "<22"],
  // Bioactives & Extras
  ["choline", "Choline", "mg", "extra", "550"],
  ["creatine", "Creatine", "mg", "extra", "~3000\u20135000\u2020"],
  ["taurine", "Taurine", "mg", "extra", "~3000\u2020"],
  ["coq10", "Coenzyme Q10", "mg", "extra", "~100\u2013200\u2020"],
  ["astaxanthin", "Astaxanthin", "mg", "extra", "~4\u201312\u2020"],
  ["betaCarotene", "Beta-Carotene", "\u00b5g", "extra", "\u2014"],
  ["lutein", "Lutein + Zeaxanthin", "\u00b5g", "extra", "~6000\u201310000\u2020"],
  ["lycopene", "Lycopene", "\u00b5g", "extra", "\u2014"],
  ["betaine", "Betaine (TMG)", "mg", "extra", "~1500\u20136000\u2020"],
  ["glycine", "Glycine", "mg", "extra", "~3000\u20135000\u2020"],
  ["collagen", "Collagen (approx.)", "mg", "extra", "~5000\u201315000\u2020"],
  ["sulforaphane", "Sulforaphane precursor", "mg", "extra", "~10\u201340\u2020"],
];

export const nutrients: Nutrient[] = nutrientDefs.map(
  ([id, name, unit, category, rda]) => ({
    id,
    name,
    unit,
    category,
    rda,
    rdaNum: parseRda(rda),
  })
);

export const nutrientMap = Object.fromEntries(
  nutrients.map((n) => [n.id, n])
) as Record<string, Nutrient>;

export type FoodSource = "usda" | "label" | "label+estimated" | "estimated";

export interface Food {
  id: string;
  name: string;
  emoji: string;
  /** All values are per 100 g. */
  values: Record<string, number | null>;
  /** Packaged product fields — absent on generic USDA foods. */
  brand?: string;
  ean?: string;
  packageG?: number;
  source?: FoodSource;
  confidence?: "high" | "moderate" | "low";
  /** false = contains animal-derived ingredients beyond dairy/egg (gelatine, collagen, animal rennet, meat, fish). Omitted = not assessed. */
  vegetarian?: boolean;
  /** How estimated values were derived; which values are label vs proxy. */
  notes?: string;
}

export const foods: Food[] = [
  {
    id: "salmon",
    name: "Salmon (Atlantic, wild)",
    emoji: "\ud83d\udc1f",
    values: {
      kcal: 142, protein: 19.8, fat: 6.3, carbs: 0, fiber: 0,
      vitA: 12, vitB1: 0.23, vitB2: 0.38, vitB3: 7.9, vitB5: 1.66, vitB6: 0.64, vitB7: 5, vitB9: 25, vitB12: 3.2, vitC: 0, vitD: 11, vitE: 3.5, vitK: 0.5,
      calcium: 12, iron: 0.8, magnesium: 29, zinc: 0.6, selenium: 36.5, potassium: 490, phosphorus: 200, copper: 0.25, manganese: 0.02, iodine: 27, chromium: null, sodium: 44,
      epa: 890, dha: 1120, ala: 90, omega6: 170, saturated: 1.0,
      choline: 78, creatine: 450, taurine: 130, coq10: null, astaxanthin: 0.4, betaCarotene: 0, lutein: 0, lycopene: 0, betaine: null, glycine: 980, collagen: null, sulforaphane: 0,
    },
  },
  {
    id: "mackerel",
    name: "Mackerel (Atlantic)",
    emoji: "\ud83d\udc1f",
    values: {
      kcal: 205, protein: 18.6, fat: 13.9, carbs: 0, fiber: 0,
      vitA: 50, vitB1: 0.18, vitB2: 0.31, vitB3: 9.1, vitB5: 0.86, vitB6: 0.4, vitB7: null, vitB9: 1, vitB12: 8.7, vitC: 0.4, vitD: 16.1, vitE: 1.5, vitK: 5,
      calcium: 12, iron: 1.6, magnesium: 76, zinc: 0.6, selenium: 44, potassium: 314, phosphorus: 217, copper: 0.07, manganese: 0.02, iodine: 45, chromium: null, sodium: 90,
      epa: 900, dha: 1400, ala: 100, omega6: 220, saturated: 3.3,
      choline: 65, creatine: 400, taurine: 100, coq10: 4.3, astaxanthin: null, betaCarotene: 0, lutein: 0, lycopene: 0, betaine: null, glycine: 890, collagen: null, sulforaphane: 0,
    },
  },
  {
    id: "sardines",
    name: "Sardines (canned, oil)",
    emoji: "\ud83d\udc1f",
    values: {
      kcal: 208, protein: 24.6, fat: 11.5, carbs: 0, fiber: 0,
      vitA: 32, vitB1: 0.08, vitB2: 0.23, vitB3: 5.2, vitB5: 0.64, vitB6: 0.17, vitB7: null, vitB9: 10, vitB12: 8.9, vitC: 0, vitD: 4.8, vitE: 2.0, vitK: 2.6,
      calcium: 382, iron: 2.9, magnesium: 39, zinc: 1.3, selenium: 52.7, potassium: 397, phosphorus: 490, copper: 0.19, manganese: 0.1, iodine: 35, chromium: null, sodium: 505,
      epa: 740, dha: 1100, ala: 60, omega6: 340, saturated: 1.5,
      choline: 75, creatine: 400, taurine: 150, coq10: 6.4, astaxanthin: null, betaCarotene: 0, lutein: 0, lycopene: 0, betaine: null, glycine: 1200, collagen: null, sulforaphane: 0,
    },
  },
  {
    id: "beefLiver",
    name: "Beef Liver",
    emoji: "\ud83e\udec0",
    values: {
      kcal: 135, protein: 20.4, fat: 3.6, carbs: 3.9, fiber: 0,
      vitA: 9442, vitB1: 0.19, vitB2: 2.76, vitB3: 13.2, vitB5: 7.17, vitB6: 1.08, vitB7: 40, vitB9: 290, vitB12: 59.3, vitC: 1.3, vitD: 1.2, vitE: 0.4, vitK: 3.1,
      calcium: 5, iron: 6.5, magnesium: 18, zinc: 4.0, selenium: 39.7, potassium: 313, phosphorus: 387, copper: 9.76, manganese: 0.31, iodine: null, chromium: null, sodium: 69,
      epa: 14, dha: 14, ala: 30, omega6: 280, saturated: 1.2,
      choline: 333, creatine: 50, taurine: 70, coq10: 3.9, astaxanthin: 0, betaCarotene: 0, lutein: 0, lycopene: 0, betaine: 5, glycine: 1140, collagen: null, sulforaphane: 0,
    },
  },
  {
    id: "eggs",
    name: "Whole Eggs",
    emoji: "\ud83e\udd5a",
    values: {
      kcal: 143, protein: 12.6, fat: 9.5, carbs: 0.7, fiber: 0,
      vitA: 160, vitB1: 0.04, vitB2: 0.46, vitB3: 0.08, vitB5: 1.53, vitB6: 0.17, vitB7: 25, vitB9: 47, vitB12: 0.89, vitC: 0, vitD: 2.0, vitE: 1.05, vitK: 0.3,
      calcium: 56, iron: 1.75, magnesium: 12, zinc: 1.29, selenium: 30.7, potassium: 138, phosphorus: 198, copper: 0.07, manganese: 0.03, iodine: 53, chromium: null, sodium: 142,
      epa: 0, dha: 36, ala: 20, omega6: 1150, saturated: 3.1,
      choline: 294, creatine: null, taurine: null, coq10: 1.2, astaxanthin: 0, betaCarotene: 10, lutein: 503, lycopene: 0, betaine: 0.3, glycine: 420, collagen: null, sulforaphane: 0,
    },
  },
  {
    id: "oysters",
    name: "Oysters (Pacific, raw)",
    emoji: "\ud83e\uddea",
    values: {
      kcal: 81, protein: 9.5, fat: 2.3, carbs: 4.9, fiber: 0,
      vitA: 8, vitB1: 0.07, vitB2: 0.23, vitB3: 2.0, vitB5: 0.5, vitB6: 0.05, vitB7: null, vitB9: 10, vitB12: 16, vitC: 8, vitD: 8, vitE: 0.9, vitK: 2,
      calcium: 44, iron: 5.1, magnesium: 22, zinc: 16.6, selenium: 77, potassium: 168, phosphorus: 162, copper: 4.5, manganese: 0.37, iodine: 160, chromium: null, sodium: 106,
      epa: 430, dha: 320, ala: 10, omega6: 40, saturated: 0.5,
      choline: 65, creatine: null, taurine: 700, coq10: null, astaxanthin: 0, betaCarotene: 0, lutein: 0, lycopene: 0, betaine: null, glycine: 740, collagen: null, sulforaphane: 0,
    },
  },
  {
    id: "beef",
    name: "Beef (grass-fed, lean)",
    emoji: "\ud83e\udd69",
    values: {
      kcal: 198, protein: 26.1, fat: 10.1, carbs: 0, fiber: 0,
      vitA: 0, vitB1: 0.05, vitB2: 0.18, vitB3: 5.4, vitB5: 0.62, vitB6: 0.6, vitB7: 2, vitB9: 6, vitB12: 2.6, vitC: 0, vitD: 0.1, vitE: 0.3, vitK: 1.5,
      calcium: 18, iron: 2.6, magnesium: 23, zinc: 4.5, selenium: 18, potassium: 318, phosphorus: 198, copper: 0.08, manganese: 0.01, iodine: null, chromium: null, sodium: 66,
      epa: 30, dha: 10, ala: 80, omega6: 250, saturated: 4.3,
      choline: 82, creatine: 350, taurine: 43, coq10: 3.1, astaxanthin: 0, betaCarotene: 0, lutein: 0, lycopene: 0, betaine: 8, glycine: 1450, collagen: null, sulforaphane: 0,
    },
  },
  {
    id: "chicken",
    name: "Chicken Breast",
    emoji: "\ud83c\udf57",
    values: {
      kcal: 165, protein: 31, fat: 3.6, carbs: 0, fiber: 0,
      vitA: 6, vitB1: 0.07, vitB2: 0.11, vitB3: 13.7, vitB5: 0.96, vitB6: 0.6, vitB7: 2, vitB9: 4, vitB12: 0.3, vitC: 0, vitD: 0.1, vitE: 0.3, vitK: 0.3,
      calcium: 15, iron: 1.0, magnesium: 29, zinc: 1.0, selenium: 27.6, potassium: 256, phosphorus: 228, copper: 0.05, manganese: 0.02, iodine: null, chromium: null, sodium: 74,
      epa: 0, dha: 0, ala: 20, omega6: 520, saturated: 1.0,
      choline: 85, creatine: 400, taurine: 18, coq10: 1.4, astaxanthin: 0, betaCarotene: 0, lutein: 0, lycopene: 0, betaine: 7, glycine: 1250, collagen: null, sulforaphane: 0,
    },
  },
  {
    id: "spinach",
    name: "Spinach (raw)",
    emoji: "\ud83e\udd6c",
    values: {
      kcal: 23, protein: 2.9, fat: 0.4, carbs: 3.6, fiber: 2.2,
      vitA: 469, vitB1: 0.08, vitB2: 0.19, vitB3: 0.72, vitB5: 0.07, vitB6: 0.2, vitB7: null, vitB9: 194, vitB12: 0, vitC: 28.1, vitD: 0, vitE: 2.0, vitK: 483,
      calcium: 99, iron: 2.7, magnesium: 79, zinc: 0.53, selenium: 1.0, potassium: 558, phosphorus: 49, copper: 0.13, manganese: 0.9, iodine: null, chromium: null, sodium: 79,
      epa: 0, dha: 0, ala: 138, omega6: 26, saturated: 0.06,
      choline: 18, creatine: null, taurine: null, coq10: null, astaxanthin: 0, betaCarotene: 5626, lutein: 12198, lycopene: 0, betaine: 550, glycine: 130, collagen: 0, sulforaphane: 0,
    },
  },
  {
    id: "kale",
    name: "Kale (raw)",
    emoji: "\ud83e\udd6c",
    values: {
      kcal: 49, protein: 4.3, fat: 0.9, carbs: 8.8, fiber: 3.6,
      vitA: 500, vitB1: 0.11, vitB2: 0.13, vitB3: 1.0, vitB5: 0.09, vitB6: 0.27, vitB7: null, vitB9: 141, vitB12: 0, vitC: 120, vitD: 0, vitE: 1.5, vitK: 817,
      calcium: 150, iron: 1.5, magnesium: 47, zinc: 0.56, selenium: 0.9, potassium: 491, phosphorus: 92, copper: 0.29, manganese: 0.66, iodine: null, chromium: null, sodium: 38,
      epa: 0, dha: 0, ala: 180, omega6: 138, saturated: 0.09,
      choline: 0.5, creatine: null, taurine: null, coq10: null, astaxanthin: 0, betaCarotene: 9990, lutein: 8198, lycopene: 0, betaine: 0.3, glycine: 130, collagen: 0, sulforaphane: 0,
    },
  },
  {
    id: "broccoli",
    name: "Broccoli (raw)",
    emoji: "\ud83e\udd66",
    values: {
      kcal: 34, protein: 2.8, fat: 0.4, carbs: 6.6, fiber: 2.6,
      vitA: 31, vitB1: 0.07, vitB2: 0.12, vitB3: 0.64, vitB5: 0.57, vitB6: 0.17, vitB7: null, vitB9: 63, vitB12: 0, vitC: 89.2, vitD: 0, vitE: 0.8, vitK: 102,
      calcium: 47, iron: 0.7, magnesium: 21, zinc: 0.41, selenium: 2.5, potassium: 316, phosphorus: 66, copper: 0.05, manganese: 0.21, iodine: null, chromium: null, sodium: 33,
      epa: 0, dha: 0, ala: 21, omega6: 17, saturated: 0.04,
      choline: 19, creatine: null, taurine: null, coq10: null, astaxanthin: 0, betaCarotene: 361, lutein: 1403, lycopene: 0, betaine: null, glycine: 120, collagen: 0, sulforaphane: 29,
    },
  },
  {
    id: "sweetPotato",
    name: "Sweet Potato (baked)",
    emoji: "\ud83c\udf60",
    values: {
      kcal: 90, protein: 2.0, fat: 0.1, carbs: 20.7, fiber: 3.3,
      vitA: 961, vitB1: 0.11, vitB2: 0.11, vitB3: 1.5, vitB5: 0.88, vitB6: 0.29, vitB7: null, vitB9: 6, vitB12: 0, vitC: 19.6, vitD: 0, vitE: 0.7, vitK: 2.3,
      calcium: 38, iron: 0.7, magnesium: 27, zinc: 0.3, selenium: 0.2, potassium: 475, phosphorus: 54, copper: 0.16, manganese: 0.5, iodine: null, chromium: null, sodium: 36,
      epa: 0, dha: 0, ala: 0, omega6: 10, saturated: 0.02,
      choline: 13, creatine: null, taurine: null, coq10: null, astaxanthin: 0, betaCarotene: 11509, lutein: 0, lycopene: 0, betaine: 35, glycine: 50, collagen: 0, sulforaphane: 0,
    },
  },
  {
    id: "blueberries",
    name: "Blueberries",
    emoji: "\ud83e\uded0",
    values: {
      kcal: 57, protein: 0.7, fat: 0.3, carbs: 14.5, fiber: 2.4,
      vitA: 3, vitB1: 0.04, vitB2: 0.04, vitB3: 0.42, vitB5: 0.12, vitB6: 0.05, vitB7: null, vitB9: 6, vitB12: 0, vitC: 9.7, vitD: 0, vitE: 0.6, vitK: 19.3,
      calcium: 6, iron: 0.28, magnesium: 6, zinc: 0.16, selenium: 0.1, potassium: 77, phosphorus: 12, copper: 0.06, manganese: 0.34, iodine: null, chromium: null, sodium: 1,
      epa: 0, dha: 0, ala: 58, omega6: 80, saturated: 0.03,
      choline: 6, creatine: null, taurine: null, coq10: null, astaxanthin: 0, betaCarotene: 32, lutein: 80, lycopene: 0, betaine: 0.2, glycine: 20, collagen: 0, sulforaphane: 0,
    },
  },
  {
    id: "almonds",
    name: "Almonds",
    emoji: "\ud83e\udd5c",
    values: {
      kcal: 579, protein: 21.2, fat: 49.9, carbs: 21.7, fiber: 12.5,
      vitA: 0, vitB1: 0.2, vitB2: 1.14, vitB3: 3.6, vitB5: 0.47, vitB6: 0.14, vitB7: null, vitB9: 44, vitB12: 0, vitC: 0, vitD: 0, vitE: 25.6, vitK: 0,
      calcium: 269, iron: 3.7, magnesium: 270, zinc: 3.1, selenium: 4.1, potassium: 733, phosphorus: 481, copper: 1.03, manganese: 2.18, iodine: 2, chromium: null, sodium: 1,
      epa: 0, dha: 0, ala: 6, omega6: 12320, saturated: 3.8,
      choline: 52, creatine: null, taurine: null, coq10: null, astaxanthin: 0, betaCarotene: 1, lutein: 1, lycopene: 0, betaine: 0.5, glycine: 1430, collagen: 0, sulforaphane: 0,
    },
  },
  {
    id: "avocado",
    name: "Avocado",
    emoji: "\ud83e\udd51",
    values: {
      kcal: 160, protein: 2.0, fat: 14.7, carbs: 8.5, fiber: 6.7,
      vitA: 7, vitB1: 0.07, vitB2: 0.13, vitB3: 1.74, vitB5: 1.39, vitB6: 0.26, vitB7: null, vitB9: 81, vitB12: 0, vitC: 10, vitD: 0, vitE: 2.1, vitK: 21,
      calcium: 12, iron: 0.55, magnesium: 29, zinc: 0.64, selenium: 0.4, potassium: 485, phosphorus: 52, copper: 0.19, manganese: 0.14, iodine: null, chromium: null, sodium: 7,
      epa: 0, dha: 0, ala: 110, omega6: 1680, saturated: 2.1,
      choline: 14, creatine: null, taurine: null, coq10: null, astaxanthin: 0, betaCarotene: 62, lutein: 271, lycopene: 0, betaine: 0.7, glycine: 100, collagen: 0, sulforaphane: 0,
    },
  },
  {
    id: "lentils",
    name: "Lentils (cooked)",
    emoji: "\ud83e\uded8",
    values: {
      kcal: 116, protein: 9.0, fat: 0.4, carbs: 20.1, fiber: 7.9,
      vitA: 0, vitB1: 0.17, vitB2: 0.07, vitB3: 1.1, vitB5: 0.64, vitB6: 0.18, vitB7: null, vitB9: 181, vitB12: 0, vitC: 1.5, vitD: 0, vitE: 0.1, vitK: 1.7,
      calcium: 19, iron: 3.3, magnesium: 36, zinc: 1.27, selenium: 2.8, potassium: 369, phosphorus: 180, copper: 0.25, manganese: 0.49, iodine: null, chromium: null, sodium: 2,
      epa: 0, dha: 0, ala: 8, omega6: 90, saturated: 0.06,
      choline: 33, creatine: null, taurine: null, coq10: null, astaxanthin: 0, betaCarotene: 5, lutein: 0, lycopene: 0, betaine: null, glycine: 390, collagen: 0, sulforaphane: 0,
    },
  },
  {
    id: "darkChocolate",
    name: "Dark Chocolate (85%)",
    emoji: "\ud83c\udf6b",
    values: {
      kcal: 598, protein: 7.8, fat: 42.6, carbs: 46, fiber: 11,
      vitA: 2, vitB1: 0.03, vitB2: 0.08, vitB3: 1.1, vitB5: 0.4, vitB6: 0.04, vitB7: null, vitB9: 15, vitB12: 0.2, vitC: 0, vitD: 0, vitE: 0.6, vitK: 7.2,
      calcium: 73, iron: 11.9, magnesium: 228, zinc: 3.3, selenium: 6.8, potassium: 715, phosphorus: 308, copper: 1.77, manganese: 1.95, iodine: null, chromium: null, sodium: 20,
      epa: 0, dha: 0, ala: 0, omega6: 570, saturated: 24.5,
      choline: null, creatine: null, taurine: null, coq10: null, astaxanthin: 0, betaCarotene: 18, lutein: 0, lycopene: 0, betaine: null, glycine: 150, collagen: 0, sulforaphane: 0,
    },
  },
  {
    id: "boneBroth",
    name: "Bone Broth (beef)",
    emoji: "\ud83c\udf56",
    values: {
      kcal: 17, protein: 3.5, fat: 0.1, carbs: 0, fiber: 0,
      vitA: 0, vitB1: 0, vitB2: 0.02, vitB3: 0.4, vitB5: 0.1, vitB6: 0.02, vitB7: null, vitB9: 2, vitB12: 0.1, vitC: 0, vitD: 0, vitE: 0, vitK: 0,
      calcium: 14, iron: 0.4, magnesium: 5, zinc: 0.2, selenium: 1.5, potassium: 60, phosphorus: 22, copper: 0.02, manganese: 0.01, iodine: null, chromium: null, sodium: 200,
      epa: 0, dha: 0, ala: 0, omega6: 0, saturated: 0,
      choline: 5, creatine: null, taurine: null, coq10: null, astaxanthin: 0, betaCarotene: 0, lutein: 0, lycopene: 0, betaine: null, glycine: 1200, collagen: 3500, sulforaphane: 0,
    },
  },
  {
    id: "tomato",
    name: "Tomato (raw)",
    emoji: "\ud83c\udf45",
    values: {
      kcal: 18, protein: 0.9, fat: 0.2, carbs: 3.9, fiber: 1.2,
      vitA: 42, vitB1: 0.04, vitB2: 0.02, vitB3: 0.6, vitB5: 0.09, vitB6: 0.08, vitB7: null, vitB9: 15, vitB12: 0, vitC: 14, vitD: 0, vitE: 0.5, vitK: 7.9,
      calcium: 10, iron: 0.3, magnesium: 11, zinc: 0.17, selenium: 0, potassium: 237, phosphorus: 24, copper: 0.06, manganese: 0.11, iodine: null, chromium: null, sodium: 5,
      epa: 0, dha: 0, ala: 3, omega6: 80, saturated: 0.03,
      choline: 6.7, creatine: null, taurine: null, coq10: null, astaxanthin: 0, betaCarotene: 449, lutein: 123, lycopene: 2573, betaine: null, glycine: 20, collagen: 0, sulforaphane: 0,
    },
  },
  {
    id: "greekYogurt",
    name: "Greek Yogurt (full-fat)",
    emoji: "\ud83e\udd5b",
    values: {
      kcal: 97, protein: 9.0, fat: 5.0, carbs: 3.6, fiber: 0,
      vitA: 26, vitB1: 0.02, vitB2: 0.28, vitB3: 0.21, vitB5: 0.33, vitB6: 0.06, vitB7: 3, vitB9: 7, vitB12: 0.75, vitC: 0, vitD: 0.1, vitE: 0.1, vitK: 0.4,
      calcium: 100, iron: 0.1, magnesium: 11, zinc: 0.52, selenium: 9.7, potassium: 141, phosphorus: 135, copper: 0.02, manganese: 0.01, iodine: 35, chromium: null, sodium: 47,
      epa: 0, dha: 0, ala: 30, omega6: 70, saturated: 3.2,
      choline: 15, creatine: null, taurine: null, coq10: null, astaxanthin: 0, betaCarotene: 3, lutein: 0, lycopene: 0, betaine: null, glycine: 100, collagen: null, sulforaphane: 0,
    },
  },

  // ---------------------------------------------------------------------------
  // Packaged products Tudor actually eats (added 2026-10-20 from pack photos).
  // Macros, salt and anything named in `notes` as "label" are transcribed from
  // the EU nutrition panel (per 100 g). Micros are NOT on the pack: they are
  // USDA SR Legacy proxies scaled by the ingredient fractions on the label
  // (formula in `notes`). sodium = salt × 400. null = unknown, don't guess.
  // Full provenance per item: body-os data/food/foods.yaml.
  // ---------------------------------------------------------------------------
  {
    id: "sanovitaTofuMasline",
    name: "SanoVita Tofu Măsline",
    emoji: "🧈",
    brand: "SanoVita",
    ean: "5941882803226",
    packageG: 200,
    source: "label+estimated",
    confidence: "moderate",
    notes: "Label: kcal, protein, fat, carbs, fiber, saturated, sodium (salt 1.5 g), magnesium 120 mg, omega6 (linoleic 7.1 g). Vegan; soy; MgCl2-coagulated (no calcium salt), olives 12%. Micros = USDA 'tofu, firm' ×1.0 (protein 17.3 ≈ 17.6) + 0.12 × USDA ripe olives. Calcium LOW confidence (nigari-only tofu, range 150–350). Label fat 14.8 g is ~5 g above what soy + olives explain — kept as printed.",
    values: {
      kcal: 207, protein: 17.6, fat: 14.8, carbs: 0, fiber: 1.7,
      vitA: 2, vitB1: 0.16, vitB2: 0.10, vitB3: 0.4, vitB5: 0.13, vitB6: 0.09, vitB7: null, vitB9: 29, vitB12: 0, vitC: 0, vitD: 0, vitE: 0.3, vitK: 2.4,
      calcium: 200, iron: 3.1, magnesium: 120, zinc: 1.6, selenium: 17, potassium: 240, phosphorus: 190, copper: 0.4, manganese: 1.2, iodine: null, chromium: null, sodium: 600,
      epa: 0, dha: 0, ala: 600, omega6: 7100, saturated: 2.2,
      choline: 28, creatine: 0, taurine: 0, coq10: null, astaxanthin: 0, betaCarotene: 10, lutein: 0, lycopene: 0, betaine: null, glycine: 740, collagen: 0, sulforaphane: 0,
    },
  },
  {
    id: "bornWinnerSlimChocHazelnut",
    name: "Born Winner Slim 50% bar — Chocolate & Hazelnut",
    emoji: "🍫",
    brand: "Born Winner",
    packageG: 50,
    source: "label+estimated",
    confidence: "low",
    vegetarian: false,
    notes: "NOT vegetarian: hydrolysed bovine gelatine. Label: kcal, protein, fat, carbs 29 (of which polyols 27, sugars 1.3), fiber, saturated, sodium (salt 0.55 g). Ingredients (sezamo.ro, 60 g SKU, same recipe): milk protein, whey concentrate, soy protein isolate, sorbitol, gelatine, maltitol cocoa coating 10%, palm/shea fats, sunflower oil, cocoa 2%. Protein-blend ratio undisclosed, so every mineral here is a placeholder: calcium assumes ~half the protein is milk-protein concentrate (range 200–800). Collagen (from gelatine) present, amount unknown.",
    values: {
      kcal: 370, protein: 50, fat: 10.6, carbs: 29, fiber: 0.5,
      vitA: null, vitB1: null, vitB2: 0.3, vitB3: null, vitB5: null, vitB6: null, vitB7: null, vitB9: null, vitB12: 0.5, vitC: 0, vitD: 0, vitE: null, vitK: null,
      calcium: 400, iron: 2, magnesium: 50, zinc: 1.5, selenium: null, potassium: 300, phosphorus: 400, copper: null, manganese: null, iodine: null, chromium: null, sodium: 220,
      epa: 0, dha: 0, ala: null, omega6: null, saturated: 4.3,
      choline: null, creatine: null, taurine: null, coq10: null, astaxanthin: 0, betaCarotene: 0, lutein: 0, lycopene: 0, betaine: null, glycine: null, collagen: null, sulforaphane: 0,
    },
  },
  {
    id: "joxtyProteinChipsChilliLime",
    name: "Joxty Protein Chips Chilli & Lime",
    emoji: "🌶️",
    brand: "Joxty (Enjoy Chips Agricola, IT)",
    packageG: 50,
    source: "label+estimated",
    confidence: "low",
    notes: "Label: kcal, protein, fat, carbs, fiber, saturated, sodium (salt 2.2 g). Vegan, gluten-free; soy. Ingredients: potato granules 28%, potato starch, soy protein 20%, sunflower oil, flavouring 4%, salt. Minerals = 0.28 × USDA dehydrated potato flakes + 0.20 × USDA soy protein isolate (SPI iron varies 10–15 mg, so iron is a guess). Vit E and omega-6 treat all 26 g fat as sunflower oil (~41 mg α-TE, ~60% linoleic per 100 g oil) — vit E is the one notable micro here. Vit C assumes heavy frying loss.",
    values: {
      kcal: 496, protein: 22, fat: 26, carbs: 44, fiber: 2.0,
      vitA: 0, vitB1: null, vitB2: null, vitB3: 1.7, vitB5: null, vitB6: 0.2, vitB7: null, vitB9: 40, vitB12: 0, vitC: 5, vitD: 0, vitE: 10, vitK: null,
      calcium: 45, iron: 3.2, magnesium: 30, zinc: 1.0, selenium: null, potassium: 320, phosphorus: 205, copper: 0.4, manganese: 0.4, iodine: null, chromium: null, sodium: 880,
      epa: 0, dha: 0, ala: 50, omega6: 15600, saturated: 3.0,
      choline: 45, creatine: 0, taurine: 0, coq10: null, astaxanthin: 0, betaCarotene: null, lutein: 0, lycopene: 0, betaine: null, glycine: 900, collagen: 0, sulforaphane: 0,
    },
  },
  {
    id: "veraMiniKorniszony",
    name: "Vera mini korniszony (cornichons, sweet-sour)",
    emoji: "🥒",
    brand: "Vera (PL)",
    ean: "5904378641320",
    packageG: 350,
    source: "estimated",
    confidence: "low",
    notes: "Nutrition panel not on the photographed face — EVERYTHING estimated. Ingredients: cucumbers 53%, water, sugar (3rd!), salt, acetic acid, red pepper, spices 0.52% (mustard, dill, pepper), onion. Proxy: Polish 'korniszony z przyprawami' listings (35–41 kcal, 4.5–5 g sugar) + USDA 'pickles, cucumber, sweet' for minerals/vit K. Replace with the pack's own panel when photographed; at 25 g the error is <5 kcal.",
    values: {
      kcal: 35, protein: 0.8, fat: 0.2, carbs: 6, fiber: 1.0,
      vitA: 5, vitB1: null, vitB2: null, vitB3: null, vitB5: null, vitB6: null, vitB7: null, vitB9: null, vitB12: 0, vitC: 1, vitD: 0, vitE: null, vitK: 20,
      calcium: 30, iron: 0.3, magnesium: 8, zinc: null, selenium: null, potassium: 120, phosphorus: null, copper: null, manganese: null, iodine: null, chromium: null, sodium: 720,
      epa: 0, dha: 0, ala: null, omega6: null, saturated: 0,
      choline: null, creatine: 0, taurine: 0, coq10: null, astaxanthin: 0, betaCarotene: null, lutein: null, lycopene: 0, betaine: null, glycine: null, collagen: 0, sulforaphane: 0,
    },
  },
  {
    id: "ribellaHummusCaramelizedGarlic",
    name: "Ribella Hummus Caramelized Garlic",
    emoji: "🫘",
    brand: "Ribella (RS)",
    ean: "8606011893543",
    packageG: 200,
    source: "label+estimated",
    confidence: "moderate",
    notes: "Label: kcal, protein, fat, carbs, fiber, saturated, sodium (salt 0.9 g). Vegan, gluten-free; sesame. Chickpeas 68%, rapeseed+olive oil, tahini, caramelised garlic 8%. Micros = USDA 'hummus, commercial' unscaled (237 kcal / 17.8 g fat / 5.4 g fiber — close match); label protein 5 g vs proxy 7.8 g, so chickpea-derived minerals may run ~20% high. Fatty acids from ~12 g oils + ~4 g tahini fat.",
    values: {
      kcal: 240, protein: 5, fat: 18.5, carbs: 11, fiber: 5,
      vitA: 1, vitB1: 0.1, vitB2: 0.06, vitB3: 0.6, vitB5: null, vitB6: 0.2, vitB7: null, vitB9: 80, vitB12: 0, vitC: 0, vitD: 0, vitE: 2.5, vitK: 10,
      calcium: 40, iron: 2.4, magnesium: 70, zinc: 1.8, selenium: 2.6, potassium: 230, phosphorus: 175, copper: 0.5, manganese: 0.8, iodine: null, chromium: null, sodium: 360,
      epa: 0, dha: 0, ala: 700, omega6: 4400, saturated: 2,
      choline: 30, creatine: 0, taurine: 0, coq10: null, astaxanthin: 0, betaCarotene: null, lutein: null, lycopene: 0, betaine: null, glycine: 200, collagen: 0, sulforaphane: 0,
    },
  },
  {
    id: "starPopcornCascaval",
    name: "Star Popcorn cu gust de cașcaval",
    emoji: "🍿",
    brand: "Star (RO)",
    packageG: 80,
    source: "label+estimated",
    confidence: "moderate",
    notes: "Label: kcal, protein, fat, carbs, fiber, saturated, sodium (salt 2.0 g), trans fat 0.10 g. Vegetarian; milk (cheese powder 1.6%, milk powder, lactose); MSG/guanylate/inosinate; iodised salt (iodine present, amount unknown). Corn fraction = label carbs 51 / air-popped 77.8 = 0.66; minerals, B-vitamins, lutein = 0.66 × USDA 'popcorn, air-popped'. Vit E/K and fatty acids from ~21 g rapeseed oil.",
    values: {
      kcal: 473, protein: 10.3, fat: 23, carbs: 51, fiber: 10.2,
      vitA: 2, vitB1: 0.07, vitB2: null, vitB3: 1.5, vitB5: 0.28, vitB6: 0.1, vitB7: null, vitB9: 20, vitB12: 0, vitC: 0, vitD: 0, vitE: 4, vitK: 15,
      calcium: 20, iron: 2.1, magnesium: 95, zinc: 2.0, selenium: null, potassium: 220, phosphorus: 235, copper: 0.17, manganese: 0.7, iodine: null, chromium: null, sodium: 800,
      epa: 0, dha: 0, ala: 1900, omega6: 4800, saturated: 1.9,
      choline: null, creatine: 0, taurine: 0, coq10: null, astaxanthin: 0, betaCarotene: null, lutein: 960, lycopene: 0, betaine: null, glycine: 410, collagen: 0, sulforaphane: 0,
    },
  },
  // added 2026-10-21
  {
    id: "ribellaHummusItaliano",
    name: "Ribella Hummus Italiano (Tomato & Garlic)",
    emoji: "🫘",
    brand: "Ribella (RS)",
    packageG: 200,
    source: "label+estimated",
    confidence: "moderate",
    notes: "Label: kcal 231, protein 5, fat 18.7 (sat 1.7), carbs 9.3 (sugars 3), fiber 3.2, sodium (salt 1.3 g). Vegan, gluten-free; sesame. Chickpeas 66%, rapeseed+olive oil, vegetables (carrot, onion), tahini, tomato powder 2%, sugar, garlic powder 1.5%. Micros = USDA 'hummus, commercial' ×0.95 (chickpea share slightly below the caramelized-garlic SKU) + 0.02 × USDA tomato powder (lycopene ~46 mg/100 g → ~900 µg; K, vit C, β-carotene). Fatty acids from ~12 g oils + ~4 g tahini fat.",
    values: {
      kcal: 231, protein: 5, fat: 18.7, carbs: 9.3, fiber: 3.2,
      vitA: 5, vitB1: 0.1, vitB2: 0.06, vitB3: 0.6, vitB5: null, vitB6: 0.2, vitB7: null, vitB9: 76, vitB12: 0, vitC: 2, vitD: 0, vitE: 2.5, vitK: 10,
      calcium: 40, iron: 2.3, magnesium: 68, zinc: 1.7, selenium: 2.5, potassium: 260, phosphorus: 170, copper: 0.5, manganese: 0.8, iodine: null, chromium: null, sodium: 520,
      epa: 0, dha: 0, ala: 700, omega6: 4400, saturated: 1.7,
      choline: 29, creatine: 0, taurine: 0, coq10: null, astaxanthin: 0, betaCarotene: 50, lutein: null, lycopene: 900, betaine: null, glycine: 200, collagen: 0, sulforaphane: 0,
    },
  },
  {
    id: "powerBitesDatesHazelnut",
    name: "Power Bites — Dates & Hazelnuts, coconut coated",
    emoji: "🥥",
    brand: "Power Bites (TR; imp. Global Net Grid Pro, RO)",
    ean: "8697950816670",
    packageG: 96,
    source: "label+estimated",
    confidence: "moderate",
    notes: "Label: kcal 433, protein 6.71, fat 17.44 (sat 5.86), carbs 57.74 (sugars 42.81 — all from dates, no added sugar), fiber 9.26, sodium (salt 0.21 g). Vegan, gluten-free; hazelnuts; may contain pistachio, peanut, almond, other nuts. Dates 65% (Saudi), hazelnuts 16%, cocoa mass 7%, coconut 5%, chickpea flour, sea salt. Micros = 0.65 × USDA dates (deglet noor) + 0.16 × USDA hazelnuts + 0.07 × cocoa mass (unsweetened baking chocolate) + 0.05 × dried coconut. Hazelnuts drive vit E, Mn, Cu; cocoa drives Mg, Fe. ~43 g sugar/100 g: one 96 g pack is ~41 g sugar and ~416 kcal.",
    values: {
      kcal: 433, protein: 6.71, fat: 17.44, carbs: 57.74, fiber: 9.26,
      vitA: 1, vitB1: 0.14, vitB2: 0.07, vitB3: 1.4, vitB5: 0.7, vitB6: 0.22, vitB7: null, vitB9: 31, vitB12: 0, vitC: 1, vitD: 0, vitE: 2.5, vitK: 4,
      calcium: 56, iron: 2.5, magnesium: 98, zinc: 1.2, selenium: 1, potassium: 636, phosphorus: 124, copper: 0.72, manganese: 1.6, iodine: null, chromium: null, sodium: 84,
      epa: 0, dha: 0, ala: 14, omega6: 1300, saturated: 5.86,
      choline: 14, creatine: 0, taurine: 0, coq10: null, astaxanthin: 0, betaCarotene: 5, lutein: 65, lycopene: 0, betaine: null, glycine: 300, collagen: 0, sulforaphane: 0,
    },
  },
  {
    id: "bornWinner35CookiesCream",
    name: "Born Winner High Protein 35% bar — Cookies & Cream",
    emoji: "🍪",
    brand: "Born Winner (made in Italy)",
    ean: "5060961650404",
    packageG: 75,
    source: "label+estimated",
    confidence: "low",
    vegetarian: false,
    notes: "NOT vegetarian: hydrolysed bovine collagen. Label (per 100 g; 75 g bar = 250 kcal / 26 g protein): kcal 334, protein 35, fat 11 (sat 5.2), carbs 37 (polyols 33, sugars 2.1), fiber 0.4, sodium (salt 0.12 g). Milk, soy; may contain gluten, egg, peanut, almond, hazelnut. Ingredients: protein blend (milk protein, whey protein concentrate), maltitol, sorbitol, milk coating 12% (maltitol, palm/palm-kernel/shea fats, fat-reduced cocoa 0.4%, sweet whey powder 1%, skimmed milk powder 0.5%, lecithins), sunflower oil, hydrolysed bovine collagen, flavouring, soy protein isolate. Milk protein dominant, so calcium/phosphorus are higher than the 50% hazelnut bar but the blend ratio is undisclosed — placeholders (Ca range 300–900). Collagen present, amount undisclosed. 33 g polyols/100 g → 25 g per bar; the pack itself warns of laxative effect.",
    values: {
      kcal: 334, protein: 35, fat: 11, carbs: 37, fiber: 0.4,
      vitA: 10, vitB1: null, vitB2: 0.4, vitB3: null, vitB5: null, vitB6: null, vitB7: null, vitB9: null, vitB12: 0.6, vitC: 0, vitD: 0, vitE: null, vitK: null,
      calcium: 500, iron: 0.5, magnesium: 40, zinc: 1.5, selenium: null, potassium: 250, phosphorus: 450, copper: null, manganese: null, iodine: null, chromium: null, sodium: 48,
      epa: 0, dha: 0, ala: null, omega6: null, saturated: 5.2,
      choline: null, creatine: null, taurine: null, coq10: null, astaxanthin: 0, betaCarotene: 0, lutein: 0, lycopene: 0, betaine: null, glycine: null, collagen: null, sulforaphane: 0,
    },
  },
  {
    id: "sanovitaMusliMerisoare",
    name: "SanoVita Müsli Merișoare (cranberry muesli)",
    emoji: "🥣",
    brand: "SanoVita",
    packageG: 400,
    source: "label+estimated",
    confidence: "moderate",
    notes: "Label: kcal 374, protein 9.28, fat 9.23 (sat 3.59), carbs 59.6 (sugars 20.0), fiber 7.92, sodium (salt 0.21 g), magnesium 67.8 mg, thiamin 0.22 mg, iron 3.73 mg. Serving 60 g (≈224 kcal, 12 g sugar). Vegan by ingredients; contains gluten (oat, wheat, barley malt), sulphites; may contain milk, sesame, soy, nuts, peanuts, mustard. Whole-grain flakes 52% (oat, wheat), raisins 13.5% (sunflower oil, SO2), candied cranberries 12% (cranberry, sugar, oil), corn flakes 7%, coconut flakes, date cubes 5%, sunflower seeds 3%, bran wheat flakes (iodised salt). Micros = 0.52 × mean(USDA rolled oats, wheat flakes) + 0.135 × raisins + 0.05 × dates + 0.03 × sunflower kernels + ~0.05 × dried coconut; candied cranberry and corn flakes contribute ~nothing. Sat fat 3.59 is mostly the coconut. Iodised salt → iodine present, amount unknown.",
    values: {
      kcal: 374, protein: 9.28, fat: 9.23, carbs: 59.6, fiber: 7.92,
      vitA: 0, vitB1: 0.22, vitB2: 0.07, vitB3: 1.2, vitB5: 0.6, vitB6: 0.12, vitB7: null, vitB9: 30, vitB12: 0, vitC: 0, vitD: 0, vitE: 1.5, vitK: 2,
      calcium: 35, iron: 3.73, magnesium: 67.8, zinc: 2.0, selenium: 15, potassium: 350, phosphorus: 270, copper: 0.4, manganese: 2.3, iodine: null, chromium: null, sodium: 84,
      epa: 0, dha: 0, ala: 50, omega6: 2000, saturated: 3.59,
      choline: 15, creatine: 0, taurine: 0, coq10: null, astaxanthin: 0, betaCarotene: 0, lutein: 95, lycopene: 0, betaine: 20, glycine: 450, collagen: 0, sulforaphane: 0,
    },
  },
  {
    id: "parmesanAged",
    name: "Parmesan, aged (hard)",
    emoji: "🧀",
    source: "usda",
    confidence: "high",
    vegetarian: false,
    notes: "USDA SR Legacy 01032 'Cheese, parmesan, hard' — generic, no pack. Sodium varies 1,200–1,800 mg by producer and age; grated is higher. NOT vegetarian in the strict sense: Parmigiano Reggiano / Grana Padano are made with calf rennet by law; most products sold as 'parmesan' in RO are too unless labelled vegetable rennet. Iodine present but variable — left null.",
    values: {
      kcal: 392, protein: 35.8, fat: 25.8, carbs: 3.2, fiber: 0,
      vitA: 201, vitB1: 0.04, vitB2: 0.33, vitB3: 0.27, vitB5: 0.45, vitB6: 0.09, vitB7: null, vitB9: 7, vitB12: 1.2, vitC: 0, vitD: 0.5, vitE: 0.22, vitK: 1.7,
      calcium: 1184, iron: 0.82, magnesium: 44, zinc: 2.75, selenium: 22.5, potassium: 92, phosphorus: 694, copper: 0.32, manganese: 0.02, iodine: null, chromium: null, sodium: 1602,
      epa: 0, dha: 0, ala: 100, omega6: 380, saturated: 16.4,
      choline: 15, creatine: 0, taurine: 0, coq10: null, astaxanthin: 0, betaCarotene: 0, lutein: 0, lycopene: 0, betaine: 0, glycine: 630, collagen: 0, sulforaphane: 0,
    },
  },
];

export function formatValue(v: number | null): string {
  if (v === null) return "\u2014";
  if (v === 0) return "0";
  if (v >= 1000) return v.toLocaleString("en-US");
  if (v < 1) return v.toFixed(2);
  if (v < 10) return v.toFixed(1);
  return Math.round(v).toString();
}

export function calcRdaPercent(value: number | null, rdaNum: number | null): number | null {
  if (value === null || rdaNum === null || rdaNum === 0) return null;
  return (value / rdaNum) * 100;
}
