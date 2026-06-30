import { create } from "zustand";
import { fetchApi, ApiError } from "../api";

export interface Counterparty {
  id: number;
  company_name: string;
  primary_contact_email?: string;
  contact_phone?: string;
  billing_address?: string;
  industry?: string;
  notes?: string;
  created_at?: string;
  contracts_count?: number;
}

export interface Pipeline {
  id: number;
  deal_name: string;
  stage: "Drafting" | "Internal Review" | "In Negotiation" | "Out for Signature" | "Signed" | "Active";
  value: number;
  counterparty_id?: number;
  created_at?: string;
  counterparty_name?: string;
  contracts_count?: number;
}

interface CrmState {
  counterparties: Counterparty[];
  pipelines: Pipeline[];
  isLoading: boolean;
  
  fetchCounterparties: () => Promise<void>;
  fetchPipelines: () => Promise<void>;
  fetchCrmData: () => Promise<void>;
  
  addCounterparty: (data: Omit<Counterparty, "id" | "created_at" | "contracts_count">) => Promise<Counterparty>;
  updateCounterparty: (id: number, data: Partial<Counterparty>) => Promise<void>;
  deleteCounterparty: (id: number) => Promise<void>;
  
  addPipeline: (data: Omit<Pipeline, "id" | "created_at" | "counterparty_name" | "contracts_count">) => Promise<Pipeline>;
  updatePipeline: (id: number, data: Partial<Pipeline>) => Promise<void>;
  updatePipelineStage: (id: number, stage: Pipeline["stage"]) => Promise<void>;
  deletePipeline: (id: number) => Promise<void>;
  
  seedCrmData: () => Promise<void>;
  clearCrm: () => void;
}

export const useCrmStore = create<CrmState>((set, get) => ({
  counterparties: [],
  pipelines: [],
  isLoading: false,

  fetchCounterparties: async () => {
    try {
      const data = await fetchApi("/crm/counterparties");
      set({ counterparties: data });
    } catch (e) {
      if (!(e instanceof ApiError && e.status === 401)) {
        console.error("Failed to fetch counterparties", e);
      }
    }
  },

  fetchPipelines: async () => {
    try {
      const data = await fetchApi("/crm/pipelines");
      set({ pipelines: data });
    } catch (e) {
      if (!(e instanceof ApiError && e.status === 401)) {
        console.error("Failed to fetch pipelines", e);
      }
    }
  },

  fetchCrmData: async () => {
    set({ isLoading: true });
    await Promise.all([get().fetchCounterparties(), get().fetchPipelines()]);
    set({ isLoading: false });
  },

  addCounterparty: async (data) => {
    try {
      const result = await fetchApi("/crm/counterparties", {
        method: "POST",
        body: JSON.stringify(data),
      });
      set((state) => ({
        counterparties: [...state.counterparties, result],
      }));
      return result;
    } catch (e) {
      console.error("Failed to add counterparty", e);
      throw e;
    }
  },

  updateCounterparty: async (id, data) => {
    try {
      const result = await fetchApi(`/crm/counterparties/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      set((state) => ({
        counterparties: state.counterparties.map((cp) => (cp.id === id ? result : cp)),
      }));
    } catch (e) {
      console.error("Failed to update counterparty", e);
      throw e;
    }
  },

  deleteCounterparty: async (id) => {
    try {
      await fetchApi(`/crm/counterparties/${id}`, {
        method: "DELETE",
      });
      set((state) => ({
        counterparties: state.counterparties.filter((cp) => cp.id !== id),
        // Clean up pipeline items linked to deleted counterparty
        pipelines: state.pipelines.map((pipe) =>
          pipe.counterparty_id === id ? { ...pipe, counterparty_id: undefined, counterparty_name: undefined } : pipe
        ),
      }));
    } catch (e) {
      console.error("Failed to delete counterparty", e);
      throw e;
    }
  },

  addPipeline: async (data) => {
    try {
      const result = await fetchApi("/crm/pipelines", {
        method: "POST",
        body: JSON.stringify(data),
      });
      set((state) => ({
        pipelines: [...state.pipelines, result],
      }));
      return result;
    } catch (e) {
      console.error("Failed to add pipeline deal", e);
      throw e;
    }
  },

  updatePipeline: async (id, data) => {
    try {
      const result = await fetchApi(`/crm/pipelines/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      set((state) => ({
        pipelines: state.pipelines.map((pipe) => (pipe.id === id ? result : pipe)),
      }));
    } catch (e) {
      console.error("Failed to update pipeline deal", e);
      throw e;
    }
  },

  updatePipelineStage: async (id, stage) => {
    // Optimistic update
    const previousPipelines = get().pipelines;
    set((state) => ({
      pipelines: state.pipelines.map((pipe) => (pipe.id === id ? { ...pipe, stage } : pipe)),
    }));

    try {
      const result = await fetchApi(`/crm/pipelines/${id}`, {
        method: "PUT",
        body: JSON.stringify({ stage }),
      });
      set((state) => ({
        pipelines: state.pipelines.map((pipe) => (pipe.id === id ? result : pipe)),
      }));
    } catch (e) {
      console.error("Failed to update pipeline stage", e);
      // Revert optimistic update
      set({ pipelines: previousPipelines });
      throw e;
    }
  },

  deletePipeline: async (id) => {
    try {
      await fetchApi(`/crm/pipelines/${id}`, {
        method: "DELETE",
      });
      set((state) => ({
        pipelines: state.pipelines.filter((pipe) => pipe.id !== id),
      }));
    } catch (e) {
      console.error("Failed to delete pipeline deal", e);
      throw e;
    }
  },

  seedCrmData: async () => {
    set({ isLoading: true });
    try {
      await fetchApi("/crm/seed", { method: "POST" });
      await get().fetchCrmData();
    } catch (e) {
      console.error("Failed to seed CRM data", e);
    } finally {
      set({ isLoading: false });
    }
  },

  clearCrm: () => set({ counterparties: [], pipelines: [] }),
}));
