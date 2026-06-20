"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContractsStore } from "@/lib/store/useContractsStore";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { RiskBadge } from "@/components/contract/risk-badge";
import { StatusPill } from "@/components/contract/status-pill";
import { cn } from "@/lib/utils";
import {
  FileText,
  AlertTriangle,
  Calendar,
  RefreshCcw,
  Plus,
  Eye,
  GitCompare,
  FilterX,
  Trash2,
  ShieldAlert,
  Clock,
  X,
  SlidersHorizontal,
  Sparkles,
  FolderSync,
  LayoutGrid,
  List,
  CheckCircle2,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

type ViewMode = "table" | "grid";
type SortField = "name" | "risk" | "next_date" | "status";
type SortDir = "asc" | "desc";

const RISK_ORDER: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
const FILTER_CHIP_BASE =
  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border cursor-pointer transition-all duration-150 select-none";

function ContractGridCard({
  contract,
  onDelete,
  deletingId,
  formatDate,
}: {
  contract: any;
  onDelete: (id: number) => void;
  deletingId: number | null;
  formatDate: (d: string) => string;
}) {
  const router = useRouter();
  const riskColor = {
    High: "border-red-200 bg-red-50/30",
    Medium: "border-amber-200 bg-amber-50/30",
    Low: "border-emerald-200 bg-emerald-50/30",
  }[contract.risk as string] ?? "border-zinc-200";

  const riskStripe = {
    High: "from-red-500 to-rose-600",
    Medium: "from-amber-400 to-orange-500",
    Low: "from-emerald-500 to-teal-500",
  }[contract.risk as string] ?? "from-zinc-400 to-zinc-500";

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border overflow-hidden card-shimmer hover:-translate-y-0.5 hover:shadow-lg hover:shadow-zinc-200/80 transition-all duration-300 cursor-pointer group animate-fade-slide-up",
        riskColor
      )}
      onClick={() => router.push(`/dashboard/contracts/${contract.id}`)}
    >
      {/* Color stripe top */}
      <div className={`h-0.5 bg-gradient-to-r ${riskStripe}`} />

      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="h-9 w-9 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 shrink-0 group-hover:bg-blue-50 group-hover:text-blue-500 group-hover:border-blue-100 transition-all">
            <FileText className="h-4 w-4" />
          </div>
          <RiskBadge risk={contract.risk} showDot={false} className="text-[9px] py-0.5" />
        </div>

        {/* Name */}
        <div>
          <h4 className="text-sm font-bold text-zinc-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
            {contract.name}
          </h4>
          <p className="text-[11px] text-zinc-400 font-medium mt-1">
            {contract.counterparty}
          </p>
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-100 text-zinc-500 border border-zinc-200/60">
            {contract.type}
          </span>
          <StatusPill status={contract.status} className="text-[9px] py-0.5" />
        </div>

        {/* Date */}
        {contract.next_date && (
          <div className="flex items-center gap-1.5 pt-1 border-t border-zinc-100">
            <Calendar className="h-3 w-3 text-zinc-300 shrink-0" />
            <span className="text-[10px] font-medium text-zinc-400">{formatDate(contract.next_date)}</span>
          </div>
        )}
      </div>

      {/* Actions row */}
      <div className="px-4 pb-3 flex items-center justify-between gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" onClick={(e) => e.stopPropagation()}>
        <Link
          href={`/dashboard/contracts/${contract.id}`}
          className="flex-1 h-7 text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
        >
          <Eye className="h-3 w-3" /> View
        </Link>
        <Link
          href={`/dashboard/contracts/${contract.id}?tab=compare`}
          className="h-7 px-2 text-[11px] font-bold text-zinc-600 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
        >
          <GitCompare className="h-3 w-3" />
        </Link>
        <button
          onClick={() => onDelete(contract.id)}
          disabled={deletingId === contract.id}
          className="h-7 w-7 rounded-lg hover:bg-red-50 hover:text-red-500 text-zinc-300 flex items-center justify-center transition-all cursor-pointer border border-transparent hover:border-red-100 disabled:opacity-50"
        >
          {deletingId === contract.id ? (
            <RefreshCcw className="h-3 w-3 animate-spin" />
          ) : (
            <Trash2 className="h-3 w-3" />
          )}
        </button>
      </div>
    </div>
  );
}

