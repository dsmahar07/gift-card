export interface StandardizedDenominations {
  options: number[]; // standardized options to display
  min: number; // effective min (>= 15)
  max: number; // effective max (<= 150)
}

// Base standardized ladder
const BASE = [15, 25, 50, 75, 100, 150];

/**
 * Standardize a provider's denomination definition into a common set.
 * Input can be:
 *  - fixed list: [5,10,25,50,...]
 *  - range-like: [min, max]
 */
export function standardizeDenominations(raw: number[]): StandardizedDenominations {
  if (!Array.isArray(raw) || raw.length === 0) {
    return { options: [], min: 15, max: 150 };
  }

  const isRange = raw.length === 2 && raw[0] !== raw[1];

  if (isRange) {
    const minRaw = Math.min(raw[0], raw[1]);
    const maxRaw = Math.max(raw[0], raw[1]);

    const min = Math.max(15, Math.floor(minRaw));
    const max = Math.min(150, Math.ceil(maxRaw));

    if (min > max) {
      return { options: [], min, max };
    }

    const options = BASE.filter((x) => x >= min && x <= max);
    return { options, min, max };
  }

  // Fixed list
  const fixedSorted = [...raw].filter((n) => Number.isFinite(n)).sort((a, b) => a - b);

  const within = fixedSorted.filter((x) => x >= 15 && x <= 150);
  const intersection = BASE.filter((x) => within.includes(x));

  if (intersection.length > 0) {
    return { options: intersection, min: Math.min(...within, 150), max: Math.max(...within, 15) };
  }

  // Fallback: if provider has values within range but none match base ladder,
  // pick up to 6 closest values >= 15 for display.
  const candidates = within.slice(0, 6);
  return { options: candidates, min: Math.min(...within, 150), max: Math.max(...within, 15) };
}
