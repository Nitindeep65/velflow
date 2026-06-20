// components/contract/detail-header.tsx
"use client";

import { ChevronLeft, RefreshCcw, Zap, Building2, Tag, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RiskBadge } from "./risk-badge";
import { RiskLevel } from "./types";
import { cn } from "@/lib/utils";

interface DetailHeaderProps {
  contract: {
    id: number;
    name: string;
    type: string;
    counterparty: string;
    status: string;
    risk: RiskLevel;
  };
  onBack: () => void;
  onReanalyze: () => void;
  isReanalyzing: boolean;
}

const STATUS_STYLES: Record<string, string> = {
  "Analyzed": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Needs Review": "bg-amber-50 text-amber-700 border-amber-200",
  "Uploaded": "bg-blue-50 text-blue-700 border-blue-200",
};

export function DetailHeader({ contract, onBack, onReanalyze, isReanalyzing }: DetailHeaderProps) {
  return (
    <div className="bg-white border-b border-zinc-200/80 shrink-0 sticky top-0 z-30 shadow-sm shadow-zinc-100/60">
      {/* Risk accent stripe */}
      <div className={cn(
        "h-0.5 w-full",
        contract.risk === "High" ? "bg-gradient-to-r from-red-500 to-rose-600" :
        contract.risk === "Medium" ? "bg-gradient-to-r from-amber-400 to-orange-500" :
        "bg-gradient-to-r from-emerald-500 to-teal-500"
      )} />

      <div className="px-8 py-4 max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center text-xs font-semibold text-zinc-400 select-none mb-3">
          <button
            onClick={onBack}
            className="hover:text-blue-600 flex items-center gap-1 transition-colors cursor-pointer outline-none group"
          >
            <ChevronLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Contracts
          </button>
          <span className="mx-2 text-zinc-200">/</span>
          <span className="text-zinc-600 font-bold truncate max-w-[280px]" title={contract.name}>
            {contract.name}
          </span>
        </div>

        {/* Title row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 min-w-0 flex-1">
            <h1 className="text-xl font-black text-zinc-950 tracking-tight leading-tight truncate" title={contract.name}>
              {contract.name}
            </h1>
            {/* Metadata chips */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-50 border border-zinc-200 text-[11px] font-semibold text-zinc-600">
                <Building2 className="h-3 w-3 text-zinc-400" />
                {contract.counterparty}
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-50 border border-zinc-200 text-[11px] font-semibold text-zinc-600">
                <Tag className="h-3 w-3 text-zinc-400" />
                {contract.type}
              </div>
              <div className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold",
                STATUS_STYLES[contract.status] ?? "bg-zinc-50 text-zinc-600 border-zinc-200"
              )}>
                <Activity className="h-3 w-3" />
                {contract.status}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <RiskBadge risk={contract.risk} />
            <Button
              variant="outline"
              size="sm"
              onClick={onReanalyze}
              disabled={isReanalyzing}
              className="h-8 text-xs font-bold text-blue-600 border-blue-200 hover:bg-blue-50 cursor-pointer shadow-sm gap-1.5"
            >
              <RefreshCcw className={cn("h-3.5 w-3.5", isReanalyzing && "animate-spin")} />
              {isReanalyzing ? "Analyzing..." : "Re-analyze"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
