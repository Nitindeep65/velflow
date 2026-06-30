"use client";

import { useEffect, useState, useMemo } from "react";
import { useCrmStore, Counterparty } from "@/lib/store/useCrmStore";
import { useContractsStore } from "@/lib/store/useContractsStore";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import {
  Users,
  Plus,
  Mail,
  Phone,
  MapPin,
  Building,
  FileText,
  Trash2,
  Calendar,
  X,
  FileDown,
  Info,
  ChevronRight,
} from "lucide-react";
import { RiskBadge } from "@/components/contract/risk-badge";

export default function CounterpartiesPage() {
  const {
    counterparties,
    isLoading,
    fetchCrmData,
    addCounterparty,
    updateCounterparty,
    deleteCounterparty,
  } = useCrmStore();

  const { contracts, fetchContracts } = useContractsStore();
  const { addToast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCp, setSelectedCp] = useState<Counterparty | null>(null);
  const [isNewCpOpen, setIsNewCpOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [companyName, setCompanyName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [industry, setIndustry] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchCrmData();
    fetchContracts();
  }, [fetchCrmData, fetchContracts]);

  // Filter counterparties based on search
  const filteredCounterparties = useMemo(() => {
    return counterparties.filter((cp) => {
      const matchQuery = searchQuery.toLowerCase();
      return (
        cp.company_name.toLowerCase().includes(matchQuery) ||
        (cp.industry && cp.industry.toLowerCase().includes(matchQuery)) ||
        (cp.primary_contact_email && cp.primary_contact_email.toLowerCase().includes(matchQuery))
      );
    });
  }, [counterparties, searchQuery]);

  // Filter contracts linked to selected counterparty
  const selectedCpContracts = useMemo(() => {
    if (!selectedCp) return [];
    return contracts.filter((c) => c.counterparty_id === selectedCp.id);
  }, [selectedCp, contracts]);

  const handleCreateCounterparty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName) return;

    setIsSubmitting(true);
    try {
      await addCounterparty({
        company_name: companyName,
        primary_contact_email: contactEmail || undefined,
        contact_phone: contactPhone || undefined,
        billing_address: billingAddress || undefined,
        industry: industry || undefined,
        notes: notes || undefined,
      });

      addToast({
        type: "success",
        title: "Contact Created",
        message: `Successfully added ${companyName} to directory.`,
      });

      // Reset
      setCompanyName("");
      setContactEmail("");
      setContactPhone("");
      setBillingAddress("");
      setIndustry("");
      setNotes("");
      setIsNewCpOpen(false);
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Creation failed",
        message: err.message || "Failed to create counterparty.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCounterparty = async (e: React.MouseEvent, cp: Counterparty) => {
    e.stopPropagation(); // Stop row click triggering details view
    if (
      !confirm(
        `Are you sure you want to delete ${cp.company_name}? This will remove references to this counterparty from all associated deals and contracts.`
      )
    )
      return;

    try {
      await deleteCounterparty(cp.id);
      addToast({
        type: "success",
        title: "Contact deleted",
        message: `${cp.company_name} removed from your directory.`,
      });
      if (selectedCp?.id === cp.id) {
        setSelectedCp(null);
      }
    } catch (err) {
      addToast({
        type: "error",
        title: "Deletion failed",
        message: "Failed to delete contact.",
      });
    }
  };

  return (
    <div className="space-y-6 select-none p-1 relative min-h-screen">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="h-6 w-6 text-blue-600 animate-pulse" />
            Counterparties Hub
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Manage client, vendor, and contractor metadata profiles.
          </p>
        </div>
        <div>
          <button
            onClick={() => setIsNewCpOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-black text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-xl shadow-md shadow-blue-100 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Counterparty
          </button>
        </div>
      </div>

      {/* ── Main content grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Table list */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, industry, or email..."
              className="block w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center text-slate-400 animate-pulse">Loading directory...</div>
            ) : filteredCounterparties.length === 0 ? (
              <div className="p-12 text-center">
                <Building className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-black text-slate-700">No counterparties found</p>
                <p className="text-xs text-slate-400 mt-0.5">Seed some demo data or add a custom contact to start.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200/80 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      <th className="py-3 px-5">Company Name</th>
                      <th className="py-3 px-5">Industry</th>
                      <th className="py-3 px-5">Primary Contact</th>
                      <th className="py-3 px-5 text-center">Contracts</th>
                      <th className="py-3 px-5"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCounterparties.map((cp) => (
                      <tr
                        key={cp.id}
                        onClick={() => setSelectedCp(cp)}
                        className={`hover:bg-blue-50/20 transition-colors cursor-pointer text-[12px] font-medium text-slate-600 ${
                          selectedCp?.id === cp.id ? "bg-blue-50/30" : ""
                        }`}
                      >
                        <td className="py-3.5 px-5 font-black text-slate-800">{cp.company_name}</td>
                        <td className="py-3.5 px-5">{cp.industry || "—"}</td>
                        <td className="py-3.5 px-5 font-semibold text-slate-500">{cp.primary_contact_email || "—"}</td>
                        <td className="py-3.5 px-5 text-center">
                          <span className="inline-flex items-center justify-center h-6 w-6 font-black bg-slate-100 border border-slate-200/60 rounded-lg text-slate-700">
                            {cp.contracts_count || 0}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={(e) => handleDeleteCounterparty(e, cp)}
                              className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                              title="Delete relationship"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                            <ChevronRight className="h-4 w-4 text-slate-400" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Details side panel */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-5 min-h-[400px]">
          {selectedCp ? (
            <div className="space-y-6">
              {/* Header Details */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-tight">{selectedCp.company_name}</h3>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100/50 px-2 py-0.5 rounded-full mt-1.5 inline-block">
                    {selectedCp.industry || "General Partner"}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedCp(null)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Contact Specifics */}
              <div className="space-y-3.5">
                {selectedCp.primary_contact_email && (
                  <div className="flex items-center gap-2.5 text-[12px] font-semibold text-slate-600">
                    <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                    <a href={`mailto:${selectedCp.primary_contact_email}`} className="hover:underline text-blue-600">
                      {selectedCp.primary_contact_email}
                    </a>
                  </div>
                )}
                {selectedCp.contact_phone && (
                  <div className="flex items-center gap-2.5 text-[12px] font-semibold text-slate-600">
                    <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>{selectedCp.contact_phone}</span>
                  </div>
                )}
                {selectedCp.billing_address && (
                  <div className="flex items-start gap-2.5 text-[12px] font-semibold text-slate-600 leading-normal">
                    <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>{selectedCp.billing_address}</span>
                  </div>
                )}
              </div>

              {/* Notes */}
              {selectedCp.notes && (
                <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-3.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Info className="h-3.5 w-3.5 text-slate-500" />
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                      Internal Notes
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-600 leading-relaxed">{selectedCp.notes}</p>
                </div>
              )}

              {/* Linked Contracts Timeline */}
              <div className="space-y-3 pt-2">
                <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-400" />
                  Linked Agreements ({selectedCpContracts.length})
                </h4>

                {selectedCpContracts.length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl text-slate-400 text-[11px] font-semibold bg-slate-50/30">
                    No documents linked to this contact.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedCpContracts.map((c) => (
                      <div
                        key={c.id}
                        className="p-3 border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-white rounded-xl transition-all flex items-start gap-3"
                      >
                        <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 border border-blue-100/30">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-black text-slate-800 truncate leading-snug">{c.name}</p>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            <span className="text-[9px] font-semibold text-slate-400">{c.type}</span>
                            <span className="text-slate-300 text-[9px] font-bold">•</span>
                            <RiskBadge risk={c.risk} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Building className="h-10 w-10 text-slate-300 mb-2.5 animate-pulse" />
              <p className="text-xs font-black text-slate-700">No Counterparty Selected</p>
              <p className="text-[11px] text-slate-400 mt-1 font-medium leading-normal">
                Click any partner row in the table to display address records, notes, and associated agreements.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Dialog: Create Counterparty ── */}
      {isNewCpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-slide-up">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsNewCpOpen(false)} />
          <div className="bg-white rounded-2xl border border-slate-200/80 w-full max-w-md relative z-10 shadow-2xl overflow-hidden animate-scale-in">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between">
              <div>
                <h2 className="text-base font-black text-slate-950">Add New Counterparty</h2>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Create a profile directory for vendor and client management.
                </p>
              </div>
              <button
                onClick={() => setIsNewCpOpen(false)}
                className="h-7 w-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCounterparty} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Acme Corporation"
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Industry
                  </label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g. SaaS / Real Estate"
                    className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Primary Email
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="e.g. legal@acme.com"
                    className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="e.g. +1 (555) 019-2834"
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Billing Address
                </label>
                <textarea
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                  placeholder="e.g. 123 Industrial Parkway, Suite A, San Jose, CA 95112"
                  rows={2}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Internal Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any context, negotiation preferences, or historical comments..."
                  rows={2}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium resize-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsNewCpOpen(false)}
                  disabled={isSubmitting}
                  className="cursor-pointer text-slate-600 hover:text-slate-900 font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !companyName}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold cursor-pointer shadow-md shadow-blue-200 rounded-xl"
                >
                  {isSubmitting ? "Adding..." : "Add Counterparty"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
