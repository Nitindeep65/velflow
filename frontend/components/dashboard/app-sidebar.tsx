// components/dashboard/app-sidebar.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarSeparator,
  useSidebar
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  FileText,
  Settings,
  LogOut,
  Plus,
  Sparkles,
  ShieldAlert,
  ChevronRight,
  Scale,
  Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useContractsStore } from "@/lib/store/useContractsStore";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface AppSidebarProps {
  user: { full_name: string; email: string } | null;
  onLogout: () => void;
}

export function AppSidebar({ user, onLogout }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useSidebar();
  const { contracts, setIsNewContractOpen } = useContractsStore();

  const highRiskCount = contracts.filter((c) => c.risk === "High").length;
  const isExpanded = state === "expanded";

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Contracts", href: "/dashboard/contracts", icon: FileText, badge: contracts.length > 0 ? contracts.length : null },
    { name: "Templates", href: "/dashboard/templates", icon: Copy },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const userInitials = user?.full_name
    ? user.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-slate-200/80 select-none"
      style={{ background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)" }}
    >
      {/* ── Brand Header ── */}
      <SidebarHeader className={cn(
        "h-16 shrink-0 flex items-center border-b border-slate-200/70",
        isExpanded ? "px-4" : "px-0 justify-center"
      )}>
        <div className={cn("flex items-center gap-3", !isExpanded && "justify-center w-full")}>
          {/* Logo icon */}
          <div
            className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 relative"
            style={{
              background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
              boxShadow: "0 4px 14px rgba(59,130,246,0.35)",
            }}
          >
            <Scale className="h-[18px] w-[18px] text-white" strokeWidth={2.5} />
            <span
              className="absolute inset-0 rounded-xl animate-ping opacity-20 bg-blue-400"
              style={{ animationDuration: "3s" }}
            />
          </div>
          {/* Brand text — only when expanded */}
          {isExpanded && (
            <div className="flex flex-col min-w-0 animate-fade-slide-in-right">
              <span className="font-black text-[15px] tracking-tight leading-none text-slate-900">
                Vel<span className="text-blue-600">flow</span>
              </span>
              <span className="text-[9px] font-bold tracking-widest uppercase mt-0.5 text-slate-400">
                AI Contract Navigator
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* ── Main Nav ── */}
      <SidebarContent className={cn("py-4 flex flex-col gap-1", isExpanded ? "px-3" : "px-2")}>

        {/* New Contract CTA */}
        <div className="mb-3">
          {isExpanded ? (
            <button
              onClick={() => setIsNewContractOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-[12px] font-bold transition-all duration-200 cursor-pointer group relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                boxShadow: "0 4px 14px rgba(59,130,246,0.25)",
              }}
            >
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)" }}
              />
              <Plus className="h-3.5 w-3.5 group-hover:rotate-90 transition-transform duration-200 shrink-0" />
              New Contract
            </button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setIsNewContractOpen(true)}
                  className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl text-white transition-all duration-200 cursor-pointer group"
                  style={{
                    background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                    boxShadow: "0 4px 14px rgba(59,130,246,0.25)",
                  }}
                >
                  <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-200" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">New Contract</TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Section label */}
        {isExpanded && (
          <p className="text-[9px] font-black uppercase tracking-widest px-2 mb-1 text-slate-400/70">
            Navigation
          </p>
        )}

        {/* Nav Items */}
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {navigation.map((item, idx) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));

                return (
                  <SidebarMenuItem
                    key={item.name}
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          className={cn(
                            "transition-all duration-150 outline-none rounded-xl relative group",
                            isExpanded
                              ? "h-10 w-full px-2.5 flex items-center gap-2.5"
                              : "h-9 w-9 mx-auto flex items-center justify-center p-0",
                            isActive
                              ? "text-blue-600"
                              : "text-slate-500 hover:text-slate-800"
                          )}
                          style={isActive ? {
                            background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
                            border: "1px solid rgba(59,130,246,0.15)",
                            boxShadow: "0 1px 3px rgba(59,130,246,0.08)",
                          } : {
                            border: "1px solid transparent",
                          }}
                        >
                          <Link
                            href={item.href}
                            className={cn(
                              "flex items-center w-full",
                              isExpanded ? "gap-2.5" : "justify-center"
                            )}
                          >
                            {/* Active left accent — only when expanded */}
                            {isActive && isExpanded && (
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-blue-600" />
                            )}

                            {/* Icon container */}
                            <div className={cn(
                              "flex items-center justify-center shrink-0 rounded-lg transition-all",
                              isExpanded ? "h-6 w-6" : "h-7 w-7",
                              isActive
                                ? "bg-blue-100/60"
                                : "bg-transparent group-hover:bg-slate-100"
                            )}>
                              <item.icon
                                className={cn(
                                  "shrink-0 transition-colors",
                                  isExpanded ? "h-3.5 w-3.5" : "h-4 w-4",
                                  isActive
                                    ? "text-blue-600"
                                    : "text-slate-400 group-hover:text-slate-600"
                                )}
                              />
                            </div>

                            {/* Label + badge — only when expanded */}
                            {isExpanded && (
                              <>
                                <span className="flex-1 truncate font-semibold text-[12.5px]">
                                  {item.name}
                                </span>
                                {item.badge && (
                                  <span className={cn(
                                    "text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center shrink-0",
                                    isActive
                                      ? "bg-blue-600/10 text-blue-600"
                                      : "bg-slate-100 text-slate-500"
                                  )}>
                                    {item.badge}
                                  </span>
                                )}
                              </>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      {/* Only show tooltip when collapsed */}
                      {!isExpanded && (
                        <TooltipContent side="right">{item.name}</TooltipContent>
                      )}
                    </Tooltip>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* High Risk Alert */}
        {highRiskCount > 0 && (
          <>
            <SidebarSeparator className="my-3 bg-slate-100" />
            {isExpanded ? (
              <Link href="/dashboard/contracts">
                <div
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer group transition-all duration-200"
                  style={{
                    background: "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)",
                    border: "1px solid rgba(239,68,68,0.12)",
                  }}
                >
                  <div className="relative shrink-0 h-7 w-7 rounded-lg bg-red-500/10 border border-red-400/20 flex items-center justify-center">
                    <ShieldAlert className="h-3.5 w-3.5 text-red-600" />
                    <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black leading-none text-red-700">
                      {highRiskCount} High Risk Alert{highRiskCount !== 1 ? "s" : ""}
                    </p>
                    <p className="text-[9px] mt-0.5 font-semibold text-red-500">Requires immediate review</p>
                  </div>
                  <ChevronRight className="h-3 w-3 shrink-0 text-red-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => router.push("/dashboard/contracts")}
                    className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl cursor-pointer outline-none relative"
                    style={{
                      background: "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)",
                      border: "1px solid rgba(239,68,68,0.15)",
                    }}
                  >
                    <ShieldAlert className="h-4 w-4 text-red-600" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {highRiskCount} High Risk Alert{highRiskCount !== 1 ? "s" : ""}
                </TooltipContent>
              </Tooltip>
            )}
          </>
        )}

        <div className="flex-1" />
      </SidebarContent>

      {/* ── Footer ── */}
      <SidebarFooter
        className={cn("pb-4 flex flex-col gap-2 shrink-0 border-t border-slate-100", isExpanded ? "px-3" : "px-2")}
        style={{ background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)" }}
      >
        {/* AI Status */}
        {isExpanded ? (
          <div
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mt-3"
            style={{
              background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
              border: "1px solid rgba(59,130,246,0.12)",
            }}
          >
            <Sparkles className="h-3.5 w-3.5 animate-pulse shrink-0 text-blue-600" />
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-black uppercase tracking-wider leading-none text-blue-700">AI Core Active</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <p className="text-[8px] font-semibold text-blue-500">Gemini 2.5 Flash · Online</p>
              </div>
            </div>
          </div>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="mx-auto mt-3 h-9 w-9 rounded-xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
                  border: "1px solid rgba(59,130,246,0.15)",
                }}
              >
                <Sparkles className="h-4 w-4 text-blue-600 animate-pulse" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">AI Core Active (Gemini 2.5 Flash)</TooltipContent>
          </Tooltip>
        )}

        {/* User row */}
        {user && (
          <div className="mt-1">
            {isExpanded ? (
              <div className="flex items-center gap-2.5 p-2 rounded-xl group hover:bg-white/70 transition-all">
                <div
                  className="h-8 w-8 rounded-full flex items-center justify-center text-white font-black text-[10px] shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
                    boxShadow: "0 2px 8px rgba(99,102,241,0.3)",
                  }}
                >
                  {userInitials}
                </div>
                <div className="flex flex-col justify-center min-w-0 flex-1">
                  <p className="text-[12px] font-bold truncate leading-none text-slate-800">{user.full_name}</p>
                  <p className="text-[9px] truncate leading-none mt-0.5 text-slate-400">{user.email}</p>
                </div>
                <button
                  onClick={onLogout}
                  title="Sign out"
                  className="h-7 w-7 rounded-lg flex items-center justify-center transition-all cursor-pointer shrink-0 text-slate-400 hover:bg-red-50 hover:text-red-500"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={onLogout}
                    className="mx-auto flex h-9 w-9 items-center justify-center rounded-full text-white font-black text-[10px] shrink-0 cursor-pointer transition-all duration-300"
                    style={{
                      background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
                      boxShadow: "0 2px 8px rgba(99,102,241,0.3)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(239,68,68,0.3)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(99,102,241,0.3)";
                    }}
                  >
                    {userInitials}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Sign out ({user.full_name})</TooltipContent>
              </Tooltip>
            )}
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
