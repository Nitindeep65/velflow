import { create } from "zustand";
import { fetchApi, ApiError } from "../api";

export interface Comment {
  id: number;
  contract_id: number;
  user_id?: number;
  author_name: string;
  text: string;
  clause_index?: number;
  created_at: string;
}

export interface SignatureLog {
  id: number;
  contract_id: number;
  signer_name: string;
  signer_email: string;
  ip_address?: string;
  signature_svg?: string;
  verification_token?: string;
  signed_at: string;
}

interface CrmCollaborationState {
  comments: Comment[];
  signatures: SignatureLog[];
  isLoading: boolean;
  
  fetchComments: (contractId: number) => Promise<void>;
  postComment: (contractId: number, text: string, clauseIndex?: number, authorName?: string) => Promise<Comment>;
  fetchSignatures: (contractId: number) => Promise<void>;
  signContract: (contractId: number, name: string, email: string, signatureSvg?: string) => Promise<SignatureLog>;
  clearCollaboration: () => void;
}

export const useCrmCollaborationStore = create<CrmCollaborationState>((set, get) => ({
  comments: [],
  signatures: [],
  isLoading: false,

  fetchComments: async (contractId) => {
    set({ isLoading: true });
    try {
      const data = await fetchApi(`/contracts/${contractId}/comments`);
      set({ comments: data, isLoading: false });
    } catch (e) {
      if (!(e instanceof ApiError && e.status === 401)) {
        console.error("Failed to fetch comments", e);
      }
      set({ isLoading: false });
    }
  },

  postComment: async (contractId, text, clauseIndex, authorName) => {
    try {
      const result = await fetchApi(`/contracts/${contractId}/comments`, {
        method: "POST",
        body: JSON.stringify({
          text,
          clause_index: clauseIndex,
          author_name: authorName || "Workspace Member",
        }),
      });
      set((state) => ({
        comments: [...state.comments, result],
      }));
      return result;
    } catch (e) {
      console.error("Failed to post comment", e);
      throw e;
    }
  },

  fetchSignatures: async (contractId) => {
    try {
      const data = await fetchApi(`/contracts/${contractId}/signatures`);
      set({ signatures: data });
    } catch (e) {
      if (!(e instanceof ApiError && e.status === 401)) {
        console.error("Failed to fetch signatures", e);
      }
    }
  },

  signContract: async (contractId, name, email, signatureSvg) => {
    set({ isLoading: true });
    try {
      const result = await fetchApi(`/contracts/${contractId}/sign`, {
        method: "POST",
        body: JSON.stringify({
          signer_name: name,
          signer_email: email,
          signature_svg: signatureSvg || "",
          ip_address: "127.0.0.1",
        }),
      });
      
      set((state) => ({
        signatures: [...state.signatures, result],
        isLoading: false,
      }));
      
      // Update the contract status to 'Signed' in useContractsStore if loaded
      try {
        const { useContractsStore } = require("./useContractsStore");
        const contractsState = useContractsStore.getState();
        if (contractsState.contracts.some((c: any) => c.id === contractId)) {
          contractsState.fetchContracts();
        }
      } catch (err) {
        console.error("Could not sync contracts store status", err);
      }
      
      return result;
    } catch (e) {
      set({ isLoading: false });
      console.error("Failed to sign contract", e);
      throw e;
    }
  },

  clearCollaboration: () => set({ comments: [], signatures: [] }),
}));
