// components/contract/status-pill.tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import { ContractStatus } from "./types";
import { STATUS_VARIANTS } from "./tokens";

interface StatusPillProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: ContractStatus;
}

export function StatusPill({ status, className, ...props }: StatusPillProps) {
  const styles = STATUS_VARIANTS[status] || STATUS_VARIANTS.Uploaded;

  return (
    <span
      className={cn(
        "text-[10px] uppercase font-black tracking-wide px-2.5 py-0.5 rounded border inline-flex items-center shadow-3xs",
        styles.bg,
        styles.text,
        styles.border,
        className
      )}
      {...props}
    >
      {status}
    </span>
  );
}
