/**
 * Single source of truth for figure and table numbers. Order = order of appearance.
 * Prose, chart frames and embed pages all call fig()/tab(), so inserting a figure
 * renumbers every reference at once.
 */
const FIGURES = [
  "threads",
  "cumulative",
  "deals",
  "spreads",
  "curves",
  "funding",
  "capex",
  "waterfall",
  "growth",
  "coverage",
  "depreciation",
  "mismatch",
  "gap",
  "wall",
] as const;

const TABLES = ["table-sample", "table-commitments", "table-sensitivity"] as const;

export type FigureId = (typeof FIGURES)[number];
export type TableId = (typeof TABLES)[number];

export const figNo = (id: FigureId): number => FIGURES.indexOf(id) + 1;
export const tabNo = (id: TableId): number => TABLES.indexOf(id) + 1;

/** "Figure 7" */
export const fig = (id: FigureId): string => `Figure ${figNo(id)}`;
/** "Table 2" */
export const tab = (id: TableId): string => `Table ${tabNo(id)}`;
