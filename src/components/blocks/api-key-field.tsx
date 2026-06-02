"use client"

import { useLayoutEffect, useRef, useState } from "react"

import { Check, CircleHelp, Copy, Eye, Key, Loader2 } from "lucide-react"

import { INSET_WELL_CLASS } from "@/components/blocks/inset-well"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { fetchSessionApiKey } from "@/services/session.service"

type ApiKeyFieldProps = {
  sessionId: string
  /** Full key from POST /sessions — client-only until refresh. */
  apiKey?: string | null
  /** Last 8 chars from GET /sessions. */
  apiKeyMasked?: string | null
}

function isFullApiKey(value: string): boolean {
  return value.startsWith("zpka_")
}

/** DB stores last 8; legacy rows may still be first8...last4. */
function visibleSuffixFromStored(masked: string): string {
  const trimmed = masked.trim()
  if (!trimmed) {
    return ""
  }

  const ellipsis = trimmed.indexOf("...")
  if (ellipsis !== -1) {
    return trimmed.slice(ellipsis + 3).slice(-8)
  }

  return trimmed.slice(-8)
}

function measureTextWidth(text: string, style: CSSStyleDeclaration, ctx: CanvasRenderingContext2D): number {
  ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
  return ctx.measureText(text).width
}

function buildWidthFilledMask(inputEl: HTMLInputElement, suffix: string): string {
  const style = window.getComputedStyle(inputEl)
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")

  if (!ctx || !suffix) {
    return suffix ? `****${suffix}` : ""
  }

  const contentWidth =
    inputEl.clientWidth -
    parseFloat(style.paddingLeft) -
    parseFloat(style.paddingRight)

  let low = 4
  let high = 400
  let best = 4

  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    const candidate = "*".repeat(mid) + suffix

    if (measureTextWidth(candidate, style, ctx) <= contentWidth + 1) {
      best = mid
      low = mid + 1
    } else {
      high = mid - 1
    }
  }

  return "*".repeat(best) + suffix
}

export function ApiKeyField({ sessionId, apiKey, apiKeyMasked }: ApiKeyFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)
  const [filledMask, setFilledMask] = useState("")
  const [revealedKey, setRevealedKey] = useState("")
  const [isRevealing, setIsRevealing] = useState(false)
  const [revealError, setRevealError] = useState(false)

  const fullFromProps = apiKey?.trim() ?? ""
  const fullKey = isFullApiKey(fullFromProps)
    ? fullFromProps
    : isFullApiKey(revealedKey)
      ? revealedKey
      : ""

  const maskedStored = apiKeyMasked?.trim() ?? ""
  const visibleSuffix =
    !fullKey && maskedStored ? visibleSuffixFromStored(maskedStored) : ""

  useLayoutEffect(() => {
    if (fullKey || !visibleSuffix) {
      setFilledMask("")
      return
    }

    const container = containerRef.current
    if (!container) {
      return
    }

    function updateMask() {
      const el = containerRef.current
      if (!el) {
        return
      }
      const input = el.querySelector("input")
      if (!input) {
        return
      }
      setFilledMask(buildWidthFilledMask(input, visibleSuffix))
    }

    updateMask()

    const observer = new ResizeObserver(updateMask)
    observer.observe(container)

    return () => observer.disconnect()
  }, [fullKey, visibleSuffix])

  const inputValue =
    fullKey || filledMask || (visibleSuffix ? `****${visibleSuffix}` : "")

  async function copyApiKey() {
    if (!fullKey) {
      return
    }

    await navigator.clipboard.writeText(fullKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  async function revealApiKey() {
    setIsRevealing(true)
    setRevealError(false)

    try {
      const { apiKey: key } = await fetchSessionApiKey(sessionId)
      setRevealedKey(key)
    } catch {
      setRevealError(true)
    } finally {
      setIsRevealing(false)
    }
  }

  return (
    <section className={INSET_WELL_CLASS}>
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <Key className="w-4 h-4 text-muted-foreground shrink-0" />
          <Label htmlFor={`api-key-${sessionId}`} className="mb-0">
            Session API Key
          </Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground"
                aria-label="API key help"
              >
                <CircleHelp className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              Send messages with{" "}
              <span className="font-mono">Authorization: Bearer &lt;key&gt;</span>{" "}
              on POST /messages. Use Show to reveal the full key.
            </TooltipContent>
          </Tooltip>
        </div>

        <div ref={containerRef} className="relative">
          <Input
            id={`api-key-${sessionId}`}
            type="text"
            readOnly
            value={inputValue}
            placeholder="No API key"
            className="pr-10 font-mono text-sm"
          />
          <Tooltip>
            <TooltipTrigger asChild>
              {fullKey ? (
                <button
                  type="button"
                  onClick={() => void copyApiKey()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Copy API key"
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!visibleSuffix || isRevealing}
                  onClick={() => void revealApiKey()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                  aria-label="Show API key"
                >
                  {isRevealing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              )}
            </TooltipTrigger>
            <TooltipContent>
              {fullKey
                ? "Copy key"
                : revealError
                  ? "Failed to reveal key"
                  : "Show key"}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </section>
  )
}
