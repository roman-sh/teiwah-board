"use client";

import { useState, useEffect, useRef, type ReactNode } from "react"

import {
  Loader2,
  CheckCircle2,
  XCircle,
  Smartphone,
  AlertTriangle,
  X,
  Circle,
  RotateCcw
} from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import { QRCodeSVG } from "qrcode.react"
import { toast } from "sonner"

import { ApiKeyField } from "@/components/blocks/api-key-field"
import { WebhookConfigForm } from "@/components/blocks/webhook-config-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  useSessionStream,
  type BaileysStatus,
  type SessionDisconnectReason
} from "@/hooks/use-session-stream"
import { formatPhoneNumber } from "@/lib/format-phone"
import { cn } from "@/lib/utils"
import { reconnectSession } from "@/services/session.service"

type SessionCardProps = {
  sessionId: string
  isProvisioning?: boolean
  webhookUrl?: string | null
  apiKey?: string | null
  apiKeyMasked?: string | null
}

type OnboardingPhase = "setup" | "scan" | "pairing"

function getOnboardingPhase(
  status: BaileysStatus | null,
  qr: string | null
): OnboardingPhase {
  if (status === "authenticating") {
    return "pairing"
  }
  if (status === "waiting_qr" && qr) {
    return "scan"
  }
  return "setup"
}

/** Ignore brief authenticating blips (SSE reconnect, Baileys noise) before showing pairing UI. */
function useOnboardingPhase(
  status: BaileysStatus | null,
  qr: string | null
): OnboardingPhase {
  const rawPhase = getOnboardingPhase(status, qr)
  const [displayPhase, setDisplayPhase] = useState<OnboardingPhase>(rawPhase)

  useEffect(() => {
    if (rawPhase !== "pairing") {
      setDisplayPhase(rawPhase)
      return
    }

    const timer = window.setTimeout(() => setDisplayPhase("pairing"), 600)
    return () => window.clearTimeout(timer)
  }, [rawPhase, status, qr])

  return displayPhase
}

const ONBOARDING_STEPS = [
  { key: "setup", label: "Setup" },
  { key: "scan", label: "Scan" },
  { key: "done", label: "Done" }
] as const

const SETUP_TASKS = [
  "Starting worker",
  "Creating API key",
  "Almost ready"
] as const

