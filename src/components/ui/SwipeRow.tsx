import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { animate, motion, useMotionValue, useTransform, type PanInfo } from "framer-motion"
import { uid } from "@/lib/id"
import { cn } from "@/lib/cn"

type Side = "closed" | "leading" | "trailing"

interface SwipeCtx {
  openId: string | null
  setOpenId: (id: string | null) => void
}

// Coordinates single-open behavior across rows. Optional — without it, rows
// open independently.
const SwipeContext = createContext<SwipeCtx | null>(null)

export function SwipeList({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const [openId, setOpenId] = useState<string | null>(null)
  return (
    <SwipeContext.Provider value={{ openId, setOpenId }}>
      <div className={className}>{children}</div>
    </SwipeContext.Provider>
  )
}

const SNAP = { type: "spring", stiffness: 500, damping: 44 } as const

export interface SwipeRowProps {
  // Revealed by swiping right (anchored left edge).
  leading?: ReactNode
  // Revealed by swiping left (anchored right edge).
  trailing?: ReactNode
  onTap?: () => void
  children: ReactNode
  className?: string
}

// A single swipeable row: drag horizontally to reveal leading/trailing action
// panels; snaps open or closed by distance/velocity. Tapping a closed row fires
// onTap; tapping an open row closes it. Vertical scrolling passes through.
export function SwipeRow({ leading, trailing, onTap, children, className }: SwipeRowProps) {
  const ctx = useContext(SwipeContext)
  const idRef = useRef<string>(uid("swipe"))
  const id = idRef.current

  const x = useMotionValue(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const leadingRef = useRef<HTMLDivElement>(null)
  const trailingRef = useRef<HTMLDivElement>(null)
  const [leadW, setLeadW] = useState(0)
  const [trailW, setTrailW] = useState(0)
  const sideRef = useRef<Side>("closed")
  const draggedRef = useRef(false)

  // Scale action panels up from their anchored edge as the row is dragged off
  // them. At rest they're scaled to nothing, so a closed row stays glassy with
  // no buttons showing underneath.
  const leadingScaleX = useTransform(x, [0, Math.max(leadW, 1)], [0, 1])
  const trailingScaleX = useTransform(x, [-Math.max(trailW, 1), 0], [1, 0])

  useLayoutEffect(() => {
    setLeadW(leadingRef.current?.offsetWidth ?? 0)
    setTrailW(trailingRef.current?.offsetWidth ?? 0)
  }, [leading, trailing])

  // Close when another row opens (single-open coordination).
  const openId = ctx?.openId
  useLayoutEffect(() => {
    if (openId !== id && sideRef.current !== "closed") {
      settle(0, "closed")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openId])

  // Close when a pointer-down lands outside this row while it's open.
  const isOpen = ctx?.openId === id
  useEffect(() => {
    if (!isOpen) return
    function onDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close()
    }
    document.addEventListener("pointerdown", onDown)
    return () => document.removeEventListener("pointerdown", onDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  function settle(target: number, side: Side) {
    sideRef.current = side
    animate(x, target, SNAP)
    if (side === "closed") {
      if (ctx?.openId === id) ctx.setOpenId(null)
    } else {
      ctx?.setOpenId(id)
    }
  }

  function close() {
    settle(0, "closed")
  }

  function onDragEnd(_: unknown, info: PanInfo) {
    const o = info.offset.x
    const v = info.velocity.x
    if (leadW && (o > leadW / 2 || v > 500)) settle(leadW, "leading")
    else if (trailW && (o < -trailW / 2 || v < -500)) settle(-trailW, "trailing")
    else settle(0, "closed")
  }

  return (
    <div ref={rootRef} className="relative overflow-hidden">
      {leading && (
        <motion.div
          ref={leadingRef}
          style={{ scaleX: leadingScaleX, transformOrigin: "left center" }}
          className="absolute inset-y-0 left-0 flex"
        >
          {leading}
        </motion.div>
      )}
      {trailing && (
        <motion.div
          ref={trailingRef}
          style={{ scaleX: trailingScaleX, transformOrigin: "right center" }}
          className="absolute inset-y-0 right-0 flex"
        >
          {trailing}
        </motion.div>
      )}
      <motion.div
        drag="x"
        style={{ x, touchAction: "pan-y" }}
        dragConstraints={{ left: -trailW, right: leadW }}
        dragElastic={0.06}
        onPointerDownCapture={() => {
          draggedRef.current = false
        }}
        onDrag={(_, info) => {
          if (Math.abs(info.offset.x) > 4) draggedRef.current = true
        }}
        onDragEnd={onDragEnd}
        onClick={() => {
          if (draggedRef.current) return
          if (sideRef.current !== "closed") {
            close()
            return
          }
          onTap?.()
        }}
        className={cn("relative", className)}
      >
        {children}
      </motion.div>
    </div>
  )
}
