"use client"

import { useEffect, useState } from "react"

import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

/**
 * Placeholder grid while GET /sessions is in flight.
 *
 * 1. Continuous CSS shimmer on every placeholder bar
 * 2. Motion spotlight — one card breathes + blue ring pulse at a time
 */

const GHOST_COUNT = 3
const SPOTLIGHT_MS = 1800

function GhostBar({
  className,
  shimmerDelayMs,
  isActive
}: {
  className?: string
  shimmerDelayMs: number
  isActive: boolean
}) {
  return (
    <div
      className={cn(
        "skeleton-shimmer rounded-md",
        isActive && "skeleton-shimmer-active",
        className
      )}
      style={{ ["--shimmer-delay" as string]: `${shimmerDelayMs}ms` }}
    />
  )
}

function SessionCardGhost({ isActive }: { isActive: boolean }) {
  return (
    <motion.div
      aria-hidden
      initial={false}
      animate={
        isActive
          ? {
              scale: [1, 1.04, 1],
              y: [0, -4, 0]
            }
          : { scale: 1, y: 0 }
      }
      transition={
        isActive
          ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
          : { type: "spring", stiffness: 320, damping: 28 }
      }
      className={cn(
        "relative rounded-xl border border-dashed shadow-sm min-h-[380px] flex flex-col overflow-hidden",
        isActive
          ? "border-blue-400/80 bg-blue-500/[0.09] shadow-[0_16px_48px_rgba(59,130,246,0.28)]"
          : "border-muted-foreground/20 bg-muted/5 opacity-50"
      )}
    >
      {isActive && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-xl border-2 border-blue-400/70"
          initial={false}
          animate={{
            opacity: [0.35, 0.85, 0.35],
            scale: [1, 1.02, 1]
          }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <div className="relative p-6 border-b border-dashed border-muted-foreground/15 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <GhostBar
            className={cn("h-5 w-[42%]", isActive ? "bg-blue-400/20" : "bg-muted/60")}
            shimmerDelayMs={0}
            isActive={isActive}
          />
          <GhostBar
            className={cn("h-5 w-16", isActive ? "bg-blue-400/15" : "bg-muted/45")}
            shimmerDelayMs={120}
            isActive={isActive}
          />
        </div>
        <GhostBar
          className={cn("h-4 w-[72%]", isActive ? "bg-blue-400/12" : "bg-muted/35")}
          shimmerDelayMs={240}
          isActive={isActive}
        />
      </div>

      <div className="relative p-6 flex-1 flex flex-col">
        <div
          className={cn(
            "relative flex-1 min-h-[160px] rounded-lg border-2 border-dashed mb-6 overflow-hidden",
            isActive
              ? "border-blue-400/35 bg-blue-500/[0.07]"
              : "border-muted-foreground/20 bg-muted/10"
          )}
        >
          <GhostBar
            className="absolute inset-0 rounded-lg opacity-40"
            shimmerDelayMs={360}
            isActive={isActive}
          />
          <div className="relative flex h-full items-center justify-center">
            <GhostBar
              className={cn(
                "h-10 w-10 rounded-full",
                isActive ? "bg-blue-400/25" : "bg-muted/45"
              )}
              shimmerDelayMs={480}
              isActive={isActive}
            />
          </div>
        </div>
        <div className="space-y-2">
          <GhostBar
            className={cn("h-3 w-1/3", isActive ? "bg-blue-400/12" : "bg-muted/35")}
            shimmerDelayMs={600}
            isActive={isActive}
          />
          <GhostBar
            className={cn("h-9 w-full", isActive ? "bg-blue-400/10" : "bg-muted/25")}
            shimmerDelayMs={720}
            isActive={isActive}
          />
        </div>
      </div>
    </motion.div>
  )
}

export function SessionGridGhost() {
  const prefersReducedMotion = useReducedMotion()
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (prefersReducedMotion) {
      return
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % GHOST_COUNT)
    }, SPOTLIGHT_MS)

    return () => window.clearInterval(intervalId)
  }, [prefersReducedMotion])

  return (
    <div className="contents" aria-busy="true">
      {Array.from({ length: GHOST_COUNT }, (_, index) => (
        <SessionCardGhost
          key={index}
          isActive={prefersReducedMotion ? index === 0 : activeIndex === index}
        />
      ))}
    </div>
  )
}
