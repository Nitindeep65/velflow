import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

interface DialogContextType {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const DialogContext = React.createContext<DialogContextType | null>(null)

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {open ? children : null}
    </DialogContext.Provider>
  )
}

export function DialogContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const context = React.useContext(DialogContext)
  if (!context) throw new Error("DialogContent must be used within a Dialog")

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in-0"
        onClick={() => context.onOpenChange(false)}
      />
      {/* Dialog container */}
      <div
        className={cn(
          "relative w-full max-w-md bg-white rounded-xl border border-zinc-200 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 focus-visible:outline-hidden",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  )
}

export function DialogHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const context = React.useContext(DialogContext)
  if (!context) throw new Error("DialogHeader must be used within a Dialog")

  return (
    <div
      className={cn(
        "bg-zinc-50 border-b border-zinc-200 px-6 py-4 flex items-center justify-between shrink-0",
        className
      )}
      {...props}
    >
      {children}
      <button
        type="button"
        onClick={() => context.onOpenChange(false)}
        className="h-7 w-7 rounded-md hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 flex items-center justify-center transition-colors cursor-pointer"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export function DialogTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-sm font-black text-zinc-900", className)}
      {...props}
    />
  )
}
