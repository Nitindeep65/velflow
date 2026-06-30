"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContractsStore } from "@/lib/store/useContractsStore";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useCrmStore } from "@/lib/store/useCrmStore";
import { useTasksStore } from "@/lib/store/useTasksStore";
import { Button } from "@/components/ui/button";
import {
  FileText,
  AlertTriangle,
  Calendar,
  Sparkles,
  Files,
  ArrowRight,
  Upload,
  Clock,
  RefreshCcw,
  CheckCircle2,
  CalendarDays,
  FileUp,
  X,
  ShieldAlert,
  FolderSync,
  Zap,
  BarChart3,
  TrendingUp,
  Activity,
} from "lucide-react";
import { RiskBadge } from "@/components/contract/risk-badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

function getGreeting(name: string) {
  const hour = new Date().getHours();
  const first = name.split(" ")[0] || name;
  if (hour < 12) return { text: `Good morning, ${first}`, emoji: "☀️" };
  if (hour < 17) return { text: `Good afternoon, ${first}`, emoji: "👋" };
  return { text: `Good evening, ${first}`, emoji: "🌙" };
}

interface StatCardProps {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ElementType;
  gradient: string;
  glowColor: string;
  delay?: number;
}

function StatCard({ label, value, sub, icon: Icon, gradient, glowColor, delay = 0 }: StatCardProps) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 bg-white border border-slate-100 hover:border-slate-200/80 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05),0_10px_20px_-8px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_30px_-5px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group cursor-default animate-fade-slide-up"
      style={{
        animationDelay: `${delay}ms`,
      }}
    >
      {/* Top gradient bar */}
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: gradient }} />

      {/* Background glow */}
      <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full opacity-[0.03] transition-all duration-500 group-hover:scale-125 group-hover:opacity-[0.08]"
        style={{ background: gradient, filter: "blur(20px)" }} />

      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-sans">{label}</p>
          <p className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans leading-none">{value}</p>
          <p className="text-[11px] font-medium text-slate-500 font-sans mt-1.5">{sub}</p>
        </div>
        <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-115"
          style={{ background: `${glowColor.replace("0.1", "0.08")}`, border: `1px solid ${glowColor.replace("0.1", "0.15")}` }}>
          <Icon className="h-4.5 w-4.5" style={{ color: gradient.includes("59,130,246") ? "#3b82f6" : (gradient.includes("239,68,68") || gradient.includes("225,29,72")) ? "#ef4444" : gradient.includes("245,158,11") ? "#f59e0b" : "#10b981" }} />
        </div>
      </div>
    </div>
  );
}

