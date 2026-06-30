import { create } from "zustand";
import { fetchApi } from "@/lib/api";

export interface PlaybookRule {
  id: number;
  owner_id: number;
  rule_category: string;
  preferred_terms: string | null;
  forbidden_terms: string | null;
  risk_level: "High" | "Medium" | "Low";
}

export interface PlaybookViolation {
  rule_category: string;
  violation: string;
  clause_text: string;
  severity: "High" | "Medium" | "Low";
}

export interface ComplianceResult {
  contract_id: number;
  total_violations: number;
  violations: PlaybookViolation[];
  overall_compliance: "Pass" | "Warning" | "Fail";
}

interface PlaybookStore {
  playbooks: PlaybookRule[];
  complianceResult: ComplianceResult | null;
  isChecking: boolean;
  isLoading: boolean;
  fetchPlaybooks: () => Promise<void>;
  createPlaybook: (data: Omit<PlaybookRule, "id" | "owner_id">) => Promise<void>;
  updatePlaybook: (id: number, data: Partial<Omit<PlaybookRule, "id" | "owner_id">>) => Promise<void>;
  deletePlaybook: (id: number) => Promise<void>;
  checkContractCompliance: (contractId: number) => Promise<void>;
  clearComplianceResult: () => void;
}

export const usePlaybookStore = create<PlaybookStore>((set) => ({
  playbooks: [],
  complianceResult: null,
  isChecking: false,
  isLoading: false,

  fetchPlaybooks: async () => {
    set({ isLoading: true });
    try {
      const data = await fetchApi("/api/playbook");
      set({ playbooks: data });
    } catch (err) {
      console.error("Failed to fetch playbooks:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  createPlaybook: async (data) => {
    const newRule = await fetchApi("/api/playbook", {
      method: "POST",
      body: JSON.stringify(data),
    });
    set((state) => ({ playbooks: [...state.playbooks, newRule] }));
  },

  updatePlaybook: async (id, data) => {
    const updated = await fetchApi(`/api/playbook/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    set((state) => ({
      playbooks: state.playbooks.map((r) => (r.id === id ? updated : r)),
    }));
  },

  deletePlaybook: async (id) => {
    await fetchApi(`/api/playbook/${id}`, { method: "DELETE" });
    set((state) => ({ playbooks: state.playbooks.filter((r) => r.id !== id) }));
  },

  checkContractCompliance: async (contractId: number) => {
    set({ isChecking: true, complianceResult: null });
    try {
      const result = await fetchApi(`/api/playbook/check/${contractId}`, {
        method: "POST",
      });
      set({ complianceResult: result });
    } catch (err) {
      console.error("Compliance check failed:", err);
    } finally {
      set({ isChecking: false });
    }
  },

  clearComplianceResult: () => set({ complianceResult: null }),
}));
