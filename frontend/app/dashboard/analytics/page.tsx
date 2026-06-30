"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  FileText,
  CheckCircle,
  AlertTriangle,
  Users,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ShieldAlert,
} from "lucide-react";
import { useContractsStore } from "@/lib/store/useContractsStore";
import { useCrmStore } from "@/lib/store/useCrmStore";

function MiniBarChart({ data, color = "#6366f1" }: { data: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-16">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1">
          <div
            className="w-full rounded-t-md transition-all duration-500"
            style={{ height: `${(d.value / max) * 52}px`, backgroundColor: color, opacity: 0.7 + (i / data.length) * 0.3 }}
          />
          <span className="text-[8px] text-slate-400 font-medium">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((acc, s) => acc + s.value, 0) || 1;
  let cumulativeAngle = -90;

  const arcs = segments.map((seg) => {
    const angle = (seg.value / total) * 360;
    const start = cumulativeAngle;
    cumulativeAngle += angle;
    const end = cumulativeAngle;

    const startRad = (start * Math.PI) / 180;
    const endRad = (end * Math.PI) / 180;
    const cx = 50, cy = 50, r = 36, innerR = 24;

    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const ix1 = cx + innerR * Math.cos(endRad);
    const iy1 = cy + innerR * Math.sin(endRad);
    const ix2 = cx + innerR * Math.cos(startRad);
    const iy2 = cy + innerR * Math.sin(startRad);

    const largeArc = angle > 180 ? 1 : 0;

    return {
      path: `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix2} ${iy2} Z`,
      color: seg.color,
      label: seg.label,
      value: seg.value,
    };
  });

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 100 100" className="w-24 h-24 shrink-0">
        {arcs.map((arc, i) => (
          <path key={i} d={arc.path} fill={arc.color} className="transition-all hover:opacity-80" />
        ))}
        <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" className="text-[10px]" fill="#1e293b" fontWeight="bold" fontSize="10">
          {total}
        </text>
        <text x="50" y="58" textAnchor="middle" dominantBaseline="middle" fill="#94a3b8" fontSize="5">
          total
        </text>
      </svg>
      <div className="flex flex-col gap-1.5">
        {arcs.map((arc, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: arc.color }} />
            <span className="text-xs text-slate-600">{arc.label}</span>
            <span className="text-xs font-bold text-slate-900 ml-auto pl-4">{arc.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function AnalyticsPage() {
  const { contracts, fetchContracts } = useContractsStore();
  const { counterparties, fetchCounterparties } = useCrmStore();

  useEffect(() => {
    fetchContracts();
    fetchCounterparties();
  }, [fetchContracts, fetchCounterparties]);

  const stats = useMemo(() => {
    const signed = contracts.filter((c) => c.status === "Signed");
    const highRisk = contracts.filter((c) => c.risk === "High");
    const active = contracts.filter((c) => c.status === "Active");

    return {
      total: contracts.length,
      signed: signed.length,
      highRisk: highRisk.length,
      active: active.length,
    };
  }, [contracts]);

  const monthlyData = useMemo(() => {
    const now = new Date();
    return MONTHS.slice(0, now.getMonth() + 1).map((label, i) => {
      const value = contracts.filter((c) => {
        const d = c.created_at ? new Date(c.created_at) : null;
        return d && d.getMonth() === i && d.getFullYear() === now.getFullYear();
      }).length;
      return { label, value };
    });
  }, [contracts]);

  const typeBreakdown = useMemo(() => {
    const types: Record<string, number> = {};
    contracts.forEach((c) => {
      const t = c.type || "Other";
      types[t] = (types[t] || 0) + 1;
    });
    const palette = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"];
    return Object.entries(types).map(([label, value], i) => ({
      label,
      value,
      color: palette[i % palette.length],
    }));
  }, [contracts]);

  const riskBreakdown = useMemo(() => [
    { label: "High", value: contracts.filter((c) => c.risk === "High").length, color: "#ef4444" },
    { label: "Medium", value: contracts.filter((c) => c.risk === "Medium").length, color: "#f59e0b" },
    { label: "Low", value: contracts.filter((c) => c.risk === "Low").length, color: "#10b981" },
  ], [contracts]);

  const topCounterparties = useMemo(() => {
    const map: Record<string, number> = {};
    contracts.forEach((c) => {
      if (c.counterparty) map[c.counterparty] = (map[c.counterparty] || 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }, [contracts]);

  const exportCsv = () => {
    const header = ["ID", "Name", "Type", "Status", "Risk", "Counterparty", "Next Date"];
    const rows = contracts.map((c) => [
      c.id, `"${c.name}"`, c.type || "", c.status || "", c.risk || "", `"${c.counterparty || ""}"`, c.next_date || ""
    ]);
    const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "velflow_contracts_export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const summaryCards = [
    { label: "Total Contracts", value: stats.total, icon: FileText, color: "text-indigo-600", bg: "from-indigo-50 to-indigo-100/50", border: "border-indigo-100", trend: null },
    { label: "Signed", value: stats.signed, icon: CheckCircle, color: "text-emerald-600", bg: "from-emerald-50 to-emerald-100/50", border: "border-emerald-100", trend: "up" },
    { label: "High Risk", value: stats.highRisk, icon: ShieldAlert, color: "text-red-500", bg: "from-red-50 to-red-100/50", border: "border-red-100", trend: stats.highRisk > 0 ? "down" : null },
    { label: "Active", value: stats.active, icon: TrendingUp, color: "text-violet-600", bg: "from-violet-50 to-violet-100/50", border: "border-violet-100", trend: null },
    { label: "Counterparties", value: counterparties.length, icon: Users, color: "text-cyan-600", bg: "from-cyan-50 to-cyan-100/50", border: "border-cyan-100", trend: null },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 p-6 bg-white border border-slate-100 rounded-2xl shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] animate-fade-slide-up">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-200">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Analytics</h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">Contract portfolio insights &amp; reporting</p>
          </div>
        </div>
        <button
          onClick={exportCsv}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition h-9 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {summaryCards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] flex flex-col gap-2 hover:-translate-y-0.5 transition-transform duration-300">
            <div className="flex items-center justify-between">
              <card.icon className={`w-4.5 h-4.5 ${card.color}`} />
              {card.trend === "up" && <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />}
              {card.trend === "down" && <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />}
              {!card.trend && <Minus className="w-3.5 h-3.5 text-slate-300" />}
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 leading-none">{card.value}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-1.5">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Signing Velocity */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Contract Volume</h2>
              <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Contracts uploaded per month this year</p>
            </div>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          {monthlyData.length > 0 ? (
            <MiniBarChart data={monthlyData} color="#6366f1" />
          ) : (
            <div className="h-16 flex items-center justify-center text-xs text-slate-300">No data yet</div>
          )}
        </div>

        {/* Contract Type Donut */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Contract Types</h2>
              <p className="text-[10px] text-slate-400 mt-0.5 font-medium">By category</p>
            </div>
          </div>
          {typeBreakdown.length > 0 ? (
            <DonutChart segments={typeBreakdown} />
          ) : (
            <div className="flex items-center justify-center h-24 text-xs text-slate-300">No contracts yet</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Risk Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Risk Distribution</h2>
              <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Portfolio risk profile</p>
            </div>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <DonutChart segments={riskBreakdown} />
        </div>

        {/* Top Counterparties */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Top Counterparties</h2>
              <p className="text-[10px] text-slate-400 mt-0.5 font-medium">By contract count</p>
            </div>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          {topCounterparties.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-xs text-slate-300">No data yet</div>
          ) : (
            <div className="space-y-2.5">
              {topCounterparties.map((cp, i) => {
                const max = topCounterparties[0]?.count || 1;
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-slate-700 truncate">{cp.name}</span>
                      <span className="text-xs font-bold text-slate-900 ml-2">{cp.count}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-violet-500 transition-all duration-700"
                        style={{ width: `${(cp.count / max) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
      </div>
    </div>
  </div>
);
}
