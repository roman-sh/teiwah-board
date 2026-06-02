"use client";

import { useState, useEffect, useRef, type ReactNode } from "react"

import { Loader2, CheckCircle2, XCircle, Smartphone, AlertTriangle, X } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

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
import { useSessionStream, type BaileysStatus } from "@/hooks/use-session-stream"
import { formatPhoneNumber } from "@/lib/format-phone"
import { cn } from "@/lib/utils"

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

function OnboardingStepIndicator({ phase }: { phase: OnboardingPhase }) {
  const activeIndex = phase === "setup" ? 0 : phase === "scan" ? 1 : 2

  return (
    <div className="flex items-center justify-center gap-2 w-full max-w-[280px] mb-8">
      {ONBOARDING_STEPS.map((step, index) => (
        <div key={step.key} className="flex items-center gap-2">
          <div className="flex flex-col items-center gap-1">
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium border transition-colors",
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
            <div
              className={cn(
                "h-px w-8 mb-4",
                index < activeIndex ? "bg-primary/40" : "bg-muted-foreground/20"
              )}
            />
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

function SessionOnboardingModal({
  sessionId,
  phase,
  qr,
  onClose
}: {
  sessionId: string
  phase: OnboardingPhase
  qr: string | null
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
            <div className="mt-5 flex w-full justify-center">
              <div className="p-4 bg-white rounded-xl shadow-sm border">
                <QRCodeSVG value={qr} size={240} />
              </div>
            </div>
          )}

          {phase === "setup" && (
            <>
              <div className="flex min-h-0 flex-1 items-center justify-center">
                <Loader2 className="size-12 text-primary animate-spin" />
              </div>
              <div className="shrink-0 space-y-1 pb-1">
                <p className="text-sm font-medium text-foreground">Preparing your session…</p>
                <p className="text-xs text-muted-foreground">This usually takes about 30 seconds</p>
              </div>
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
    isStreamConnected
  } = useSessionStream(sessionId, isProvisioning)

  const [suppressQrModal, setSuppressQrModal] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
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
          onClose={handleCloseQrModal}
        />
      )}
    </Card>
  )
}
