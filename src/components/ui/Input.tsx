import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react"
import { cn } from "@/lib/cn"

const base =
  "w-full rounded-xl border border-border bg-surface-2 px-3 text-sm text-fg placeholder:text-muted/70 " +
  "transition-colors focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/30 " +
  "disabled:opacity-50"

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leading?: ReactNode
  trailing?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, leading, trailing, ...rest },
  ref,
) {
  if (leading || trailing) {
    return (
      <div
        className={cn(
          "flex h-10 items-center gap-2 rounded-xl border border-border bg-surface-2 px-3",
          "focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/30",
          className,
        )}
      >
        {leading && <span className="text-muted">{leading}</span>}
        <input
          ref={ref}
          className="h-full w-full bg-transparent text-sm text-fg placeholder:text-muted/70 focus:outline-none"
          {...rest}
        />
        {trailing && <span className="text-muted">{trailing}</span>}
      </div>
    )
  }
  return <input ref={ref} className={cn(base, "h-10", className)} {...rest} />
})

// Labelled field wrapper for forms.
export function Field({
  label,
  hint,
  error,
  children,
  className,
}: {
  label?: string
  hint?: string
  error?: string
  children: ReactNode
  className?: string
}) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      {label && <span className="text-xs font-medium text-muted">{label}</span>}
      {children}
      {error ? (
        <span className="text-xs text-red-400">{error}</span>
      ) : hint ? (
        <span className="text-xs text-muted/70">{hint}</span>
      ) : null}
    </label>
  )
}
