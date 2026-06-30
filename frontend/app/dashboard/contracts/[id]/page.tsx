"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Send, 
  FileText, 
  AlertCircle, 
  Loader2, 
  Calendar, 
  AlertTriangle, 
  RefreshCcw,
  Sparkles,
  ArrowUpDown,
  ChevronRight,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Info,
  X,
  FileCheck,
  Share2,
  Clipboard,
  MessageSquare,
  ShieldCheck,
  PenTool
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchApi, fetchFileBlob } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useCrmCollaborationStore } from "@/lib/store/useCrmCollaborationStore";
import { DetailHeader } from "@/components/contract/detail-header";
import { RiskRadar } from "@/components/contract/risk-radar";
import { QANavigator } from "@/components/contract/qa-navigator";
import { ComparisonRow } from "@/components/contract/compare-viewer";
import { DatesScheduler } from "@/components/contract/dates-scheduler";

// Types
interface Message {
  role: "user" | "ai";
  content: string;
}

const getRiskCategories = (contract: any) => {
  const defaultCategories: Record<string, { risk: "Low" | "Medium" | "High", clauses: any[], summary: string }> = {
    "Term & Renewal": { risk: "Low", clauses: [], summary: "Details regarding agreement start, extension options, and automatic rollover notice windows." },
    "Termination": { risk: "Low", clauses: [], summary: "Conditions under which either party may end the agreement, and cure periods for breaches." },
    "Liability & Indemnity": { risk: "Low", clauses: [], summary: "Caps on damages, exclusions for consequential losses, and defense obligations." },
    "Payment & Fees": { risk: "Low", clauses: [], summary: "Payment terms, invoicing schedules, late payment interest, and price adjustment rules." },
    "Governing Law": { risk: "Low", clauses: [], summary: "Jurisdiction, chosen state/country law, and arbitration/dispute resolution venues." }
  };

  const risks = contract.risks || [];
  risks.forEach((r: any) => {
    const text = (r.text || "").toLowerCase();
    let category = "Governing Law";

    if (text.includes("renew") || text.includes("term") || text.includes("duration") || text.includes("extension")) {
      category = "Term & Renewal";
    } else if (text.includes("terminate") || text.includes("cure") || text.includes("breach") || text.includes("default")) {
      category = "Termination";
    } else if (text.includes("liab") || text.includes("indem") || text.includes("cap") || text.includes("damages")) {
      category = "Liability & Indemnity";
    } else if (text.includes("pay") || text.includes("fee") || text.includes("invoice") || text.includes("price") || text.includes("cost")) {
      category = "Payment & Fees";
    }

    defaultCategories[category].clauses.push({
      heading: r.severity + " Risk Highlight",
      text: r.text,
      citation: "AI Extract"
    });

    const severities = { "Low": 1, "Medium": 2, "High": 3 };
    const currentLevel = severities[defaultCategories[category].risk];
    const newLevel = severities[r.severity as "Low" | "Medium" | "High"] || 1;
    if (newLevel > currentLevel) {
      defaultCategories[category].risk = r.severity;
    }
  });

  return Object.entries(defaultCategories).map(([name, data]) => ({
    name,
    risk: data.risk,
    summary: data.clauses.length > 0 
      ? `AI flagged ${data.clauses.length} risk items under this category.`
      : data.summary,
    clauses: data.clauses
  }));
};

