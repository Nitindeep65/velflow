// components/contract/risk-radar.tsx
"use client";

import * as React from "react";
import { ChevronRight, X, Sparkles, FileText, ShieldAlert, TrendingUp, AlertOctagon } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { RiskCategory } from "./types";
import { RiskBadge } from "./risk-badge";
import { cn } from "@/lib/utils";

interface RiskRadarProps {
  categories: RiskCategory[];
}

const RISK_CARD_STYLES: Record<string, { border: string; badge: string; iconBg: string; iconColor: string; gradient: string }> = {
  High: {
    border: "border-red-200/60 hover:border-red-300",
    badge: "bg-red-50",
    iconBg: "bg-red-50 border-red-100",
    iconColor: "text-red-600",
    gradient: "from-red-500 to-rose-600",
  },
  Medium: {
    border: "border-amber-200/60 hover:border-amber-300",
    badge: "bg-amber-50",
    iconBg: "bg-amber-50 border-amber-100",
    iconColor: "text-amber-600",
    gradient: "from-amber-400 to-orange-500",
  },
  Low: {
    border: "border-zinc-200/80 hover:border-blue-200",
    badge: "bg-zinc-50",
    iconBg: "bg-blue-50 border-blue-100",
    iconColor: "text-blue-600",
    gradient: "from-blue-400 to-indigo-500",
  },
};

export function RiskRadar({ categories }: RiskRadarProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<RiskCategory | null>(null);

  const highCount = categories.filter((c) => c.risk === "High").length;
  const mediumCount = categories.filter((c) => c.risk === "Medium").length;
  const lowCount = categories.filter((c) => c.risk === "Low").length;

  return (
    <div className="space-y-5">
      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat, idx) => {
          const styles = RISK_CARD_STYLES[cat.risk] ?? RISK_CARD_STYLES.Low;
          return (
            <div
              key={cat.name}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "bg-white border rounded-2xl overflow-hidden cursor-pointer group card-shimmer hover:-translate-y-0.5 hover:shadow-lg hover:shadow-zinc-200/60 transition-all duration-300 animate-fade-slide-up",
                styles.border
              )}
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              {/* Top accent */}
              <div className={`h-0.5 bg-gradient-to-r ${styles.gradient}`} />

              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className={cn("h-8 w-8 rounded-lg border flex items-center justify-center shrink-0", styles.iconBg, styles.iconColor)}>
                    <ShieldAlert className="h-4 w-4" />
                  </div>
                  <RiskBadge risk={cat.risk} showDot={false} className="text-[9px] py-0.5" />
                </div>

                <div>
                  <h4 className="text-sm font-bold text-zinc-900 leading-snug group-hover:text-blue-600 transition-colors">
                    {cat.name}
                  </h4>
                  <p className="text-[11px] text-zinc-500 font-medium leading-relaxed mt-1 line-clamp-2">
                    {cat.summary}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[10px] font-bold text-blue-600 border-t border-zinc-100 pt-3 group-hover:text-blue-700 transition-colors">
                  <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {cat.clauses.length} clause{cat.clauses.length !== 1 ? "s" : ""} extracted
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sliding Sheet Detail View */}
      {selectedCategory && (
        <Sheet open={true} onOpenChange={(open) => !open && setSelectedCategory(null)}>
          <SheetContent className="w-[460px] sm:max-w-md bg-white border-l border-zinc-200 flex flex-col p-0 shadow-2xl z-50">
            {/* Sheet Header */}
            <div className="p-6 pb-4 border-b border-zinc-100 relative">
              {/* Risk accent */}
              <div className={cn("absolute top-0 left-0 right-0 h-0.5",
                selectedCategory.risk === "High" ? "bg-gradient-to-r from-red-500 to-rose-600" :
                selectedCategory.risk === "Medium" ? "bg-gradient-to-r from-amber-400 to-orange-500" :
                "bg-gradient-to-r from-blue-500 to-indigo-500"
              )} />
              <div className="flex items-start justify-between pt-1">
                <div className="space-y-2">
                  <SheetTitle className="text-base font-black text-zinc-950">{selectedCategory.name}</SheetTitle>
                  <RiskBadge risk={selectedCategory.risk} />
                </div>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="h-7 w-7 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 flex items-center justify-center transition-colors cursor-pointer mt-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-grow overflow-y-auto space-y-6 p-6">

              {/* AI Summary */}
              <div className="space-y-2">
                <h4 className="text-[9px] font-black text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-blue-500" />
                  AI Summary
                </h4>
                <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl text-xs text-zinc-700 leading-relaxed font-medium">
                  {selectedCategory.summary}
                </div>
              </div>

              {/* Extracted clauses */}
              {selectedCategory.clauses.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-[9px] font-black text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="h-3 w-3 text-zinc-400" />
                    Extracted Clause{selectedCategory.clauses.length !== 1 ? "s" : ""} & Citations
                    <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-zinc-100 text-zinc-500 font-bold">
                      {selectedCategory.clauses.length}
                    </span>
                  </h4>
                  <div className="space-y-3">
                    {selectedCategory.clauses.map((clause, idx) => (
                      <div key={idx} className="bg-zinc-50 border border-zinc-200/80 rounded-xl overflow-hidden animate-fade-slide-up" style={{ animationDelay: `${idx * 60}ms` }}>
                        <div className="flex justify-between items-center px-4 py-2 bg-white border-b border-zinc-100">
                          <span className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">
                            {clause.heading}
                          </span>
                          <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                            {clause.citation}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-700 font-medium font-mono leading-relaxed p-4 max-h-[140px] overflow-y-auto whitespace-pre-wrap">
                          {clause.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedCategory.clauses.length === 0 && (
                <div className="text-center py-8 text-xs text-zinc-400 font-medium">
                  No specific clauses extracted for this category.
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
