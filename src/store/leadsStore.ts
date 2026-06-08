// Leads store — dashboard data with reactive KPIs and full mutators.

import { create } from "zustand";
import type { Lead, LeadStatus, TaxYear } from "@/types/crm";
import { MOCK_LEADS } from "@/data/mockLeads";

const LEADS_STORAGE_KEY = "sales-leads";

function normalizeEntityNames(names?: string[]) {
  return (names ?? []).map((name) => name.trim()).filter(Boolean);
}

function loadStoredLeads(): Lead[] {
  if (typeof window === "undefined") {
    return MOCK_LEADS;
  }

  try {
    const stored = window.localStorage.getItem(LEADS_STORAGE_KEY);
    if (!stored) {
      return MOCK_LEADS;
    }
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      return parsed.map((lead: Lead) => {
        if (!lead.entityNames?.length) {
          const seed = MOCK_LEADS.find((m) => m.id === lead.id);
          if (seed?.entityNames?.length) return { ...lead, entityNames: seed.entityNames };
        }
        return lead;
      });
    }
  } catch {
  }

  return MOCK_LEADS;
}

interface LeadsState {
  leads: Lead[];
  addLead: (
    l: Omit<
      Lead,
      | "id"
      | "addedAt"
      | "status"
      | "engagementYears"
      | "engagedSince"
      | "latestCalculation"
      | "taxYears"
    > & { taxYears?: TaxYear[]; entityNames?: string[] },
  ) => void;
  updateLead: (id: string, patch: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  setStatus: (id: string, status: LeadStatus) => void;
  promoteToActive: (id: string) => void;
  getLead: (id: string) => Lead | undefined;
}

export const useLeadsStore = create<LeadsState>((set, get) => ({
  leads: loadStoredLeads(),
  addLead: (l) => {
    const entityNames = normalizeEntityNames(l.entityNames);
    return set((s) => ({
      leads: [
        {
          ...l,
          taxYears: l.taxYears ?? [],
          entityNames,
          entitiesCount: entityNames.length || l.entitiesCount || 0,
          id: `ld_${Date.now()}`,
          status: "new",
          engagementYears: 0,
          engagedSince: "",
          latestCalculation: "—",
          addedAt: new Date().toISOString(),
        } as Lead,
        ...s.leads,
      ],
    }));
  },
  updateLead: (id, patch) =>
    set((s) => ({
      leads: s.leads.map((x) => {
        if (x.id !== id) return x;

        const nextEntityNames =
          patch.entityNames !== undefined ? normalizeEntityNames(patch.entityNames) : x.entityNames;

        return {
          ...x,
          ...patch,
          entityNames: nextEntityNames,
          entitiesCount:
            patch.entityNames !== undefined
              ? (nextEntityNames ?? []).length
              : (patch.entitiesCount ?? x.entitiesCount),
        };
      }),
    })),
  deleteLead: (id) => set((s) => ({ leads: s.leads.filter((x) => x.id !== id) })),
  setStatus: (id, status) =>
    set((s) => ({ leads: s.leads.map((x) => (x.id === id ? { ...x, status } : x)) })),
  promoteToActive: (id) =>
    set((s) => ({
      leads: s.leads.map((x) =>
        x.id === id
          ? {
              ...x,
              status: "active_engagement",
              engagedSince: x.engagedSince || new Date().toISOString().slice(0, 10),
              engagementYears: Math.max(1, x.engagementYears),
            }
          : x,
      ),
    })),
  getLead: (id) => get().leads.find((l) => l.id === id),
}));

if (typeof window !== "undefined") {
  useLeadsStore.subscribe((state) => {
    try {
      window.localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(state.leads));
    } catch {
    }
  });
}
