"use client"

import { useEffect, useRef, useState } from "react"

import { toast } from "sonner"

import { ApiKeyField } from "@/components/blocks/api-key-field"
import { SessionActionsMenu } from "@/components/blocks/session-card/session-actions-menu"
import { SessionConnectionPanel } from "@/components/blocks/session-card/session-connection-panel"
import { SessionIdChip } from "@/components/blocks/session-card/session-id-chip"
import {
  SessionOnboardingModal,
  useOnboardingPhase
} from "@/components/blocks/session-card/session-onboarding-modal"
import {
  getSessionStatusMeta,
  SessionStatusIndicator
} from "@/components/blocks/session-card/session-status"
import { WebhookConfigForm } from "@/components/blocks/webhook-config-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader
} from "@/components/ui/card"
import { useSessionStream } from "@/hooks/use-session-stream"
import { formatPhoneNumber } from "@/lib/format-phone"
import { disconnectSession, reconnectSession } from "@/services/session.service"

export type SessionCardProps = {
  sessionId: string
  isProvisioning?: boolean
  webhookUrl?: string | null
  apiKey?: string | null
  apiKeyMasked?: string | null
  /** Permanently delete this session. Rejects on failure (dialog stays open). */
  onDelete: (sessionId: string) => Promise<void>
  /** Open the Freemius portal to manage the subscription (downgrade slots). */
  onManageBilling: () => void
}

export function SessionCard({
  sessionId,
  isProvisioning = false,
  webhookUrl,
  apiKey,
  apiKeyMasked,
  onDelete,
  onManageBilling
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
  const [isDisconnectDialogOpen, setIsDisconnectDialogOpen] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
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
      (isLocalProvisioning ||
        status === "starting" ||
        status === "waiting_qr" ||
        status === "authenticating")
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

  async function handleDisconnect() {
    setIsDisconnecting(true)
    try {
      // Fire-and-forget: the worker logs out, wipes auth, and idles. The card
      // flips to 'disconnected' (reason 'manual') via the SSE stream, where the
      // Reconnect button takes over.
      await disconnectSession(sessionId)
      setIsDisconnectDialogOpen(false)
    } catch (error) {
      console.error(`[session ${sessionId}] Disconnect failed:`, error)
      toast.error("Couldn't disconnect. Please try again.")
    } finally {
      setIsDisconnecting(false)
    }
  }

  async function handleDelete() {
    setIsDeleting(true)
    try {
      // On success the parent removes this card from the list (unmounts us), so
      // there's no "done" state to render. On failure, keep the dialog open and
      // let the toast (raised upstream) explain.
      await onDelete(sessionId)
    } catch {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  const onboardingPhase = useOnboardingPhase(status, qr)
  const statusMeta = getSessionStatusMeta(
    isLocalProvisioning,
    isStreamConnected,
    status
  )

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex h-7 shrink-0 items-end justify-start px-1">
        <SessionIdChip sessionId={sessionId} />
      </div>

      <Card className="flex min-h-0 flex-1 flex-col shadow">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between gap-2">
            <SessionStatusIndicator
              label={statusMeta.label}
              tone={statusMeta.tone}
              spinning={statusMeta.spinning}
            />

            <SessionActionsMenu
              sessionId={sessionId}
              isDeleteDialogOpen={isDeleteDialogOpen}
              isDeleting={isDeleting}
              onDeleteDialogOpenChange={setIsDeleteDialogOpen}
              onDelete={() => void handleDelete()}
              onManageBilling={onManageBilling}
            />
          </div>
          <CardDescription className="text-[13px] leading-relaxed">
            {isLocalProvisioning
              ? "Creating isolated worker container..."
              : !isStreamConnected
                ? "Establishing connection to server..."
                : status === "connected" && phoneNumber
                  ? (
                    <>
                      Connected as
                      <span className="ml-2 font-medium tabular-nums tracking-tight text-foreground">
                        {formatPhoneNumber(phoneNumber)}
                      </span>
                    </>
                  )
                  : "Connect your phone to start sending messages."}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col pt-6">
          <SessionConnectionPanel
            isLocalProvisioning={isLocalProvisioning}
            isStreamConnected={isStreamConnected}
            status={status}
            disconnectReason={disconnectReason}
            hasWebhookConfigured={hasWebhookConfigured}
            isReconnecting={isReconnecting}
            isDisconnecting={isDisconnecting}
            isDisconnectDialogOpen={isDisconnectDialogOpen}
            onDisconnectDialogOpenChange={setIsDisconnectDialogOpen}
            onShowQr={handleShowQrModal}
            onReconnect={() => void handleReconnect()}
            onDisconnect={() => void handleDisconnect()}
          />

          <div className="mt-auto space-y-5">
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
    </div>
  )
}