export default function ContractsPage() {
  const {
    contracts,
    searchQuery,
    setSearchQuery,
    deleteContract,
    fetchContracts,
    isLoading,
    restoreDefaults,
    setIsNewContractOpen,
  } = useContractsStore();
  const { isAuthenticated, isHydrated } = useAuthStore();
  const { addToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (isHydrated && isAuthenticated) fetchContracts();
  }, [fetchContracts, isHydrated, isAuthenticated]);

  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [statusFilter, setStatusFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const uniqueTypes = useMemo(() => Array.from(new Set(contracts.map((c) => c.type))), [contracts]);

  const handleClearFilters = () => {
    setStatusFilter("all");
    setRiskFilter("all");
    setTypeFilter("all");
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 opacity-40" />;
    return sortDir === "asc" ? <ArrowUp className="h-3 w-3 text-blue-600" /> : <ArrowDown className="h-3 w-3 text-blue-600" />;
  };

  const filteredContracts = useMemo(() => {
    let list = contracts.filter((c) => {
      const q = searchQuery.toLowerCase();
      const matchSearch = c.name.toLowerCase().includes(q) || c.counterparty.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || c.status.toLowerCase() === statusFilter.toLowerCase();
      const matchRisk = riskFilter === "all" || c.risk.toLowerCase() === riskFilter.toLowerCase();
      const matchType = typeFilter === "all" || c.type.toLowerCase() === typeFilter.toLowerCase();
      return matchSearch && matchStatus && matchRisk && matchType;
    });

    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === "name") cmp = a.name.localeCompare(b.name);
      else if (sortField === "risk") cmp = (RISK_ORDER[b.risk] ?? 0) - (RISK_ORDER[a.risk] ?? 0);
      else if (sortField === "next_date") cmp = new Date(a.next_date || 0).getTime() - new Date(b.next_date || 0).getTime();
      else if (sortField === "status") cmp = a.status.localeCompare(b.status);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [contracts, searchQuery, statusFilter, riskFilter, typeFilter, sortField, sortDir]);

  const stats = useMemo(() => ({
    total: contracts.length,
    highRisk: contracts.filter((c) => c.risk === "High").length,
    needsReview: contracts.filter((c) => c.status === "Needs Review").length,
    analyzed: contracts.filter((c) => c.status === "Analyzed").length,
    renewals: contracts.filter((c) => c.next_date?.startsWith("202")).length,
  }), [contracts]);

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }); }
    catch { return d; }
  };

  const isFiltersActive = statusFilter !== "all" || riskFilter !== "all" || typeFilter !== "all";
  const activeFilterCount = [statusFilter, riskFilter, typeFilter].filter((f) => f !== "all").length;

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteContract(id);
      addToast({ type: "success", title: "Contract deleted", message: "The agreement has been removed." });
    } catch {
      addToast({ type: "error", title: "Delete failed", message: "Could not remove contract. Try again." });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 min-h-full">

      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-slide-up">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-950">Contracts</h1>
          <p className="text-xs text-zinc-500 mt-0.5 font-medium">
            {stats.total > 0
              ? `${stats.total} agreement${stats.total !== 1 ? "s" : ""} · ${stats.analyzed} analyzed`
              : "Upload your first contract to begin AI-powered analysis"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {contracts.length === 0 && (
            <Button variant="outline" size="sm" onClick={restoreDefaults} disabled={isLoading}
              className="h-9 text-xs font-semibold px-3 border-blue-100 text-blue-600 hover:bg-blue-50/50 cursor-pointer gap-1.5">
              <FolderSync className="h-3.5 w-3.5" /> Seed Demo Data
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => fetchContracts()} disabled={isLoading}
            className="h-9 text-xs font-semibold px-3 border-zinc-200 text-zinc-600 hover:text-zinc-900 cursor-pointer gap-1.5">
            <RefreshCcw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} /> Refresh
          </Button>
          <Button onClick={() => setIsNewContractOpen(true)}
            className="h-9 text-xs font-bold px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl shadow-md shadow-blue-200 cursor-pointer gap-1.5">
        <Plus className="h-4 w-4" /> New Contract
          </Button>
        </div>
      </div>

      {/* ── KPI Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-fade-slide-up" style={{ animationDelay: "60ms" }}>
        {[
          { label: "Total Contracts", value: stats.total, sub: `${stats.analyzed} analyzed`, icon: FileText, stripe: "from-indigo-500 to-indigo-600", iconBg: "bg-indigo-50 text-indigo-600 border-indigo-100" },
          { label: "High Risk", value: stats.highRisk, sub: stats.highRisk > 0 ? "Requires attention" : "No critical issues", icon: ShieldAlert, stripe: "from-red-500 to-rose-600", iconBg: "bg-red-50 text-red-600 border-red-100" },
          { label: "Needs Review", value: stats.needsReview, sub: "Pending audit", icon: Clock, stripe: "from-amber-400 to-orange-500", iconBg: "bg-amber-50 text-amber-600 border-amber-100" },
          { label: "Upcoming Renewals", value: stats.renewals, sub: "Active deadlines", icon: Calendar, stripe: "from-emerald-500 to-teal-500", iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100" },
        ].map((item, idx) => (
          <div key={item.label}
            className="bg-white rounded-xl p-4 flex items-start justify-between card-shimmer hover:-translate-y-px hover:shadow-md transition-all duration-200"
            style={{ border: "1px solid #e8edf3", boxShadow: "0 1px 3px rgba(15,23,42,0.04)", animationDelay: `${idx * 40}ms` }}
          >
            <div>
              <div className={`h-0.5 w-8 rounded-full bg-gradient-to-r ${item.stripe} mb-3`} />
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#94a3b8" }}>{item.label}</p>
              <p className="text-2xl font-black mt-0.5" style={{ color: "#0f172a" }}>{item.value}</p>
              <p className="text-[10px] font-medium mt-1" style={{ color: "#64748b" }}>{item.sub}</p>
            </div>
            <div className={cn("h-8 w-8 rounded-lg border flex items-center justify-center shrink-0", item.iconBg)}>
              <item.icon className="h-4 w-4" />
            </div>
          </div>
        ))}
      </div>

      {/* ── Contracts Panel ── */}
      <div
        className="bg-white rounded-2xl overflow-hidden animate-fade-slide-up"
        style={{ border: "1px solid #e8edf3", boxShadow: "0 1px 4px rgba(15,23,42,0.05)", animationDelay: "120ms" }}
      >
        {/* Table/Grid Header bar */}
        <div className="px-5 py-3.5 border-b border-zinc-100 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-extrabold text-zinc-950">All Contracts</h2>
              {filteredContracts.length > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-500 border border-zinc-200">
                  {filteredContracts.length}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* View mode toggle */}
              <div className="flex items-center bg-zinc-100 rounded-lg p-0.5 gap-0.5">
                <button
                  onClick={() => setViewMode("table")}
                  className={cn("h-7 w-7 rounded-md flex items-center justify-center transition-all cursor-pointer", viewMode === "table" ? "bg-white shadow-sm text-zinc-900" : "text-zinc-400 hover:text-zinc-600")}
                >
                  <List className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn("h-7 w-7 rounded-md flex items-center justify-center transition-all cursor-pointer", viewMode === "grid" ? "bg-white shadow-sm text-zinc-900" : "text-zinc-400 hover:text-zinc-600")}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </button>
              </div>

              {isFiltersActive && (
                <button onClick={handleClearFilters} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-blue-600 hover:bg-blue-50 border border-blue-100 transition-colors cursor-pointer">
                  <FilterX className="h-3 w-3" /> Clear {activeFilterCount > 1 ? `(${activeFilterCount})` : ""}
                </button>
              )}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer",
                  showFilters ? "bg-zinc-900 text-white border-zinc-900" : "text-zinc-600 hover:bg-zinc-50 border-zinc-200"
                )}
              >
                <SlidersHorizontal className="h-3 w-3" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="h-4 w-4 rounded-full bg-blue-600 text-white text-[9px] font-black flex items-center justify-center">{activeFilterCount}</span>
                )}
              </button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="flex flex-wrap gap-3 pt-2 border-t border-zinc-100 animate-slide-down">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mr-1">Status</span>
                {["all", "Analyzed", "Needs Review", "Uploaded"].map((s) => (
                  <button key={s} onClick={() => setStatusFilter(s)}
                    className={cn(FILTER_CHIP_BASE,
                      statusFilter === s
                        ? s === "all" ? "bg-zinc-900 text-white border-zinc-900" : s === "Analyzed" ? "bg-indigo-600 text-white border-indigo-600" : s === "Needs Review" ? "bg-rose-600 text-white border-rose-600" : "bg-zinc-600 text-white border-zinc-600"
                        : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300 hover:text-zinc-700"
                    )}>
                    {s === "all" ? "All" : s}
                  </button>
                ))}
              </div>
              <div className="w-px h-5 bg-zinc-200 self-center" />
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mr-1">Risk</span>
                {["all", "High", "Medium", "Low"].map((r) => (
                  <button key={r} onClick={() => setRiskFilter(r)}
                    className={cn(FILTER_CHIP_BASE,
                      riskFilter === r
                        ? r === "all" ? "bg-zinc-900 text-white border-zinc-900" : r === "High" ? "bg-red-600 text-white border-red-600" : r === "Medium" ? "bg-amber-500 text-white border-amber-500" : "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300 hover:text-zinc-700"
                    )}>
                    {r === "all" ? "All" : r}
                  </button>
                ))}
              </div>
              {uniqueTypes.length > 0 && (
                <>
                  <div className="w-px h-5 bg-zinc-200 self-center" />
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mr-1">Type</span>
                    <button onClick={() => setTypeFilter("all")} className={cn(FILTER_CHIP_BASE, typeFilter === "all" ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300 hover:text-zinc-700")}>All</button>
                    {uniqueTypes.map((t) => (
                      <button key={t} onClick={() => setTypeFilter(t.toLowerCase())} className={cn(FILTER_CHIP_BASE, typeFilter === t.toLowerCase() ? "bg-blue-600 text-white border-blue-600" : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300 hover:text-zinc-700")}>{t}</button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Body */}
        {isLoading && contracts.length === 0 ? (
          <div className="divide-y divide-zinc-100">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-4 animate-pulse">
                <div className="h-8 w-8 bg-zinc-100 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-zinc-100 rounded w-1/3" />
                  <div className="h-2.5 bg-zinc-100 rounded w-1/5" />
                </div>
                <div className="h-5 w-16 bg-zinc-100 rounded-full" />
                <div className="h-5 w-14 bg-zinc-100 rounded-full" />
              </div>
            ))}
          </div>
        ) : filteredContracts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
            <div className="h-14 w-14 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-300 mb-5">
              <FileText className="h-7 w-7" />
            </div>
            {contracts.length === 0 ? (
              <>
                <h3 className="text-sm font-extrabold text-zinc-950 mb-1.5">No contracts yet</h3>
                <p className="text-xs text-zinc-400 max-w-xs leading-relaxed mb-6 font-medium">Upload your first contract to begin AI-powered risk analysis, deadline tracking, and more.</p>
                <div className="flex items-center gap-3">
                  <Button onClick={() => setIsNewContractOpen(true)} className="h-9 text-xs font-bold px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl cursor-pointer gap-1.5 shadow-md shadow-blue-200">
                    <Plus className="h-3.5 w-3.5" /> Upload Contract
                  </Button>
                  <Button variant="outline" onClick={restoreDefaults} className="h-9 text-xs font-semibold px-4 border-zinc-200 text-zinc-600 cursor-pointer gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" /> Load Demo Data
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-sm font-extrabold text-zinc-950 mb-1.5">No results match your filters</h3>
                <p className="text-xs text-zinc-400 max-w-xs leading-relaxed mb-5 font-medium">Try adjusting or clearing your filter criteria.</p>
                <Button onClick={handleClearFilters} className="h-9 text-xs font-bold px-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl cursor-pointer gap-1.5">
                  <X className="h-3.5 w-3.5" /> Clear Filters
                </Button>
              </>
            )}
          </div>
        ) : viewMode === "grid" ? (
          /* GRID VIEW */
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredContracts.map((contract, idx) => (
              <ContractGridCard
                key={contract.id}
                contract={contract}
                onDelete={handleDelete}
                deletingId={deletingId}
                formatDate={formatDate}
              />
            ))}
          </div>
        ) : (
          /* TABLE VIEW */
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/50">
                  <th className="px-5 py-3">
                    <button onClick={() => toggleSort("name")} className="flex items-center gap-1.5 text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-zinc-600 cursor-pointer">
                      Contract <SortIcon field="name" />
                    </button>
                  </th>
                  <th className="px-5 py-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Counterparty</th>
                  <th className="px-5 py-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Type</th>
                  <th className="px-5 py-3">
                    <button onClick={() => toggleSort("status")} className="flex items-center gap-1.5 text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-zinc-600 cursor-pointer">
                      Status <SortIcon field="status" />
                    </button>
                  </th>
                  <th className="px-5 py-3">
                    <button onClick={() => toggleSort("risk")} className="flex items-center gap-1.5 text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-zinc-600 cursor-pointer">
                      Risk <SortIcon field="risk" />
                    </button>
                  </th>
                  <th className="px-5 py-3">
                    <button onClick={() => toggleSort("next_date")} className="flex items-center gap-1.5 text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-zinc-600 cursor-pointer">
                      Next Date <SortIcon field="next_date" />
                    </button>
                  </th>
                  <th className="px-5 py-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100/80">
                {filteredContracts.map((contract, idx) => (
                  <tr key={contract.id} className="group hover:bg-zinc-50/70 transition-colors duration-100"
                    style={{ animationDelay: `${idx * 30}ms` }}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-0.5 h-8 rounded-full shrink-0",
                          contract.risk === "High" ? "bg-red-400" : contract.risk === "Medium" ? "bg-amber-400" : "bg-emerald-400"
                        )} />
                        <div className="h-8 w-8 rounded-lg bg-zinc-50 border border-zinc-150 flex items-center justify-center text-zinc-400 shrink-0 group-hover:bg-blue-50 group-hover:text-blue-500 group-hover:border-blue-100 transition-all">
                          <FileText className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0">
                          <Link href={`/dashboard/contracts/${contract.id}`}
                            className="text-sm font-bold text-zinc-900 hover:text-blue-600 transition-colors truncate block max-w-[200px]">
                            {contract.name}
                          </Link>
                          <p className="text-[10px] text-zinc-400 mt-0.5 font-medium">ID #{contract.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-semibold text-zinc-700 truncate block max-w-[130px]">{contract.counterparty}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-100 text-zinc-600 border border-zinc-200/60">{contract.type}</span>
                    </td>
                    <td className="px-5 py-3.5"><StatusPill status={contract.status as any} /></td>
                    <td className="px-5 py-3.5"><RiskBadge risk={contract.risk as any} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 text-zinc-300 shrink-0" />
                        <span className="text-xs font-semibold text-zinc-500 whitespace-nowrap">{formatDate(contract.next_date)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        <Link href={`/dashboard/contracts/${contract.id}`}
                          className="h-7 px-2.5 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-lg flex items-center gap-1 transition-colors cursor-pointer">
                          <Eye className="h-3 w-3" /> View
                        </Link>
                        <Link href={`/dashboard/contracts/${contract.id}?tab=compare`}
                          className="h-7 px-2.5 text-[11px] font-bold text-zinc-600 hover:text-zinc-800 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-lg flex items-center gap-1 transition-colors cursor-pointer">
                          <GitCompare className="h-3 w-3" /> Compare
                        </Link>
                        <button onClick={() => handleDelete(contract.id)} disabled={deletingId === contract.id} title="Delete contract"
                          className="h-7 w-7 rounded-lg hover:bg-red-50 hover:text-red-500 text-zinc-300 flex items-center justify-center transition-all cursor-pointer border border-transparent hover:border-red-100 disabled:opacity-50">
                          {deletingId === contract.id ? <RefreshCcw className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-5 py-3 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
              <p className="text-[10px] font-semibold text-zinc-400">
                Showing <span className="text-zinc-600 font-bold">{filteredContracts.length}</span> of <span className="text-zinc-600 font-bold">{contracts.length}</span> contracts
              </p>
              <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-medium">
                <Sparkles className="h-3 w-3 text-blue-400" />
                AI-analyzed · sorted by {sortField}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
