"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { Button } from "@/components/ui/button";
import {
  User,
  CreditCard,
  Check,
  Zap,
  BarChart3,
  Clock,
  Settings,
  ShieldCheck,
  ArrowUpRight,
  Sparkles,
  Building,
  Mail,
  AlertCircle,
  Bell,
  Globe,
  Lock,
  ChevronRight,
  FileText,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [profileName, setProfileName] = useState(user?.full_name || "Jane Doe");
  const [profileEmail, setProfileEmail] = useState(user?.email || "jane@example.com");
  const [company, setCompany] = useState("Acme Corporation");
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "billing" | "notifications">("profile");

  const usageStats = {
    contractsAnalyzed: 14,
    contractsLimit: 100,
    workspaceSeats: 1,
    seatsLimit: 3,
    activeTimelines: 3,
    timelinesLimit: 5,
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const userInitials = profileName
    ? profileName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "notifications", label: "Notifications", icon: Bell },
  ] as const;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 select-none">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-slide-up">
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-900">Account Settings</h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Manage your profile, subscription, and notification preferences.
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl self-start sm:self-auto"
          style={{
            background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
            border: "1px solid rgba(59,130,246,0.15)",
          }}
        >
          <Zap className="h-3.5 w-3.5 text-blue-600" />
          <span className="text-xs font-black text-blue-700">Growth Pro</span>
          <span className="text-[9px] font-bold text-blue-500 uppercase tracking-wide">Active</span>
        </div>
      </div>

      {/* ── Profile Hero Card ── */}
      <div
        className="relative overflow-hidden rounded-2xl p-6 animate-fade-slide-up"
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1e40af 100%)",
          boxShadow: "0 8px 32px rgba(30,64,175,0.25)",
        }}
      >
        {/* Mesh overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle at 80% 20%, rgba(99,102,241,0.3) 0%, transparent 60%), radial-gradient(circle at 20% 80%, rgba(59,130,246,0.2) 0%, transparent 50%)",
          }}
        />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div
              className="h-16 w-16 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg"
              style={{
                background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
                boxShadow: "0 4px 20px rgba(99,102,241,0.5)",
              }}
            >
              {userInitials}
            </div>
            <span
              className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 flex items-center justify-center"
              style={{ borderColor: "#0f172a" }}
            >
              <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-black text-white leading-none">{profileName}</h3>
              <span
                className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{ background: "rgba(99,102,241,0.3)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.3)" }}
              >
                Pro
              </span>
            </div>
            <p className="text-sm text-blue-200 mt-0.5 font-medium truncate">{profileEmail}</p>
            <p className="text-[11px] text-blue-300/70 mt-1 font-medium">{company}</p>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 shrink-0">
            {[
              { label: "Contracts", value: usageStats.contractsAnalyzed },
              { label: "Timelines", value: usageStats.activeTimelines },
              { label: "Seats", value: usageStats.workspaceSeats },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-xl font-black text-white leading-none">{s.value}</p>
                <p className="text-[9px] font-semibold text-blue-300 mt-0.5 uppercase tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div
        className="flex items-center gap-1 p-1 rounded-xl animate-fade-slide-up"
        style={{ background: "#f1f5f9", border: "1px solid #e2e8f0" }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex-1 justify-center",
              activeTab === tab.id
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            )}
            style={activeTab === tab.id ? { border: "1px solid rgba(226,232,240,0.8)" } : {}}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-fade-slide-up">

        {/* ── PROFILE TAB ── */}
        {activeTab === "profile" && (
          <>
            {/* Left: Form */}
            <div className="lg:col-span-7 space-y-5">
              {/* Personal Info Card */}
              <div className="rounded-2xl overflow-hidden"
                style={{ background: "white", border: "1px solid rgba(226,232,240,0.8)", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
                <div className="px-5 py-4 flex items-center gap-2.5" style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)", border: "1px solid rgba(59,130,246,0.12)" }}>
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Personal Information</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Update your name and organization details</p>
                  </div>
                </div>

                <form onSubmit={handleSave} className="p-5 space-y-5">
                  {/* Avatar + name preview */}
                  <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                    <div
                      className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0"
                      style={{ background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)", boxShadow: "0 2px 10px rgba(99,102,241,0.3)" }}
                    >
                      {userInitials}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{profileName}</p>
                      <p className="text-[11px] text-slate-400 font-medium">{company}</p>
                    </div>
                    <div className="ml-auto">
                      <span className="text-[10px] text-slate-400 font-semibold">Avatar auto-generated</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Full Name</label>
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="block w-full px-3 py-2.5 text-sm rounded-xl text-slate-900 font-medium transition-all outline-none"
                        style={{ background: "white", border: "1px solid #e2e8f0" }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "#3b82f6";
                          e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.08)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "#e2e8f0";
                          e.target.style.boxShadow = "none";
                        }}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <input
                          type="email"
                          disabled
                          value={profileEmail}
                          className="block w-full pl-9 pr-3 py-2.5 text-sm rounded-xl text-slate-400 font-medium cursor-not-allowed"
                          style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Organization / Company</label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="block w-full pl-9 pr-3 py-2.5 text-sm rounded-xl text-slate-900 font-medium transition-all outline-none"
                        style={{ background: "white", border: "1px solid #e2e8f0" }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "#3b82f6";
                          e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.08)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "#e2e8f0";
                          e.target.style.boxShadow = "none";
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid #f1f5f9" }}>
                    {isSaved ? (
                      <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold animate-fade-slide-up">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                        Changes saved successfully!
                      </div>
                    ) : (
                      <span />
                    )}
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl text-white text-xs font-bold cursor-pointer transition-all"
                      style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", boxShadow: "0 2px 8px rgba(15,23,42,0.2)" }}
                    >
                      Save Profile
                    </button>
                  </div>
                </form>
              </div>

              {/* Preferences Card */}
              <div className="rounded-2xl overflow-hidden"
                style={{ background: "white", border: "1px solid rgba(226,232,240,0.8)", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
                <div className="px-5 py-4 flex items-center gap-2.5" style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)", border: "1px solid #e2e8f0" }}>
                    <Settings className="h-4 w-4 text-slate-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Application Preferences</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Configure how Velflow works for you</p>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  {[
                    { label: "Email notifications on risk radar analysis completion", checked: true },
                    { label: "Weekly contract renewal digests & countdown deadlines", checked: true },
                    { label: "Join early adopter updates and beta legal parser runs", checked: false },
                  ].map((pref, idx) => (
                    <label key={idx} className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                      <div className="relative shrink-0">
                        <input
                          type="checkbox"
                          defaultChecked={pref.checked}
                          className="sr-only peer"
                          readOnly
                        />
                        <div className={cn(
                          "h-4 w-4 rounded flex items-center justify-center transition-colors",
                          pref.checked ? "bg-blue-600 border border-blue-600" : "bg-white border border-slate-300"
                        )}>
                          {pref.checked && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
                        </div>
                      </div>
                      <span className="text-xs text-slate-700 font-semibold leading-relaxed">{pref.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Security & Session */}
            <div className="lg:col-span-5 space-y-5">
              {/* Security Card */}
              <div className="rounded-2xl overflow-hidden"
                style={{ background: "white", border: "1px solid rgba(226,232,240,0.8)", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
                <div className="px-5 py-4 flex items-center gap-2.5" style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)", border: "1px solid rgba(16,185,129,0.12)" }}>
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Security & Session</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Authentication & access controls</p>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  {[
                    { icon: Lock, label: "Password", value: "••••••••••", action: "Change" },
                    { icon: Globe, label: "Session origin", value: "Local workspace", action: null },
                    { icon: Activity, label: "Auth method", value: "Email/Password", action: null },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2.5 px-3 rounded-xl"
                      style={{ background: "#f8fafc", border: "1px solid #f1f5f9" }}>
                      <div className="flex items-center gap-2.5">
                        <item.icon className="h-3.5 w-3.5 text-slate-400" />
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.label}</p>
                          <p className="text-xs font-semibold text-slate-700">{item.value}</p>
                        </div>
                      </div>
                      {item.action && (
                        <button className="text-[10px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer">
                          {item.action}
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Session info banner */}
                  <div className="flex items-start gap-2.5 p-3 rounded-xl mt-1"
                    style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)", border: "1px solid rgba(16,185,129,0.15)" }}>
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" strokeWidth={3} />
                    <p className="text-[11px] text-emerald-700 font-semibold leading-relaxed">
                      Your session is secured in local workspace storage. No credentials are shared externally.
                    </p>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="rounded-2xl overflow-hidden"
                style={{ background: "white", border: "1px solid rgba(239,68,68,0.12)", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
                <div className="px-5 py-4 flex items-center gap-2.5" style={{ borderBottom: "1px solid rgba(239,68,68,0.08)" }}>
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)", border: "1px solid rgba(239,68,68,0.12)" }}>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Danger Zone</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Irreversible account actions</p>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-700">Delete all contracts</p>
                      <p className="text-[10px] text-slate-400 font-medium">Permanently removes all your data</p>
                    </div>
                    <button className="text-[11px] font-bold text-red-500 hover:text-red-600 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      style={{ border: "1px solid rgba(239,68,68,0.2)" }}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── BILLING TAB ── */}
        {activeTab === "billing" && (
          <>
            {/* Left: Usage */}
            <div className="lg:col-span-7 space-y-5">
              <div className="rounded-2xl overflow-hidden"
                style={{ background: "white", border: "1px solid rgba(226,232,240,0.8)", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
                <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)", border: "1px solid rgba(59,130,246,0.12)" }}>
                      <BarChart3 className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Plan Usage</h3>
                      <p className="text-[11px] text-slate-500 font-medium">Current billing cycle usage</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider"
                    style={{ background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)", color: "#1d4ed8", border: "1px solid rgba(59,130,246,0.12)" }}>
                    PRO ACTIVE
                  </span>
                </div>
                <div className="p-5 space-y-5">
                  {/* Price */}
                  <div className="flex items-center justify-between p-4 rounded-xl"
                    style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)" }}>
                    <div>
                      <p className="text-[9px] font-black text-blue-300 uppercase tracking-widest">Current Plan</p>
                      <p className="text-lg font-black text-white">Growth Pro <span className="text-blue-300 text-sm">/ month</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-white">$3<span className="text-sm text-blue-300">.00</span></p>
                      <p className="text-[9px] text-blue-400 font-semibold">billed monthly</p>
                    </div>
                  </div>

                  {/* Metrics */}
                  {[
                    { label: "Contracts Analyzed", used: usageStats.contractsAnalyzed, limit: usageStats.contractsLimit, gradient: "linear-gradient(90deg, #3b82f6, #6366f1)", alert: false },
                    { label: "Active Timeline Trackers", used: usageStats.activeTimelines, limit: usageStats.timelinesLimit, gradient: "linear-gradient(90deg, #f59e0b, #d97706)", alert: true },
                    { label: "Collaboration Seats", used: usageStats.workspaceSeats, limit: usageStats.seatsLimit, gradient: "linear-gradient(90deg, #10b981, #059669)", alert: false },
                  ].map((m) => (
                    <div key={m.label} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-700">{m.label}</span>
                        <span className="text-xs font-bold text-slate-500">{m.used} / {m.limit}</span>
                      </div>
                      <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "#f1f5f9" }}>
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${(m.used / m.limit) * 100}%`, background: m.gradient }} />
                      </div>
                      {m.alert && (
                        <div className="flex items-center gap-1.5 text-[10px] text-amber-600 font-semibold">
                          <AlertCircle className="h-3 w-3" />
                          At maximum — archive contracts to free up space.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Payment card */}
            <div className="lg:col-span-5 space-y-5">
              <div className="rounded-2xl overflow-hidden"
                style={{ background: "white", border: "1px solid rgba(226,232,240,0.8)", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
                <div className="px-5 py-4 flex items-center gap-2.5" style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)", border: "1px solid #e2e8f0" }}>
                    <CreditCard className="h-4 w-4 text-slate-500" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Payment & Billing</h3>
                </div>
                <div className="p-5 space-y-4">
                  {/* Credit card visual */}
                  <div className="relative overflow-hidden rounded-2xl p-5 space-y-4"
                    style={{
                      background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1e40af 100%)",
                      boxShadow: "0 8px 24px rgba(15,23,42,0.25)",
                    }}>
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{ backgroundImage: "radial-gradient(circle at 80% 0%, rgba(99,102,241,0.25) 0%, transparent 60%)" }}
                    />
                    <div className="relative flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Card on File</span>
                      <span className="text-sm font-black italic text-white">VISA</span>
                    </div>
                    <div className="relative">
                      <p className="text-base font-mono tracking-[0.25em] text-white">•••• •••• •••• 4242</p>
                    </div>
                    <div className="relative flex justify-between items-end">
                      <div>
                        <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold">Expiry</p>
                        <p className="text-[11px] text-slate-300 font-bold">12/28</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold">Cardholder</p>
                        <p className="text-[11px] text-slate-300 font-bold">{profileName}</p>
                      </div>
                    </div>
                  </div>

                  {/* Invoice details */}
                  <div className="space-y-3 py-1">
                    {[
                      { label: "Next Billing Date", value: "July 13, 2026", icon: Clock },
                      { label: "Estimated Invoice", value: "$3.00", icon: FileText },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between py-2 px-3 rounded-xl"
                        style={{ background: "#f8fafc", border: "1px solid #f1f5f9" }}>
                        <div className="flex items-center gap-2">
                          <item.icon className="h-3.5 w-3.5 text-slate-400" />
                          <span className="text-xs font-semibold text-slate-500">{item.label}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-800">{item.value}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => alert("Billing portal simulation — Growth Pro plan is active in developer mode.")}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-slate-700 cursor-pointer transition-all hover:bg-slate-50"
                    style={{ border: "1px solid #e2e8f0" }}
                  >
                    Manage Billing & Invoices
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── NOTIFICATIONS TAB ── */}
        {activeTab === "notifications" && (
          <div className="lg:col-span-12">
            <div className="rounded-2xl overflow-hidden"
              style={{ background: "white", border: "1px solid rgba(226,232,240,0.8)", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
              <div className="px-5 py-4 flex items-center gap-2.5" style={{ borderBottom: "1px solid #f1f5f9" }}>
                <div className="h-8 w-8 rounded-lg flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)", border: "1px solid rgba(59,130,246,0.12)" }}>
                  <Bell className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Notification Preferences</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Control when and how Velflow contacts you</p>
                </div>
              </div>
              <div className="divide-y" style={{ borderColor: "#f1f5f9" }}>
                {[
                  { category: "Contract Alerts", items: [
                    { label: "Risk analysis completion", desc: "Get notified when AI finishes reviewing a contract", enabled: true },
                    { label: "High risk detection", desc: "Immediate alert when a critical clause is flagged", enabled: true },
                    { label: "Contract expiry warnings", desc: "30, 14, and 7 day reminders before renewals", enabled: true },
                  ]},
                  { category: "Digests & Reports", items: [
                    { label: "Weekly renewal digest", desc: "Summary of upcoming deadlines in the next 30 days", enabled: true },
                    { label: "Monthly portfolio report", desc: "Overview of all contract activity and risk changes", enabled: false },
                  ]},
                  { category: "Product Updates", items: [
                    { label: "Early access beta features", desc: "Be first to try new AI legal parser improvements", enabled: false },
                    { label: "Release notes & changelogs", desc: "Monthly email summary of new Velflow capabilities", enabled: true },
                  ]},
                ].map((section) => (
                  <div key={section.category} className="p-5 space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{section.category}</p>
                    {section.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-4 py-2">
                        <div>
                          <p className="text-xs font-bold text-slate-800">{item.label}</p>
                          <p className="text-[11px] text-slate-400 font-medium">{item.desc}</p>
                        </div>
                        {/* Toggle */}
                        <div className={cn(
                          "relative h-5 w-9 rounded-full cursor-pointer transition-colors shrink-0",
                          item.enabled ? "bg-blue-600" : "bg-slate-200"
                        )}>
                          <div className={cn(
                            "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all",
                            item.enabled ? "left-4" : "left-0.5"
                          )} />
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
