"use client";

import { useEffect, useState, useMemo } from "react";
import { useCrmStore, Pipeline } from "@/lib/store/useCrmStore";
import { useContractsStore } from "@/lib/store/useContractsStore";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import {
  FolderSync,
  Plus,
  TrendingUp,
  DollarSign,
  Briefcase,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Calendar,
  X,
  Sparkles,
} from "lucide-react";

const STAGES: Pipeline["stage"][] = [
  "Drafting",
  "Internal Review",
  "In Negotiation",
  "Out for Signature",
  "Signed",
  "Active",
];

const STAGE_LABELS: Record<Pipeline["stage"], string> = {
  "Drafting": "Drafting",
  "Internal Review": "Internal Review",
  "In Negotiation": "In Negotiation",
  "Out for Signature": "Out for Signature",
  "Signed": "Signed",
  "Active": "Active",
};

const STAGE_COLORS: Record<Pipeline["stage"], { border: string; bg: string; dot: string }> = {
  "Drafting": { border: "border-slate-200", bg: "bg-slate-50", dot: "bg-slate-400" },
  "Internal Review": { border: "border-amber-200", bg: "bg-amber-50/50", dot: "bg-amber-400" },
  "In Negotiation": { border: "border-blue-200", bg: "bg-blue-50/50", dot: "bg-blue-500" },
  "Out for Signature": { border: "border-purple-200", bg: "bg-purple-50/50", dot: "bg-purple-500" },
  "Signed": { border: "border-emerald-200", bg: "bg-emerald-50/50", dot: "bg-emerald-500" },
  "Active": { border: "border-teal-200", bg: "bg-teal-50/50", dot: "bg-teal-500" },
};

