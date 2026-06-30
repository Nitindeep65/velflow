"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useContractsStore } from "@/lib/store/useContractsStore";
import { AuthGuard } from "@/components/auth-guard";
import { AppShell } from "@/components/dashboard/app-shell";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import {
  LayoutDashboard,
  FileText,
  Copy,
  Settings,
  LogOut,
  X,
  ChevronDown,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { searchQuery, setSearchQuery, addContract, isNewContractOpen, setIsNewContractOpen } = useContractsStore();
  const { addToast } = useToast();

  // New Contract Form State
  const [contractName, setContractName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);

    const formData = new FormData();
    if (contractName) formData.append("name", contractName);
    formData.append("file", file);

    try {
      await addContract(formData);
      addToast({ type: "success", title: "Contract uploaded!", message: "AI has started analyzing your agreement." });
      // Reset Form
      setContractName("");
      setFile(null);
      setIsNewContractOpen(false);
    } catch (err: any) {
      addToast({ type: "error", title: "Upload failed", message: err?.message || "Please try again." });
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AuthGuard requireAuth={true}>
      <AppShell user={user} onLogout={handleLogout}>
        {children}
      </AppShell>

        {/* Modal: New Contract */}
        {isNewContractOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-slide-up">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsNewContractOpen(false)}
            />
            {/* Content */}
            <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] w-full max-w-md relative z-10 shadow-2xl overflow-hidden animate-scale-in">
              {/* Header */}
              <div className="px-6 py-5 border-b border-[var(--border)] flex items-start justify-between">
                <div>
                  <h2 className="text-base font-black text-slate-100">Upload New Contract</h2>
                  <p className="text-xs text-slate-450 mt-0.5 font-medium">Extraction engine will audit risks, dates, and key terms automatically.</p>
                </div>
                <button
                  onClick={() => setIsNewContractOpen(false)}
                  className="h-7 w-7 rounded-lg hover:bg-slate-800 text-slate-450 hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateContract} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider">
                    Contract Document <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    required
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="block w-full px-3 py-2 text-sm bg-slate-800/40 border border-[var(--border)] rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-500 font-medium">PDF or DOCX · up to 10MB</p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider">
                    Contract Name <span className="text-slate-500 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={contractName}
                    onChange={(e) => setContractName(e.target.value)}
                    placeholder="Leave blank to use filename"
                    className="block w-full px-3 py-2 text-sm bg-slate-800/40 border border-[var(--border)] rounded-xl text-slate-100 placeholder-slate-550 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-2 border-t border-[var(--border)]">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsNewContractOpen(false)}
                    disabled={isUploading}
                    className="cursor-pointer text-slate-400 hover:text-slate-200 font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isUploading || !file}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white font-bold cursor-pointer flex items-center gap-2 shadow-md shadow-blue-900/30 rounded-xl"
                  >
                    {isUploading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Auditing...
                      </>
                    ) : (
                      "Upload & Audit"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
    </AuthGuard>
  );
}