function OnboardingStepIndicator({ phase }: { phase: OnboardingPhase }) {
  const prefersReducedMotion = useReducedMotion()
  const activeIndex = phase === "setup" ? 0 : phase === "scan" ? 1 : 2
  const pulseActive = phase === "setup" && !prefersReducedMotion

  return (
    <div className="flex items-center justify-center gap-2 w-full max-w-[280px] mb-8">
      {ONBOARDING_STEPS.map((step, index) => (
        <div key={step.key} className="flex items-center gap-2">
          <div className="flex flex-col items-center gap-1">
            <div className="relative flex size-7 items-center justify-center">
              {pulseActive && index === activeIndex && (
                <>
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 rounded-full border-2 border-primary/70"
                    animate={{ scale: [1, 1.85], opacity: [0.75, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                  />
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-primary/25"
                    animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0.2, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                </>
              )}
              <div
                className={cn(
                  "relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium border transition-colors",
                  index < activeIndex &&
                    "border-primary/40 bg-primary/10 text-primary",
                  index === activeIndex &&
                    "border-primary bg-primary text-primary-foreground",
                  index > activeIndex && "border-muted-foreground/25 text-muted-foreground"
                )}
              >
                {index < activeIndex ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  index + 1
                )}
              </div>
            </div>
            <span
              className={cn(
                "text-[10px] font-medium uppercase tracking-wide",
                index === activeIndex ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
          </div>
          {index < ONBOARDING_STEPS.length - 1 && (
            <div className="relative h-px w-8 mb-4 overflow-hidden bg-muted-foreground/20">
              <motion.div
                className="absolute inset-y-0 left-0 bg-primary/50"
                initial={false}
                animate={{ width: index < activeIndex ? "100%" : "0%" }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function getSseSetupSteps(
  status: BaileysStatus | null,
  isStreamConnected: boolean
): number {
  if (status === "starting" || status === "waiting_qr" || status === "authenticating") {
    return 2
  }
  if (isStreamConnected) {
    return 1
  }
  return 0
}

function ProvisioningChecklist({
  sessionId,
  status,
  isStreamConnected
}: {
  sessionId: string
  status: BaileysStatus | null
  isStreamConnected: boolean
}) {
  const prefersReducedMotion = useReducedMotion()
  const [timerSteps, setTimerSteps] = useState(0)

  useEffect(() => {
    setTimerSteps(0)
    const first = window.setTimeout(() => setTimerSteps(1), 25000)
    const second = window.setTimeout(() => setTimerSteps(2), 35000)
    return () => {
      window.clearTimeout(first)
      window.clearTimeout(second)
    }
  }, [sessionId])

  const completedSteps = Math.min(
    SETUP_TASKS.length,
    Math.max(timerSteps, getSseSetupSteps(status, isStreamConnected))
  )

  return (
    <div className="relative w-full max-w-[260px]">
      {!prefersReducedMotion && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 size-36 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-2xl"
          animate={{ scale: [0.85, 1.15, 0.85], opacity: [0.25, 0.55, 0.25] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <ul className="relative space-y-2 text-left">
        {SETUP_TASKS.map((label, index) => {
          const isDone = index < completedSteps
          const isActive = index === completedSteps

          return (
            <motion.li
              key={label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08, duration: 0.25 }}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-2 py-2",
                isActive && "bg-primary/5"
              )}
            >
              {isActive && !prefersReducedMotion && (
                <motion.span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-lg border border-primary/40"
                  animate={{ opacity: [0.35, 0.85, 0.35] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
              <div className="relative z-10 flex items-center gap-3">
                {isDone ? (
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 420, damping: 22 }}
                  >
                    <CheckCircle2 className="size-4 shrink-0 text-primary" />
                  </motion.div>
                ) : isActive ? (
                  <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
                ) : (
                  <Circle className="size-4 shrink-0 text-muted-foreground/35" />
                )}
                <span
                  className={cn(
                    "text-sm transition-colors",
                    isDone && "text-foreground",
                    isActive && "font-medium text-foreground",
                    !isDone && !isActive && "text-muted-foreground"
                  )}
                >
                  {label}
                  {isActive && "…"}
                </span>
              </div>
            </motion.li>
          )
        })}
      </ul>
    </div>
  )
}

function SessionOnboardingModal({
  sessionId,
  phase,
  qr,
  status,
  isStreamConnected,
  onClose
}: {
  sessionId: string
  phase: OnboardingPhase
  qr: string | null
  status: BaileysStatus | null
  isStreamConnected: boolean
  onClose: () => void
}) {
  const title =
    phase === "setup"
      ? "Setting up your session"
      : phase === "scan"
        ? "Scan with your phone"
        : "Pairing…"

  const subtitle =
    phase === "setup"
      ? "Hang tight — preparing your session."
      : phase === "scan"
        ? "Settings → Linked devices → Link a device"
        : "Almost done."

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-md flex-col items-stretch gap-2">
        <div className="flex justify-start px-1">
          <span className="inline-flex max-w-full truncate rounded-md border border-border/70 bg-muted/50 px-2.5 py-1 font-mono text-[11px] text-muted-foreground shadow-sm">
            {sessionId}
          </span>
        </div>

        <Card
          className={cn(
            "relative w-full text-center shadow-lg p-8 pt-10",
            phase !== "scan" && "flex h-[440px] flex-col"
          )}
          role="dialog"
          aria-labelledby={`session-onboarding-title-${sessionId}`}
        >
          <span className="sr-only">Session {sessionId}</span>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="absolute top-4 right-4"
            aria-label="Close"
          >
            <X className="size-5" />
          </Button>

          <div className="flex w-full shrink-0 flex-col items-center">
            <OnboardingStepIndicator phase={phase} />

            <CardTitle
              id={`session-onboarding-title-${sessionId}`}
              className="font-display text-2xl font-medium tracking-tight"
            >
              {title}
            </CardTitle>
            <CardDescription className="mt-3 max-w-[300px]">
              {subtitle}
            </CardDescription>
          </div>

          {phase === "scan" && qr && (
            <motion.div
              className="mt-5 flex w-full justify-center"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <div className="p-4 bg-white rounded-xl shadow-sm border">
                <QRCodeSVG value={qr} size={240} />
              </div>
            </motion.div>
          )}

          {phase === "setup" && (
            <>
              <div className="flex min-h-0 flex-1 items-center justify-center px-2">
                <ProvisioningChecklist
                  sessionId={sessionId}
                  status={status}
                  isStreamConnected={isStreamConnected}
                />
              </div>
              <p className="shrink-0 pb-1 text-xs text-muted-foreground">
                This usually takes about a minute
              </p>
            </>
          )}

          {phase === "pairing" && (
            <>
              <div className="flex min-h-0 flex-1 items-center justify-center">
                <Loader2 className="size-12 text-primary animate-spin" />
              </div>
              <p className="shrink-0 pb-1 text-sm font-medium text-foreground">Linking your phone…</p>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}

function SessionStatusBadge({ children }: { children: ReactNode }) {
  return (
    <Badge variant="secondary" className="gap-1">
      {children}
    </Badge>
  )
}

/** Human-readable copy for a worker disconnect reason. */
const DISCONNECT_REASON_LABELS: Record<SessionDisconnectReason, string> = {
  logged_out: "You logged this device out from your phone.",
  forbidden: "WhatsApp removed this device.",
  bad_session: "The session expired and must be re-linked.",
  restricted: "Your WhatsApp account is currently restricted."
}

export function SessionCard({
  sessionId,
  isProvisioning = false,
  webhookUrl,
  apiKey,
  apiKeyMasked
}: SessionCardProps) {
  const {
    status,
    isLocalProvisioning,
    qr,
    phoneNumber,
    disconnectReason,
    isStreamConnected
  } = useSessionStream(sessionId, isProvisioning)

  const [suppressQrModal, setSuppressQrModal] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isReconnecting, setIsReconnecting] = useState(false)
  const [savedWebhookUrl, setSavedWebhookUrl] = useState(webhookUrl?.trim() ?? "")

  const allowAutoOpenQrModalRef = useRef(isProvisioning)

  useEffect(() => {
    setSavedWebhookUrl(webhookUrl?.trim() ?? "")
  }, [webhookUrl])

  const hasWebhookConfigured = Boolean(savedWebhookUrl)

  useEffect(() => {
    if (
      allowAutoOpenQrModalRef.current &&
      !suppressQrModal &&
      (isLocalProvisioning || status === "starting" || status === "waiting_qr" || status === "authenticating")
    ) {
      setIsModalOpen(true)
    }

    if (status === "connected" || status === "disconnected") {
      setIsModalOpen(false)
      allowAutoOpenQrModalRef.current = false
    }
  }, [isLocalProvisioning, status, suppressQrModal])

  function handleCloseQrModal() {
    setSuppressQrModal(true)
    setIsModalOpen(false)
  }

  function handleShowQrModal() {
    setSuppressQrModal(false)
    setIsModalOpen(true)
  }

  async function handleReconnect() {
    setIsReconnecting(true)
    try {
      await reconnectSession(sessionId)
      // A wiped session re-pairs with a fresh QR over SSE — re-arm the onboarding
      // modal so it auto-opens again once the worker advances past 'disconnected'.
      setSuppressQrModal(false)
      allowAutoOpenQrModalRef.current = true
    } catch (error) {
      console.error(`[session ${sessionId}] Reconnect failed:`, error)
      toast.error("Couldn't reconnect. Please try again.")
    } finally {
      setIsReconnecting(false)
    }
  }

  const onboardingPhase = useOnboardingPhase(status, qr)

  return (
    <Card className="h-fit shadow">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between gap-2">
          <CardTitle>Session {sessionId}</CardTitle>
          {isLocalProvisioning && (
            <SessionStatusBadge>
              <Loader2 className="animate-spin" />
              Provisioning...
            </SessionStatusBadge>
          )}
          {!isLocalProvisioning && !isStreamConnected && (
            <SessionStatusBadge>
              <Loader2 className="animate-spin" />
              Connecting...
            </SessionStatusBadge>
          )}
          {isStreamConnected && status === "connected" && (
            <Badge variant="success" className="gap-1">
              <CheckCircle2 />
              Connected
            </Badge>
          )}
          {isStreamConnected && status === "disconnected" && (
            <Badge variant="destructive" className="gap-1">
              <XCircle />
              Disconnected
            </Badge>
          )}
        </div>
        <CardDescription>
          {isLocalProvisioning
            ? "Creating isolated worker container..."
            : !isStreamConnected
              ? "Establishing connection to server..."
              : status === "connected" && phoneNumber
                ? (
                  <>
                    Connected as
                    <span className="ml-2 tabular-nums tracking-tight text-foreground">
                      {formatPhoneNumber(phoneNumber)}
                    </span>
                  </>
                )
                : "Connect your phone to start sending messages."}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center min-h-[160px] space-y-4 py-4 border-2 border-dashed rounded-lg bg-muted/10 mb-6">
          {isLocalProvisioning && (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="size-10 text-muted-foreground animate-spin" />
              <p className="text-sm text-muted-foreground font-medium">
                Provisioning your session...
              </p>
            </div>
          )}

          {!isLocalProvisioning && !isStreamConnected && (
            <div className="flex flex-col items-center space-y-4 opacity-50">
              <Loader2 className="size-10 text-muted-foreground animate-spin" />
              <p className="text-sm text-muted-foreground font-medium">Connecting to server...</p>
            </div>
          )}

          {isStreamConnected && status === null && (
            <>
              <Smartphone className="size-10 text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-sm">
                Status: <span className="font-medium text-foreground">Connecting</span>
              </p>
            </>
          )}

          {isStreamConnected && status === "waiting_qr" && (
            <>
              <Smartphone className="size-10 text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-sm">
                Status: <span className="font-medium text-foreground">Waiting for Scan</span>
              </p>
              <Button onClick={handleShowQrModal} className="mt-2">
                Show QR Code
              </Button>
            </>
          )}

          {isStreamConnected && status === "connected" && (
            <div className="flex flex-col items-center space-y-2">
              <div className="size-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-2">
                <CheckCircle2 className="size-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-base font-medium">Ready to send messages</p>
              {!hasWebhookConfigured && (
                <p className="flex items-center gap-1.5 text-sm text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="size-4 shrink-0" />
                  Webhook URL isn&apos;t configured
                </p>
              )}
            </div>
          )}

          {isStreamConnected && status === "disconnected" && (
            <>
              <XCircle className="size-10 text-red-500 mb-2" />
              <p className="text-muted-foreground text-sm">
                Status: <span className="font-medium text-red-500">Disconnected</span>
              </p>
              {disconnectReason && (
                <p className="text-muted-foreground text-sm text-center max-w-xs">
                  {DISCONNECT_REASON_LABELS[disconnectReason]}
                </p>
              )}
              <Button
                onClick={handleReconnect}
                disabled={isReconnecting}
                className="mt-2"
              >
                {isReconnecting ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Reconnecting...
                  </>
                ) : (
                  <>
                    <RotateCcw />
                    Reconnect
                  </>
                )}
              </Button>
            </>
          )}
        </div>

        <div className="space-y-5">
          <ApiKeyField
            sessionId={sessionId}
            apiKey={apiKey}
            apiKeyMasked={apiKeyMasked}
          />

          <WebhookConfigForm
            sessionId={sessionId}
            initialWebhookUrl={webhookUrl}
            onSaved={(url) => setSavedWebhookUrl(url)}
          />
        </div>
      </CardContent>

      {isModalOpen && (
        <SessionOnboardingModal
          sessionId={sessionId}
          phase={onboardingPhase}
          qr={qr}
          status={status}
          isStreamConnected={isStreamConnected}
          onClose={handleCloseQrModal}
        />
      )}
    </Card>
  )
}
