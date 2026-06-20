// components/contract/risk-badge.tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import { RiskLevel } from "./types";
import { RISK_VARIANTS } from "./tokens";

interface RiskBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  risk: RiskLevel;
  showDot?: boolean;
}

const GLOW_STYLES: Record<RiskLevel, string> = {
  High: "shadow-red-100",
  Medium: "shadow-amber-100",
  Low: "shadow-emerald-100",
};

export function RiskBadge({ risk, showDot = true, className, ...props }: RiskBadgeProps) {
  const styles = RISK_VARIANTS[risk] || RISK_VARIANTS.Low;
  const glow = GLOW_STYLES[risk] || "";

  return (
    <span
      className={cn(
        "text-[10px] uppercase font-black tracking-wide px-2.5 py-1 rounded-full border inline-flex items-center gap-1.5 shadow-sm transition-all duration-200",
        glow,
        styles.bg,
        styles.text,
        styles.border,
        className
      )}
      {...props}
    >
      {showDot && (
        <span className={cn(
          "w-1.5 h-1.5 rounded-full shrink-0",
          risk === "High" ? "bg-red-500 animate-pulse" : risk === "Medium" ? "bg-amber-500" : "bg-emerald-500",
        )} />
      )}
      {risk} Risk
    </span>
  );
}
