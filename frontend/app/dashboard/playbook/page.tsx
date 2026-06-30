"use client";

import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Plus,
  Trash2,
  Play,
  X,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronDown,
  FileSearch,
  Scale,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { usePlaybookStore, PlaybookRule } from "@/lib/store/usePlaybookStore";
import { useContractsStore } from "@/lib/store/useContractsStore";

const RISK_COLORS: Record<string, string> = {
  High: "bg-red-100 text-red-700 border border-red-200",
  Medium: "bg-amber-100 text-amber-700 border border-amber-200",
  Low: "bg-emerald-100 text-emerald-700 border border-emerald-200",
};

const COMPLIANCE_CONFIG = {
  Pass: { color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", icon: CheckCircle, label: "Fully Compliant" },
  Warning: { color: "text-amber-600", bg: "bg-amber-50 border-amber-200", icon: AlertTriangle, label: "Minor Concerns" },
  Fail: { color: "text-red-600", bg: "bg-red-50 border-red-200", icon: XCircle, label: "Violations Found" },
};

const CATEGORY_SUGGESTIONS = [
  "Governing Law",
  "Liability Cap",
  "Indemnification",
  "IP Ownership",
  "Payment Terms",
  "Termination Clause",
  "Non-Compete",
  "Confidentiality",
  "Dispute Resolution",
  "Force Majeure",
];

export default function PlaybookPage() {
  const { playbooks, complianceResult, isChecking, isLoading, fetchPlaybooks, createPlaybook, deletePlaybook, checkContractCompliance, clearComplianceResult } =
    usePlaybookStore();
  const { contracts, fetchContracts } = useContractsStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showCheckModal, setShowCheckModal] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<number | null>(null);
  const [form, setForm] = useState({
    rule_category: "",
    preferred_terms: "",
    forbidden_terms: "",
    risk_level: "High" as PlaybookRule["risk_level"],
  });

  useEffect(() => {
    fetchPlaybooks();
    fetchContracts();
  }, [fetchPlaybooks, fetchContracts]);

  const handleCreate = async () => {
    if (!form.rule_category.trim()) return;
    await createPlaybook({
      rule_category: form.rule_category,
      preferred_terms: form.preferred_terms || null,
      forbidden_terms: form.forbidden_terms || null,
      risk_level: form.risk_level,
    });
    setForm({ rule_category: "", preferred_terms: "", forbidden_terms: "", risk_level: "High" });
    setShowAddModal(false);
  };

  const handleCheck = async () => {
    if (!selectedContractId) return;
    await checkContractCompliance(selectedContractId);
  };

  const compliance = complianceResult
    ? COMPLIANCE_CONFIG[complianceResult.overall_compliance]
    : null;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-6 md:p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Company Playbook</h1>
            <p className="text-xs text-slate-500 mt-0.5">Define contract compliance rules &amp; run AI compliance checks</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowCheckModal(true); clearComplianceResult(); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            <FileSearch className="w-3.5 h-3.5" />
            Run Compliance Check
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-xs font-semibold hover:opacity-90 transition shadow-sm shadow-indigo-200"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Rule
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Rules", value: playbooks.length, icon: BookOpen, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "High Risk", value: playbooks.filter((p) => p.risk_level === "High").length, icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
          { label: "Medium Risk", value: playbooks.filter((p) => p.risk_level === "Medium").length, icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Low Risk", value: playbooks.filter((p) => p.risk_level === "Low").length, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center`}>
              <stat.icon className={`w-4.5 h-4.5 ${stat.color}`} size={18} />
            </div>
            <div>
              <p className="text-lg font-black text-slate-900 leading-none">{stat.value}</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Rules Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Playbook Rules</h2>
          <span className="text-xs text-slate-400">{playbooks.length} rule{playbooks.length !== 1 ? "s" : ""}</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-7 h-7 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : playbooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center">
              <Scale className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-400">No playbook rules yet</p>
            <p className="text-xs text-slate-300 text-center max-w-xs">
              Add rules like &quot;Governing law must be Delaware&quot; or &quot;No unlimited liability clauses&quot;
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600 text-xs font-semibold hover:bg-indigo-100 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Add First Rule
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {playbooks.map((rule) => (
              <div key={rule.id} className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50/50 transition group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-sm font-bold text-slate-900">{rule.rule_category}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${RISK_COLORS[rule.risk_level]}`}>
                      {rule.risk_level}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                    {rule.preferred_terms && (
                      <div className="flex gap-1.5 items-start">
                        <CheckCircle className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
                        <span className="text-xs text-slate-500">
                          <span className="font-medium text-slate-700">Required: </span>
                          {rule.preferred_terms}
                        </span>
                      </div>
                    )}
                    {rule.forbidden_terms && (
                      <div className="flex gap-1.5 items-start">
                        <XCircle className="w-3 h-3 text-red-400 mt-0.5 shrink-0" />
                        <span className="text-xs text-slate-500">
                          <span className="font-medium text-slate-700">Forbidden: </span>
                          {rule.forbidden_terms}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deletePlaybook(rule.id)}
                  className="opacity-0 group-hover:opacity-100 transition w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-300 hover:text-red-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Rule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xs px-4">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-100 shadow-2xl w-full max-w-md p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-black text-slate-900">Add Playbook Rule</h3>
                <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Create a company standard compliance directive</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Rule Category *</label>
                <input
                  value={form.rule_category}
                  onChange={(e) => setForm((f) => ({ ...f, rule_category: e.target.value }))}
                  placeholder="e.g., Governing Law"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-slate-50 focus:outline-none focus:border-indigo-400 transition-colors font-semibold"
                  list="category-suggestions"
                />
                <datalist id="category-suggestions">
                  {CATEGORY_SUGGESTIONS.map((s) => <option key={s} value={s} />)}
                </datalist>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Required Terms (comma-separated)</label>
                <input
                  value={form.preferred_terms}
                  onChange={(e) => setForm((f) => ({ ...f, preferred_terms: e.target.value }))}
                  placeholder="e.g., Delaware, New York"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-slate-50 focus:outline-none focus:border-indigo-400 transition-colors font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Forbidden Terms (comma-separated)</label>
                <input
                  value={form.forbidden_terms}
                  onChange={(e) => setForm((f) => ({ ...f, forbidden_terms: e.target.value }))}
                  placeholder="e.g., unlimited liability, perpetual"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-slate-50 focus:outline-none focus:border-indigo-400 transition-colors font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Risk Level</label>
                <div className="flex gap-2">
                  {(["High", "Medium", "Low"] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setForm((f) => ({ ...f, risk_level: level }))}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition border ${
                        form.risk_level === level ? RISK_COLORS[level] : "border-slate-200 text-slate-400 bg-white hover:border-slate-300"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2.5 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition bg-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!form.rule_category.trim()}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-xs font-bold hover:opacity-95 transition disabled:opacity-40 shadow-sm shadow-indigo-100"
              >
                Add Rule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compliance Check Modal */}
      {showCheckModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xs px-4">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-100 shadow-2xl w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                  Run Compliance Check
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Verify your document alignment against active rules</p>
              </div>
              <button onClick={() => setShowCheckModal(false)} className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {!complianceResult ? (
              <>
                <select
                  value={selectedContractId ?? ""}
                  onChange={(e) => setSelectedContractId(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-slate-50 focus:outline-none focus:border-indigo-400 font-semibold mb-4"
                >
                  <option value="">Select a contract…</option>
                  {contracts.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <button
                  onClick={handleCheck}
                  disabled={!selectedContractId || isChecking || playbooks.length === 0}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-xs font-bold hover:opacity-95 transition disabled:opacity-40 shadow-sm"
                >
                  {isChecking ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/35 border-t-white rounded-full animate-spin" />
                      Auditing via AI…
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      Run Check
                    </>
                  )}
                </button>
                {playbooks.length === 0 && (
                  <p className="text-xs text-amber-600 font-medium text-center mt-2">Add at least one playbook rule before running a check.</p>
                )}
              </>
            ) : (
              <>
                {compliance && (
                  <div className={`flex items-center gap-3 p-4 rounded-xl border ${compliance.bg} mb-5`}>
                    <compliance.icon className={`w-5 h-5 ${compliance.color}`} />
                    <div>
                      <p className={`text-sm font-black ${compliance.color}`}>{compliance.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{complianceResult.total_violations} violation{complianceResult.total_violations !== 1 ? "s" : ""} found</p>
                    </div>
                  </div>
                )}

                {complianceResult.violations.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-sm font-medium">
                    ✅ No violations found — contract is fully compliant!
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
                    {complianceResult.violations.map((v, idx) => (
                      <div key={idx} className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 space-y-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-700">{v.rule_category}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${RISK_COLORS[v.severity]}`}>{v.severity}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-normal">{v.violation}</p>
                        <p className="text-[10px] text-slate-400 font-mono bg-white rounded-lg px-2.5 py-1.5 border border-slate-200 line-clamp-2 leading-relaxed">
                          {v.clause_text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => { clearComplianceResult(); setSelectedContractId(null); }}
                  className="w-full mt-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition bg-white"
                >
                  Run Another Check
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
