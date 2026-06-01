"use client";

import { useState, useEffect, useRef } from "react"

import { Loader2, CheckCircle2, XCircle, Smartphone, AlertTriangle, X } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

import { WebhookConfigForm } from "@/components/blocks/webhook-config-form"
import { useSessionStream, type BaileysStatus } from "@/hooks/use-session-stream"
import { formatPhoneNumber } from "@/lib/format-phone"
import { cn } from "@/lib/utils"

type SessionCardProps = {
  sessionId: string
  isProvisioning?: boolean
  webhookUrl?: string | null
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
      ? "Hang tight — preparing your dedicated session."
      : phase === "scan"
        ? "WhatsApp → Settings → Linked devices → Link a device"
        : "Almost done."

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="bg-card border shadow-lg rounded-xl p-8 max-w-md w-full relative flex flex-col items-center text-center"
        role="dialog"
        aria-labelledby={`session-onboarding-title-${sessionId}`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <OnboardingStepIndicator phase={phase} />

        <h3 id={`session-onboarding-title-${sessionId}`} className="text-xl font-semibold tracking-tight">
          {title}
        </h3>
        <p className="text-xs font-mono text-muted-foreground mt-2">{sessionId}</p>
        <p className="text-sm text-muted-foreground mt-3 max-w-[300px]">{subtitle}</p>

        <div className="mt-8 min-h-[280px] flex flex-col items-center justify-center w-full">
          {phase === "setup" && (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="text-sm font-medium text-foreground">Preparing your session…</p>
              <p className="text-xs text-muted-foreground">This usually takes around 30 seconds</p>
            </div>
          )}

          {phase === "scan" && qr && (
            <div className="flex flex-col items-center space-y-5">
              <div className="p-4 bg-white rounded-xl shadow-sm border">
                <QRCodeSVG value={qr} size={240} />
              </div>
            </div>
          )}

          {phase === "pairing" && (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="text-sm font-medium text-foreground">Linking your phone…</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function SessionCard({
  sessionId,
  isProvisioning = false,
  webhookUrl
}: SessionCardProps) {
  // Live SSE from worker pod — one independent connection per card (see use-session-stream.ts)
  const { 
    status, 
    isLocalProvisioning, 
    qr, 
    phoneNumber, 
    isStreamConnected 
  } = useSessionStream(sessionId, isProvisioning)

  // ---------------------------------------------------------------------------
  // 2. THE "FACE" - Local UI State
  // ---------------------------------------------------------------------------

  // User-controlled suppression: prevents the QR modal from auto-reopening
  // if the user explicitly closed it manually.
  const [suppressQrModal, setSuppressQrModal] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [savedWebhookUrl, setSavedWebhookUrl] = useState(webhookUrl?.trim() ?? "")

  // Auto-open QR modal only for sessions created this visit (POST /sessions).
  // On page load, GET /sessions never sets isProvisioning — existing waiting_qr
  // cards should show "Show QR Code" on the card, not pop modals.
  const allowAutoOpenQrModalRef = useRef(isProvisioning)

  useEffect(() => {
    setSavedWebhookUrl(webhookUrl?.trim() ?? "")
  }, [webhookUrl])

  const hasWebhookConfigured = Boolean(savedWebhookUrl)

  // ---------------------------------------------------------------------------
  // MODAL VISIBILITY
  // ---------------------------------------------------------------------------
  // Closing the modal (handleCloseQrModal) only sets suppressQrModal — it does NOT
  // abort the SSE stream. The hook keeps running in the background.
  //
  // Card body needs BOTH isStreamConnected AND status for "Show QR Code":
  //   stream can die briefly (isStreamConnected=false) while status stays waiting_qr.

  useEffect(() => {
    // Auto-open only after "Add New Session" — not when reloading the dashboard.
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

  // ---------------------------------------------------------------------------
  // 4. EVENT HANDLERS
  // ---------------------------------------------------------------------------

  function handleCloseQrModal() {
    setSuppressQrModal(true)
    setIsModalOpen(false)
  }

  function handleShowQrModal() {
    setSuppressQrModal(false)
    setIsModalOpen(true)
  }

  const onboardingPhase = getOnboardingPhase(status, qr)

  // --- RENDER ---

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow h-fit">
      <div className="flex flex-col space-y-1.5 p-6 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold leading-none tracking-tight">Session {sessionId}</h3>
          {isLocalProvisioning && (
            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-muted text-muted-foreground">
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Provisioning...
            </span>
          )}
          {!isLocalProvisioning && !isStreamConnected && (
            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-muted text-muted-foreground">
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Connecting...
            </span>
          )}
          {isStreamConnected && status === "connected" && (
            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Connected
            </span>
          )}
          {isStreamConnected && status === "disconnected" && (
            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
              <XCircle className="w-3 h-3 mr-1" />
              Disconnected
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {isLocalProvisioning
            ? "Creating isolated worker container..."
            : !isStreamConnected 
            ? "Establishing connection to server..."
            : status === "connected" && phoneNumber ? (
              <>
                Connected as
                <span className="ml-2 tabular-nums tracking-tight text-foreground">
                  {formatPhoneNumber(phoneNumber)}
                </span>
              </>
            ) : (
              "Connect your phone to start sending messages."
            )}
        </p>
      </div>
      <div className="p-6">
        <div className="flex flex-col items-center justify-center min-h-[160px] space-y-4 py-4 border-2 border-dashed rounded-lg bg-muted/10 mb-6">
          {isLocalProvisioning && (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-10 h-10 text-muted-foreground animate-spin" />
              <p className="text-sm text-muted-foreground font-medium">
                Provisioning your session...
              </p>
            </div>
          )}

          {!isLocalProvisioning && !isStreamConnected && (
            <div className="flex flex-col items-center space-y-4 opacity-50">
              <Loader2 className="w-10 h-10 text-muted-foreground animate-spin" />
              <p className="text-sm text-muted-foreground font-medium">Connecting to server...</p>
            </div>
          )}

          {isStreamConnected && status === null && (
            <>
              <Smartphone className="w-10 h-10 text-muted-foreground mb-2" />
              <div className="text-muted-foreground text-sm">Status: <span className="font-medium text-foreground">Connecting</span></div>
            </>
          )}

          {isStreamConnected && status === "waiting_qr" && (
            <>
              <Smartphone className="w-10 h-10 text-muted-foreground mb-2" />
              <div className="text-muted-foreground text-sm">Status: <span className="font-medium text-foreground">Waiting for Scan</span></div>
              <button 
                onClick={handleShowQrModal}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 mt-2"
              >
                Show QR Code
              </button>
            </>
          )}

          {isStreamConnected && status === "connected" && (
            <div className="flex flex-col items-center space-y-2">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-2">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-base font-medium">Ready to send messages</p>
              {!hasWebhookConfigured && (
                <p className="flex items-center gap-1.5 text-sm text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  Webhook URL isn&apos;t configured
                </p>
              )}
            </div>
          )}

          {isStreamConnected && status === "disconnected" && (
            <>
              <XCircle className="w-10 h-10 text-red-500 mb-2" />
              <div className="text-muted-foreground text-sm">Status: <span className="font-medium text-red-500">Disconnected</span></div>
            </>
          )}

        </div>

        <WebhookConfigForm
          sessionId={sessionId}
          initialWebhookUrl={webhookUrl}
          onSaved={(url) => setSavedWebhookUrl(url)}
        />
      </div>

      {isModalOpen && (
        <SessionOnboardingModal
          sessionId={sessionId}
          phase={onboardingPhase}
          qr={qr}
          onClose={handleCloseQrModal}
        />
      )}
    </div>
  )
}
