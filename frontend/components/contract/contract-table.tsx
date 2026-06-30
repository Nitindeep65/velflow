// components/contract/contract-table.tsx
"use client";

import * as React from "react";
import { 
  Eye, 
  MoreHorizontal, 
  Trash2, 
  FileCheck, 
  CalendarDays
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useCrmStore } from "@/lib/store/useCrmStore";
import { useContractsStore } from "@/lib/store/useContractsStore";
import { ContractRowData } from "./types";
import { RiskBadge } from "./risk-badge";
import { StatusPill } from "./status-pill";

interface ContractTableProps {
  data: ContractRowData[];
  onView: (id: number) => void;
  onDelete: (id: number) => void;
}

export function ContractTable({ data, onView, onDelete }: ContractTableProps) {
  const { counterparties, pipelines } = useCrmStore();
  const { updateContract } = useContractsStore();

  return (
    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-2xs">
      <Table>
        <TableHeader className="bg-zinc-50/50">
          <TableRow className="border-b border-zinc-200">
            <TableHead className="font-extrabold text-zinc-700 text-xs py-3.5 pl-6 select-none">Contract Name</TableHead>
            <TableHead className="font-extrabold text-zinc-700 text-xs py-3.5 select-none">Counterparty</TableHead>
            <TableHead className="font-extrabold text-zinc-700 text-xs py-3.5 select-none">CRM Deal Link</TableHead>
            <TableHead className="font-extrabold text-zinc-700 text-xs py-3.5 select-none">Agreement Type</TableHead>
            <TableHead className="font-extrabold text-zinc-700 text-xs py-3.5 select-none">Risk Rating</TableHead>
            <TableHead className="font-extrabold text-zinc-700 text-xs py-3.5 select-none">Next Milestone</TableHead>
            <TableHead className="w-12 py-3.5 pr-6"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12 text-zinc-400 italic text-xs select-none">
                No contracts loaded. Click "Restore Demo Data" or upload a file.
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow key={item.id} className="hover:bg-zinc-50/40 border-b border-zinc-150 transition-colors">
                
                {/* Contract Name */}
                <TableCell className="font-bold text-zinc-950 text-xs py-4 pl-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 border border-blue-100 rounded-lg text-blue-600 shrink-0">
                      <FileCheck className="h-4 w-4" />
                    </div>
                    <span className="truncate max-w-[220px]" title={item.name}>{item.name}</span>
                  </div>
                </TableCell>
                
                {/* Counterparty (AI Extracted + CRM Link Selector) */}
                <TableCell className="py-3">
                  <div className="flex flex-col min-w-0">
                    <span className="text-zinc-400 text-[10px] font-bold truncate max-w-[130px]" title={item.counterparty}>
                      AI Extracted: {item.counterparty}
                    </span>
                    <select
                      value={item.counterparty_id || ""}
                      onChange={async (e) => {
                        const val = e.target.value;
                        await updateContract(item.id, { counterparty_id: val ? parseInt(val) : null });
                      }}
                      className="bg-transparent hover:bg-slate-100 rounded-md py-0.5 px-1 -ml-1 text-[11px] font-extrabold text-blue-600 focus:ring-1 focus:ring-blue-500 cursor-pointer max-w-[140px] truncate outline-none border-0"
                    >
                      <option value="">Unlinked Client</option>
                      {counterparties.map((cp) => (
                        <option key={cp.id} value={cp.id}>
                          {cp.company_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </TableCell>
                
                {/* CRM Deal Link Dropdown */}
                <TableCell className="py-3">
                  <select
                    value={item.pipeline_id || ""}
                    onChange={async (e) => {
                      const val = e.target.value;
                      await updateContract(item.id, { pipeline_id: val ? parseInt(val) : null });
                    }}
                    className="bg-transparent hover:bg-slate-100 rounded-md py-0.5 px-1 -ml-1 text-[11px] font-extrabold text-slate-600 focus:ring-1 focus:ring-blue-500 cursor-pointer max-w-[145px] truncate outline-none border-0"
                  >
                    <option value="">Unlinked Deal</option>
                    {pipelines.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.deal_name}
                      </option>
                    ))}
                  </select>
                </TableCell>
                
                {/* Status Badge */}
                <TableCell>
                  <StatusPill status={item.status} />
                </TableCell>
                
                {/* Risk Level Badge */}
                <TableCell>
                  <RiskBadge risk={item.risk} />
                </TableCell>

                {/* Next Milestone Date */}
                <TableCell className="text-xs font-semibold text-zinc-650">
                  {item.next_date ? (
                    <span className="flex items-center gap-1.5 font-bold text-zinc-900">
                      <CalendarDays className="h-4 w-4 text-zinc-400 shrink-0" />
                      {new Date(item.next_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </span>
                  ) : (
                    <span className="text-zinc-400 italic font-medium">None</span>
                  )}
                </TableCell>

                {/* Actions Dropdown */}
                <TableCell className="pr-6 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="h-8 w-8 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-zinc-700 flex items-center justify-center cursor-pointer outline-hidden transition-colors">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white border border-zinc-200 rounded-xl p-1.5 shadow-md w-36 z-30 animate-scale-in">
                      <DropdownMenuItem 
                        onClick={() => onView(item.id)}
                        className="flex items-center gap-2 px-2.5 py-2 text-xs font-bold rounded-lg text-zinc-700 hover:bg-zinc-50 focus:bg-zinc-50 cursor-pointer outline-none transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5 text-zinc-400" />
                        View Audit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDelete(item.id)}
                        className="flex items-center gap-2 px-2.5 py-2 text-xs font-bold rounded-lg text-red-650 hover:bg-red-50 focus:bg-red-50 focus:text-red-750 cursor-pointer outline-none transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-400" />
                        Delete File
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>

              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
