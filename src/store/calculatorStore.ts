// Calculator store — manages client info, multi-year tax selection, and dynamic entity cards.
// Per-year isolation: each selected tax year has its own entities, notes, and entity count.

import { create } from "zustand";
import type { ClientInfo, Entity, EntityOwner, FilingStatus, TaxYear } from "@/types/crm";
import { ALL_TAX_YEARS } from "@/types/crm";

const newOwner = (): EntityOwner => ({
  id: `own_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  firstName: "",
  lastName: "",
  role: "",
  ownershipPct: "",
});

const newEntity = (i: number): Entity => ({
  id: `ent_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 7)}`,
  companyName: "",
  state: "",
  employeeCount: "",
  filingStatus: "",
  grossRevenue: "",
  wagesOfficers: "",
  wagesW2: "",
  contractWages: "",
  totalSupplies: "",
  notes: "",
  owners: [],
});

export interface YearSlice {
  entities: Entity[];
  notes: string;
  entityCountInput: number;
}

const emptySlice = (): YearSlice => ({
  entities: [],
  notes: "",
  entityCountInput: 1,
});

interface CalculatorState {
  client: ClientInfo;
  activeYear: TaxYear;
  byYear: Record<number, YearSlice>;
  // Active-year shortcuts (mirror byYear[activeYear]) for easy consumption.
  entityCountInput: number;
  entities: Entity[];
  notes: string;
  setClientField: <K extends keyof ClientInfo>(k: K, v: ClientInfo[K]) => void;
  toggleTaxYear: (y: TaxYear) => void;
  selectAllTaxYears: () => void;
  clearTaxYears: () => void;
  setActiveYear: (y: TaxYear) => void;
  setEntityCountInput: (n: number) => void;
  generateEntities: (n: number) => void;
  addEntity: () => void;
  removeEntity: (id: string) => void;
  updateEntity: <K extends keyof Entity>(id: string, k: K, v: Entity[K]) => void;
  addOwner: (entityId: string) => void;
  removeOwner: (entityId: string, ownerId: string) => void;
  updateOwner: <K extends keyof EntityOwner>(entityId: string, ownerId: string, k: K, v: EntityOwner[K]) => void;
  setNotes: (s: string) => void;
  hydrateFromLead: (clientName: string, taxYears: TaxYear[]) => void;
  resetAll: () => void;
}

const DEFAULT_YEAR: TaxYear = 2025;

// Helpers to project active slice onto top-level shortcuts.
function projectActive(byYear: Record<number, YearSlice>, activeYear: TaxYear) {
  const slice = byYear[activeYear] ?? emptySlice();
  return {
    entities: slice.entities,
    notes: slice.notes,
    entityCountInput: slice.entityCountInput,
  };
}

function ensureSlices(
  byYear: Record<number, YearSlice>,
  years: TaxYear[],
): Record<number, YearSlice> {
  const next: Record<number, YearSlice> = {};
  // Keep slices only for currently-selected years.
  for (const y of years) {
    next[y] = byYear[y] ?? emptySlice();
  }
  return next;
}

// Mutate the active year's slice and re-project top-level shortcuts.
function withActiveSlice(
  state: CalculatorState,
  mutate: (s: YearSlice) => YearSlice,
): Partial<CalculatorState> {
  const current = state.byYear[state.activeYear] ?? emptySlice();
  const updated = mutate(current);
  const byYear = { ...state.byYear, [state.activeYear]: updated };
  return { byYear, ...projectActive(byYear, state.activeYear) };
}

export const useCalculatorStore = create<CalculatorState>((set) => ({
  client: {
    clientName: "",
    taxYears: [DEFAULT_YEAR],
    filingStatus: "mfj" as FilingStatus,
  },
  activeYear: DEFAULT_YEAR,
  byYear: { [DEFAULT_YEAR]: emptySlice() },
  entityCountInput: 1,
  entities: [],
  notes: "",
  setClientField: (k, v) => set((s) => ({ client: { ...s.client, [k]: v } })),
  toggleTaxYear: (y) =>
    set((s) => {
      const has = s.client.taxYears.includes(y);
      const nextYears = has ? s.client.taxYears.filter((x) => x !== y) : [...s.client.taxYears, y];
      nextYears.sort((a, b) => a - b);
      const byYear = ensureSlices(s.byYear, nextYears);
      const activeYear = nextYears.includes(s.activeYear)
        ? s.activeYear
        : (nextYears[0] ?? DEFAULT_YEAR);
      return {
        client: { ...s.client, taxYears: nextYears },
        byYear,
        activeYear,
        ...projectActive(byYear, activeYear),
      };
    }),
  selectAllTaxYears: () =>
    set((s) => {
      const years = [...ALL_TAX_YEARS];
      const byYear = ensureSlices(s.byYear, years);
      const activeYear = years.includes(s.activeYear) ? s.activeYear : years[0];
      return {
        client: { ...s.client, taxYears: years },
        byYear,
        activeYear,
        ...projectActive(byYear, activeYear),
      };
    }),
  clearTaxYears: () =>
    set((s) => ({
      client: { ...s.client, taxYears: [] },
      byYear: {},
      activeYear: DEFAULT_YEAR,
      ...projectActive({}, DEFAULT_YEAR),
    })),
  setActiveYear: (y) =>
    set((s) => {
      if (!s.client.taxYears.includes(y)) return {};
      const byYear = s.byYear[y] ? s.byYear : { ...s.byYear, [y]: emptySlice() };
      return { activeYear: y, byYear, ...projectActive(byYear, y) };
    }),
  setEntityCountInput: (n) =>
    set((s) =>
      withActiveSlice(s, (slice) => ({
        ...slice,
        entityCountInput: Math.max(1, Math.min(50, n)),
      })),
    ),
  generateEntities: (n) =>
    set((s) =>
      withActiveSlice(s, (slice) => ({
        ...slice,
        entities: Array.from({ length: n }, (_, i) => newEntity(i)),
      })),
    ),
  addEntity: () =>
    set((s) =>
      withActiveSlice(s, (slice) => ({
        ...slice,
        entities: [...slice.entities, newEntity(slice.entities.length)],
      })),
    ),
  removeEntity: (id) =>
    set((s) =>
      withActiveSlice(s, (slice) => ({
        ...slice,
        entities: slice.entities.filter((e) => e.id !== id),
      })),
    ),
  updateEntity: (id, k, v) =>
    set((s) =>
      withActiveSlice(s, (slice) => ({
        ...slice,
        entities: slice.entities.map((e) => (e.id === id ? { ...e, [k]: v } : e)),
      })),
    ),
  addOwner: (entityId) =>
    set((s) =>
      withActiveSlice(s, (slice) => ({
        ...slice,
        entities: slice.entities.map((e) =>
          e.id === entityId ? { ...e, owners: [...e.owners, newOwner()] } : e,
        ),
      })),
    ),
  removeOwner: (entityId, ownerId) =>
    set((s) =>
      withActiveSlice(s, (slice) => ({
        ...slice,
        entities: slice.entities.map((e) =>
          e.id === entityId
            ? { ...e, owners: e.owners.filter((o) => o.id !== ownerId) }
            : e,
        ),
      })),
    ),
  updateOwner: (entityId, ownerId, k, v) =>
    set((s) =>
      withActiveSlice(s, (slice) => ({
        ...slice,
        entities: slice.entities.map((e) =>
          e.id === entityId
            ? {
                ...e,
                owners: e.owners.map((o) => (o.id === ownerId ? { ...o, [k]: v } : o)),
              }
            : e,
        ),
      })),
    ),
  setNotes: (n) =>
    set((s) => withActiveSlice(s, (slice) => ({ ...slice, notes: n }))),
  hydrateFromLead: (clientName, taxYears) =>
    set((s) => {
      const nextYears = taxYears.length ? [...taxYears].sort((a, b) => a - b) : s.client.taxYears;
      const byYear = ensureSlices(s.byYear, nextYears);
      const activeYear = nextYears.includes(s.activeYear)
        ? s.activeYear
        : (nextYears[0] ?? DEFAULT_YEAR);
      return {
        client: { ...s.client, clientName, taxYears: nextYears },
        byYear,
        activeYear,
        ...projectActive(byYear, activeYear),
      };
    }),
  resetAll: () =>
    set(() => {
      const byYear: Record<number, YearSlice> = {};
      return {
        client: {
          clientName: "",
          taxYears: [],
          filingStatus: "mfj" as FilingStatus,
        },
        activeYear: DEFAULT_YEAR,
        byYear,
        ...projectActive(byYear, DEFAULT_YEAR),
      };
    }),

}));
