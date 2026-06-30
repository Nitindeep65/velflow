import { create } from "zustand";
import { fetchApi, ApiError } from "../api";

export interface Contract {
  id: number;
  name: string;
  counterparty: string;
  type: string;
  status: "Uploaded" | "Analyzed" | "Needs Review" | "Signed" | "Active" | "Archived" | string;
  risk: "Low" | "Medium" | "High";
  next_date: string;
  created_at?: string;
  owner_id?: number;
  counterparty_id?: number | null;
  pipeline_id?: number | null;
}

interface ContractsState {
  contracts: Contract[];
  searchQuery: string;
  isNewContractOpen: boolean;
  isLoading: boolean;
  setSearchQuery: (query: string) => void;
  setIsNewContractOpen: (open: boolean) => void;
  fetchContracts: () => Promise<void>;
  addContract: (formData: FormData) => Promise<void>;
  updateContract: (id: number, data: Partial<Contract>) => Promise<void>;
  deleteContract: (id: number) => Promise<void>;
  clearAll: () => void;
  restoreDefaults: () => Promise<void>;
}

export const useContractsStore = create<ContractsState>((set, get) => ({
  contracts: [],
  searchQuery: "",
  isNewContractOpen: false,
  isLoading: false,

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().fetchContracts();
  },
  
  setIsNewContractOpen: (open) => set({ isNewContractOpen: open }),

  fetchContracts: async () => {
    set({ isLoading: true });
    try {
      const query = get().searchQuery;
      const url = query ? `/contracts/?search=${encodeURIComponent(query)}` : "/contracts/";
      const data = await fetchApi(url);
      set({ contracts: data, isLoading: false });
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        // Suppress expected 401 session expiration error logs
      } else {
        console.error("Failed to fetch contracts", e);
      }
      set({ isLoading: false });
    }
  },

  addContract: async (formData) => {
    try {
      const data = await fetchApi("/contracts/upload", {
        method: "POST",
        body: formData,
      });
      set((state) => ({
        contracts: [data, ...state.contracts],
      }));
    } catch (e) {
      if (!(e instanceof ApiError && e.status === 401)) {
        console.error("Failed to upload contract", e);
      }
      throw e;
    }
  },

  updateContract: async (id, data) => {
    try {
      const result = await fetchApi(`/contracts/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      set((state) => ({
        contracts: state.contracts.map((c) => (c.id === id ? result : c)),
      }));
    } catch (e) {
      if (!(e instanceof ApiError && e.status === 401)) {
        console.error("Failed to update contract", e);
      }
      throw e;
    }
  },

  deleteContract: async (id) => {
    try {
      await fetchApi(`/contracts/${id}`, {
        method: "DELETE",
      });
      set((state) => ({
        contracts: state.contracts.filter((c) => c.id !== id),
      }));
    } catch (e) {
      if (!(e instanceof ApiError && e.status === 401)) {
        console.error("Failed to delete contract", e);
      }
      throw e;
    }
  },

  clearAll: () => set({ contracts: [] }),

  restoreDefaults: async () => {
    set({ isLoading: true });
    try {
      await fetchApi("/contracts/seed", { method: "POST" });
      const data = await fetchApi("/contracts/");
      set({ contracts: data, isLoading: false });
    } catch (e) {
      if (!(e instanceof ApiError && e.status === 401)) {
        console.error("Failed to restore demo data", e);
      }
      set({ isLoading: false });
    }
  },
}));
