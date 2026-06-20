import * as React from "react"
import { cn } from "@/lib/utils"

interface DropdownMenuContextType {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  triggerRef: React.RefObject<HTMLButtonElement | null>
}

const DropdownMenuContext = React.createContext<DropdownMenuContextType | null>(null)

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLButtonElement | null>(null)

  // Close when clicking outside
  React.useEffect(() => {
    if (!open) return
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        !target.closest('[data-dropdown-content]')
      ) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [open])

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, triggerRef }}>
      <div className="relative inline-block text-left">{children}</div>
    </DropdownMenuContext.Provider>
  )
}

export const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  { asChild?: boolean; children: React.ReactNode }
>(({ asChild, children, ...props }, ref) => {
  const context = React.useContext(DropdownMenuContext)
  if (!context) throw new Error("DropdownMenuTrigger must be used within a DropdownMenu")

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    context.setOpen((prev) => !prev)
  }

  // Combine refs
  const handleRef = (node: HTMLButtonElement | null) => {
    context.triggerRef.current = node
    if (typeof ref === "function") ref(node)
    else if (ref) (ref as any).current = node
  }

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{ onClick?: React.MouseEventHandler<any> }>;
    return React.cloneElement(child as any, {
      ref: handleRef,
      onClick: (e: React.MouseEvent) => {
        handleClick(e);
        if (child.props && child.props.onClick) {
          child.props.onClick(e);
        }
      },
      ...props,
    })
  }

  return (
    <button
      ref={handleRef}
      onClick={handleClick}
      type="button"
      {...props}
    >
      {children}
    </button>
  )
})
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

export const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { align?: "start" | "end" | "center" }
>(({ className, align = "end", children, ...props }, ref) => {
  const context = React.useContext(DropdownMenuContext)
  if (!context) throw new Error("DropdownMenuContent must be used within a DropdownMenu")

  if (!context.open) return null

  const alignmentClasses = {
    start: "left-0 origin-top-left",
    center: "left-1/2 -translate-x-1/2 origin-top",
    end: "right-0 origin-top-right",
  }

  return (
    <div
      ref={ref}
      data-dropdown-content
      className={cn(
        "absolute mt-2 w-48 rounded-xl border border-zinc-200 bg-white p-1 shadow-md ring-1 ring-black/5 focus:outline-hidden z-50 animate-in fade-in-50 zoom-in-95 duration-100",
        alignmentClasses[align],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
DropdownMenuContent.displayName = "DropdownMenuContent"

export const DropdownMenuItem = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, onClick, ...props }, ref) => {
  const context = React.useContext(DropdownMenuContext)
  if (!context) throw new Error("DropdownMenuItem must be used within a DropdownMenu")

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    context.setOpen(false)
    if (onClick) onClick(e)
  }

  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "flex w-full items-center rounded-lg px-2.5 py-2 text-xs font-semibold text-zinc-700 outline-none hover:bg-zinc-50 hover:text-zinc-900 focus:bg-zinc-50 focus:text-zinc-900 transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  )
})
DropdownMenuItem.displayName = "DropdownMenuItem"