export default function PipelinePage() {
  const {
    pipelines,
    counterparties,
    isLoading,
    fetchCrmData,
    addPipeline,
    updatePipelineStage,
    deletePipeline,
    seedCrmData,
  } = useCrmStore();

  const { contracts, fetchContracts } = useContractsStore();
  const { addToast } = useToast();

  const [isNewDealOpen, setIsNewDealOpen] = useState(false);
  const [dealName, setDealName] = useState("");
  const [dealValue, setDealValue] = useState("");
  const [selectedCounterpartyId, setSelectedCounterpartyId] = useState("");
  const [selectedStage, setSelectedStage] = useState<Pipeline["stage"]>("Drafting");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCrmData();
    fetchContracts();
  }, [fetchCrmData, fetchContracts]);

  // Aggregate deal statistics
  const stats = useMemo(() => {
    const totalCount = pipelines.length;
    const totalValue = pipelines.reduce((sum, p) => sum + p.value, 0);
    const activePipelineVal = pipelines
      .filter((p) => p.stage !== "Signed" && p.stage !== "Active")
      .reduce((sum, p) => sum + p.value, 0);
    return { totalCount, totalValue, activePipelineVal };
  }, [pipelines]);

  // Group pipelines by stage
  const groupedPipelines = useMemo(() => {
    const groups: Record<Pipeline["stage"], Pipeline[]> = {
      "Drafting": [],
      "Internal Review": [],
      "In Negotiation": [],
      "Out for Signature": [],
      "Signed": [],
      "Active": [],
    };
    pipelines.forEach((p) => {
      if (groups[p.stage]) {
        groups[p.stage].push(p);
      }
    });
    return groups;
  }, [pipelines]);

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealName) return;

    setIsSubmitting(true);
    try {
      await addPipeline({
        deal_name: dealName,
        value: parseFloat(dealValue) || 0,
        counterparty_id: selectedCounterpartyId ? parseInt(selectedCounterpartyId) : undefined,
        stage: selectedStage,
      });

      addToast({
        type: "success",
        title: "Deal added to pipeline!",
        message: `Successfully created "${dealName}".`,
      });

      // Reset
      setDealName("");
      setDealValue("");
      setSelectedCounterpartyId("");
      setSelectedStage("Drafting");
      setIsNewDealOpen(false);
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Submission failed",
        message: err.message || "Failed to create deal. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMoveStage = async (id: number, currentStage: Pipeline["stage"], direction: "left" | "right") => {
    const currentIndex = STAGES.indexOf(currentStage);
    let newIndex = currentIndex + (direction === "left" ? -1 : 1);
    if (newIndex < 0 || newIndex >= STAGES.length) return;

    try {
      await updatePipelineStage(id, STAGES[newIndex]);
      addToast({
        type: "success",
        title: "Deal stage updated",
        message: `Deal moved to ${STAGE_LABELS[STAGES[newIndex]]}.`,
      });
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Error moving deal",
        message: "Failed to update database record.",
      });
    }
  };

  const handleDeleteDeal = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete the deal "${name}"?`)) return;
    try {
      await deletePipeline(id);
      addToast({
        type: "success",
        title: "Deal deleted",
        message: "Deal has been removed from your pipeline.",
      });
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Deletion failed",
        message: "Could not remove deal record.",
      });
    }
  };

  const handleSeedData = async () => {
    try {
      await seedCrmData();
      addToast({
        type: "success",
        title: "Mock data seeded",
        message: "Initialized CRM counterparties and deal cards successfully.",
      });
    } catch (err) {
      addToast({
        type: "error",
        title: "Seeding failed",
        message: "Failed to seed demo data.",
      });
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6 select-none p-1">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <FolderSync className="h-6 w-6 text-blue-600 animate-pulse" />
            CRM Deal Pipeline
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Track deals, contract staging negotiations, and total pipeline volumes.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {pipelines.length === 0 && (
            <button
              onClick={handleSeedData}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100/80 rounded-xl border border-blue-200/50 transition-all cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: "4s" }} />
              Seed Mock CRM Data
            </button>
          )}
          <button
            onClick={() => setIsNewDealOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-black text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-xl shadow-md shadow-blue-100 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Deal Card
          </button>
        </div>
      </div>

      {/* ── Metrics Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1 */}
        <div className="relative overflow-hidden bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active Pipeline Value</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(stats.activePipelineVal)}</p>
              <p className="text-[11px] text-slate-500 font-medium mt-1">Excludes Closed/Signed agreements</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="relative overflow-hidden bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Pipeline Value</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(stats.totalValue)}</p>
              <p className="text-[11px] text-slate-500 font-medium mt-1">Cumulative value of all {stats.totalCount} deals</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="relative overflow-hidden bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Client Relationships</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{counterparties.length}</p>
              <p className="text-[11px] text-slate-500 font-medium mt-1">Registered partner profiles</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <Briefcase className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Kanban Board Layout ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-pulse">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="h-96 rounded-2xl bg-slate-100/50 border border-slate-200/40 p-4 space-y-4">
              <div className="h-4 bg-slate-200 rounded w-2/3" />
              <div className="h-28 bg-slate-200 rounded-xl" />
              <div className="h-28 bg-slate-200 rounded-xl" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin select-none max-w-full">
          {STAGES.map((stage) => {
            const list = groupedPipelines[stage] || [];
            const sumValue = list.reduce((s, p) => s + p.value, 0);
            const style = STAGE_COLORS[stage];

            return (
              <div
                key={stage}
                className="flex-shrink-0 w-80 rounded-2xl p-4 flex flex-col min-h-[480px] bg-slate-50 border border-slate-200/60 shadow-sm"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                    <h3 className="font-black text-[13px] text-slate-800 tracking-tight">
                      {STAGE_LABELS[stage]}
                    </h3>
                    <span className="text-[10px] font-black text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded-full">
                      {list.length}
                    </span>
                  </div>
                  {sumValue > 0 && (
                    <span className="text-[10px] font-black text-slate-600 bg-slate-200/30 px-2.5 py-0.5 rounded-lg border border-slate-200/20">
                      {formatCurrency(sumValue)}
                    </span>
                  )}
                </div>

                {/* Card stack */}
                <div className="flex-1 space-y-3 overflow-y-auto max-h-[500px] pr-1.5 scrollbar-thin">
                  {list.length === 0 ? (
                    <div className="h-24 border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-[11px] font-semibold bg-white/40">
                      No deals in this stage
                    </div>
                  ) : (
                    list.map((pipe) => {
                      // Find contracts linked to this pipeline
                      const linkedContracts = contracts.filter((c) => c.pipeline_id === pipe.id);
                      const hasHighRisk = linkedContracts.some((c) => c.risk === "High");

                      return (
                        <div
                          key={pipe.id}
                          className="bg-white border border-slate-200/70 hover:border-slate-300 hover:shadow-md transition-all duration-200 rounded-xl p-4 space-y-3 relative group"
                        >
                          {/* Card Actions (Hover delete) */}
                          <button
                            onClick={() => handleDeleteDeal(pipe.id, pipe.deal_name)}
                            className="absolute top-3 right-3 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-100 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>

                          <div className="space-y-1 pr-6">
                            <h4 className="font-black text-[12px] text-slate-800 tracking-tight leading-tight">
                              {pipe.deal_name}
                            </h4>
                            {pipe.counterparty_name && (
                              <p className="text-[10px] font-bold text-slate-400 leading-none">
                                {pipe.counterparty_name}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[12px] font-black text-slate-900">
                              {formatCurrency(pipe.value)}
                            </span>

                            {/* Risk alert badge if contract is linked */}
                            {linkedContracts.length > 0 && (
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] font-black text-slate-400 bg-slate-100 border border-slate-200/50 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                                  <Briefcase className="h-2.5 w-2.5 text-slate-500" />
                                  {linkedContracts.length}
                                </span>
                                {hasHighRisk && (
                                  <span className="text-[9px] font-black text-red-600 bg-red-50 border border-red-200/50 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                                    <AlertTriangle className="h-2.5 w-2.5 text-red-500" />
                                    Risk
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Quick movement controls */}
                          <div className="flex items-center justify-end gap-1.5 border-t border-slate-100 pt-2 bg-slate-50/50 -mx-4 -mb-4 px-4 py-2 rounded-b-xl">
                            {stage !== STAGES[0] && (
                              <button
                                onClick={() => handleMoveStage(pipe.id, pipe.stage, "left")}
                                className="h-6 w-6 border border-slate-200 rounded-md flex items-center justify-center text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Move back stage"
                              >
                                <ArrowLeft className="h-3 w-3" />
                              </button>
                            )}
                            <span className="text-[9px] font-bold text-slate-400 flex-1 text-center">
                              Move
                            </span>
                            {stage !== STAGES[STAGES.length - 1] && (
                              <button
                                onClick={() => handleMoveStage(pipe.id, pipe.stage, "right")}
                                className="h-6 w-6 border border-slate-200 rounded-md flex items-center justify-center text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Move forward stage"
                              >
                                <ArrowRight className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Dialog: Create Deal ── */}
      {isNewDealOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-slide-up">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsNewDealOpen(false)} />
          <div className="bg-white rounded-2xl border border-slate-200/80 w-full max-w-md relative z-10 shadow-2xl overflow-hidden animate-scale-in">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between">
              <div>
                <h2 className="text-base font-black text-slate-950">Add Pipeline Deal Card</h2>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Create a deal card to track negotiation and contract execution.
                </p>
              </div>
              <button
                onClick={() => setIsNewDealOpen(false)}
                className="h-7 w-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDeal} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Deal Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={dealName}
                  onChange={(e) => setDealName(e.target.value)}
                  placeholder="e.g. Acme Enterprise SaaS Licensing"
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Deal Value ($)
                  </label>
                  <input
                    type="number"
                    value={dealValue}
                    onChange={(e) => setDealValue(e.target.value)}
                    placeholder="e.g. 50000"
                    className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Starting Stage
                  </label>
                  <select
                    value={selectedStage}
                    onChange={(e) => setSelectedStage(e.target.value as Pipeline["stage"])}
                    className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                  >
                    {STAGES.map((s) => (
                      <option key={s} value={s}>
                        {STAGE_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Associated Counterparty
                </label>
                <select
                  value={selectedCounterpartyId}
                  onChange={(e) => setSelectedCounterpartyId(e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                >
                  <option value="">-- No linked contact --</option>
                  {counterparties.map((cp) => (
                    <option key={cp.id} value={cp.id}>
                      {cp.company_name} ({cp.industry || "General"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsNewDealOpen(false)}
                  disabled={isSubmitting}
                  className="cursor-pointer text-slate-600 hover:text-slate-900 font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !dealName}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold cursor-pointer shadow-md shadow-blue-200 rounded-xl"
                >
                  {isSubmitting ? "Creating..." : "Create Deal"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
