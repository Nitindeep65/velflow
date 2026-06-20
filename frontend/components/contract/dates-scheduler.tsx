// components/contract/dates-scheduler.tsx
"use client";

import * as React from "react";
import { Calendar, Trash2, Edit2, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface MilestoneDate {
  id: string;
  title: string;
  date: string;
  badge: "Critical - Renewal" | "Important" | "Upcoming";
  active: boolean;
  description: string;
}

interface DatesSchedulerProps {
  dates: MilestoneDate[];
  onToggleActive: (id: string) => void;
  onEdit: (date: MilestoneDate) => void;
  onDelete: (id: string) => void;
  selectedId: string | null;
  onSelectId: (id: string) => void;
}

export function DatesScheduler({
  dates,
  onToggleActive,
  onEdit,
  onDelete,
  selectedId,
  onSelectId
}: DatesSchedulerProps) {
  
  // Sort dates chronologically for the timeline visual representation
  const sortedDates = [...dates]
    .filter(d => d.active && d.date)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const selectedEvent = dates.find(d => d.id === selectedId) || null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* Left List Pane */}
      <div className="lg:col-span-5 space-y-4">
        {dates.map((item) => (
          <div 
            key={item.id}
            className={cn(
              "p-4 border rounded-xl flex gap-3.5 items-start transition-all",
              item.active 
                ? "bg-white border-zinc-200 shadow-2xs hover:border-zinc-300" 
                : "bg-zinc-50 border-zinc-150 opacity-60"
            )}
          >
            {/* Custom switch */}
            <button
              type="button"
              onClick={() => onToggleActive(item.id)}
              className={cn(
                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden pt-0.5",
                item.active ? "bg-blue-600" : "bg-zinc-350"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out",
                  item.active ? "translate-x-4" : "translate-x-0"
                )}
              />
            </button>

            {/* Content Slot */}
            <div className="flex-1 space-y-1.5 min-w-0">
              <div className="flex justify-between items-center gap-2">
                <h4 className="text-xs font-black text-zinc-950 truncate">{item.title}</h4>
                <span className={cn(
                  "text-[8px] tracking-wide font-black uppercase px-2 py-0.5 rounded border shrink-0",
                  item.badge === "Critical - Renewal" 
                    ? "bg-red-50 text-red-700 border-red-200" 
                    : item.badge === "Important" 
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                    : "bg-blue-50 text-blue-700 border-blue-200"
                )}>
                  {item.badge}
                </span>
              </div>
              <p className="text-sm font-extrabold text-zinc-950">
                {new Date(item.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric"
                })}
              </p>
              
              <div className="flex gap-3 text-[10px] font-bold text-zinc-500 pt-1.5 border-t border-zinc-100/60">
                <button onClick={() => onEdit(item)} className="hover:text-blue-600 cursor-pointer flex items-center gap-1">
                  <Edit2 className="h-3 w-3" /> Edit
                </button>
                <button onClick={() => onDelete(item.id)} className="hover:text-red-600 cursor-pointer flex items-center gap-1">
                  <Trash2 className="h-3 w-3" /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Right Visual Timeline Card Pane */}
      <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-xl p-6 shadow-2xs space-y-6">
        <div>
          <h3 className="text-base font-black text-zinc-950 tracking-tight">Timeline Calendar</h3>
          <p className="text-xs text-zinc-500 font-medium">Graphical mapping of active milestones.</p>
        </div>

        {sortedDates.length > 0 ? (
          <div className="space-y-6">
            
            {/* SVG Timelines */}
            <div className="relative h-[90px] w-full">
              <svg width="100%" height="100%" viewBox="0 0 500 80" className="overflow-visible">
                {/* Center Path line */}
                <line x1="20" y1="35" x2="480" y2="35" stroke="#E4E4E7" strokeWidth="2.5" strokeLinecap="round" />
                
                {sortedDates.map((item, idx) => {
                  const spacing = sortedDates.length > 1 ? 460 / (sortedDates.length - 1) : 0;
                  const cx = sortedDates.length > 1 ? 20 + idx * spacing : 250;
                  const isSelected = selectedId === item.id;
                  
                  let color = "#3b82f6"; // Upcoming
                  if (item.badge === "Critical - Renewal") color = "#ef4444";
                  if (item.badge === "Important") color = "#10b981";

                  return (
                    <g key={item.id} className="group cursor-pointer" onClick={() => onSelectId(item.id)}>
                      {isSelected && (
                        <circle cx={cx} cy="35" r="11" fill="none" stroke={color} strokeWidth="1.5" className="opacity-80" />
                      )}
                      <circle cx={cx} cy="35" r="6" fill={color} className="stroke-white stroke-2 group-hover:scale-125 transition-transform" />
                      <text x={cx} y="15" textAnchor="middle" className="text-[9px] font-black fill-zinc-400">
                        {new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </text>
                      <text x={cx} y="55" textAnchor="middle" className="text-[8px] font-black fill-zinc-500 max-w-[60px] truncate">
                        {item.title.length > 10 ? `${item.title.substring(0, 8)}...` : item.title}
                      </text>
                      <circle cx={cx} cy="35" r="18" fill="transparent" />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Selected details slot */}
            {selectedEvent && (
              <div className="p-4 bg-zinc-50 border border-zinc-150 rounded-xl space-y-2 animate-fade-in">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-200/50">
                  <h4 className="text-xs font-black text-zinc-950">{selectedEvent.title}</h4>
                  <span className={cn(
                    "text-[8px] tracking-wide font-black uppercase px-2 py-0.5 rounded border",
                    selectedEvent.badge === "Critical - Renewal" 
                      ? "bg-red-50 text-red-700 border-red-200" 
                      : selectedEvent.badge === "Important"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-blue-50 text-blue-700 border-blue-200"
                  )}>
                    {selectedEvent.badge}
                  </span>
                </div>
                <p className="text-xs text-zinc-650 font-semibold leading-relaxed">
                  {selectedEvent.description || "No specific details entered for this milestone."}
                </p>
              </div>
            )}

          </div>
        ) : (
          <div className="bg-zinc-50 border border-zinc-200 border-dashed rounded-xl p-10 text-center text-zinc-400 italic text-xs">
            No milestones currently toggled active.
          </div>
        )}
      </div>

    </div>
  );
}