export default function ContractDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const contractId = params.id as string;

  const [activeTab, setActiveTab] = useState("Overview");

  // State for Document & Contract Data
  const [contractData, setContractData] = useState<any>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Chat State
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Hello! I have analyzed this contract. What would you like to know?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Additional States for Phase 6
  const [allContracts, setAllContracts] = useState<any[]>([]);
  const [compareContractId, setCompareContractId] = useState<string>("");
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  const [selectedComparisonCategory, setSelectedComparisonCategory] = useState<string | null>(null);
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  // Dates Tab States
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [editingDateId, setEditingDateId] = useState<string | null>(null);
  const [dateForm, setDateForm] = useState({
    title: "",
    date: "",
    badge: "Upcoming",
    description: ""
  });
  const [selectedTimelineEvent, setSelectedTimelineEvent] = useState<any>(null);

  // Collaboration Hook
  const {
    comments,
    signatures,
    fetchComments,
    postComment,
    fetchSignatures,
    signContract,
  } = useCrmCollaborationStore();

  const [activeClauseIndex, setActiveClauseIndex] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");
  const [isSigningOpen, setIsSigningOpen] = useState(false);
  const [signerName, setSignerName] = useState("");
  const [signerEmail, setSignerEmail] = useState("");
  const [typedSignature, setTypedSignature] = useState("");
  const [isSubmittingSignature, setIsSubmittingSignature] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [contractText, setContractText] = useState("");

  const contractClauses = useMemo(() => {
    if (!contractText) return [];
    return contractText.split("\n\n").filter((p: string) => p.trim().length > 0);
  }, [contractText]);

  const { isAuthenticated, isHydrated } = useAuthStore();

  // Fetch initial data
  useEffect(() => {
    async function loadData() {
      try {
        const contract = await fetchApi(`/contracts/${contractId}`);
        setContractData(contract);
        
        const blob = await fetchFileBlob(`/contracts/${contractId}/file`);
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);

        const shareData = await fetchApi(`/contracts/${contractId}/share`);
        setContractText(shareData.text || "");
        fetchComments(parseInt(contractId));
        fetchSignatures(parseInt(contractId));
      } catch (err) {
        setError("Failed to load document.");
      }
    }
    if (isHydrated && isAuthenticated) {
      loadData();
    }

    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [contractId, isHydrated, isAuthenticated]);

  // Fetch other contracts for comparison dropdown
  useEffect(() => {
    async function loadAllContracts() {
      try {
        const contracts = await fetchApi("/contracts");
        // Filter out current contract so you can't compare it with itself
        setAllContracts(contracts.filter((c: any) => c.id !== parseInt(contractId)));
      } catch (err) {
        console.error("Failed to load comparison contracts list:", err);
      }
    }
    if (isHydrated && isAuthenticated) {
      loadAllContracts();
    }
  }, [contractId, isHydrated, isAuthenticated]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (activeTab === "Q&A") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, activeTab]);

  // Handle re-analysis
  const handleReanalyze = async () => {
    setIsReanalyzing(true);
    try {
      const data = await fetchApi(`/contracts/${contractId}/reanalyze`, {
        method: "POST"
      });
      setContractData(data);
    } catch (err: any) {
      alert(err.message || "Failed to re-analyze contract.");
    } finally {
      setIsReanalyzing(false);
    }
  };

  // Handle Q&A Chat messaging
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsTyping(true);

    try {
      const data = await fetchApi(`/contracts/${contractId}/chat`, {
        method: "POST",
        body: JSON.stringify({ question: userMsg }),
      });
      setMessages((prev) => [...prev, { role: "ai", content: data.answer }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Sorry, I encountered an error while analyzing the contract." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessageText = async (text: string) => {
    if (!text.trim() || isTyping) return;
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setIsTyping(true);

    try {
      const data = await fetchApi(`/contracts/${contractId}/chat`, {
        method: "POST",
        body: JSON.stringify({ question: text }),
      });
      setMessages((prev) => [...prev, { role: "ai", content: data.answer }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Sorry, I encountered an error while analyzing the contract." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle comparison API
  const handleCompare = async () => {
    if (!compareContractId) return;
    setIsComparing(true);
    setSelectedComparisonCategory(null);
    try {
      const data = await fetchApi(`/contracts/compare?base_id=${contractId}&compare_id=${compareContractId}`, {
        method: "POST"
      });
      setComparisonResult(data);
    } catch (err: any) {
      alert(err.message || "Comparison failed. Make sure both files contain legal text.");
    } finally {
      setIsComparing(false);
    }
  };

  // Swap Base & New selection inside comparison
  const handleSwapSides = () => {
    if (!compareContractId) return;
    // Redirect to the compare contract's detail view, passing current contract ID as comparison parameter
    router.push(`/dashboard/contracts/${compareContractId}?compare_id=${contractId}`);
  };

  // Handle check for compare_id query param to automatically trigger comparison on swap redirect
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const preselectedCompareId = searchParams.get("compare_id");
    if (preselectedCompareId && allContracts.length > 0) {
      setCompareContractId(preselectedCompareId);
      setActiveTab("Comparison");
      // Clean up search query parameter
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [allContracts]);

  // Handle dynamic compare trigger once compareContractId is set from redirect
  useEffect(() => {
    if (compareContractId && activeTab === "Comparison" && !comparisonResult && !isComparing) {
      handleCompare();
    }
  }, [compareContractId, activeTab]);

  // Handle Date timeline toggles
  const handleToggleDateActive = async (index: number) => {
    if (!contractData) return;
    const updatedDates = [...(contractData.dates_timeline || [])];
    updatedDates[index] = {
      ...updatedDates[index],
      active: !updatedDates[index].active
    };

    try {
      const data = await fetchApi(`/contracts/${contractId}/dates`, {
        method: "PUT",
        body: JSON.stringify({ dates_timeline: updatedDates })
      });
      setContractData(data);
      // Sync selected timeline details if active state changed
      if (selectedTimelineEvent && selectedTimelineEvent.id === updatedDates[index].id) {
        setSelectedTimelineEvent(updatedDates[index]);
      }
    } catch (err) {
      alert("Failed to update date setting.");
    }
  };

  const handleToggleDateActiveById = async (id: string) => {
    if (!contractData) return;
    const index = (contractData.dates_timeline || []).findIndex((d: any) => d.id === id);
    if (index !== -1) {
      await handleToggleDateActive(index);
    }
  };

  // Delete Date Milestone
  const handleDeleteDate = async (id: string) => {
    if (!contractData) return;
    if (!confirm("Are you sure you want to delete this date?")) return;

    const updatedDates = (contractData.dates_timeline || []).filter((d: any) => d.id !== id);

    try {
      const data = await fetchApi(`/contracts/${contractId}/dates`, {
        method: "PUT",
        body: JSON.stringify({ dates_timeline: updatedDates })
      });
      setContractData(data);
      if (selectedTimelineEvent?.id === id) {
        setSelectedTimelineEvent(null);
      }
    } catch (err) {
      alert("Failed to delete date.");
    }
  };

  // Open Edit Dialog for Date
  const handleOpenEditDate = (dateItem: any) => {
    setEditingDateId(dateItem.id);
    setDateForm({
      title: dateItem.title,
      date: dateItem.date,
      badge: dateItem.badge || "Upcoming",
      description: dateItem.description || ""
    });
    setIsDateModalOpen(true);
  };

  // Save/Create custom dates
  const handleSaveDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractData) return;

    let updatedDates = [...(contractData.dates_timeline || [])];
    if (editingDateId) {
      updatedDates = updatedDates.map((d: any) => 
        d.id === editingDateId 
          ? { ...d, title: dateForm.title, date: dateForm.date, badge: dateForm.badge, description: dateForm.description }
          : d
      );
    } else {
      const newDateObj = {
        id: `custom_${Date.now()}`,
        title: dateForm.title,
        date: dateForm.date,
        badge: dateForm.badge,
        active: true,
        description: dateForm.description
      };
      updatedDates.push(newDateObj);
    }

    try {
      const data = await fetchApi(`/contracts/${contractId}/dates`, {
        method: "PUT",
        body: JSON.stringify({ dates_timeline: updatedDates })
      });
      setContractData(data);
      setIsDateModalOpen(false);
      setEditingDateId(null);
      setDateForm({ title: "", date: "", badge: "Upcoming", description: "" });
    } catch (err) {
      alert("Failed to save date.");
    }
  };

  const tabs = ["Overview", "Risk Radar", "Q&A", "Comparison", "Dates", "Negotiate & Sign"];

  if (!contractData) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-400">
        <Loader2 className="h-8 w-8 animate-spin mb-3 text-blue-600" />
        <p className="text-sm font-medium">Loading details...</p>
      </div>
    );
  }

  // Helper date sorting for timelines
  const activeTimelineDates = (contractData.dates_timeline || [])
    .filter((d: any) => d.active && d.date)
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Default timeline event selection on mount
  if (activeTimelineDates.length > 0 && !selectedTimelineEvent) {
    setSelectedTimelineEvent(activeTimelineDates[0]);
  }

  return (
    <div className="flex flex-col h-full font-sans overflow-hidden relative" style={{ background: "#f4f6f9", color: "#1e293b" }}>
      
      {/* Header Area */}
      <DetailHeader
        contract={contractData}
        onBack={() => router.push("/dashboard/contracts")}
        onReanalyze={handleReanalyze}
        isReanalyzing={isReanalyzing}
      />

      {/* Premium Tab Navigation */}
      <div
        className="px-8 shrink-0 relative z-25"
        style={{
          background: "#ffffff",
          borderBottom: "1px solid #e8edf3",
        }}
      >
        <div className="max-w-6xl mx-auto flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="relative py-3.5 px-4 text-[12.5px] font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap"
              style={activeTab === tab ? { color: "#2563eb" } : { color: "#64748b" }}
            >
              {tab}
              {/* Active underline */}
              {activeTab === tab && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ background: "linear-gradient(90deg, #2563eb, #6366f1)" }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Tab Content Wrapper (Conditional scroll container toggled based on Active Tab) */}
      <div className={`flex-1 max-w-6xl w-full mx-auto p-8 ${activeTab === "Q&A" ? "overflow-hidden flex flex-col" : "overflow-y-auto"}`}>
        
        {/* OVERVIEW TAB */}
        {activeTab === "Overview" && (
          <div className="space-y-6">
            {!contractData.details_extracted && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-start gap-4 shadow-2xs">
                <Info className="h-5.5 w-5.5 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-2 flex-1">
                  <h4 className="text-sm font-bold text-blue-900">Contract Analysis Pending</h4>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    This document has not been fully processed. Click the <strong>Re-analyze</strong> button above to extract detailed summary points, risk vectors, and timeline milestones.
                  </p>
                  <Button size="xs" onClick={handleReanalyze} disabled={isReanalyzing} className="bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer">
                    {isReanalyzing ? "Running Deep Extract..." : "Extract Deep Metadata Now"}
                  </Button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                
                {/* Summary */}
                <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-2xs hover:shadow-xs transition-shadow">
                  <h3 className="text-base font-black text-zinc-950 tracking-tight mb-4 flex items-center gap-2">
                    <FileCheck className="h-4.5 w-4.5 text-zinc-700" />
                    Summary of Terms
                  </h3>
                  {contractData.summary_points && contractData.summary_points.length > 0 ? (
                    <ul className="space-y-3">
                      {contractData.summary_points.map((pt: string, idx: number) => (
                        <li key={idx} className="flex gap-2.5 text-sm text-zinc-700 items-start">
                          <span className="h-5 w-5 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{pt}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-zinc-400 italic">No summary details extracted. Click Re-analyze to generate.</p>
                  )}
                </div>

                {/* Top Risks */}
                <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-2xs hover:shadow-xs transition-shadow">
                  <h3 className="text-base font-black text-zinc-950 tracking-tight mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-4.5 w-4.5 text-zinc-700" />
                    Critical Warnings & Risks
                  </h3>
                  {contractData.risks && contractData.risks.length > 0 ? (
                    <div className="space-y-3">
                      {contractData.risks.map((riskObj: any, idx: number) => (
                        <div key={idx} className="p-3.5 border border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50 rounded-lg flex gap-3.5 items-start transition-colors">
                          {riskObj.severity === "High" ? (
                            <div className="p-1.5 bg-red-100 border border-red-200 rounded-lg text-red-600 shrink-0">
                              <AlertTriangle className="h-4 w-4" />
                            </div>
                          ) : riskObj.severity === "Medium" ? (
                            <div className="p-1.5 bg-amber-100 border border-amber-200 rounded-lg text-amber-600 shrink-0">
                              <AlertTriangle className="h-4 w-4" />
                            </div>
                          ) : (
                            <div className="p-1.5 bg-blue-100 border border-blue-200 rounded-lg text-blue-600 shrink-0">
                              <Info className="h-4 w-4" />
                            </div>
                          )}

                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] uppercase font-black tracking-wide px-1.5 py-0.5 rounded-md ${
                                riskObj.severity === "High" 
                                  ? "bg-red-50 text-red-700 border border-red-200" 
                                  : riskObj.severity === "Medium" 
                                  ? "bg-amber-50 text-amber-700 border border-amber-200" 
                                  : "bg-blue-50 text-blue-700 border border-blue-200"
                              }`}>
                                {riskObj.severity} Risk
                              </span>
                            </div>
                            <p className="text-sm font-medium text-zinc-800 leading-relaxed">{riskObj.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-400 italic">No risks analyzed. Click Re-analyze to assess risk factors.</p>
                  )}
                </div>
              </div>

              {/* Right Side Column */}
              <div className="space-y-6">
                
                {/* Contract Info */}
                <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-2xs">
                  <h3 className="text-base font-black text-zinc-950 tracking-tight mb-4">Agreement Information</h3>
                  <div className="space-y-3.5 text-sm">
                    <div className="flex justify-between items-center border-b border-zinc-100 pb-2.5">
                      <span className="text-zinc-500 font-semibold">Counterparty</span>
                      <span className="font-bold text-zinc-950">{contractData.counterparty}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-zinc-100 pb-2.5">
                      <span className="text-zinc-500 font-semibold">Agreement Type</span>
                      <span className="font-bold text-zinc-950">{contractData.type}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-zinc-100 pb-2.5">
                      <span className="text-zinc-500 font-semibold">Current Status</span>
                      <span className="font-bold text-zinc-950">{contractData.status}</span>
                    </div>
                    <div className="flex justify-between items-center pb-1">
                      <span className="text-zinc-500 font-semibold">Date Analyzed</span>
                      <span className="font-bold text-zinc-950">
                        {new Date(contractData.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric"
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Next Key Date */}
                <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-2xs relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500" />
                  <h3 className="text-base font-black text-zinc-950 tracking-tight mb-4 flex items-center gap-2">
                    <Calendar className="h-4.5 w-4.5 text-red-600" />
                    Next Critical Deadline
                  </h3>
                  {contractData.next_date ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                          <Calendar className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-black text-red-600 tracking-tight">
                            {new Date(contractData.next_date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric"
                            })}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-500 font-semibold leading-relaxed">
                        This represents your next crucial milestone or renewal window. Ensure appropriate notices are prepared before this date.
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-400 italic">No upcoming deadline detected.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RISK RADAR TAB */}
        {activeTab === "Risk Radar" && (
          <div className="space-y-6">
            <div className="bg-white border border-zinc-200 rounded-xl p-8 shadow-2xs max-w-5xl mx-auto space-y-6">
              <div className="text-center space-y-2">
                <div className="h-12 w-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto text-red-600">
                  <AlertTriangle className="h-6 w-6 animate-pulse" />
                </div>
                <h2 className="text-lg font-black text-zinc-950 tracking-tight">Interactive Risk Index</h2>
                <p className="text-sm text-zinc-500 max-w-md mx-auto">
                  Below is a categorized distribution of structural risk and exposure levels located inside this document.
                </p>
              </div>

              <div className="border-t border-zinc-100 pt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-red-50/50 border border-red-100 rounded-xl text-center space-y-1">
                  <p className="text-2xl font-black text-red-600">
                    {contractData.risks?.filter((r: any) => r.severity === "High").length || 0}
                  </p>
                  <p className="text-xs font-bold text-red-700">High Severity Risks</p>
                </div>
                <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl text-center space-y-1">
                  <p className="text-2xl font-black text-amber-600">
                    {contractData.risks?.filter((r: any) => r.severity === "Medium").length || 0}
                  </p>
                  <p className="text-xs font-bold text-amber-700">Medium Severity Risks</p>
                </div>
                <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl text-center space-y-1">
                  <p className="text-2xl font-black text-emerald-600">
                    {contractData.risks?.filter((r: any) => r.severity === "Low").length || 0}
                  </p>
                  <p className="text-xs font-bold text-emerald-700">Low Exposure Warnings</p>
                </div>
              </div>
            </div>

            <div className="max-w-5xl mx-auto">
              <RiskRadar categories={getRiskCategories(contractData)} />
            </div>
          </div>
        )}

        {/* Q&A TAB (Includes PDF & Chat) */}
        {activeTab === "Q&A" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch h-[calc(100vh-280px)]">
            {/* Left: PDF Viewer */}
            <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-2xs flex flex-col relative">
              {error ? (
                <div className="flex flex-col items-center justify-center flex-1 text-zinc-500">
                  <AlertCircle className="h-8 w-8 mb-3 text-red-500/80" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              ) : pdfUrl ? (
                <iframe src={pdfUrl} className="w-full h-full border-none bg-zinc-50" title="Contract Document" />
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 text-zinc-400">
                  <Loader2 className="h-8 w-8 animate-spin mb-3 text-blue-600" />
                  <p className="text-sm font-medium">Loading document securely...</p>
                </div>
              )}
            </div>

            {/* Right: AI Chat Navigator */}
            <div className="lg:col-span-7 flex flex-col min-h-0">
              <QANavigator 
                messages={messages.map((m, i) => ({
                  id: String(i),
                  role: m.role,
                  content: m.content,
                  citations: []
                }))}
                onSendMessage={handleSendMessageText}
                isTyping={isTyping}
              />
            </div>
          </div>
        )}

        {/* COMPARISON TAB */}
        {activeTab === "Comparison" && (
          <div className="flex flex-col gap-6 relative min-h-[500px]">
            
            {/* Top Selector Panel */}
            <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-2xs flex flex-col md:flex-row items-end md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4 flex-1 w-full">
                {/* Base Contract Selector */}
                <div className="space-y-1.5 flex-1 min-w-[200px]">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Base Contract</label>
                  <select 
                    disabled 
                    className="w-full bg-zinc-100 border border-zinc-200 rounded-lg text-sm font-bold p-2.5 text-zinc-600 cursor-not-allowed outline-none"
                  >
                    <option>{contractData.name} (This file)</option>
                  </select>
                </div>

                {/* Swap Icon */}
                <div className="pt-5 shrink-0 self-center">
                  <button 
                    onClick={handleSwapSides} 
                    disabled={!compareContractId}
                    title="Swap Sides"
                    className="h-9 w-9 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-600 hover:bg-zinc-100 disabled:opacity-40 disabled:hover:bg-zinc-50 flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
                  >
                    <ArrowUpDown className="h-4 w-4 rotate-90" />
                  </button>
                </div>

                {/* Compare Contract Selector */}
                <div className="space-y-1.5 flex-1 min-w-[200px]">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">New Contract</label>
                  <select 
                    value={compareContractId}
                    onChange={(e) => setCompareContractId(e.target.value)}
                    className="w-full bg-white border border-zinc-200 focus:border-blue-500 rounded-lg text-sm font-semibold p-2.5 text-zinc-800 outline-none transition-colors"
                  >
                    <option value="">Select a document to compare...</option>
                    {allContracts.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Compare Button */}
              <div className="w-full md:w-auto pt-1 shrink-0">
                <Button 
                  onClick={handleCompare} 
                  disabled={!compareContractId || isComparing}
                  className="w-full md:w-auto h-10 font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-xs"
                >
                  {isComparing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Comparing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Compare Versions
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Results Section */}
            {comparisonResult ? (
              <div className="space-y-5 animate-fade-in max-w-5xl mx-auto w-full">
                
                {/* Overall key changes badges */}
                {comparisonResult.key_changes && comparisonResult.key_changes.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Key Changes Detected</p>
                    <div className="flex flex-wrap gap-2">
                      {comparisonResult.key_changes.map((badge: any, idx: number) => (
                        <span 
                          key={idx} 
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg border flex items-center gap-1.5 shadow-2xs ${
                            badge.impact === "High" 
                              ? "bg-red-50 text-red-700 border-red-200" 
                              : badge.impact === "Medium"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {badge.text} ({badge.impact} impact)
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* List of categories with Side-by-Side Diffs */}
                <div className="space-y-4">
                  {["Term & Renewal", "Termination", "Liability & Indemnity", "Payment & Fees", "Governing Law"].map((categoryName) => {
                    const catData = comparisonResult.categories?.[categoryName] || { 
                      status: "Unchanged",
                      old_text: null,
                      new_text: null,
                      change_summary: "No modifications detected."
                    };
                    return (
                      <ComparisonRow
                        key={categoryName}
                        category={categoryName}
                        status={catData.status}
                        oldText={catData.old_text}
                        newText={catData.new_text}
                        changeSummary={catData.change_summary || "No modifications detected."}
                        isSelected={selectedComparisonCategory === categoryName}
                        onSelect={() => setSelectedComparisonCategory(selectedComparisonCategory === categoryName ? null : categoryName)}
                        baseName={contractData.name}
                        compareName={allContracts.find(c => c.id === parseInt(compareContractId))?.name || "v2"}
                      />
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-zinc-200 border-dashed rounded-xl p-16 flex flex-col items-center justify-center text-center space-y-4 max-w-2xl mx-auto w-full">
                <div className="h-12 w-12 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-zinc-950">No Comparison Active</h3>
                  <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
                    Select a secondary contract version from the dropdown above and click <strong>Compare Versions</strong> to view comparative changes.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* DATES TAB */}
        {activeTab === "Dates" && (
          <div className="space-y-6 max-w-5xl mx-auto w-full">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4 mb-2">
              <div>
                <h2 className="text-lg font-black text-zinc-950 tracking-tight">Milestones & Timeline</h2>
                <p className="text-xs text-zinc-500 font-semibold">Manage crucial contract obligations, renewals, and expiration schedules.</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setEditingDateId(null);
                  setDateForm({ title: "", date: "", badge: "Upcoming", description: "" });
                  setIsDateModalOpen(true);
                }}
                className="h-8 text-xs font-bold text-blue-600 border-blue-200 hover:bg-blue-50 cursor-pointer shadow-xs"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Milestone
              </Button>
            </div>

            <DatesScheduler
              dates={contractData.dates_timeline || []}
              onToggleActive={handleToggleDateActiveById}
              onEdit={handleOpenEditDate}
              onDelete={handleDeleteDate}
              selectedId={selectedTimelineEvent?.id || null}
              onSelectId={(id) => {
                const dateItem = (contractData.dates_timeline || []).find((d: any) => d.id === id);
                if (dateItem) setSelectedTimelineEvent(dateItem);
              }}
            />
          </div>
        )}

        {/* NEGOTIATE & SIGN TAB */}
        {activeTab === "Negotiate & Sign" && (
          <div className="space-y-6 max-w-6xl mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Document Text Line-by-Line (8 cols) */}
              <div className="lg:col-span-8 bg-white border border-zinc-200 rounded-xl p-6 shadow-2xs">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3.5 mb-4">
                  <h3 className="text-base font-black text-zinc-950 flex items-center gap-2">
                    <FileText className="h-4.5 w-4.5 text-zinc-700" />
                    Agreement Clauses
                  </h3>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase">Click any clause to review or comment</span>
                </div>
                
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {contractClauses.length === 0 ? (
                    <div className="text-center py-12 text-zinc-400 text-xs italic font-medium">
                      No text clauses extracted. Click Re-analyze to generate text body.
                    </div>
                  ) : (
                    contractClauses.map((clause: string, idx: number) => {
                      const isActive = activeClauseIndex === idx;
                      const clauseCommentsCount = comments.filter(c => c.clause_index === idx).length;
                      return (
                        <div
                          key={idx}
                          onClick={() => setActiveClauseIndex(idx)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer relative group ${
                            isActive
                              ? "bg-blue-50/20 border-blue-200 shadow-2xs"
                              : "border-transparent hover:bg-zinc-50 hover:border-zinc-200/60"
                          }`}
                        >
                          {clauseCommentsCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 h-4.5 px-1.5 flex items-center justify-center text-[9px] font-black text-white bg-blue-600 rounded-full shadow-sm">
                              {clauseCommentsCount}
                            </span>
                          )}
                          <div className="prose prose-slate max-w-none text-xs font-semibold leading-relaxed text-zinc-700">
                            <ReactMarkdown>{clause}</ReactMarkdown>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Sidebar Action Center (4 cols) */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Public Share Link Card */}
                <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-2xs">
                  <h4 className="text-xs font-black text-zinc-800 tracking-tight uppercase flex items-center gap-2 mb-3">
                    <Share2 className="h-4 w-4 text-blue-600" />
                    Guest Share Portal
                  </h4>
                  <p className="text-[11px] text-zinc-500 font-semibold leading-normal mb-4">
                    Generate a secure public link for external clients or lawyers to view and e-sign this document.
                  </p>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={typeof window !== "undefined" ? `${window.location.origin}/share/${contractId}` : `/share/${contractId}`}
                      className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-[10px] font-mono text-zinc-500 focus:outline-none"
                    />
                    <Button
                      size="xs"
                      onClick={() => {
                        const link = `${window.location.origin}/share/${contractId}`;
                        navigator.clipboard.writeText(link);
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 2000);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer shrink-0 rounded-lg h-8"
                    >
                      {copiedLink ? "Copied!" : "Copy Link"}
                    </Button>
                  </div>
                </div>

                {/* E-Signing Actions */}
                <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-2xs">
                  <h4 className="text-xs font-black text-zinc-800 tracking-tight uppercase flex items-center gap-2 mb-3">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    E-Signatures
                  </h4>
                  
                  {contractData.status === "Signed" || signatures.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-1.5 text-emerald-600 text-[11px] font-black">
                        <CheckCircle2 className="h-4 w-4" />
                        Signed & Locked
                      </div>
                      
                      <div className="space-y-3.5 mt-2">
                        {signatures.map((sig) => (
                          <div key={sig.id} className="p-3 bg-zinc-50 border border-zinc-155 rounded-xl text-[11px] text-zinc-600 font-semibold space-y-1">
                            <div>
                              <span className="text-zinc-400 uppercase text-[8px] font-black block">Signer:</span>
                              <span className="font-extrabold text-zinc-800">{sig.signer_name}</span>
                            </div>
                            <div>
                              <span className="text-zinc-400 uppercase text-[8px] font-black block">Email:</span>
                              <span>{sig.signer_email}</span>
                            </div>
                            {sig.verification_token && (
                              <div>
                                <span className="text-zinc-400 uppercase text-[8px] font-black block">Audit Hash:</span>
                                <span className="font-mono text-[9px] font-black bg-zinc-200 px-1 py-0.5 rounded">
                                  {sig.verification_token}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-[11px] text-zinc-500 font-semibold leading-normal mb-4">
                        This agreement requires signatures from both parties to complete the deal stage.
                      </p>
                      <Button
                        onClick={() => setIsSigningOpen(true)}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-blue-100 rounded-xl h-9"
                      >
                        <PenTool className="h-4 w-4" />
                        E-Sign Contract
                      </Button>
                    </div>
                  )}
                </div>

                {/* Redlines thread */}
                <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-2xs space-y-3">
                  <h4 className="text-xs font-black text-zinc-800 tracking-tight uppercase flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                    {activeClauseIndex !== null ? `Comments: Clause #${activeClauseIndex + 1}` : "Clause Redlines"}
                  </h4>
                  
                  <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
                    {comments.filter(c => activeClauseIndex === null || c.clause_index === activeClauseIndex).length === 0 ? (
                      <div className="text-center py-6 text-zinc-400 text-[10px] font-bold">
                        {activeClauseIndex !== null
                          ? "No redline comments on this clause yet."
                          : "Select any clause paragraph in the document to see or leave specific redline comments."}
                      </div>
                    ) : (
                      comments
                        .filter(c => activeClauseIndex === null || c.clause_index === activeClauseIndex)
                        .map((c) => (
                          <div key={c.id} className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-155 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black text-zinc-700 leading-none">{c.author_name}</span>
                              <span className="text-[8px] text-zinc-400 font-bold">
                                {new Date(c.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            <p className="text-[11px] font-medium text-zinc-600 leading-normal">{c.text}</p>
                          </div>
                        ))
                    )}
                  </div>
                  
                  {contractData.status !== "Signed" && (
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      if (!commentText) return;
                      await postComment(parseInt(contractId), commentText, activeClauseIndex !== null ? activeClauseIndex : undefined);
                      setCommentText("");
                    }} className="border-t border-zinc-100 pt-3 flex gap-2">
                      <input
                        type="text"
                        placeholder="Add annotation..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        required
                        className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold focus:outline-none focus:border-blue-500"
                      />
                      <Button
                        type="submit"
                        size="xs"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer h-7"
                      >
                        Post
                      </Button>
                    </form>
                  )}
                </div>

              </div>

            </div>
          </div>
        )}

      </div>

      {/* CUSTOM DATE ADD/EDIT DIALOG MODAL */}
      {isDateModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white border border-zinc-200 rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in">
            <div className="bg-zinc-50 border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-sm font-black text-zinc-900">
                {editingDateId ? "Edit Milestone" : "Add Custom Milestone"}
              </h3>
              <button 
                onClick={() => {
                  setIsDateModalOpen(false);
                  setEditingDateId(null);
                }}
                className="h-7 w-7 rounded-md hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDate} className="p-6 space-y-4">
              {/* Title Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Milestone Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Initial Term End"
                  value={dateForm.title}
                  onChange={(e) => setDateForm({ ...dateForm, title: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-blue-500 rounded-lg text-sm font-semibold p-2.5 text-zinc-800 outline-none transition-colors"
                />
              </div>

              {/* Date Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Target Date</label>
                <input 
                  type="date" 
                  required
                  value={dateForm.date}
                  onChange={(e) => setDateForm({ ...dateForm, date: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-blue-500 rounded-lg text-sm font-semibold p-2.5 text-zinc-800 outline-none transition-colors"
                />
              </div>

              {/* Badge Selection */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Classification</label>
                <select 
                  value={dateForm.badge}
                  onChange={(e) => setDateForm({ ...dateForm, badge: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-blue-500 rounded-lg text-sm font-semibold p-2.5 text-zinc-800 outline-none transition-colors"
                >
                  <option value="Critical - Renewal">Critical - Renewal</option>
                  <option value="Important">Important</option>
                  <option value="Upcoming">Upcoming</option>
                </select>
              </div>

              {/* Description Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Description</label>
                <textarea 
                  rows={3}
                  placeholder="Summarize the action or obligation required on this date..."
                  value={dateForm.description}
                  onChange={(e) => setDateForm({ ...dateForm, description: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-blue-500 rounded-lg text-sm font-semibold p-2.5 text-zinc-800 outline-none transition-colors resize-none"
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setIsDateModalOpen(false);
                    setEditingDateId(null);
                  }}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
                >
                  Save Milestone
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* E-SIGNATURE MODAL */}
      {isSigningOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white border border-zinc-200 rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in">
            <div className="bg-zinc-50 border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-sm font-black text-zinc-900">E-Sign Agreement</h3>
              <button 
                onClick={() => setIsSigningOpen(false)}
                className="h-7 w-7 rounded-md hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!signerName || !signerEmail) return;
              setIsSubmittingSignature(true);
              try {
                await signContract(parseInt(contractId), signerName, signerEmail, signerName);
                setContractData((prev: any) => ({ ...prev, status: "Signed" }));
                setIsSigningOpen(false);
                setSignerName("");
                setSignerEmail("");
              } catch (err) {
                alert("Signing failed.");
              } finally {
                setIsSubmittingSignature(false);
              }
            }} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. John Doe"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-blue-500 rounded-lg text-sm font-semibold p-2.5 text-zinc-800 outline-none transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Email Address</label>
                <input 
                  type="email" 
                  required
                  placeholder="e.g. john@acme.com"
                  value={signerEmail}
                  onChange={(e) => setSignerEmail(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-blue-500 rounded-lg text-sm font-semibold p-2.5 text-zinc-800 outline-none transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Signature Preview</label>
                <div className="h-24 border border-zinc-200 rounded-lg bg-zinc-50 flex items-center justify-center font-serif text-xl italic text-blue-700 tracking-wide">
                  {signerName || "Typographic Signature"}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsSigningOpen(false)}
                  disabled={isSubmittingSignature}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  size="sm"
                  disabled={isSubmittingSignature || !signerName || !signerEmail}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  {isSubmittingSignature ? "Signing..." : "Verify & Sign"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
