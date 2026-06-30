// components/dashboard/app-shell.tsx
"use client";

import * as React from "react";
import {
  Search,
  Bell,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";
import { useContractsStore } from "@/lib/store/useContractsStore";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { usePathname } from "next/navigation";

interface AppShellProps {
  children: React.ReactNode;
  user: { full_name: string; email: string } | null;
  onLogout: () => void;
}

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Contract intelligence overview" },
  "/dashboard/contracts": { title: "Contracts", subtitle: "All analyzed agreements" },
  "/dashboard/templates": { title: "Templates", subtitle: "Reusable contract templates" },
  "/dashboard/settings": { title: "Settings", subtitle: "Profile & preferences" },
};

export function AppShell({ children, user, onLogout }: AppShellProps) {
  const pathname = usePathname();
  const { searchQuery, setSearchQuery, contracts } = useContractsStore();
  const searchRef = React.useRef<HTMLInputElement>(null);
  const highRiskCount = contracts.filter((c) => c.risk === "High").length;

  const pageInfo = PAGE_TITLES[pathname] || { title: "Velflow", subtitle: "AI contract navigator" };

  const userInitials = user?.full_name
    ? user.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  // ⌘K keyboard shortcut
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
      if (e.key === "Escape" && document.activeElement === searchRef.current) {
        searchRef.current?.blur();
        setSearchQuery("");
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [setSearchQuery]);

  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen overflow-hidden font-sans selection:bg-blue-100" style={{ background: "#f1f5f9" }}>
        <AppSidebar user={user} onLogout={onLogout} />

        <SidebarInset className="flex-grow flex flex-col min-w-0 overflow-hidden" style={{ background: "#f1f5f9" }}>
          {/* Topbar */}
          <header className="h-15 px-5 flex items-center justify-between gap-4 shrink-0 relative z-20 bg-white"
            style={{ borderBottom: "1px solid rgba(226,232,240,0.8)", boxShadow: "0 1px 4px rgba(15,23,42,0.04)" }}>

            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Sidebar trigger */}
              <SidebarTrigger className="h-8 w-8 rounded-lg cursor-pointer text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all shrink-0" />

              {/* Page title (visible on md+) */}
              <div className="hidden md:flex flex-col justify-center">
                <h1 className="text-sm font-black leading-none text-slate-900">{pageInfo.title}</h1>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5 leading-none">{pageInfo.subtitle}</p>
              </div>

              {/* Divider */}
              <div className="hidden md:block w-px h-5 bg-slate-200 mx-1" />

              {/* Search bar */}
              <div className="relative w-full max-w-[260px] sm:max-w-sm">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none text-slate-400" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search contracts..."
                  className="w-full pl-8 pr-14 py-1.5 rounded-lg text-[12px] font-semibold outline-none transition-all placeholder:text-slate-400 placeholder:font-normal"
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    color: "#0f172a",
                  }}
                  onFocus={(e) => {
                    e.target.style.background = "#ffffff";
                    e.target.style.borderColor = "#3b82f6";
                    e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.08)";
                  }}
                  onBlur={(e) => {
                    e.target.style.background = "#f8fafc";
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-0.5">
                  <kbd className="h-4 px-1.5 rounded text-[9px] font-bold flex items-center bg-slate-100 border border-slate-200 text-slate-400">
                    ⌘K
                  </kbd>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Engine Status pill */}
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-bold tracking-wide uppercase select-none"
                style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)", border: "1px solid rgba(16,185,129,0.15)", color: "#166534" }}>
                <ShieldCheck className="h-3 w-3 shrink-0 text-emerald-600" />
                System Active
              </div>

              {/* Notification bell */}
              <div className="relative">
                <button className="h-8 w-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                  <Bell className="h-4 w-4" />
                </button>
                {highRiskCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 rounded-full text-white text-[8px] font-black flex items-center justify-center border-2 border-white bg-red-500 px-0.5"
                    style={{ boxShadow: "0 0 6px rgba(239,68,68,0.4)" }}>
                    {highRiskCount > 9 ? "9+" : highRiskCount}
                  </span>
                )}
              </div>

              {/* Divider */}
              <div className="w-px h-5 bg-slate-200" />

              {/* User avatar + info */}
              <button className="flex items-center gap-2 px-2 py-1.5 rounded-xl cursor-pointer group transition-all hover:bg-slate-50"
                style={{ border: "1px solid transparent" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(226,232,240,0.8)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "transparent")}
              >
                <div className="h-7 w-7 rounded-full flex items-center justify-center text-white font-black text-[10px] select-none shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
                    boxShadow: "0 2px 8px rgba(99,102,241,0.3)"
                  }}>
                  {userInitials}
                </div>
                {user && (
                  <div className="hidden xl:flex flex-col items-start">
                    <p className="text-[11px] font-bold leading-none text-slate-700">{user.full_name}</p>
                    <p className="text-[9px] font-semibold mt-0.5 text-slate-400 leading-none">{user.email}</p>
                  </div>
                )}
                <ChevronDown className="h-3 w-3 text-slate-400 hidden xl:block" />
              </button>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 min-h-0 relative overflow-y-auto" style={{ background: "#f1f5f9" }}>
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
