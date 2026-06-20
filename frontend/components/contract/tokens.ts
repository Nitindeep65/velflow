// components/contract/tokens.ts

export const RISK_VARIANTS = {
  High: {
    bg: "bg-red-500/10",
    text: "text-red-700 dark:text-red-400",
    border: "border-red-500/20",
    dot: "bg-red-600",
    iconColor: "text-red-500"
  },
  Medium: {
    bg: "bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-500/20",
    dot: "bg-amber-500",
    iconColor: "text-amber-500"
  },
  Low: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-500/20",
    dot: "bg-emerald-500",
    iconColor: "text-emerald-500"
  }
};

export const STATUS_VARIANTS = {
  Uploaded: {
    bg: "bg-zinc-100",
    text: "text-zinc-800",
    border: "border-zinc-200"
  },
  Processing: {
    bg: "bg-blue-500/10",
    text: "text-blue-700",
    border: "border-blue-500/20"
  },
  Analyzed: {
    bg: "bg-indigo-500/10",
    text: "text-indigo-700",
    border: "border-indigo-500/20"
  },
  "Needs Review": {
    bg: "bg-rose-500/10",
    text: "text-rose-700",
    border: "border-rose-500/20"
  }
};
