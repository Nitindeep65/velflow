// app/page.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Scale,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileText,
  Calendar,
  Zap,
  TrendingUp,
  AlertTriangle,
  MessageSquare,
  Radar,
  Check,
  Lock,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Clock,
  HelpCircle,
  Mail,
  User,
  Compass
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

// Types for Hero Contract Presets
interface ContractPreset {
  name: string;
  risk: "High" | "Medium" | "Low";
  summary: string;
  warning: string;
  deadline: string;
  obligations: string[];
}

export default function LandingPage() {
  const [activePreset, setActivePreset] = React.useState<"saas" | "nda" | "contractor">("saas");
  const [activeTab, setActiveTab] = React.useState<"radar" | "chat" | "diff" | "timeline">("radar");
  const [isAnnual, setIsAnnual] = React.useState<boolean>(true);
  const [activeClause, setActiveClause] = React.useState<"liability" | "indemnity" | "termination" | "governing">("liability");
  const [activeSection, setActiveSection] = React.useState<string>("hero");
  const [scrolled, setScrolled] = React.useState(false);
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);
  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };
  const [emailSubscribed, setEmailSubscribed] = React.useState(false);
  const [newsletterEmail, setNewsletterEmail] = React.useState("");

  // Interactive Feature State
  const [chatQuestion, setChatQuestion] = React.useState<"liability" | "notice" | "ip">("liability");
  const [isChatTyping, setIsChatTyping] = React.useState(false);
  const [diffCategory, setDiffCategory] = React.useState<"cure" | "ip" | "liability">("cure");
  const [timelineEvent, setTimelineEvent] = React.useState<"notice" | "payment" | "expiration">("notice");
  const [contractsCount, setContractsCount] = React.useState(5);

  // Upload Simulator State
  const [uploadedFile, setUploadedFile] = React.useState<string | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [uploadStep, setUploadStep] = React.useState("");

  const startUploadSimulation = (presetKey: "saas" | "nda" | "contractor") => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadedFile(null);
    setUploadStep("Connecting to secure AI gateway...");
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 8) + 6;
      if (progress >= 100) {
        progress = 100;
        setUploadProgress(100);
        setUploadStep("Completing audit report...");
        clearInterval(interval);
        setTimeout(() => {
          setIsUploading(false);
          setActivePreset(presetKey);
          setUploadedFile(contractPresets[presetKey].name);
        }, 500);
      } else {
        setUploadProgress(progress);
        if (progress < 25) {
          setUploadStep("Uploading secure stream (AES-256)...");
        } else if (progress < 55) {
          setUploadStep("Extracting layout text structures...");
        } else if (progress < 80) {
          setUploadStep("Auditing 14 risk categories...");
        } else {
          setUploadStep("Compiling timeline calendar alerts...");
        }
      }
    }, 100);
  };

  // Clause Sandbox Interactive State
  const [isFixedMap, setIsFixedMap] = React.useState<Record<string, boolean>>({
    liability: false,
    indemnity: false,
    termination: false,
    governing: false
  });
  const [activeTooltipId, setActiveTooltipId] = React.useState<string | null>(null);
  const [isFixing, setIsFixing] = React.useState(false);

  const triggerAutoFix = (clauseKey: string) => {
    setIsFixing(true);
    setActiveTooltipId(null);
    setTimeout(() => {
      setIsFixedMap(prev => ({ ...prev, [clauseKey]: true }));
      setIsFixing(false);
    }, 850);
  };

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      
      const sections = ["features", "sandbox", "pricing", "faq"];
      const scrollPosition = window.scrollY + 160; // offset for sticky navbar height and padding
      
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            return;
          }
        }
      }
      
      if (window.scrollY < 100) {
        setActiveSection("hero");
      }
    };
    window.addEventListener("scroll", handleScroll);
    // Initial compute
    setTimeout(handleScroll, 100);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setEmailSubscribed(true);
      setNewsletterEmail("");
      setTimeout(() => setEmailSubscribed(false), 3000);
    }
  };

  const triggerChatTyping = (key: "liability" | "notice" | "ip") => {
    if (key === chatQuestion) return;
    setIsChatTyping(true);
    setChatQuestion(key);
    setTimeout(() => {
      setIsChatTyping(false);
    }, 700);
  };

  // Hero presets data
  const contractPresets: Record<"saas" | "nda" | "contractor", ContractPreset> = {
    saas: {
      name: "ACME SaaS Subscription Agreement.pdf",
      risk: "High",
      summary: "Initial term is 12 months, auto-renews. The liability cap is 12 months fees, but includes unlimited data breach exposures. Cure period for material breaches shortened to 15 days.",
      warning: "Notice period shortened from 30 to 15 days, resulting in tight renewal obligations.",
      deadline: "February 10, 2027",
      obligations: ["Notice of non-renewal: 15 days prior", "Indemnification: Unlimited for data loss"]
    },
    nda: {
      name: "NDA Mutual Draft - Final.docx",
      risk: "Low",
      summary: "Standard mutual non-disclosure agreement. Protection term is 3 years from disclosure date. Standard exceptions for public knowledge, court orders, and prior disclosure apply.",
      warning: "No major risks identified. Governed by Delaware law which is standard.",
      deadline: "March 12, 2029",
      obligations: ["Confidentiality protection term: 3 years", "Exceptions: standard exceptions apply"]
    },
    contractor: {
      name: "Freelance Developer Contract.pdf",
      risk: "Medium",
      summary: "Independent contractor agreement. Work-for-hire provisions assign all IP to client upon payment. Net 45 payment terms. 30 days notice required for termination without cause.",
      warning: "Payment terms are Net 45 (long delay). IP is only assigned 'upon full payment' which protects you.",
      deadline: "November 15, 2026",
      obligations: ["Payment Terms: Net 45", "IP Assignment: Conditional on payment receipt"]
    }
  };

  const currentPreset = contractPresets[activePreset];

  // Clause sandbox data
  const clauseSandbox = {
    liability: {
      title: "Limitation of Liability",
      risk: "High Risk",
      color: "text-rose-600 bg-rose-50 border-rose-100",
      raw: "In no event shall either party's maximum aggregate liability arising out of or related to this Agreement exceed the total fees paid or payable to Supplier in the twelve (12) month period immediately preceding the event giving rise to liability. Notwithstanding the foregoing, the cap on liability set forth in this Section shall not apply to claims arising out of data privacy breaches, Supplier's indemnification obligations, or gross negligence.",
      analysis: "Data privacy breach claims and indemnification obligations are fully uncapped. Under modern data regulations (GDPR/CCPA), data breach claims can exceed SaaS subscription values by several orders of magnitude. A single breach could result in bankrupting liability.",
      recommendation: "Negotiate a 'super-cap' for data breaches and indemnification claims. A common market standard is to cap these high-risk categories at 3x or 5x the annual contract value rather than leaving them completely unlimited.",
      rewrite: "In no event shall either party's maximum aggregate liability exceed the total fees paid or payable in the 12-month period preceding the event. Provided, however, that each party's maximum liability for claims arising out of data privacy breaches or indemnification obligations shall be subject to a separate cap equal to three (3) times the annual fees paid under this Agreement."
    },
    indemnity: {
      title: "Intellectual Property Indemnification",
      risk: "High Risk",
      color: "text-rose-600 bg-rose-50 border-rose-100",
      raw: "Provider shall defend, indemnify, and hold harmless Client against any claims, losses, or damages arising out of any allegation that the Software infringes the intellectual property rights of any third party. Provider shall pay all court costs, attorney fees, and settlements resulting from such claims, without limitation.",
      analysis: "The indemnity obligation is broad, triggers on mere 'allegations', and covers attorney fees and settlements without a liability cap. There is no requirement for the client to immediately notify the provider of the claim, which would prevent the provider from defending it properly.",
      recommendation: "Add requirements for immediate written notification of claims, exclusive control of the defense by the Provider, and a duty for the Client to cooperate. Standardize infringement remedies (modify, replace, or refund).",
      rewrite: "Provider shall defend and indemnify Client against final judgments arising out of claims that the Software infringes third-party IP rights, provided that Client: (a) promptly notifies Provider in writing of the claim, (b) grants Provider sole control of the defense and settlement, and (c) fully cooperates with Provider. If an infringement claim occurs, Provider may modify the software, replace it, or terminate and refund prepaid fees."
    },
    termination: {
      title: "Cure Period for Material Breach",
      risk: "Medium Risk",
      color: "text-amber-600 bg-amber-50 border-amber-100",
      raw: "Either party may terminate this Agreement immediately upon written notice if the other party breaches any material term of this Agreement and fails to cure such breach within ten (10) business days after receipt of written notice thereof.",
      analysis: "A cure period of 10 business days (approx. 14 calendar days) is shorter than the standard industry benchmark of 30 calendar days. This leaves very little buffer to resolve complex technical service failures or billing disputes, heightening the risk of contract breach.",
      recommendation: "Request that the cure period be extended to thirty (30) calendar days to ensure reasonable time is available to resolve disputes.",
      rewrite: "Either party may terminate this Agreement if the other party fails to cure a material breach within thirty (30) calendar days after written notice thereof."
    },
    governing: {
      title: "Governing Law & Venue",
      risk: "Low Risk / Neutral",
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
      raw: "This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of law principles. Any legal suit, action, or proceeding arising out of this Agreement shall be instituted exclusively in the federal or state courts located in Wilmington, Delaware.",
      analysis: "Delaware governing law and exclusive venue are the standard business defaults in US corporate contracts, especially for venture-backed and SaaS startups. Courts in Delaware are highly predictable.",
      recommendation: "Acceptable as drafted. No changes required.",
      rewrite: "No revisions needed. Retain Delaware governing law for predictability."
    }
  };

  const sandboxHighlights = {
    liability: {
      pre: "In no event shall either party's maximum aggregate liability arising out of or related to this Agreement exceed the total fees paid or payable to Supplier in the twelve (12) month period immediately preceding the event giving rise to liability. ",
      bad: "Notwithstanding the foregoing, the cap on liability set forth in this Section shall not apply to claims arising out of data privacy breaches, Supplier's indemnification obligations, or gross negligence.",
      good: "Provided, however, that each party's maximum liability for claims arising out of data privacy breaches or indemnification obligations shall be subject to a separate cap equal to three (3) times the annual fees paid under this Agreement.",
      title: "Uncapped Liability Trap",
      desc: "Uncapped data breach claims can exceed SaaS contract values by orders of magnitude, threatening business solvency.",
      rating: "HIGH RISK"
    },
    indemnity: {
      pre: "Provider shall defend, indemnify, and hold harmless Client against any claims, losses, or damages arising out of ",
      bad: "any allegation that the Software infringes the intellectual property rights of any third party. Provider shall pay all court costs, attorney fees, and settlements resulting from such claims, without limitation.",
      good: "final judgments arising out of claims that the Software infringes third-party IP rights, provided that Client: (a) promptly notifies Provider in writing, (b) grants Provider sole control of the defense, and (c) fully cooperates.",
      title: "Unconditional IP Indemnity",
      desc: "Triggers uncapped attorney fees on mere allegations without immediate written notification and sole defense control mandates.",
      rating: "HIGH RISK"
    },
    termination: {
      pre: "Either party may terminate this Agreement immediately upon written notice if the other party breaches any material term of this Agreement and fails to cure such breach within ",
      bad: "ten (10) business days after receipt of written notice thereof.",
      good: "thirty (30) calendar days after receipt of written notice thereof.",
      title: "Short Cure Period",
      desc: "A 10 business day window is highly operational-risk prone for resolving complex technical service outages or disputes.",
      rating: "MEDIUM RISK"
    },
    governing: {
      pre: "This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, ",
      bad: "without regard to its conflict of law principles. Any legal suit, action, or proceeding arising out of this Agreement shall be instituted exclusively in the federal or state courts located in Wilmington, Delaware.",
      good: "without regard to its conflict of law principles. Any legal suit, action, or proceeding shall be instituted exclusively in state/federal courts of Delaware.",
      title: "Delaware Venue Choice",
      desc: "Delaware law and Wilmington venue are standard US business defaults. Highly predictable courts. Safe as drafted.",
      rating: "LOW RISK"
    }
  };

  const currentClause = clauseSandbox[activeClause];

  // Chat simulator options
  const chatSimOptions = {
    liability: {
      q: "What is the liability cap under this agreement?",
      a: "According to Section 10.1, the liability cap is equal to the total fees paid or payable in the 12-month period preceding the event. However, this cap does NOT apply to data breaches or indemnification obligations, meaning they are completely unlimited.",
      citation: "Section 10.1 (Page 5)"
    },
    notice: {
      q: "What is the notice period for non-renewal?",
      a: "Under Section 11.2, you must provide written notice of non-renewal at least fifteen (15) days prior to the expiration of the current term. If missed, the agreement auto-renews for another 12-month period.",
      citation: "Section 11.2 (Page 7)"
    },
    ip: {
      q: "Who owns the intellectual property rights?",
      a: "Section 6.4 dictates that all intellectual property rights in the custom deliverables assign to the Client automatically, but this assignment is conditional upon the Provider's receipt of full payment.",
      citation: "Section 6.4 (Page 3)"
    }
  };

  // Version diff simulator options
  const diffSimOptions = {
    cure: {
      title: "Cure Period for Breach",
      orig: "Either party may terminate this Agreement if the other party fails to cure a material breach within ten (10) business days following receipt of written notice.",
      rev: "Either party may terminate this Agreement if the other party fails to cure a material breach within thirty (30) calendar days following receipt of written notice.",
      desc: "Extends cure buffer to standard 30 calendar days, reducing operational breach risks."
    },
    ip: {
      title: "Intellectual Property Transfer",
      orig: "Provider hereby assigns and transfers to Client all right, title, and interest in the Work Product immediately upon creation thereof.",
      rev: "Provider hereby assigns and transfers to Client all right, title, and interest in the Work Product conditional upon Provider's receipt of full payment.",
      desc: "Protects freelance developers by ensuring ownership only transfers once payment is cleared."
    },
    liability: {
      title: "Liability Limit Cap",
      orig: "In no event shall either party's maximum aggregate liability arising out of or related to this Agreement exceed the total fees paid in the preceding 12 months.",
      rev: "In no event shall either party's maximum aggregate liability exceed the total fees paid in the preceding 12 months, provided that claims for data breach shall be subject to a cap of three (3) times annual fees.",
      desc: "Implements a separate 'super-cap' for data privacy exposures instead of leaving breaches unlimited."
    }
  };

  // Timeline simulator options
  const timelineSimOptions = {
    notice: {
      name: "Non-renewal notice window deadline",
      date: "Feb 10, 2027",
      countdown: "58 Days remaining",
      alert: "bg-rose-500 text-white",
      desc: "You must notify the provider in writing before this date to prevent the contract from automatically renewing for another 12-month period."
    },
    payment: {
      name: "Deliverable Milestones & Net 45 Payment",
      date: "Mar 01, 2027",
      countdown: "77 Days remaining",
      alert: "bg-amber-500 text-white",
      desc: "Invoice payment due under Net 45 terms. Delayed payment will hold up intellectual property ownership transfer."
    },
    expiration: {
      name: "Contract End & Expiration Date",
      date: "Mar 12, 2027",
      countdown: "88 Days remaining",
      alert: "bg-blue-500 text-white",
      desc: "Official termination date of the current contract term. Shift to support retainer or renew options."
    }
  };

  // FAQ Data
  const faqs = [
    {
      q: "How does Velflow analyze contracts?",
      a: "Velflow parses your uploaded PDF or DOCX legal documents using secure, custom-tuned LLMs trained on legal syntax and commercial agreements. It reviews terms, parses clauses, indexes deadlines, and maps risks based on standard corporate legal guidelines."
    },
    {
      q: "Is my data secure and confidential?",
      a: "Yes. Velflow enforces end-to-end transport encryption (TLS 1.3) and AES-256 encryption at rest. We never sell your legal data, and we do not use your proprietary documents to train public AI models. All reviews are private to your workspace."
    },
    {
      q: "Can I compare multiple contract versions?",
      a: "Absolutely. The Comparative Analysis feature allows you to upload two different drafts (e.g. original and marked-up versions) to review side-by-side. Velflow highlights visual redline additions and removals, explaining the business impact of each change."
    },
    {
      q: "How does the Renewal Timeline tracker work?",
      a: "When a contract is analyzed, Velflow automatically extracts dates like term durations, renewal notification deadlines, and payment triggers. It places them on a central interactive dashboard timeline with countdown alerts, preventing you from being locked into costly auto-renewals."
    }
  ];

  return (
    <TooltipProvider>
      <div className="min-h-screen font-sans text-slate-800 flex flex-col justify-between selection:bg-blue-100 relative overflow-hidden" style={{ background: "#f8fafc" }}>
        
        {/* Rich background mesh */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: [
            "radial-gradient(ellipse 80% 50% at 50% -5%, rgba(59,130,246,0.12) 0%, transparent 70%)",
            "radial-gradient(ellipse 40% 30% at 80% 20%, rgba(99,102,241,0.08) 0%, transparent 60%)",
            "radial-gradient(ellipse 40% 30% at 20% 70%, rgba(59,130,246,0.06) 0%, transparent 60%)",
          ].join(", ")
        }} />
        {/* Grid pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.025]" style={{
          backgroundImage: "linear-gradient(rgba(15,23,42,1) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,1) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }} />

        {/* ── Premium Navbar ── */}
        <header className={cn(
          "sticky top-0 z-50 transition-all duration-500 w-full flex items-center justify-center",
          scrolled
            ? "py-2"
            : "py-4"
        )}>
          <div className={cn(
            "max-w-5xl w-full mx-4 px-4 flex items-center justify-between transition-all duration-500 rounded-2xl",
            scrolled
              ? "bg-white/85 backdrop-blur-xl shadow-lg shadow-slate-900/5 border border-slate-200/80 py-2.5 px-5"
              : "bg-transparent py-3"
          )}>
            <Link href="/" className="flex items-center gap-2.5 group">
              <div
                className="h-9 w-9 rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-all duration-300 relative"
                style={{ background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", boxShadow: "0 4px 14px rgba(59,130,246,0.35)" }}
              >
                <Scale className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-black text-[17px] tracking-tight text-slate-900">
                Vel<span className="text-blue-600">flow</span>
              </span>
            </Link>

            {/* Center nav links */}
            <nav className="hidden md:flex items-center gap-1 p-1 rounded-xl" style={{ background: scrolled ? "transparent" : "rgba(241,245,249,0.8)" }}>
              {[
                { id: "features", label: "Features" },
                { id: "sandbox", label: "Sandbox" },
                { id: "pricing", label: "Pricing" },
                { id: "faq", label: "FAQ" },
              ].map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className={cn(
                    "text-xs font-bold transition-all px-3.5 py-1.5 rounded-lg cursor-pointer outline-none",
                    activeSection === link.id
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-800 hover:bg-white/60"
                  )}
                >
                  {link.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-bold cursor-pointer transition-all rounded-xl text-xs h-9 px-4">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <button
                  className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-white text-xs font-bold cursor-pointer transition-all hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)", boxShadow: "0 4px 14px rgba(59,130,246,0.3)" }}
                >
                  Get Started
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </Link>
            </div>
          </div>
        </header>

        {/* ── Hero Section ── */}
        <main className="flex-grow flex flex-col items-center justify-center px-6 pt-16 pb-8 max-w-6xl mx-auto w-full relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-7 mb-16 animate-fade-slide-up">
            
            {/* Tagline badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase"
              style={{
                background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
                border: "1px solid rgba(59,130,246,0.2)",
                color: "#1d4ed8",
                boxShadow: "0 2px 8px rgba(59,130,246,0.1)",
              }}
            >
              <Sparkles className="h-3 w-3 animate-pulse" />
              Product-led AI Legal Co-Pilot · Powered by Gemini
            </div>
            
            {/* Main Headline */}
            <div className="relative">
              {/* Glow blob behind text */}
              <div
                className="absolute inset-0 pointer-events-none -z-10"
                style={{
                  background: "radial-gradient(ellipse 60% 50% at 50% 60%, rgba(59,130,246,0.08) 0%, transparent 80%)",
                  filter: "blur(24px)",
                }}
              />
              <h1 className="text-4xl sm:text-[64px] font-black tracking-[-0.03em] leading-[1.0] text-slate-950">
                Sign contracts with
                <span
                  className="block mt-1"
                  style={{
                    background: "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 40%, #6366f1 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  absolute confidence.
                </span>
              </h1>
            </div>
            
            {/* Subtitle */}
            <p className="text-sm sm:text-[15px] text-slate-500 leading-relaxed font-medium max-w-xl mx-auto">
              Velflow is the AI Contract Navigator built for founders, freelancers, and growth teams.
              Analyze risk, compare versions, and track critical renewal deadlines — in seconds.
            </p>

            {/* Social proof micro-stats */}
            <div className="flex items-center justify-center gap-6 flex-wrap">
              {[
                { value: "10k+", label: "Contracts Analyzed" },
                { value: "99.2%", label: "Risk Accuracy" },
                { value: "< 30s", label: "Avg. Analysis Time" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-2.5">
                  <div className="text-left">
                    <p className="text-base font-black text-slate-900 leading-none">{stat.value}</p>
                    <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{stat.label}</p>
                  </div>
                  <div className="h-6 w-px bg-slate-200 last:hidden" />
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
              <Link href="/signup">
                <button
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 h-12 rounded-xl text-white text-sm font-black cursor-pointer transition-all hover:-translate-y-0.5 animate-in fade-in zoom-in-95 duration-300"
                  style={{
                    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                    boxShadow: "0 4px 20px rgba(15,23,42,0.25), 0 1px 0 rgba(255,255,255,0.1) inset",
                  }}
                >
                  Analyze a Contract Free
                  <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                </button>
              </Link>
              <button
                onClick={() => scrollToSection("sandbox")}
                className="w-full sm:w-auto h-12 px-6 rounded-xl text-slate-700 text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5"
                style={{ background: "white", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(15,23,42,0.06)" }}
              >
                Try the Clause Sandbox
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Quick-Navigator Bar */}
            <div className="pt-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 text-center">⚡ Click to instantly explore features</p>
              <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl mx-auto">
                {[
                  { label: "🔍 Risk Analyzer", sectionId: "sandbox" },
                  { label: "💬 Legal AI Chat", sectionId: "features", tab: "chat" },
                  { label: "⚖️ Smart Redlines", sectionId: "features", tab: "diff" },
                  { label: "📅 Obligation timeline", sectionId: "features", tab: "timeline" },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      scrollToSection(item.sectionId);
                      if (item.tab) {
                        setActiveTab(item.tab as any);
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white border border-slate-200 hover:border-indigo-400 hover:bg-white text-slate-600 hover:text-indigo-600 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all cursor-pointer hover:-translate-y-0.5"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Hero Product Preview (Mockup SaaS Surface) */}
          <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-xl relative overflow-hidden mb-24 animate-scale-in">
            {!uploadedFile && !isUploading ? (
              <div className="p-8 text-center flex flex-col items-center justify-center bg-slate-50/30 py-16 border-2 border-dashed border-slate-200 rounded-xl m-5 hover:border-blue-400 hover:bg-slate-50/60 transition-all duration-300">
                <div className="h-14 w-14 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4 animate-float shadow-2xs">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight">Drop your contract file here to review</h3>
                <p className="text-xs text-slate-400 font-semibold mt-1 mb-6 max-w-xs leading-relaxed">
                  Upload any PDF or select a preset contract file below to run a simulated AI compliance risk audit.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => startUploadSimulation("saas")}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs hover:border-slate-300 flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
                  >
                    <Scale className="h-3.5 w-3.5 text-blue-600" />
                    ACME SaaS Agreement.pdf
                  </button>
                  <button
                    onClick={() => startUploadSimulation("nda")}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs hover:border-slate-300 flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    NDA Draft Mutual.docx
                  </button>
                  <button
                    onClick={() => startUploadSimulation("contractor")}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs hover:border-slate-300 flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
                  >
                    <User className="h-3.5 w-3.5 text-amber-600" />
                    Developer Contractor Agreement.pdf
                  </button>
                </div>
              </div>
            ) : isUploading ? (
              <div className="p-8 py-20 text-center flex flex-col items-center justify-center bg-white space-y-6">
                <div className="relative h-16 w-16 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
                  <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
                  <Sparkles className="h-5 w-5 text-blue-600 animate-pulse" />
                </div>
                
                <div className="space-y-1.5 max-w-sm mx-auto">
                  <h3 className="text-sm font-black text-slate-800 tracking-tight flex items-center justify-center gap-2">
                    Analyzing Document
                    <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-md font-black">{uploadProgress}%</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold transition-all duration-200 animate-pulse">
                    {uploadStep}
                  </p>
                </div>
                
                <div className="w-full max-w-xs h-2 bg-slate-100 rounded-full overflow-hidden relative">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-300 shadow-sm"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <>
                {/* Mockup Topbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 px-5 py-4 bg-slate-50/50 gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-200 shrink-0" />
                    <div className="w-3 h-3 rounded-full bg-slate-200 shrink-0" />
                    <div className="w-3 h-3 rounded-full bg-slate-200 shrink-0" />
                    <span className="text-xs font-bold text-slate-400 ml-2 truncate max-w-[200px] sm:max-w-xs">{currentPreset.name}</span>
                  </div>
                  
                  {/* Presets Selectors and Reset button */}
                  <div className="flex items-center gap-2 select-none">
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto shrink-0 shadow-inner">
                      <button
                        onClick={() => startUploadSimulation("saas")}
                        className={cn(
                          "text-[10px] font-black px-2.5 py-1 rounded-lg transition-all cursor-pointer",
                          activePreset === "saas"
                            ? "bg-white text-slate-900 shadow-xs"
                            : "text-slate-400 hover:text-slate-600"
                        )}
                      >
                        SaaS
                      </button>
                      <button
                        onClick={() => startUploadSimulation("nda")}
                        className={cn(
                          "text-[10px] font-black px-2.5 py-1 rounded-lg transition-all cursor-pointer",
                          activePreset === "nda"
                            ? "bg-white text-slate-900 shadow-xs"
                            : "text-slate-400 hover:text-slate-600"
                        )}
                      >
                        NDA
                      </button>
                      <button
                        onClick={() => startUploadSimulation("contractor")}
                        className={cn(
                          "text-[10px] font-black px-2.5 py-1 rounded-lg transition-all cursor-pointer",
                          activePreset === "contractor"
                            ? "bg-white text-slate-900 shadow-xs"
                            : "text-slate-400 hover:text-slate-600"
                        )}
                      >
                        Contractor
                      </button>
                    </div>

                    <button 
                      onClick={() => setUploadedFile(null)}
                      className="text-[10px] font-black bg-slate-100 hover:bg-slate-200 border border-slate-200/50 text-slate-500 hover:text-slate-700 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>
                </div>
                
                {/* Mockup Dashboard content */}
                <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-5 text-left bg-white">
                  {/* Left summary side */}
                  <div className="md:col-span-8 space-y-4">
                    <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4.5 space-y-1.5 shadow-2xs">
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider flex items-center gap-1.5 select-none">
                        <Sparkles className="h-3 w-3 animate-pulse" />
                        AI Summary & Overview
                      </span>
                      <p className="text-xs text-slate-600 font-semibold leading-relaxed transition-all duration-300">
                        {currentPreset.summary}
                      </p>
                    </div>
                    
                    <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4.5 space-y-2 shadow-2xs">
                      <span className="text-[10px] font-black text-rose-600 uppercase tracking-wider flex items-center gap-1.5 select-none">
                        <AlertTriangle className="h-3 w-3 text-rose-500" />
                        Top Risk Assessment
                      </span>
                      <div className="flex gap-2.5 items-start text-xs text-slate-600 font-semibold">
                        <span className={cn(
                          "text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 shadow-2xs",
                          currentPreset.risk === "High" ? "bg-rose-50 border border-rose-100 text-rose-600" :
                          currentPreset.risk === "Medium" ? "bg-amber-50 border border-amber-100 text-amber-600" :
                          "bg-emerald-50 border border-emerald-100 text-emerald-600"
                        )}>
                          {currentPreset.risk} Risk
                        </span>
                        <span className="transition-all duration-300 leading-relaxed">{currentPreset.warning}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right metadata side */}
                  <div className="md:col-span-4 space-y-4">
                    <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-5 text-center flex flex-col justify-center items-center shadow-2xs">
                      <Calendar className="h-7 w-7 text-blue-600 mb-2.5" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider select-none">Obligation Deadline</span>
                      <span className="text-base font-extrabold text-slate-900 mt-1.5 transition-all duration-300">{currentPreset.deadline}</span>
                      <span className="text-[9px] text-slate-400 mt-0.5 font-bold uppercase tracking-widest">Renewal Lockin</span>
                    </div>

                    <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4.5 space-y-2 shadow-2xs text-left">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider select-none">Key Obligations</span>
                      <ul className="space-y-1.5">
                        {currentPreset.obligations.map((obl, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-[10.5px] font-bold text-slate-600 truncate">
                            <Check className="h-3 w-3 text-emerald-500 shrink-0" strokeWidth={3} />
                            <span className="truncate">{obl}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Trust cloud section */}
          <div className="w-full text-center mb-24 max-w-5xl mx-auto space-y-5 select-none">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400/80">Securing contract workflows for fast-growing companies</p>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-40">
              <span className="font-extrabold text-slate-800 tracking-tight text-lg">Y Combinator</span>
              <span className="font-extrabold text-slate-800 tracking-tight text-lg">STRIPE</span>
              <span className="font-extrabold text-slate-800 tracking-tight text-lg">Linear</span>
              <span className="font-extrabold text-slate-800 tracking-tight text-lg">vercel</span>
              <span className="font-extrabold text-slate-800 tracking-tight text-lg">Retool</span>
            </div>
          </div>

          {/* Showcase Feature Cards */}
          <section id="features" className="w-full py-10 scroll-mt-20">
            {/* Features Showcase Header */}
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">AI Capability Matrix</h2>
              <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed">
                Take an interactive tour of the complete Velflow toolset built to protect your startup assets.
              </p>
            </div>

            {/* Feature Tabs Container */}
            <div className="flex flex-col gap-6">
              
              {/* Tab headers */}
              <div className="flex flex-wrap justify-center items-center gap-2 bg-slate-100/80 p-1.5 rounded-xl max-w-2xl mx-auto shadow-inner">
                <button
                  onClick={() => setActiveTab("radar")}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer outline-none",
                    activeTab === "radar"
                      ? "bg-white text-blue-600 shadow-xs border border-slate-200/20"
                      : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  <Radar className="h-3.5 w-3.5" />
                  Risk Radar
                </button>
                <button
                  onClick={() => setActiveTab("chat")}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer outline-none",
                    activeTab === "chat"
                      ? "bg-white text-blue-600 shadow-xs border border-slate-200/20"
                      : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Secure Chat
                </button>
                <button
                  onClick={() => setActiveTab("diff")}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer outline-none",
                    activeTab === "diff"
                      ? "bg-white text-blue-600 shadow-xs border border-slate-200/20"
                      : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  <TrendingUp className="h-3.5 w-3.5" />
                  Version Diff
                </button>
                <button
                  onClick={() => setActiveTab("timeline")}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer outline-none",
                    activeTab === "timeline"
                      ? "bg-white text-blue-600 shadow-xs border border-slate-200/20"
                      : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  <Calendar className="h-3.5 w-3.5" />
                  Timelines
                </button>
              </div>

              {/* Tab Display Panel */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl text-left grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch min-h-[360px]">
                
                {/* Left Side: Text explanation */}
                <div className="md:col-span-5 space-y-4 flex flex-col justify-center">
                  {activeTab === "radar" && (
                    <>
                      <div className="h-10 w-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                        <Radar className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide">AI Risk Indexing Radar</h3>
                      <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                        Instantly audits loaded contracts against standard startup risk profiles. Scans for indemnity ceilings, auto-renewal trap loops, data security mandates, and exclusive venue traps.
                      </p>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-xs text-slate-600 font-bold">
                          <Check className="h-4 w-4 text-emerald-500" strokeWidth={3} />
                          Automatic risk scoring (High, Medium, Low)
                        </li>
                        <li className="flex items-center gap-2 text-xs text-slate-600 font-bold">
                          <Check className="h-4 w-4 text-emerald-500" strokeWidth={3} />
                          Category breakdown (Liability, IP, Payment)
                        </li>
                      </ul>
                    </>
                  )}

                  {activeTab === "chat" && (
                    <>
                      <div className="h-10 w-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide">Secure Chat Simulator</h3>
                      <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                        Query legal content using plain-English questions. Ask about liability caps or renewal notices to see immediate citations.
                      </p>
                      
                      {/* Interactive Question Prompts */}
                      <div className="space-y-2 pt-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest select-none">Ask Velflow AI a Question:</span>
                        <div className="flex flex-col gap-1.5">
                          {(["liability", "notice", "ip"] as const).map((key) => (
                            <button
                              key={key}
                              onClick={() => triggerChatTyping(key)}
                              className={cn(
                                "text-[11px] font-bold text-left px-3 py-2 rounded-lg border transition-all cursor-pointer outline-none flex items-center gap-2",
                                chatQuestion === key
                                  ? "bg-blue-50 border-blue-100 text-blue-600"
                                  : "bg-slate-50 border-slate-100 text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                              )}
                            >
                              <Compass className="h-3 w-3" />
                              {chatSimOptions[key].q}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === "diff" && (
                    <>
                      <div className="h-10 w-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide">Version Comparison Diff</h3>
                      <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                        Never sign a document without knowing what changed in the redline. Upload version revisions to instantly match structural removals, text inserts, and rephrasings.
                      </p>
                      
                      {/* Interactive Diff selectors */}
                      <div className="space-y-2 pt-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest select-none">Select Clause Redline:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {(["cure", "ip", "liability"] as const).map((key) => (
                            <button
                              key={key}
                              onClick={() => setDiffCategory(key)}
                              className={cn(
                                "text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all cursor-pointer outline-none",
                                diffCategory === key
                                  ? "bg-blue-50 border-blue-100 text-blue-600 shadow-2xs"
                                  : "bg-slate-50 border-slate-100 text-slate-400 hover:text-slate-600"
                              )}
                            >
                              {diffSimOptions[key].title}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === "timeline" && (
                    <>
                      <div className="h-10 w-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide">Obligation Milelines</h3>
                      <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                        Missed renewal deadlines can lock you into multi-year commitments. Velflow automatically extracts opt-out lockins and place them on an active timeline tracker.
                      </p>

                      {/* Interactive Timeline Event Toggles */}
                      <div className="space-y-2 pt-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest select-none">Trigger Calendar Event:</span>
                        <div className="flex flex-col gap-1.5">
                          {(["notice", "payment", "expiration"] as const).map((key) => (
                            <button
                              key={key}
                              onClick={() => setTimelineEvent(key)}
                              className={cn(
                                "text-[11px] font-bold text-left px-3 py-2 rounded-lg border transition-all cursor-pointer outline-none flex items-center gap-2",
                                timelineEvent === key
                                  ? "bg-blue-50 border-blue-100 text-blue-600"
                                  : "bg-slate-50 border-slate-100 text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                              )}
                            >
                              <Clock className="h-3.5 w-3.5 text-slate-400" />
                              {timelineSimOptions[key].name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Right Side: Graphical mock preview */}
                <div className="md:col-span-7 bg-slate-50 border border-slate-200/60 rounded-xl p-5 flex flex-col justify-center relative overflow-hidden shadow-inner select-none min-h-[300px]">
                  {activeTab === "radar" && (
                    <div className="space-y-4 animate-scale-in">
                      <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
                        <span className="text-xs font-bold text-slate-800">Liability Limitation Cap</span>
                        <span className="text-[9px] font-black px-2 py-0.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-full">HIGH RISK</span>
                      </div>
                      <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
                        <span className="text-xs font-bold text-slate-800">Automatic Renewal Loop</span>
                        <span className="text-[9px] font-black px-2 py-0.5 bg-amber-50 border border-amber-100 text-amber-600 rounded-full">MEDIUM RISK</span>
                      </div>
                      <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
                        <span className="text-xs font-bold text-slate-800">Governing Venue Jurisdiction</span>
                        <span className="text-[9px] font-black px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full">LOW RISK</span>
                      </div>
                    </div>
                  )}

                  {activeTab === "chat" && (
                    <div className="space-y-3 flex flex-col justify-center h-full">
                      {/* User chat bubble */}
                      <div className="bg-blue-600 text-white text-[11.5px] font-semibold p-3.5 rounded-2xl rounded-tr-none max-w-[80%] self-end ml-auto shadow-2xs animate-fade-slide-up">
                        {chatSimOptions[chatQuestion].q}
                      </div>
                      
                      {/* AI Chat response bubble */}
                      {isChatTyping ? (
                        <div className="bg-white border border-slate-200 text-slate-400 text-[11px] font-semibold p-3 rounded-2xl rounded-tl-none max-w-[40%] shadow-2xs flex items-center gap-1.5 self-start mr-auto select-none">
                          <span className="h-2 w-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="h-2 w-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="h-2 w-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      ) : (
                        <div className="bg-white border border-slate-200 text-slate-700 text-[11.5px] font-semibold p-3.5 rounded-2xl rounded-tl-none max-w-[85%] shadow-2xs self-start mr-auto animate-scale-in">
                          {chatSimOptions[chatQuestion].a}
                          <div className="mt-2 text-[9px] font-black text-blue-600 flex items-center gap-1 border-t border-slate-100 pt-1.5 uppercase select-none">
                            <FileText className="h-3 w-3" />
                            View Citation: {chatSimOptions[chatQuestion].citation}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "diff" && (
                    <div className="space-y-3 animate-scale-in">
                      <div className="bg-rose-50 border border-rose-100 text-rose-700 p-3.5 rounded-xl font-mono text-[10.5px] leading-relaxed relative">
                        <span className="absolute top-2 right-2 text-[8px] font-bold bg-rose-200 text-rose-800 px-1 rounded uppercase tracking-wider select-none">Removed</span>
                        <span className="mr-8 block">{diffSimOptions[diffCategory].orig}</span>
                      </div>
                      <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-3.5 rounded-xl font-mono text-[10.5px] leading-relaxed relative">
                        <span className="absolute top-2 right-2 text-[8px] font-bold bg-emerald-200 text-emerald-800 px-1 rounded uppercase tracking-wider select-none">Inserted</span>
                        <span className="mr-8 block">{diffSimOptions[diffCategory].rev}</span>
                      </div>
                      <div className="text-center text-[10px] text-slate-500 font-bold bg-slate-100/50 p-2 rounded-lg border border-slate-200/40">
                        {diffSimOptions[diffCategory].desc}
                      </div>
                    </div>
                  )}

                  {activeTab === "timeline" && (
                    <div className="space-y-4 animate-scale-in">
                      {/* Active Alert Widget */}
                      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-150 shadow-xs relative">
                        <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center shrink-0 shadow-2xs font-extrabold text-[12px] uppercase", timelineSimOptions[timelineEvent].alert.includes("rose") ? "bg-rose-500 text-white" : timelineSimOptions[timelineEvent].alert.includes("amber") ? "bg-amber-500 text-white" : "bg-blue-500 text-white")}>
                          <Clock className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black text-slate-800 leading-none">{timelineSimOptions[timelineEvent].name}</p>
                          <p className="text-[10px] text-slate-400 font-bold mt-1.5">{timelineSimOptions[timelineEvent].date} · {timelineSimOptions[timelineEvent].countdown}</p>
                        </div>
                        <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-full select-none", timelineSimOptions[timelineEvent].alert.includes("rose") ? "bg-rose-50 border border-rose-100 text-rose-600" : timelineSimOptions[timelineEvent].alert.includes("amber") ? "bg-amber-50 border border-amber-100 text-amber-600" : "bg-blue-50 border border-blue-100 text-blue-600")}>
                          {timelineSimOptions[timelineEvent].alert.includes("rose") ? "CRITICAL" : timelineSimOptions[timelineEvent].alert.includes("amber") ? "WARNING" : "INFO"}
                        </span>
                      </div>
                      
                      {/* Event description block */}
                      <div className="bg-white border border-slate-150 p-3.5 rounded-xl text-xs text-slate-500 font-semibold leading-relaxed text-left shadow-2xs">
                        {timelineSimOptions[timelineEvent].desc}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </section>

          {/* Interactive Clause Sandbox */}
          <section id="sandbox" className="w-full max-w-5xl mx-auto py-12 scroll-mt-20">
            <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">Try the Clause Risk Sandbox</h2>
              <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed">
                Click on typical startup contract terms to see how Velflow dissects risk and suggests cleaner, founder-friendly terms.
              </p>
            </div>

            {/* Sandbox Container */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white border border-slate-200/80 rounded-2xl shadow-xl overflow-hidden p-6">
              
              {/* Left Selector Column (4 cols) */}
              <div className="md:col-span-4 flex flex-col gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 pl-1 select-none">Select Clause Category</span>
                {(["liability", "indemnity", "termination", "governing"] as const).map((key) => {
                  const isClauseActive = activeClause === key;
                  const clause = clauseSandbox[key];
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveClause(key)}
                      className={cn(
                        "w-full text-left px-4 py-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 relative overflow-hidden group outline-none",
                        isClauseActive
                          ? "bg-blue-50 border-blue-100 text-blue-600 shadow-2xs"
                          : "bg-slate-50/50 hover:bg-slate-50 border-slate-100 text-slate-600 hover:text-slate-800"
                      )}
                    >
                      {isClauseActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
                      )}
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-black truncate">{clause.title}</span>
                        <ChevronRight className={cn("h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity", isClauseActive ? "text-blue-500" : "text-slate-400")} />
                      </div>
                      <span className={cn(
                        "text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider self-start shadow-2xs",
                        clause.risk.includes("High") ? "bg-rose-100/60 text-rose-600" :
                        clause.risk.includes("Medium") ? "bg-amber-100/60 text-amber-600" :
                        "bg-emerald-100/60 text-emerald-600"
                      )}>
                        {clause.risk}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Right Panel Column (8 cols) */}
              <div className="md:col-span-8 flex flex-col gap-4 text-left border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-6 relative min-h-[380px]">
                
                {/* Clause Title & Status */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-4">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">{currentClause.title}</h3>
                  <div className="flex items-center gap-2 select-none">
                    {isFixedMap[activeClause] ? (
                      <span className="text-[9px] font-black px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full uppercase tracking-wider flex items-center gap-1">
                        <Check className="h-3 w-3 text-emerald-500" strokeWidth={3} />
                        FIXED & SAFE
                      </span>
                    ) : (
                      <div className={cn("text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border", currentClause.color)}>
                        {currentClause.risk}
                      </div>
                    )}
                  </div>
                </div>

                {/* Raw Clause block */}
                <div className="space-y-1.5 relative">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider select-none">Contract Draft (Redline View)</span>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 font-mono text-[11px] leading-relaxed text-slate-600 relative overflow-hidden transition-all duration-300">
                    <span>{sandboxHighlights[activeClause].pre}</span>
                    {isFixing ? (
                      <span className="bg-amber-50 border border-amber-200 text-amber-600 px-1.5 py-0.5 rounded font-black typing-cursor animate-pulse">
                        AI rewriting term...
                      </span>
                    ) : isFixedMap[activeClause] ? (
                      <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold px-1.5 py-0.5 rounded cursor-pointer hover:bg-emerald-100 transition-colors inline-block animate-scale-in">
                        {sandboxHighlights[activeClause].good}
                      </span>
                    ) : (
                      <span 
                        onClick={() => setActiveTooltipId(activeTooltipId === activeClause ? null : activeClause)}
                        className="bg-rose-50 border border-rose-200 text-rose-700 font-bold px-1.5 py-0.5 rounded cursor-pointer hover:bg-rose-100 transition-colors inline-block relative animate-pulse-glow"
                      >
                        {sandboxHighlights[activeClause].bad}
                      </span>
                    )}
                  </div>
                  {!isFixedMap[activeClause] && !isFixing && !activeTooltipId && (
                    <p className="text-[10px] text-slate-400 font-semibold italic mt-1.5 pl-1 select-none animate-pulse">
                      💡 Click on the highlighted red text above to view AI recommendations.
                    </p>
                  )}
                </div>

                {/* AI Auditing Recommendation Popover Card */}
                {activeTooltipId === activeClause && !isFixedMap[activeClause] && !isFixing && (
                  <div className="bg-slate-900 border border-slate-800 text-slate-100 p-4 rounded-xl shadow-lg animate-fade-slide-up relative space-y-3">
                    <div className="flex items-center justify-between select-none">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-rose-500" />
                        <span className="text-xs font-black uppercase tracking-wider text-rose-400">{sandboxHighlights[activeClause].title}</span>
                      </div>
                      <span className="text-[9px] font-black px-2 py-0.5 bg-rose-950 text-rose-400 rounded-md border border-rose-900">{sandboxHighlights[activeClause].rating}</span>
                    </div>
                    <p className="text-[11.5px] text-slate-300 font-semibold leading-relaxed">
                      {sandboxHighlights[activeClause].desc}
                    </p>
                    <div className="flex items-center justify-between gap-4 pt-1.5 border-t border-slate-800">
                      <span className="text-[10px] text-slate-400 font-bold select-none">Velflow's AI auto-fix is ready.</span>
                      <button
                        onClick={() => triggerAutoFix(activeClause)}
                        className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        1-Click AI Fix
                      </button>
                    </div>
                  </div>
                )}

                {/* AI Review Details (Dynamic assessment blocks) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-rose-500 uppercase tracking-wider select-none flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      AI Risk Assessment
                    </span>
                    <p className="text-[11.5px] text-slate-600 font-semibold leading-relaxed">
                      {isFixedMap[activeClause] 
                        ? `Risk resolved. Safe standard commercial capping parameters successfully substituted in final agreement.` 
                        : currentClause.analysis}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider select-none flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Suggested Action
                    </span>
                    <p className="text-[11.5px] text-slate-600 font-semibold leading-relaxed">
                      {isFixedMap[activeClause] 
                        ? `No further action needed. The clause now aligns perfectly with commercial benchmarks.` 
                        : currentClause.recommendation}
                    </p>
                  </div>
                </div>

                {/* Velflow Suggestion / Rewrite */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 mt-auto">
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider select-none flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Velflow Rewritten Clause (Safe Standard)
                  </span>
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3.5 font-medium text-[11px] leading-relaxed text-slate-700 flex justify-between items-start gap-4">
                    <div className="flex-1">
                      {currentClause.rewrite}
                    </div>
                    {isFixedMap[activeClause] ? (
                      <span className="text-[9px] font-black text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md uppercase tracking-wider flex items-center gap-1 select-none shrink-0 shadow-2xs">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                        Active
                      </span>
                    ) : (
                      <button
                        onClick={() => triggerAutoFix(activeClause)}
                        className="text-[9px] font-black text-blue-600 hover:text-white hover:bg-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1.5 rounded-lg uppercase tracking-wider flex items-center gap-1 select-none shrink-0 shadow-2xs transition-colors cursor-pointer"
                      >
                        Apply Fix
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing Section */}
          <section id="pricing" className="w-full max-w-5xl mx-auto py-12 scroll-mt-20">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">Simple, Growth-Centered Pricing</h2>
              <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed">
                Choose a plan that matches your signature volume. Get full protection starting today.
              </p>

              {/* Monthly/Annual Toggle */}
              <div className="flex items-center justify-center gap-3 pt-2 select-none">
                <span className={cn("text-xs font-black transition-colors", !isAnnual ? "text-slate-800" : "text-slate-400")}>Monthly</span>
                <button
                  onClick={() => setIsAnnual(!isAnnual)}
                  className="w-12 h-6.5 rounded-full bg-slate-200 border border-slate-300 p-0.5 flex items-center transition-all cursor-pointer outline-none"
                  style={{
                    justifyContent: isAnnual ? "flex-end" : "flex-start"
                  }}
                >
                  <div className="h-5 w-5 rounded-full bg-blue-600 shadow-sm" />
                </button>
                <span className={cn("text-xs font-black transition-colors flex items-center gap-1.5", isAnnual ? "text-blue-600" : "text-slate-400")}>
                  Yearly
                  <span className="text-[9px] font-black bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-md uppercase tracking-wider">Save 20%</span>
                </span>
              </div>
            </div>

            {/* Pricing Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Starter Tier */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between text-left hover:shadow-lg hover:border-slate-300 transition-all duration-300">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Starter</h3>
                    <div className="flex items-baseline mt-2">
                      <span className="text-3xl font-black text-slate-900">$0</span>
                      <span className="text-xs font-semibold text-slate-400 ml-1">/ lifetime</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-bold mt-1">Perfect for founders reviewing initial agreements.</p>
                  </div>
                  <div className="w-full h-px bg-slate-100" />
                  <ul className="space-y-2.5">
                    <li className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" strokeWidth={3} />
                      3 contract uploads per month
                    </li>
                    <li className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" strokeWidth={3} />
                      Full AI Summary & Risk Radar
                    </li>
                    <li className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" strokeWidth={3} />
                      Standard Q&A Chat Navigator
                    </li>
                  </ul>
                </div>
                <Link href="/signup" className="mt-8">
                  <Button variant="outline" className="w-full h-10 border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl cursor-pointer">
                    Get Started
                  </Button>
                </Link>
              </div>

              {/* Growth Pro Tier (Popular - Updated to $3/mo) */}
              <div className="bg-white border-2 border-blue-600 rounded-2xl p-6 flex flex-col justify-between text-left shadow-lg relative overflow-hidden transform md:-translate-y-2 hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-[9px] font-black uppercase tracking-wider px-3.5 py-1 rounded-bl-xl shadow-xs select-none">
                  Launch Special
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest leading-none">Growth Pro</h3>
                    <div className="flex items-baseline mt-2">
                      <span className="text-3xl font-black text-slate-900">${isAnnual ? "2.40" : "3"}</span>
                      <span className="text-xs font-semibold text-slate-400 ml-1">/ month</span>
                    </div>
                    {isAnnual && (
                      <p className="text-[9.5px] text-blue-600 font-bold leading-none mt-1">Billed annually ($28.80 / year)</p>
                    )}
                    <p className="text-[11px] text-slate-400 font-bold mt-1">For active founders, freelancers, and growth operators.</p>
                  </div>
                  <div className="w-full h-px bg-slate-100" />
                  <ul className="space-y-2.5">
                    <li className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" strokeWidth={3} />
                      <strong>Unlimited</strong> contract uploads
                    </li>
                    <li className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" strokeWidth={3} />
                      Version redline comparisons
                    </li>
                    <li className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" strokeWidth={3} />
                      Milestone Timeline tracking
                    </li>
                    <li className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" strokeWidth={3} />
                      Prioritized support & backups
                    </li>
                  </ul>
                </div>
                <Link href="/signup" className="mt-8">
                  <Button className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl cursor-pointer shadow-md shadow-blue-100">
                    Claim $3/mo Access
                  </Button>
                </Link>
              </div>

              {/* Enterprise Tier */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between text-left hover:shadow-lg hover:border-slate-300 transition-all duration-300">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Enterprise</h3>
                    <div className="flex items-baseline mt-2">
                      <span className="text-3xl font-black text-slate-900">Custom</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-bold mt-1">For corporate teams and platforms requiring integration.</p>
                  </div>
                  <div className="w-full h-px bg-slate-100" />
                  <ul className="space-y-2.5">
                    <li className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" strokeWidth={3} />
                      Custom volume agreements
                    </li>
                    <li className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" strokeWidth={3} />
                      Dedicated AI instance models
                    </li>
                    <li className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" strokeWidth={3} />
                      SOC2 compliance reports
                    </li>
                    <li className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" strokeWidth={3} />
                      Dedicated Account Manager
                    </li>
                  </ul>
                </div>
                <Link href="/signup" className="mt-8">
                  <Button variant="outline" className="w-full h-10 border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl cursor-pointer">
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </div>

            {/* ROI Calculator Card */}
            <div className="bg-slate-50/50 border border-slate-200/80 rounded-2xl p-6 mt-12 text-left relative overflow-hidden shadow-xs hover-card-premium">
              <div className="absolute top-[-50%] right-[-50%] w-[100%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.04),rgba(255,255,255,0))] pointer-events-none" />
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
                {/* Slider Control (7 cols) */}
                <div className="md:col-span-7 space-y-6">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 border border-blue-100/60 px-2 py-0.5 rounded uppercase tracking-wider select-none">Return on Investment</span>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Calculate Your legal Reclaim ROI</h3>
                    <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                      Commercial contract reviews take an average of 3 hours and cost $350/hour in external legal counsel fees. Reclaim both with Velflow.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center select-none">
                      <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Volume to Review</span>
                      <span className="text-xs font-black text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-xl shadow-2xs">
                        {contractsCount} {contractsCount === 1 ? "Contract" : "Contracts"} / month
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      value={contractsCount}
                      onChange={(e) => setContractsCount(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-bold select-none">
                      <span>1 contract / mo</span>
                      <span>15 / mo</span>
                      <span>30+ / mo</span>
                    </div>
                  </div>
                </div>

                {/* Calculations Display (5 cols) */}
                <div className="md:col-span-5 bg-white border border-slate-150 rounded-xl p-5 space-y-4 shadow-2xs">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Hours Reclaimed</span>
                    <span className="text-sm font-black text-slate-900">{contractsCount * 3} hrs / mo</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Counsel Fees Saved</span>
                    <span className="text-sm font-black text-emerald-600">${(contractsCount * 3 * 350).toLocaleString()} / mo</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Velflow Cost</span>
                    <span className="text-sm font-black text-slate-900">${isAnnual ? "2.40" : "3.00"} / mo</span>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-100/60 rounded-lg p-3 text-center">
                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest block">Net Savings Rate</span>
                    <span className="text-lg font-black text-emerald-700 mt-1 block">
                      ${((contractsCount * 3 * 350) - (isAnnual ? 2.40 : 3.00)).toLocaleString()} Saved / mo
                    </span>
                    <span className="text-[9.5px] text-emerald-600/95 font-bold mt-1.5 block">
                      Reclaims {Math.round((contractsCount * 3 * 12) / 8)} full working days / year!
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </section>

          {/* Social Proof & Testimonials */}
          <section className="w-full max-w-5xl mx-auto py-12 space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">Verified Legal Protection</h2>
              <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed">
                See why SaaS founders, freelancers, and operators trust Velflow to scan their legal documents.
              </p>
            </div>

            {/* Testimonials grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Testimonial 1 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 text-left shadow-xs space-y-4">
                <p className="text-xs sm:text-sm text-slate-600 font-semibold leading-relaxed italic">
                  "As a startup founder, I don't have the budget to run every NDA or contractor redline through an external legal firm. Velflow flag-checks critical liability caps in seconds. I've caught three auto-renewal clauses already. Absolutely essential tool."
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-800 font-black text-[10px] shadow-sm select-none">
                    MK
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 leading-none">Marcus Kaelen</h4>
                    <p className="text-[9.5px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">CEO & Co-founder · OrbitSaaS</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 text-left shadow-xs space-y-4">
                <p className="text-xs sm:text-sm text-slate-600 font-semibold leading-relaxed italic">
                  "Velflow's ability to automatically extract notice deadlines and place them on a timeline calendar has saved us from being locked into a $15k vendor renewal we intended to cancel. The Secure Chat Navigator answers plain questions with direct citations."
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-800 font-black text-[10px] shadow-sm select-none">
                    SH
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 leading-none">Sarah Chen</h4>
                    <p className="text-[9.5px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Operations Director · Veloce Digital</p>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* Interactive FAQ Section */}
          <section id="faq" className="w-full max-w-3xl mx-auto py-12 scroll-mt-20">
            <div className="text-center mb-10 space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">Frequently Asked Questions</h2>
              <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed">
                Got questions? We have answers to help you navigate your legal compliance flow.
              </p>
            </div>

            {/* Accordion list */}
            <div className="space-y-3.5">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div 
                    key={idx}
                    className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden transition-all shadow-xs"
                  >
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full px-5 py-4 flex items-center justify-between text-left font-bold text-slate-800 hover:text-slate-950 transition-colors cursor-pointer outline-none"
                    >
                      <span className="text-xs sm:text-sm">{faq.q}</span>
                      <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform duration-350 shrink-0 ml-4", isOpen && "rotate-180 text-slate-800")} />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4.5 text-xs text-slate-500 leading-relaxed font-semibold border-t border-slate-100 pt-3 animate-fade-slide-up">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Call to Action Footer Panel */}
          <section className="w-full max-w-5xl mx-auto py-12">
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-slate-800/80 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl space-y-6">
              
              {/* Background gradient bubble inside panel */}
              <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.12),rgba(255,255,255,0))] pointer-events-none" />

              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                Secure your startup flow.<br />
                Try Velflow today.
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 font-semibold leading-relaxed max-w-lg mx-auto">
                No credit card required. Free tier includes 3 contract reviews per month with absolute analysis security.
              </p>
              
              <div className="flex items-center justify-center pt-3 relative z-10">
                <Link href="/signup">
                  <Button size="lg" className="bg-white text-slate-950 hover:bg-slate-100 font-extrabold cursor-pointer px-7 h-12 text-sm rounded-xl shadow-md flex items-center gap-2">
                    Create Free Account
                    <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>

        </main>

        {/* Premium Multi-Column Footer */}
        <footer className="border-t border-slate-200 bg-white relative z-10 py-12 select-none">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8 mb-10">
            
            {/* Column 1: Brand & Desc */}
            <div className="md:col-span-5 space-y-4">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="h-8.5 w-8.5 rounded-lg flex items-center justify-center text-white font-extrabold text-base shadow-md bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/20">
                  <Scale className="h-4 w-4 text-white" strokeWidth={2.5} />
                </div>
                <span className="font-extrabold text-lg tracking-tight text-slate-900">
                  Vel<span className="text-blue-600">flow</span>
                </span>
              </Link>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed max-w-sm">
                Understand every legal document before you sign. Instantly audit risks, track renewal windows, and compare changes with custom legal intelligence.
              </p>
            </div>

            {/* Column 2: Product */}
            <div className="md:col-span-2 space-y-3 text-left">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Product</h4>
              <ul className="space-y-2 text-xs font-bold">
                <li><button onClick={() => scrollToSection("features")} className="text-slate-500 hover:text-slate-800 transition-colors cursor-pointer outline-none">Features</button></li>
                <li><button onClick={() => scrollToSection("sandbox")} className="text-slate-500 hover:text-slate-800 transition-colors cursor-pointer outline-none">Clause Sandbox</button></li>
                <li><button onClick={() => scrollToSection("pricing")} className="text-slate-500 hover:text-slate-800 transition-colors cursor-pointer outline-none">Pricing</button></li>
                <li><Link href="/signup" className="text-slate-500 hover:text-slate-800 transition-colors">Workspace Login</Link></li>
              </ul>
            </div>

            {/* Column 3: Resources */}
            <div className="md:col-span-2 space-y-3 text-left">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resources</h4>
              <ul className="space-y-2 text-xs font-bold text-slate-500">
                <li><a href="#" className="hover:text-slate-800 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-slate-800 transition-colors">Legal Guides</a></li>
                <li><a href="#" className="hover:text-slate-800 transition-colors">API Docs (Soon)</a></li>
                <li><button onClick={() => scrollToSection("faq")} className="hover:text-slate-800 transition-colors cursor-pointer outline-none">FAQs</button></li>
              </ul>
            </div>

            {/* Column 4: Newsletter */}
            <div className="md:col-span-3 space-y-3 text-left">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stay Updated</h4>
              <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                Join our newsletter for fresh startup legal checklists and updates.
              </p>
              {emailSubscribed ? (
                <div className="p-3 text-[11px] bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl font-bold flex items-center gap-1.5 animate-scale-in">
                  <Check className="h-4 w-4" />
                  Thanks for subscribing!
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2 w-full">
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 font-bold"
                  />
                  <button
                    type="submit"
                    className="h-8.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center cursor-pointer transition-colors shadow-sm"
                  >
                    <Mail className="h-3.5 w-3.5" />
                  </button>
                </form>
              )}
            </div>

          </div>

          <div className="max-w-6xl w-full mx-auto px-6 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
            <div>
              <span>Velflow</span> © 2026. All rights reserved.
            </div>
            <div className="flex gap-6 font-bold text-slate-400">
              <a href="#" className="hover:text-slate-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-slate-600 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-slate-600 transition-colors">Security Audit</a>
            </div>
          </div>
        </footer>

      </div>
    </TooltipProvider>
  );
}

// Utility class name merge helper
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
