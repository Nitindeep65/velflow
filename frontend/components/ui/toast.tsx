// components/ui/toast.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, Info, X, Zap } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

const ICONS: Record<ToastType, React.ElementType> = {
  success: CheckCircle2,
  error: AlertTriangle,
  warning: AlertTriangle,
  info: Info,
};

const STYLES: Record<ToastType, string> = {
  success: "border-emerald-200 bg-emerald-50",
  error: "border-red-200 bg-red-50",
  warning: "border-amber-200 bg-amber-50",
  info: "border-blue-200 bg-blue-50",
};

const ICON_STYLES: Record<ToastType, string> = {
  success: "text-emerald-600 bg-emerald-100",
  error: "text-red-600 bg-red-100",
  warning: "text-amber-600 bg-amber-100",
  info: "text-blue-600 bg-blue-100",
};

const TITLE_STYLES: Record<ToastType, string> = {
  success: "text-emerald-900",
  error: "text-red-900",
  warning: "text-amber-900",
  info: "text-blue-900",
};

const MSG_STYLES: Record<ToastType, string> = {
  success: "text-emerald-700",
  error: "text-red-700",
  warning: "text-amber-700",
  info: "text-blue-700",
};

function ToastItem({ toast, onRemove }: { toast: Toast & { leaving?: boolean }; onRemove: () => void }) {
  const Icon = ICONS[toast.type];

  return (
    <div
      className={cn(
        "flex items-start gap-3 px-4 py-3.5 rounded-xl border shadow-lg backdrop-blur-sm w-80 max-w-[calc(100vw-2rem)]",
        "animate-toast-in",
        STYLES[toast.type]
      )}
    >
      <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5", ICON_STYLES[toast.type])}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-bold leading-snug", TITLE_STYLES[toast.type])}>
          {toast.title}
        </p>
        {toast.message && (
          <p className={cn("text-xs mt-0.5 font-medium leading-relaxed", MSG_STYLES[toast.type])}>
            {toast.message}
          </p>
        )}
      </div>
      <button
        onClick={onRemove}
        className="text-zinc-400 hover:text-zinc-600 transition-colors shrink-0 mt-0.5 cursor-pointer"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback((toast: Omit<Toast, "id">) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const duration = toast.duration ?? 4000;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      {/* Toast Viewport */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onRemove={() => removeToast(toast.id)} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
