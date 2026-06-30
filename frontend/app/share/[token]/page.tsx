"use client";

import { useEffect, useState, useMemo, use } from "react";
import { fetchApi } from "@/lib/api";
import {
  FileText,
  Users,
  PenTool,
  CheckCircle,
  Clock,
  Sparkles,
  MessageSquare,
  ChevronRight,
  Send,
  AlertTriangle,
  FileCheck,
  ShieldCheck,
  Scale,
  X,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

interface SharePageProps {
  params: Promise<{ token: string }>;
}

export default function GuestSharePage({ params }: SharePageProps) {
  const { token } = use(params); // Unwraps the route parameters (contract ID)
  const contractId = parseInt(token);

  const [contract, setContract] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [signatures, setSignatures] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Comments & Sign states
  const [activeClauseIndex, setActiveClauseIndex] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");
  const [guestAuthorName, setGuestAuthorName] = useState("");
  const [isPostingComment, setIsPostingComment] = useState(false);

  // Signing states
  const [isSigningOpen, setIsSigningOpen] = useState(false);
  const [signerName, setSignerName] = useState("");
  const [signerEmail, setSignerEmail] = useState("");
  const [signatureType, setSignatureType] = useState<"draw" | "type">("type");
  const [typedSignature, setTypedSignature] = useState("");
  const [isSubmittingSignature, setIsSubmittingSignature] = useState(false);

  const fetchSharedData = async () => {
    setIsLoading(true);
    try {
      // Unauthenticated public endpoints
      const [contractData, commentsData, signaturesData] = await Promise.all([
        fetchApi(`/contracts/${contractId}/share`, { requireAuth: false }),
        fetchApi(`/contracts/${contractId}/comments`, { requireAuth: false }),
        fetchApi(`/contracts/${contractId}/signatures`, { requireAuth: false }),
      ]);
      setContract(contractData);
      setComments(commentsData);
      setSignatures(signaturesData);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load contract. Access may be restricted or link expired.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (contractId) fetchSharedData();
  }, [contractId]);

  // Split contract text into paragraphs/clauses for line-by-line annotations
  const contractClauses = useMemo(() => {
    if (!contract?.text) return [];
    return contract.text.split("\n\n").filter((p: string) => p.trim().length > 0);
  }, [contract]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText || !contractId) return;

    setIsPostingComment(true);
    const author = guestAuthorName.trim() || "Guest Reviewer";

    try {
      const newComment = await fetchApi(`/contracts/${contractId}/comments`, {
        method: "POST",
        requireAuth: false,
        body: JSON.stringify({
          text: commentText,
          clause_index: activeClauseIndex !== null ? activeClauseIndex : undefined,
          author_name: author,
        }),
      });

      setComments((prev) => [...prev, newComment]);
      setCommentText("");
      setGuestAuthorName("");
    } catch (err) {
      console.error("Failed to post comment:", err);
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleSignContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signerName || !signerEmail || !contractId) return;

    setIsSubmittingSignature(true);
    try {
      const sigData = signatureType === "type" ? typedSignature || signerName : "DrawSignatureCoordinates";
      const newSig = await fetchApi(`/contracts/${contractId}/sign`, {
        method: "POST",
        requireAuth: false,
        body: JSON.stringify({
          signer_name: signerName,
          signer_email: signerEmail,
          signature_svg: sigData,
          ip_address: "127.0.0.1",
        }),
      });

      setSignatures((prev) => [...prev, newSig]);
      setContract((prev: any) => ({ ...prev, status: "Signed" }));
      setIsSigningOpen(false);
      
      // Reset
      setSignerName("");
      setSignerEmail("");
      setTypedSignature("");
    } catch (err) {
      console.error("Signing failed:", err);
    } finally {
      setIsSubmittingSignature(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-slate-400 select-none">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent mb-3" />
        <p className="text-sm font-bold text-slate-700">Loading Shared Agreement Room...</p>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-slate-400 select-none max-w-md mx-auto">
        <AlertTriangle className="h-10 w-10 text-red-500 mb-3" />
        <p className="text-sm font-black text-slate-800">Access Restricted</p>
        <p className="text-xs text-slate-500 text-center mt-2 leading-relaxed font-semibold">
          {error || "Could not retrieve contract room data. Please check the sharing link validity."}
        </p>
      </div>
    );
  }

  const isSigned = contract.status === "Signed" || signatures.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col select-none">
      <title>{`Review & Sign: ${contract.name} | VelFlow SecureSign`}</title>
      <meta name="description" content="Collaboratively review, discuss, and sign this legal agreement securely via VelFlow's client workspace." />
      {/* ── Top Bar Header ── */}
      <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl flex items-center justify-center text-white bg-gradient-to-br from-blue-600 to-blue-700 shadow-md shadow-blue-100">
            <Scale className="h-[18px] w-[18px]" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xs font-black text-slate-900 tracking-tight leading-none uppercase">VelFlow Room</h1>
            <span className="text-[9px] font-bold text-slate-400 mt-1 block">External Negotiation & E-Sign Portal</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isSigned ? (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200/60 shadow-sm animate-pulse">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              Fully Signed
            </span>
          ) : (
            <button
              onClick={() => setIsSigningOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-black text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-xl shadow-md shadow-blue-100 transition-all cursor-pointer"
            >
              <PenTool className="h-4 w-4" />
              E-Sign Contract
            </button>
          )}
        </div>
      </header>

      {/* ── Main Content Split Panel ── */}
      <main className="flex-1 flex overflow-hidden max-w-full">
        {/* Left Side: Document Viewer */}
        <section className="flex-1 overflow-y-auto p-8 bg-white border-r border-slate-200/80">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="border-b border-slate-100 pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <span className="text-[9px] font-black uppercase text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
                  {contract.type}
                </span>
                <span className="text-[9px] font-black uppercase text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                  {contract.status}
                </span>
              </div>
              <h2 className="text-lg font-black text-slate-900 mt-2.5 leading-snug tracking-tight">
                {contract.name}
              </h2>
              <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">
                Between: {contract.counterparty}
              </p>
            </div>

            {/* Render contract clauses line by line */}
            <div className="space-y-4">
              {contractClauses.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs italic">
                  No text clauses extracted for this document.
                </div>
              ) : (
                contractClauses.map((clause: string, idx: number) => {
                  const isActive = activeClauseIndex === idx;
                  const clauseCommentsCount = comments.filter((c) => c.clause_index === idx).length;

                  return (
                    <div
                      key={idx}
                      onClick={() => setActiveClauseIndex(idx)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer relative group ${
                        isActive
                          ? "bg-blue-50/20 border-blue-200 shadow-xs"
                          : "border-transparent hover:bg-slate-50/50 hover:border-slate-200/60"
                      }`}
                    >
                      {/* Comments count indicator */}
                      {clauseCommentsCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 h-4.5 px-1.5 flex items-center justify-center text-[9px] font-black text-white bg-blue-600 rounded-full shadow-sm">
                          {clauseCommentsCount}
                        </span>
                      )}

                      <div className="prose prose-slate max-w-none text-xs font-semibold leading-relaxed text-slate-700">
                        <ReactMarkdown>{clause}</ReactMarkdown>
                      </div>

                      {/* Small line redline CTA */}
                      {!isSigned && (
                        <div className="absolute right-3 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[9px] font-black text-blue-600">
                          <MessageSquare className="h-3 w-3" />
                          Comment/Redline
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>

        {/* Right Side: Sidebar Comments & Logs */}
        <aside className="w-80 bg-slate-50 overflow-y-auto p-5 shrink-0 flex flex-col gap-5 justify-between">
          <div className="space-y-5">
            {/* Clause Comments Box */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-4">
              <h3 className="text-xs font-black text-slate-800 tracking-tight uppercase flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-600" />
                {activeClauseIndex !== null ? `Redlines: Clause #${activeClauseIndex + 1}` : "Redline Comments"}
              </h3>

              {/* Thread list */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {comments.filter((c) => activeClauseIndex === null || c.clause_index === activeClauseIndex).length ===
                0 ? (
                  <div className="text-center py-6 text-slate-400 text-[10px] font-bold">
                    {activeClauseIndex !== null
                      ? "No comments on this clause yet. Leave a redline request below!"
                      : "Select any clause paragraph in the document to see or leave specific redline comments."}
                  </div>
                ) : (
                  comments
                    .filter((c) => activeClauseIndex === null || c.clause_index === activeClauseIndex)
                    .map((c) => (
                      <div key={c.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-700 leading-none">{c.author_name}</span>
                          <span className="text-[8px] text-slate-400 font-bold">
                            {new Date(c.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-[11px] font-medium text-slate-600 leading-normal">{c.text}</p>
                      </div>
                    ))
                )}
              </div>

              {/* Post comment form */}
              {!isSigned && (
                <form onSubmit={handlePostComment} className="border-t border-slate-100 pt-3 space-y-2">
                  <input
                    type="text"
                    placeholder="Your Name (e.g. Counsel)"
                    value={guestAuthorName}
                    onChange={(e) => setGuestAuthorName(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-semibold focus:outline-none focus:border-blue-500"
                  />
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Comment text..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-2.5 pr-8 py-1.5 text-[10px] font-semibold focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={isPostingComment || !commentText}
                      className="absolute right-1.5 top-1.5 text-blue-600 hover:text-blue-700 cursor-pointer"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Signature Log Panel */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3">
              <h3 className="text-xs font-black text-slate-800 tracking-tight uppercase flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Signing Certs
              </h3>

              {signatures.length === 0 ? (
                <div className="text-center py-4 text-slate-400 text-[10px] font-bold">
                  Pending signature logs.
                </div>
              ) : (
                <div className="space-y-3.5">
                  {signatures.map((sig) => (
                    <div key={sig.id} className="p-3 bg-slate-50 border border-slate-200/50 rounded-xl space-y-2">
                      <div className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-black">
                        <CheckCircle className="h-3.5 w-3.5" />
                        E-Signed
                      </div>
                      <div className="text-[10px] text-slate-600 font-semibold space-y-1">
                        <div>
                          <span className="text-slate-400 uppercase text-[8px] font-black block">Signer:</span>
                          <span className="font-extrabold text-slate-800">{sig.signer_name}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 uppercase text-[8px] font-black block">Email:</span>
                          <span>{sig.signer_email}</span>
                        </div>
                        {sig.verification_token && (
                          <div>
                            <span className="text-slate-400 uppercase text-[8px] font-black block">Hash Code:</span>
                            <span className="font-mono text-[9px] font-black bg-slate-200 px-1 py-0.5 rounded">
                              {sig.verification_token}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>
      </main>

      {/* ── Modal: E-Sign Contract ── */}
      {isSigningOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-slide-up">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-xs" onClick={() => setIsSigningOpen(false)} />
          <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-100 w-full max-w-md relative z-10 shadow-2xl overflow-hidden animate-scale-in">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between">
              <div>
                <h2 className="text-base font-black text-slate-900">E-Sign Agreement</h2>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">
                  Review and sign. A tamper-proof cryptographic audit trail will be logged.
                </p>
              </div>
              <button
                onClick={() => setIsSigningOpen(false)}
                className="h-7 w-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSignContract} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={signerName}
                    onChange={(e) => {
                      setSignerName(e.target.value);
                      if (signatureType === "type") setTypedSignature(e.target.value);
                    }}
                    placeholder="e.g. John Doe"
                    className="block w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-400 transition-all font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={signerEmail}
                    onChange={(e) => setSignerEmail(e.target.value)}
                    placeholder="e.g. john@doe.com"
                    className="block w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-400 transition-all font-semibold"
                  />
                </div>
              </div>

              {/* Typographic signature input */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  Signature Style
                </label>
                <div className="h-28 border border-slate-200 rounded-xl bg-slate-50/50 flex flex-col items-center justify-center font-serif text-2xl italic text-indigo-700 tracking-wide border-dashed relative overflow-hidden select-none">
                  <div className="absolute top-1 left-2 text-[8px] font-mono text-slate-400 not-italic uppercase tracking-widest">e-signature certificate</div>
                  <span className="font-sans font-semibold text-slate-900/10 text-5xl absolute select-none tracking-tighter">VelFlow E-Sign</span>
                  {signerName ? (
                    <span className="relative z-10 font-serif italic">{signerName}</span>
                  ) : (
                    <span className="text-slate-400 text-xs font-semibold relative z-10 not-italic">Enter name above to generate e-sign</span>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSigningOpen(false)}
                  disabled={isSubmittingSignature}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 font-semibold cursor-pointer text-xs border border-slate-200 bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSignature || !signerName || !signerEmail}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-200 cursor-pointer"
                >
                  {isSubmittingSignature ? "Signing..." : "Verify & Sign"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
