"use client";

import { Button } from "@/components/ui/button";
import { Files, FileText, ArrowRight, Star } from "lucide-react";

export default function TemplatesPage() {
  const templates = [
    {
      name: "Standard NDA",
      description: "Non-disclosure agreement for typical commercial negotiations and partnerships.",
      type: "NDA",
      version: "v1.4",
      risk: "Low Risk",
    },
    {
      name: "SaaS Terms of Service",
      description: "Terms and conditions template for cloud-based software subscription services.",
      type: "SaaS",
      version: "v2.1",
      risk: "Medium Risk",
    },
    {
      name: "Independent Contractor Agreement",
      description: "Agreement governing project-based relationship with freelance contractors.",
      type: "Vendor",
      version: "v3.0",
      risk: "Low Risk",
    },
    {
      name: "Commercial Lease Agreement",
      description: "Standard real estate agreement for office space tenancy.",
      type: "Lease",
      version: "v1.0",
      risk: "High Risk",
    },
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 select-none">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-zinc-950">Templates</h2>
        <p className="text-xs text-zinc-500 mt-0.5">
          Select or customize pre-approved agreement structures.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <div
            key={template.name}
            className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-zinc-300 transition-colors group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-500 bg-zinc-50 border border-zinc-150 px-2 py-0.5 rounded-md">
                  {template.type}
                </span>
                <span className="text-[10px] text-zinc-400 font-semibold uppercase">
                  {template.version}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-zinc-950 group-hover:text-blue-600 transition-colors">
                {template.name}
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                {template.description}
              </p>
            </div>
            
            <div className="flex items-center justify-between pt-4 mt-2 border-t border-zinc-50">
              <span className={`text-[10px] font-semibold uppercase ${
                template.risk.includes("Low") ? "text-emerald-600" : template.risk.includes("Medium") ? "text-amber-600" : "text-red-600"
              }`}>
                {template.risk}
              </span>
              <Button
                variant="ghost"
                size="xs"
                className="text-xs text-zinc-600 hover:text-zinc-950 cursor-pointer h-7 px-2 flex items-center gap-1 border border-zinc-150 hover:bg-zinc-50"
              >
                Use Template
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
