"use client";

import { useState, useEffect } from "react";
import { useCrmStore } from "@/lib/store/useCrmStore";
import { useContractsStore } from "@/lib/store/useContractsStore";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { fetchApi } from "@/lib/api";
import {
  FileText,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  X,
  FileCode,
  Save,
  PenTool,
  CheckCircle,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Template {
  id: string;
  name: string;
  description: string;
  type: string;
  version: string;
  risk: "Low Risk" | "Medium Risk" | "High Risk";
  fields: Array<{ key: string; label: string; placeholder: string; type: string }>;
}

const TEMPLATES: Template[] = [
  {
    id: "NDA",
    name: "Mutual NDA Template",
    description: "Standard mutual non-disclosure agreement for partner commercial negotiations.",
    type: "NDA",
    version: "v1.4",
    risk: "Low Risk",
    fields: [
      { key: "disclosing_party", label: "Disclosing/Client Party", placeholder: "e.g. Acme Corp", type: "text" },
      { key: "receiving_party", label: "Receiving/Partner Party", placeholder: "e.g. Globex Industries", type: "text" },
      { key: "effective_date", label: "Effective Date", placeholder: "YYYY-MM-DD", type: "date" },
      { key: "purpose", label: "Purpose of Disclosures", placeholder: "e.g. exploring a SaaS partnership", type: "text" },
      { key: "term", label: "Confidentiality Term", placeholder: "e.g. 3 years", type: "text" },
      { key: "governing_law", label: "Governing Law (State)", placeholder: "e.g. Delaware", type: "text" },
    ],
  },
  {
    id: "SaaS",
    name: "SaaS Subscription Agreement",
    description: "Subscription terms and conditions for licensing cloud software services.",
    type: "SaaS",
    version: "v2.1",
    risk: "Medium Risk",
    fields: [
      { key: "disclosing_party", label: "Software Provider", placeholder: "e.g. VelFlow Tech Ltd", type: "text" },
      { key: "receiving_party", label: "Customer Name", placeholder: "e.g. Stark Enterprises", type: "text" },
      { key: "effective_date", label: "Effective Date", placeholder: "YYYY-MM-DD", type: "date" },
      { key: "pricing", label: "Subscription Pricing", placeholder: "e.g. $12,500 annually", type: "text" },
      { key: "sla", label: "Uptime SLA Commit", placeholder: "e.g. 99.9% uptime", type: "text" },
      { key: "governing_law", label: "Governing Law (State)", placeholder: "e.g. New York", type: "text" },
    ],
  },
  {
    id: "Contractor",
    name: "Independent Contractor Agreement",
    description: "Standard contract for freelance project-based developer or consulting deliverables.",
    type: "Contractor",
    version: "v3.0",
    risk: "Low Risk",
    fields: [
      { key: "disclosing_party", label: "Client/Company", placeholder: "e.g. Initech LLC", type: "text" },
      { key: "receiving_party", label: "Contractor/Freelancer", placeholder: "e.g. Peter Gibbons", type: "text" },
      { key: "effective_date", label: "Effective Date", placeholder: "YYYY-MM-DD", type: "date" },
      { key: "scope", label: "Scope of Deliverables", placeholder: "e.g. software development services", type: "text" },
      { key: "value", label: "Contract Value ($)", placeholder: "e.g. 15000", type: "text" },
      { key: "governing_law", label: "Governing Law (State)", placeholder: "e.g. Texas", type: "text" },
    ],
  },
];

export default function TemplatesPage() {
  const { counterparties, pipelines, fetchCrmData } = useCrmStore();
  const { addContract } = useContractsStore();
  const { addToast } = useToast();

  const [activeTemplate, setActiveTemplate] = useState<Template | null>(null);
  const [formVariables, setFormVariables] = useState<Record<string, string>>({});
  const [linkedCounterpartyId, setLinkedCounterpartyId] = useState("");
  const [linkedPipelineId, setLinkedPipelineId] = useState("");
  
  // Wizard States
  const [step, setStep] = useState<"list" | "form" | "preview">("list");
  const [generatedDraft, setGeneratedDraft] = useState("");
  const [draftName, setDraftName] = useState("");
  const [isDrafting, setIsDrafting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingMode, setIsEditingMode] = useState(false);

  useEffect(() => {
    fetchCrmData();
  }, [fetchCrmData]);

  const handleSelectTemplate = (template: Template) => {
    setActiveTemplate(template);
    // Seed initial dates and variables
    const initialVars: Record<string, string> = {};
    template.fields.forEach((f) => {
      if (f.type === "date") {
        initialVars[f.key] = new Date().toISOString().split("T")[0];
      } else {
        initialVars[f.key] = "";
      }
    });
    setFormVariables(initialVars);
    setStep("form");
  };

  const handleFieldChange = (key: string, val: string) => {
    setFormVariables((prev) => ({ ...prev, [key]: val }));
  };

  const handleGenerateDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTemplate) return;

    setIsDrafting(true);
    setStep("preview");
    
    try {
      const response = await fetchApi("/contracts/generate", {
        method: "POST",
        body: JSON.stringify({
          template_type: activeTemplate.id,
          variables: formVariables,
        }),
      });

      setGeneratedDraft(response.draft);
      setDraftName(`${activeTemplate.name} - ${formVariables.receiving_party || "Draft"}`);
      setIsDrafting(false);
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Drafting Failed",
        message: err.message || "Failed to communicate with legal AI service.",
      });
      setStep("form");
      setIsDrafting(false);
    }
  };

  const handleSaveToCrm = async () => {
    if (!generatedDraft) return;
    setIsSaving(true);

    try {
      // Convert Markdown draft string to a File Blob
      const blob = new Blob([generatedDraft], { type: "text/markdown" });
      const file = new File([blob], `${draftName || "contract_draft"}.md`, { type: "text/markdown" });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", draftName);
      formData.append("counterparty", formVariables.receiving_party || "Unknown Party");
      formData.append("type", activeTemplate?.type || "Other");
      
      if (linkedCounterpartyId) {
        formData.append("counterparty_id", linkedCounterpartyId);
      }
      if (linkedPipelineId) {
        formData.append("pipeline_id", linkedPipelineId);
      }

      await addContract(formData);

      addToast({
        type: "success",
        title: "Contract Saved & Analyzed",
        message: "Your drafted contract has been created and indexed for compliance.",
      });

      // Clear state and go back to list
      setActiveTemplate(null);
      setGeneratedDraft("");
      setLinkedCounterpartyId("");
      setLinkedPipelineId("");
      setStep("list");
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Failed to save contract",
        message: err.message || "Please check your network and try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 select-none min-h-screen">
      {/* ── STEP 1: TEMPLATE CARDS LIST ── */}
      {step === "list" && (
        <div className="space-y-6">
          <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] flex items-center justify-between">
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
                <PenTool className="h-5 w-5 text-indigo-600 animate-pulse" />
                Smart Clause Wizard
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Select a pre-approved legal structure, enter deal parameters, and draft with AI.
              </p>
            </div>
            <div className="text-[10px] font-black uppercase bg-indigo-50 text-indigo-600 border border-indigo-100/50 px-3 py-1 rounded-xl">
              Step 1 of 3
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                className="bg-white border border-slate-100 hover:border-slate-200/80 rounded-2xl p-5 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between group cursor-default"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 border border-blue-100/50 px-2.5 py-0.5 rounded-lg">
                      {tmpl.type}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{tmpl.version}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">
                    {tmpl.name}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    {tmpl.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-50">
                  <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg">
                    {tmpl.risk}
                  </span>
                  <button
                    onClick={() => handleSelectTemplate(tmpl)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-bold text-slate-700 hover:text-white border border-slate-200 hover:bg-slate-900 hover:border-slate-900 rounded-xl transition-all cursor-pointer"
                  >
                    Draft
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── STEP 2: VARIABLE FILL FORM ── */}
      {step === "form" && activeTemplate && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep("list")}
              className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" /> Back to templates
            </button>
            <div className="text-[10px] font-black uppercase bg-indigo-50 text-indigo-600 border border-indigo-100/50 px-3 py-1 rounded-xl">
              Step 2 of 3
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] max-w-lg mx-auto">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Configure variables: {activeTemplate.name}</h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">Input deal attributes. AI will structure standard legal clauses.</p>
            
            <form onSubmit={handleGenerateDraft} className="space-y-4 mt-5">
              {activeTemplate.fields.map((f) => (
                <div key={f.key} className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    {f.label} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type={f.type}
                    required
                    value={formVariables[f.key] || ""}
                    onChange={(e) => handleFieldChange(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    className="block w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 focus:border-indigo-400 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none transition-all font-semibold animate-fade-in"
                  />
                </div>
              ))}

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-50">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    Link CRM Counterparty
                  </label>
                  <select
                    value={linkedCounterpartyId}
                    onChange={(e) => setLinkedCounterpartyId(e.target.value)}
                    className="block w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-400 transition-all font-semibold"
                  >
                    <option value="">-- No linked contact --</option>
                    {counterparties.map((cp) => (
                      <option key={cp.id} value={cp.id}>
                        {cp.company_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    Link CRM Deal Pipeline
                  </label>
                  <select
                    value={linkedPipelineId}
                    onChange={(e) => setLinkedPipelineId(e.target.value)}
                    className="block w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-400 transition-all font-semibold"
                  >
                    <option value="">-- No linked deal --</option>
                    {pipelines.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.deal_name} ({p.stage})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep("list")}
                  className="cursor-pointer text-slate-600 hover:text-slate-900 font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:opacity-95 text-white font-bold cursor-pointer flex items-center gap-2 shadow-sm shadow-indigo-100 rounded-xl px-4 py-2 text-xs"
                >
                  <Sparkles className="h-4 w-4" />
                  Generate AI Draft
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── STEP 3: PREVIEW & CUSTOMIZE DRAFT ── */}
      {step === "preview" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <button
                onClick={() => setStep("form")}
                disabled={isDrafting}
                className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" /> Adjust fields
              </button>
              <h2 className="text-base font-extrabold text-slate-900 mt-2">Generated Draft</h2>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingMode(!isEditingMode)}
                disabled={isDrafting}
                className="h-9 text-xs font-bold text-slate-600 hover:text-slate-950 border-slate-200 cursor-pointer flex items-center gap-1.5 rounded-xl"
              >
                <FileCode className="h-3.5 w-3.5" />
                {isEditingMode ? "View Rendered" : "Edit Source"}
              </Button>
              <Button
                size="sm"
                onClick={handleSaveToCrm}
                disabled={isDrafting || isSaving || !generatedDraft}
                className="h-9 text-xs font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:opacity-95 text-white cursor-pointer flex items-center gap-1.5 shadow-sm shadow-emerald-100 rounded-xl"
              >
                <Save className="h-3.5 w-3.5" />
                {isSaving ? "Saving..." : "Link & Save to CRM"}
              </Button>
            </div>
          </div>

          {isDrafting ? (
            <div className="h-96 border border-slate-100 bg-white rounded-2xl flex flex-col items-center justify-center p-8 text-slate-400 space-y-4 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)]">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
              <div className="text-center">
                <p className="text-sm font-bold text-slate-800">Drafting Agreement clauses...</p>
                <p className="text-xs text-slate-400 mt-1 font-semibold">Legal AI engine is engineering boilerplate parameters.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {/* Draft Name Editable Field */}
              <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl flex items-center gap-3">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Contract Name:</span>
                <input
                  type="text"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-400"
                />
              </div>

              {/* Document Editor/Preview canvas */}
              <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] min-h-[500px]">
                {isEditingMode ? (
                  <textarea
                    value={generatedDraft}
                    onChange={(e) => setGeneratedDraft(e.target.value)}
                    className="w-full h-[520px] p-6 text-xs font-mono bg-slate-900 text-slate-200 focus:outline-none resize-none leading-relaxed"
                  />
                ) : (
                  <div className="p-8 prose prose-slate max-w-none text-xs font-medium leading-relaxed overflow-y-auto max-h-[520px]">
                    <ReactMarkdown>{generatedDraft}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
