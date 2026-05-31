"use client";

import { useState, useEffect } from "react"

import { Loader2, CheckCircle2, XCircle, Smartphone, AlertTriangle } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

import { WebhookConfigForm } from "@/components/blocks/webhook-config-form"
import { useSessionStream } from "@/hooks/use-session-stream"
import { formatPhoneNumber } from "@/lib/format-phone"

type SessionCardProps = {
  sessionId: string
  isProvisioning?: boolean
  webhookUrl?: string | null
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
    // Auto-open modal only while onboarding is active and user did not suppress it.
    // We consider onboarding active if we are provisioning, starting, waiting for scan, or authenticating.
    if (
      !suppressQrModal &&
      (isLocalProvisioning || status === "starting" || status === "waiting_qr" || status === "authenticating")
    ) {
      setIsModalOpen(true)
    }

    // Once connected or disconnected is final, automatically close the onboarding modal.
    if (status === "connected" || status === "disconnected") {
      setIsModalOpen(false)
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

  // ---------------------------------------------------------------------------
  // 5. RENDER
  // ---------------------------------------------------------------------------

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

      {/* QR Code Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border shadow-lg rounded-xl p-8 max-w-sm w-full relative flex flex-col items-center text-center">
            <button 
              onClick={handleCloseQrModal}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <XCircle className="w-5 h-5" />
            </button>
            
            <h3 className="text-lg font-semibold mb-6">Connect WhatsApp</h3>

            {(isLocalProvisioning || status === "starting") && (
              <div className="flex flex-col items-center space-y-4 py-8">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground font-medium">Starting session container...</p>
              </div>
            )}

            {status === "waiting_qr" && qr && (
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-white rounded-xl shadow-sm border">
                  <QRCodeSVG value={qr} size={240} />
                </div>
                <p className="text-sm text-muted-foreground font-medium animate-pulse">Open WhatsApp and scan this code</p>
              </div>
            )}

            {(status === "authenticating" || (status === "waiting_qr" && !qr)) && (
              <div className="flex flex-col items-center space-y-4 py-8">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground font-medium">Authenticating...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
