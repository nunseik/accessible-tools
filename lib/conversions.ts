export type UnitCategory = "cooking" | "length" | "weight" | "temperature" | "volume";

export interface UnitDef {
  label: string;
  symbol: string;
  toBase: (v: number) => number;
  fromBase: (v: number) => number;
}

export interface CategoryDef {
  label: string;
  units: Record<string, UnitDef>;
}

export const CATEGORIES: Record<UnitCategory, CategoryDef> = {
  cooking: {
    label: "Cooking",
    units: {
      tsp:  { label: "Teaspoon",    symbol: "tsp",  toBase: v => v * 4.92892, fromBase: v => v / 4.92892 },
      tbsp: { label: "Tablespoon",  symbol: "tbsp", toBase: v => v * 14.7868, fromBase: v => v / 14.7868 },
      cup:  { label: "Cup",         symbol: "cup",  toBase: v => v * 236.588, fromBase: v => v / 236.588 },
      floz: { label: "Fl. Ounce",   symbol: "fl oz",toBase: v => v * 29.5735, fromBase: v => v / 29.5735 },
      ml:   { label: "Milliliter",  symbol: "ml",   toBase: v => v,           fromBase: v => v },
      l:    { label: "Liter",       symbol: "L",    toBase: v => v * 1000,    fromBase: v => v / 1000 },
      pt:   { label: "Pint",        symbol: "pt",   toBase: v => v * 473.176, fromBase: v => v / 473.176 },
      qt:   { label: "Quart",       symbol: "qt",   toBase: v => v * 946.353, fromBase: v => v / 946.353 },
    },
  },
  length: {
    label: "Length",
    units: {
      mm:  { label: "Millimeter", symbol: "mm", toBase: v => v,         fromBase: v => v },
      cm:  { label: "Centimeter", symbol: "cm", toBase: v => v * 10,    fromBase: v => v / 10 },
      m:   { label: "Meter",      symbol: "m",  toBase: v => v * 1000,  fromBase: v => v / 1000 },
      km:  { label: "Kilometer",  symbol: "km", toBase: v => v * 1e6,   fromBase: v => v / 1e6 },
      in:  { label: "Inch",       symbol: "in", toBase: v => v * 25.4,  fromBase: v => v / 25.4 },
      ft:  { label: "Foot",       symbol: "ft", toBase: v => v * 304.8, fromBase: v => v / 304.8 },
      yd:  { label: "Yard",       symbol: "yd", toBase: v => v * 914.4, fromBase: v => v / 914.4 },
      mi:  { label: "Mile",       symbol: "mi", toBase: v => v * 1.609e6, fromBase: v => v / 1.609e6 },
    },
  },
  weight: {
    label: "Weight",
    units: {
      g:   { label: "Gram",       symbol: "g",  toBase: v => v,         fromBase: v => v },
      kg:  { label: "Kilogram",   symbol: "kg", toBase: v => v * 1000,  fromBase: v => v / 1000 },
      mg:  { label: "Milligram",  symbol: "mg", toBase: v => v / 1000,  fromBase: v => v * 1000 },
      oz:  { label: "Ounce",      symbol: "oz", toBase: v => v * 28.3495, fromBase: v => v / 28.3495 },
      lb:  { label: "Pound",      symbol: "lb", toBase: v => v * 453.592, fromBase: v => v / 453.592 },
    },
  },
  temperature: {
    label: "Temperature",
    units: {
      c: { label: "Celsius",    symbol: "°C", toBase: v => v,                  fromBase: v => v },
      f: { label: "Fahrenheit", symbol: "°F", toBase: v => (v - 32) * 5 / 9,  fromBase: v => v * 9 / 5 + 32 },
      k: { label: "Kelvin",     symbol: "K",  toBase: v => v - 273.15,         fromBase: v => v + 273.15 },
    },
  },
  volume: {
    label: "Volume",
    units: {
      ml:  { label: "Milliliter",  symbol: "ml",  toBase: v => v,          fromBase: v => v },
      l:   { label: "Liter",       symbol: "L",   toBase: v => v * 1000,   fromBase: v => v / 1000 },
      m3:  { label: "Cubic Meter", symbol: "m³",  toBase: v => v * 1e6,    fromBase: v => v / 1e6 },
      in3: { label: "Cubic Inch",  symbol: "in³", toBase: v => v * 16.387, fromBase: v => v / 16.387 },
      ft3: { label: "Cubic Foot",  symbol: "ft³", toBase: v => v * 28316.8,fromBase: v => v / 28316.8 },
      gal: { label: "Gallon (US)", symbol: "gal", toBase: v => v * 3785.41,fromBase: v => v / 3785.41 },
    },
  },
};

export function convert(value: number, fromUnit: string, toUnit: string, category: UnitCategory): number {
  const cats = CATEGORIES[category].units;
  const from = cats[fromUnit];
  const to = cats[toUnit];
  if (!from || !to) return NaN;
  return to.fromBase(from.toBase(value));
}

export function convertAll(value: number, fromUnit: string, category: UnitCategory): Record<string, number> {
  const result: Record<string, number> = {};
  const units = CATEGORIES[category].units;
  const from = units[fromUnit];
  if (!from) return result;
  const base = from.toBase(value);
  for (const [key, unit] of Object.entries(units)) {
    if (key !== fromUnit) result[key] = unit.fromBase(base);
  }
  return result;
}

export function formatNumber(n: number): string {
  if (!isFinite(n)) return "—";
  if (n === 0) return "0";
  const abs = Math.abs(n);
  if (abs < 0.0001 || abs >= 1e7) return n.toExponential(3);
  // Snap to nearest integer if within 0.005 (handles floating point artifacts like 15.9998 → 16)
  const nearest = Math.round(n);
  if (Math.abs(n - nearest) < 0.005) return nearest.toString();
  // Otherwise limit to 4 significant decimal digits and strip trailing zeros
  return parseFloat(n.toFixed(4)).toString();
}
