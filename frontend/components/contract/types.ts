// components/contract/types.ts

export type RiskLevel = "Low" | "Medium" | "High";

export type ContractStatus = "Uploaded" | "Analyzed" | "Needs Review";

export interface ContractRowData {
  id: number;
  name: string;
  counterparty: string;
  type: string;
  risk: RiskLevel;
  status: ContractStatus;
  next_date: string | null;
  created_at: string;
  summary_points?: string[];
  risks?: Array<{ text: string; severity: RiskLevel }>;
  dates_timeline?: MilestoneDate[];
}

export interface MilestoneDate {
  id: string;
  title: string;
  date: string;
  badge: "Critical - Renewal" | "Important" | "Upcoming";
  active: boolean;
  description: string;
}

export interface ChatCitation {
  section: string;
  text: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  citations?: ChatCitation[];
}

export interface RiskCategory {
  name: string;
  risk: RiskLevel;
  summary: string;
  clauses: Array<{ heading: string; text: string; citation: string }>;
}
