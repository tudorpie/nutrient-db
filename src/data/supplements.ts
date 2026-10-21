// Supplements and pharmaceuticals. Dosed PER UNIT (capsule / tablet), not per 100 g.
// `values` uses the nutrient ids from nutrients.ts so a daily total can add them to food.
// `actives` holds compounds the nutrient table has no column for.
// Everything here is label-transcribed; nothing is estimated.

export type SupplementKind = "supplement" | "pharmaceutical";

export interface Supplement {
  id: string;
  name: string;
  brand: string;
  kind: SupplementKind;
  unit: "capsule" | "tablet";
  unitsPerPack?: number;
  ean?: string;
  /** Per unit, keyed by nutrient id from nutrients.ts. */
  values: Record<string, number>;
  /** Per unit, compounds not in the nutrient table. mg unless stated. */
  actives: { name: string; amountMg: number; note?: string }[];
  notes?: string;
}

export const supplements: Supplement[] = [
  {
    id: "allaesNacGlycine",
    name: "NAC + Glycine",
    brand: "Allaes",
    kind: "supplement",
    unit: "capsule",
    ean: "5907852065285",
    values: { glycine: 333 },
    actives: [{ name: "N-Acetyl Cysteine", amountMg: 333 }],
    notes: "1 capsule = 333 mg L-glycine + 333 mg NAC. Label: no starch, milk, lactose, soy, gluten, wheat, yeast, fish. Exp 31.05.2028, batch 403068.",
  },
  {
    id: "allaesLionsMane",
    name: "Lion's Mane",
    brand: "Allaes",
    kind: "supplement",
    unit: "capsule",
    ean: "5907852065179",
    values: {},
    actives: [
      {
        name: "Hericium erinaceus fruiting-body extract 4:1",
        amountMg: 666.7,
        note: "standardised min 30% polysaccharides, min 5% beta-glucan; ≈2.7 g dried mushroom equivalent",
      },
    ],
    notes: "Exp 31.05.2028, batch 403076. Same excipient-free claims as the NAC product.",
  },
  {
    id: "wfm365Alcar",
    name: "Acetyl L-Carnitine 500 mg",
    brand: "365 by Whole Foods Market",
    kind: "supplement",
    unit: "tablet",
    unitsPerPack: 100,
    values: {},
    actives: [{ name: "Acetyl L-Carnitine (as ALCAR HCl)", amountMg: 500 }],
    notes: "Vegan tablet. Other ingredients: microcrystalline cellulose, stearic acid, dicalcium phosphate, tricalcium phosphate, silicon dioxide, hypromellose/CMC coating, croscarmellose sodium. Directions: 1 tablet 1–2×/day. Calcium phosphate excipients contribute a few mg Ca/P — not counted.",
  },
  {
    id: "vitCZincD3Blister",
    name: "Vitamina C 1000 mg + Zinc 25 mg + D3 4000 UI",
    brand: "Fiterman Pharma (RO) — logo partly visible, confirm",
    kind: "supplement",
    unit: "tablet",
    values: { vitC: 1000, zinc: 25, vitD: 100 },
    actives: [],
    notes: "1 tablet = 1000 mg vitamin C, 25 mg zinc (form not shown), 4000 IU (100 µg) D3. Blister only photographed — box/leaflet needed for excipients and zinc salt. Exp 10/2030 printed on blister edge.",
  },
  {
    id: "driadaModafinil100",
    name: "Modafinil 100 mg",
    brand: "Driada Medical (Modus)",
    kind: "pharmaceutical",
    unit: "tablet",
    values: {},
    actives: [{ name: "Modafinil", amountMg: 100 }],
    notes: "Prescription-only drug, not a nutrient; included so intake can be logged alongside supplements. Grey-market source — no leaflet, no excipient list, no batch verification possible from the blister.",
  },
];