export default function DashboardHome() {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated } = useAuthStore();
  const { contracts, isLoading, fetchContracts, addContract, restoreDefaults } = useContractsStore();
  const { fetchCrmData, pipelines } = useCrmStore();
  const { fetchTasks, tasks, toggleTaskCompleted } = useTasksStore();
  const { addToast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      fetchContracts();
      fetchCrmData();
      fetchTasks();
    }
  }, [fetchContracts, fetchCrmData, fetchTasks, isHydrated, isAuthenticated]);

  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const stats = useMemo(() => {
    const total = contracts.length;
    const high = contracts.filter((c) => c.risk === "High").length;
    const medium = contracts.filter((c) => c.risk === "Medium").length;
    const low = contracts.filter((c) => c.risk === "Low").length;
    const needsReview = contracts.filter((c) => c.status === "Needs Review").length;
    const analyzed = contracts.filter((c) => c.status === "Analyzed").length;
    return { total, high, medium, low, needsReview, analyzed };
  }, [contracts]);

  const upcomingMilestones = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const list: any[] = [];
    contracts.forEach((c) => {
      const timeline = (c as any).dates_timeline || [];
      timeline.forEach((item: any) => {
        if (item.active && item.date) {
          try {
            const d = new Date(item.date);
            if (d >= today) {
              list.push({ id: item.id, title: item.title, dateStr: item.date, dateObj: d, badge: item.badge, contractId: c.id, contractName: c.name, description: item.description });
            }
          } catch { }
        }
      });
    });
    list.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
    return list;
  }, [contracts]);

  const nextMilestone = upcomingMilestones[0] || null;
  const recentContracts = useMemo(() => [...contracts].slice(0, 5), [contracts]);

  const percentages = useMemo(() => {
    const total = stats.total;
    if (total === 0) return { high: 0, medium: 0, low: 0 };
    return {
      high: Math.round((stats.high / total) * 100),
      medium: Math.round((stats.medium / total) * 100),
      low: Math.round((stats.low / total) * 100),
    };
  }, [stats]);

  const pipelineValue = useMemo(() => {
    return pipelines.reduce((sum, p) => sum + p.value, 0);
  }, [pipelines]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatDate = (dateString: string) => {
    try { return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }); }
    catch { return dateString; }
  };

  const getDaysUntil = (dateStr: string) => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const d = new Date(dateStr);
    return Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      const f = e.dataTransfer.files[0];
      const ext = f.name.split(".").pop()?.toLowerCase();
      if (ext === "pdf" || ext === "docx") { setFile(f); setUploadError(null); }
      else setUploadError("Only PDF and DOCX files are allowed.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const f = e.target.files[0];
      const ext = f.name.split(".").pop()?.toLowerCase();
      if (ext === "pdf" || ext === "docx") { setFile(f); setUploadError(null); }
      else setUploadError("Only PDF and DOCX files are allowed.");
    }
  };

  const handleUploadSubmit = async () => {
    if (!file) return;
    setIsUploading(true);
    setUploadError(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      await addContract(formData);
      await fetchContracts();
      const state = useContractsStore.getState();
      const latestContract = state.contracts[0];
      setFile(null);
      addToast({ type: "success", title: "Contract analyzed!", message: "AI has extracted risks, dates, and key terms." });
      if (latestContract?.id) router.push(`/dashboard/contracts/${latestContract.id}`);
    } catch (err: any) {
      setUploadError(err.message || "Failed to analyze contract.");
      addToast({ type: "error", title: "Upload failed", message: err.message || "Please try again." });
    } finally {
      setIsUploading(false);
    }
  };

  const greeting = user?.full_name ? getGreeting(user.full_name) : null;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none">

      {/* ── Hero Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border border-slate-100 rounded-2xl shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] animate-fade-slide-up">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
              {greeting ? greeting.text : "Welcome back"}
            </h2>
            {greeting && <span className="text-xl transition-transform duration-300 hover:rotate-12 cursor-default">{greeting.emoji}</span>}
          </div>
          <p className="text-xs text-slate-500 mt-1.5 font-medium leading-relaxed">
            {stats.total > 0
              ? `VelFlow AI has audited and processed ${stats.analyzed} of ${stats.total} active document${stats.total !== 1 ? "s" : ""}.`
              : "Upload your first contract to get started with instant AI metadata analysis."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchContracts()}
            disabled={isLoading}
            className="h-9 text-slate-600 hover:text-slate-950 border-slate-200 cursor-pointer text-xs font-semibold px-4 flex items-center gap-2 shadow-xs transition-colors rounded-xl"
          >
            <RefreshCcw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
            Sync
          </Button>
          {contracts.length === 0 && (
            <Button
              size="sm"
              onClick={restoreDefaults}
              className="h-9 text-xs font-bold px-4 flex items-center gap-2 cursor-pointer rounded-xl hover:opacity-95 transition-opacity"
              style={{ background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", boxShadow: "0 4px 14px rgba(59,130,246,0.25)", color: "white" }}
            >
              <FolderSync className="h-3.5 w-3.5" />
              Load Demo
            </Button>
          )}
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Agreements" value={stats.total} sub={`${stats.analyzed} AI-analyzed`} icon={FileText}
          gradient="linear-gradient(135deg, #3b82f6, #2563eb)" glowColor="rgba(59,130,246,0.1)" delay={0} />
        <StatCard label="Critical Risks" value={stats.high} sub={stats.high > 0 ? "High severity flagged" : "No critical issues"} icon={ShieldAlert}
          gradient="linear-gradient(135deg, #ef4444, #e11d48)" glowColor="rgba(239,68,68,0.1)" delay={60} />
        <StatCard label="Deal Pipeline" value={formatCurrency(pipelineValue)} sub={`${pipelines.length} active deal cards`} icon={TrendingUp}
          gradient="linear-gradient(135deg, #f59e0b, #d97706)" glowColor="rgba(245,158,11,0.1)" delay={120} />
        <StatCard
          label="Next Obligation"
          value={nextMilestone ? formatDate(nextMilestone.dateStr) : "—"}
          sub={nextMilestone ? nextMilestone.title : "No upcoming deadlines"}
          icon={CalendarDays}
          gradient="linear-gradient(135deg, #10b981, #059669)"
          glowColor="rgba(16,185,129,0.1)"
          delay={180}
        />
      </div>

      {/* ── Main 2-Column Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── Left Column (7 cols) ── */}
        <div className="lg:col-span-7 space-y-6">

          {/* Upload Zone Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] overflow-hidden animate-fade-slide-up"
            style={{ animationDelay: "200ms" }}>

            {/* Card Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-blue-50 border border-blue-100">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Instant AI Analysis</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Drop a contract to extract risks, timelines, and key terms</p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50/50 border border-blue-100">
                <Zap className="h-3 w-3 text-blue-500" />
                <span className="text-[9px] font-black text-blue-600 uppercase tracking-wider">Instant</span>
              </div>
            </div>

            {/* Drop Zone */}
            <div className="p-5">
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={cn(
                  "rounded-xl p-8 text-center transition-all duration-300 cursor-pointer flex flex-col items-center justify-center min-h-[180px] relative select-none border-2 border-dashed",
                  dragActive
                    ? "border-blue-500 bg-blue-50/30"
                    : file
                    ? "border-blue-300 bg-blue-50/10"
                    : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300",
                  isUploading && "pointer-events-none"
                )}
              >
                <input ref={fileInputRef} type="file" accept=".pdf,.docx" onChange={handleFileChange} className="hidden" disabled={isUploading} />

                {isUploading ? (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative flex items-center justify-center">
                      <div className="h-14 w-14 rounded-full border-2 border-blue-100 border-t-blue-600 animate-spin" />
                      <Sparkles className="h-5 w-5 text-blue-600 absolute animate-pulse" />
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-sm font-bold text-slate-800">AI Analyzing Agreement...</p>
                      <p className="text-[11px] text-slate-400 max-w-xs leading-normal font-medium">
                        Extracting liability clauses, risk vectors, and notice deadlines.
                      </p>
                    </div>
                    <div className="w-48 h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full animate-progress" style={{ background: "linear-gradient(90deg, #3b82f6, #6366f1)" }} />
                    </div>
                  </div>
                ) : file ? (
                  <div className="flex flex-col items-center space-y-4 w-full" onClick={(e) => e.stopPropagation()}>
                    <div className="h-12 w-12 rounded-xl flex items-center justify-center animate-float"
                      style={{ background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)", border: "1px solid rgba(59,130,246,0.2)" }}>
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="space-y-1 text-center">
                      <p className="text-sm font-bold text-slate-800 truncate max-w-xs">{file.name}</p>
                      <p className="text-[11px] text-slate-400 font-medium">{(file.size / 1024).toFixed(1)} KB · Ready for extraction</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setFile(null)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                        style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                        <X className="h-3 w-3" /> Clear
                      </button>
                      <button onClick={handleUploadSubmit} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[11px] font-bold text-white transition-all cursor-pointer"
                        style={{ background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)", boxShadow: "0 2px 10px rgba(59,130,246,0.3)" }}>
                        <Upload className="h-3 w-3" /> Analyze Document
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-3">
                    <div className="h-12 w-12 rounded-2xl flex items-center justify-center animate-float"
                      style={{ background: "linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)", border: "1px solid rgba(99,102,241,0.15)" }}>
                      <FileUp className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="space-y-1 text-center">
                      <p className="text-sm font-semibold text-slate-600">
                        Drop your contract or{" "}
                        <span className="text-blue-600 font-bold underline decoration-dotted">browse files</span>
                      </p>
                      <p className="text-[11px] text-slate-400 font-medium">PDF or DOCX · up to 10MB</p>
                    </div>
                  </div>
                )}
              </div>

              {uploadError && (
                <div className="mt-3 p-3 rounded-lg flex items-start gap-2 text-xs animate-fade-slide-up"
                  style={{ background: "#fff1f2", border: "1px solid rgba(239,68,68,0.12)", color: "#b91c1c" }}>
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span className="font-medium">{uploadError}</span>
                </div>
              )}
            </div>
          </div>

          {/* Risk Distribution Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] overflow-hidden animate-fade-slide-up"
            style={{ animationDelay: "260ms" }}>
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-blue-50 border border-blue-100">
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Clause Risk Distribution</h3>
                <p className="text-[11px] text-slate-500 font-medium">Threat distribution across all active agreements</p>
              </div>
            </div>
            <div className="p-5 space-y-4">
              {stats.total === 0 ? (
                <div className="text-center py-10">
                  <Activity className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                  <p className="text-xs text-slate-400 font-medium">Upload contracts to see risk distribution</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3.5">
                    {[
                      { label: "High Risk", count: stats.high, pct: percentages.high, gradient: "linear-gradient(90deg, #ef4444, #e11d48)", dot: "#ef4444", text: "#dc2626" },
                      { label: "Medium Risk", count: stats.medium, pct: percentages.medium, gradient: "linear-gradient(90deg, #f59e0b, #d97706)", dot: "#f59e0b", text: "#b45309" },
                      { label: "Low Risk", count: stats.low, pct: percentages.low, gradient: "linear-gradient(90deg, #10b981, #059669)", dot: "#10b981", text: "#047857" },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1.5">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: item.dot }} />
                            {item.label}
                          </span>
                          <span className="font-bold" style={{ color: item.text }}>
                            {item.pct}% <span className="text-slate-400 font-normal">({item.count})</span>
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "#f1f5f9" }}>
                          <div className="h-full rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${item.pct}%`, background: item.gradient }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3.5 rounded-xl text-[11px] text-slate-600 leading-relaxed font-medium"
                    style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                    {stats.high > 0 ? (
                      <><span className="font-bold text-slate-800">Recommendation:</span> {stats.high} high-severity element{stats.high !== 1 ? "s" : ""} detected. Review termination structures, auto-renew windows, and indemnity caps.</>
                    ) : (
                      <><span className="font-bold" style={{ color: "#059669" }}>✓ Stable:</span> No major risk inconsistencies detected across your active portfolio.</>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Right Column (5 cols) ── */}
        <div className="lg:col-span-5 space-y-5">

          {/* Recent Agreements */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] overflow-hidden animate-fade-slide-up"
            style={{ animationDelay: "240ms" }}>
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-blue-50 border border-blue-100">
                  <Files className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Recent Agreements</h3>
              </div>
              <Link href="/dashboard/contracts" className="flex items-center gap-0.5 text-[11px] font-bold text-blue-600 hover:text-blue-700 group">
                View All
                <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            <div className="p-2">
              {recentContracts.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                  <p className="text-xs text-slate-400 font-medium">No contracts uploaded yet.</p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {recentContracts.map((contract, idx) => (
                    <div
                      key={contract.id}
                      onClick={() => router.push(`/dashboard/contracts/${contract.id}`)}
                      className="px-3 py-3 rounded-xl flex items-center justify-between gap-3 transition-colors duration-150 cursor-pointer hover:bg-slate-50/70 group"
                      style={{ animationDelay: `${idx * 40}ms` }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Rank */}
                        <div className="h-6 w-6 rounded-md flex items-center justify-center text-[9px] font-black text-slate-400 shrink-0 bg-slate-50">
                          {idx + 1}
                        </div>
                        {/* Risk bar */}
                        <div className="w-1 h-8 rounded-full shrink-0"
                          style={{ background: contract.risk === "High" ? "#ef4444" : contract.risk === "Medium" ? "#f59e0b" : "#10b981" }} />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{contract.name}</h4>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5 truncate">{contract.counterparty} · {contract.type}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <RiskBadge risk={contract.risk} showDot={false} className="py-0.5 text-[9px]" />
                        <ArrowRight className="h-3 w-3 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Milestones */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] overflow-hidden animate-fade-slide-up"
            style={{ animationDelay: "300ms" }}>
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-emerald-50 border border-emerald-100">
                <Calendar className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Upcoming Milestones</h3>
                <p className="text-[11px] text-slate-500 font-medium">AI-extracted notice and renewal windows</p>
              </div>
            </div>
            <div className="p-5">
              {upcomingMilestones.length === 0 ? (
                <div className="text-center py-10">
                  <CalendarDays className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                  <p className="text-xs text-slate-400 font-medium">No upcoming deadlines scheduled.</p>
                </div>
              ) : (
                <div className="relative pl-4 space-y-5 border-l-2 border-slate-100">
                  {upcomingMilestones.slice(0, 4).map((item, idx) => {
                    const daysUntil = getDaysUntil(item.dateStr);
                    const isCritical = item.badge?.includes("Critical");
                    const isImportant = item.badge?.includes("Important");
                    const dotColor = isCritical ? "#ef4444" : isImportant ? "#f59e0b" : "#3b82f6";
                    return (
                      <div key={item.id} className="relative animate-fade-slide-up" style={{ animationDelay: `${idx * 60}ms` }}>
                        <span className="absolute -left-[21px] top-1 h-3 w-3 rounded-full border-2 border-white ring-1"
                          style={{ background: dotColor, boxShadow: `0 0 0 2px ${dotColor}25` }} />
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-black text-slate-400">{formatDate(item.dateStr)}</span>
                            <div className="flex items-center gap-1.5">
                              {daysUntil <= 30 && (
                                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md"
                                  style={daysUntil <= 7
                                    ? { background: "#fff1f2", color: "#dc2626", border: "1px solid rgba(239,68,68,0.12)" }
                                    : { background: "#fffbeb", color: "#b45309", border: "1px solid rgba(245,158,11,0.12)" }}>
                                  {daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `${daysUntil}d`}
                                </span>
                              )}
                              <span className="text-[8px] uppercase tracking-wide px-1.5 py-0.5 rounded-md font-bold"
                                style={isCritical
                                  ? { background: "#fff1f2", color: "#dc2626", border: "1px solid rgba(239,68,68,0.12)" }
                                  : isImportant
                                  ? { background: "#fffbeb", color: "#b45309", border: "1px solid rgba(245,158,11,0.12)" }
                                  : { background: "#eff6ff", color: "#1d4ed8", border: "1px solid rgba(59,130,246,0.12)" }}>
                                {item.badge}
                              </span>
                            </div>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 leading-snug">{item.title}</h4>
                          <p className="text-[10px] text-slate-400 font-medium truncate">{item.contractName}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* AI Obligation Checklist */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] overflow-hidden animate-fade-slide-up"
            style={{ animationDelay: "340ms" }}>
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-blue-50 border border-blue-100">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">AI Obligation Tracker</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Extracted post-signature tasks</p>
                </div>
              </div>
            </div>
            <div className="p-5">
              {tasks.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 font-medium">No obligations extracted yet.</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Click 'Load Demo' or seed CRM records.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.slice(0, 5).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 p-2.5 hover:bg-slate-50 rounded-xl transition-all border border-slate-100/50"
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={async (e) => {
                          await toggleTaskCompleted(task.id, e.target.checked);
                          addToast({
                            type: "success",
                            title: e.target.checked ? "Obligation completed!" : "Obligation reopened",
                            message: `Task status updated in database.`,
                          });
                        }}
                        className="mt-1 h-3.5 w-3.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold leading-snug ${task.completed ? "line-through text-slate-400" : "text-slate-800"}`}>
                          {task.title}
                        </p>
                        {task.due_date && (
                          <div className="flex items-center gap-1.5 mt-1 text-[9px] font-bold text-slate-400">
                            <CalendarDays className="h-3 w-3 shrink-0" />
                            <span>Due: {formatDate(task.due_date)}</span>
                            {task.contract_name && (
                              <>
                                <span>•</span>
                                <span className="truncate max-w-[120px]">{task.contract_name}</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
