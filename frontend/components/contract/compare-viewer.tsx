// components/contract/compare-viewer.tsx
"use client";

import { AlertTriangle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ComparisonRowProps {
  category: string;
  status: "Unchanged" | "Modified";
  oldText: string | null;
  newText: string | null;
  changeSummary: string;
  onSelect: () => void;
  isSelected: boolean;
  baseName: string;
  compareName: string;
}

export function ComparisonRow({
  category,
  status,
  oldText,
  newText,
  changeSummary,
  onSelect,
  isSelected,
  baseName,
  compareName
}: ComparisonRowProps) {
  const isModified = status === "Modified";

  return (
    <div 
      onClick={onSelect}
      className={cn(
        "p-5 border rounded-xl cursor-pointer transition-all hover:shadow-2xs",
        isSelected ? "bg-blue-50/20 border-blue-500/30" : "bg-white border-zinc-200"
      )}
    >
      <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-3">
        <div className="flex items-center gap-3">
          <h4 className="text-xs font-black text-zinc-950">{category}</h4>
          <span className={cn(
            "text-[9px] font-black uppercase px-2 py-0.5 rounded border",
            isModified 
              ? "bg-amber-50 text-amber-700 border-amber-200" 
              : "bg-emerald-50 text-emerald-700 border-emerald-200"
          )}>
            {status}
          </span>
        </div>
        
        {isModified && (
          <span className="text-[9px] font-black text-amber-600 flex items-center gap-1 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full select-none">
            <AlertTriangle className="h-3 w-3 shrink-0" /> Changed
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
        
        {/* Old Contract Excerpt */}
        <div className="space-y-1.5 min-w-0">
          <span className="text-[9px] font-black text-red-650 uppercase tracking-wider flex items-center gap-1 select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
            Base: {baseName.length > 20 ? `${baseName.substring(0, 18)}...` : baseName}
          </span>
          <div className="bg-red-50/25 border border-red-100/50 p-3 rounded-xl leading-relaxed text-zinc-750 font-mono whitespace-pre-wrap max-h-[140px] overflow-y-auto">
            {oldText ? oldText.trim() : <span className="italic text-zinc-400 font-sans">Clause not present in base.</span>}
          </div>
        </div>

        {/* New Contract Excerpt */}
        <div className="space-y-1.5 min-w-0">
          <span className="text-[9px] font-black text-emerald-650 uppercase tracking-wider flex items-center gap-1 select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            New: {compareName.length > 20 ? `${compareName.substring(0, 18)}...` : compareName}
          </span>
          <div className="bg-emerald-50/25 border border-emerald-100/50 p-3 rounded-xl leading-relaxed text-zinc-750 font-mono whitespace-pre-wrap max-h-[140px] overflow-y-auto">
            {newText ? newText.trim() : <span className="italic text-zinc-400 font-sans">Clause not present in revision.</span>}
          </div>
        </div>

      </div>

      {isModified && (
        <div className="mt-3.5 bg-zinc-50 border border-zinc-150 p-3.5 rounded-xl text-xs leading-relaxed text-zinc-750 flex items-start gap-2">
          <Sparkles className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
          <p className="font-semibold leading-relaxed">{changeSummary}</p>
        </div>
      )}
    </div>
  );
}
export { cn };
