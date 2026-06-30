import { Loader2 } from "lucide-react"

import type { BaileysStatus, SessionDisconnectReason } from "@/hooks/use-session-stream"
import { cn } from "@/lib/utils"

export type SessionStatusTone = "neutral" | "info" | "success" | "warning" | "danger"

/** One source of truth for the header status line across every session state. */
export function getSessionStatusMeta(
  isLocalProvisioning: boolean,
  isStreamConnected: boolean,
  status: BaileysStatus | null
): { label: string; tone: SessionStatusTone; spinning: boolean } {
  if (isLocalProvisioning) {
    return { label: "Provisioning", tone: "info", spinning: true }
  }
  if (!isStreamConnected) {
    return { label: "Connecting", tone: "neutral", spinning: true }
  }
  switch (status) {
    case "connected":
      return { label: "Connected", tone: "success", spinning: false }
    case "disconnected":
      return { label: "Disconnected", tone: "danger", spinning: false }
    case "waiting_qr":
      return { label: "Waiting for scan", tone: "warning", spinning: false }
    case "starting":
      return { label: "Starting", tone: "info", spinning: true }
    case "authenticating":
      return { label: "Pairing", tone: "info", spinning: true }
    default:
      return { label: "Connecting", tone: "neutral", spinning: true }
  }
}

const STATUS_DOT_TONE: Record<SessionStatusTone, string> = {
  neutral: "bg-muted-foreground/50",
  info: "bg-primary",
  success: "bg-green-500",
  warning: "bg-amber-500",
  danger: "bg-red-500"
}

const STATUS_TEXT_TONE: Record<SessionStatusTone, string> = {
  neutral: "text-muted-foreground",
  info: "text-foreground",
  success: "text-foreground",
  warning: "text-foreground",
  danger: "text-red-500"
}

export function SessionStatusIndicator({
  label,
  tone,
  spinning
}: {
  label: string
  tone: SessionStatusTone
  spinning: boolean
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      {spinning ? (
        <Loader2
          className={cn(
            "size-3.5 shrink-0 animate-spin",
            tone === "neutral" ? "text-muted-foreground" : "text-primary"
          )}
        />
      ) : (
        <span className="relative flex size-2 shrink-0 items-center justify-center">
          {tone === "warning" && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500/70" />
          )}
          <span
            className={cn(
              "relative inline-flex size-2 rounded-full",
              STATUS_DOT_TONE[tone]
            )}
          />
        </span>
      )}
      <span
        className={cn(
          "truncate font-display text-[15px] font-semibold leading-none tracking-tight",
          STATUS_TEXT_TONE[tone]
        )}
      >
        {label}
      </span>
    </div>
  )
}

/** Human-readable copy for a worker disconnect reason. */
export const DISCONNECT_REASON_LABELS: Record<SessionDisconnectReason, string> = {
  logged_out: "You logged this device out from your phone.",
  forbidden: "WhatsApp removed this device.",
  bad_session: "The session expired and must be re-linked.",
  restricted: "Your WhatsApp account is currently restricted.",
  manual: "You disconnected this session.",
  number_in_use: "This phone number is already linked to another account."
}
