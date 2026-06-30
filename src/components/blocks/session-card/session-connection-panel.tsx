"use client"

import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RotateCcw,
  Smartphone,
  Unplug,
  XCircle
} from "lucide-react"

import { DISCONNECT_REASON_LABELS } from "@/components/blocks/session-card/session-status"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import type { BaileysStatus, SessionDisconnectReason } from "@/hooks/use-session-stream"

type SessionConnectionPanelProps = {
  isLocalProvisioning: boolean
  isStreamConnected: boolean
  status: BaileysStatus | null
  disconnectReason: SessionDisconnectReason | null
  hasWebhookConfigured: boolean
  isReconnecting: boolean
  isDisconnecting: boolean
  isDisconnectDialogOpen: boolean
  onDisconnectDialogOpenChange: (open: boolean) => void
  onShowQr: () => void
  onReconnect: () => void
  onDisconnect: () => void
}

export function SessionConnectionPanel({
  isLocalProvisioning,
  isStreamConnected,
  status,
  disconnectReason,
  hasWebhookConfigured,
  isReconnecting,
  isDisconnecting,
  isDisconnectDialogOpen,
  onDisconnectDialogOpenChange,
  onShowQr,
  onReconnect,
  onDisconnect
}: SessionConnectionPanelProps) {
  return (
    <div className="mb-6 flex min-h-[160px] flex-1 flex-col items-center justify-center space-y-4 rounded-lg border-2 border-dashed bg-muted/10 py-4">
      {isLocalProvisioning && (
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="size-10 animate-spin text-muted-foreground" />
          <p className="text-sm font-medium text-muted-foreground">
            Provisioning your session...
          </p>
        </div>
      )}

      {!isLocalProvisioning && !isStreamConnected && (
        <div className="flex flex-col items-center space-y-4 opacity-50">
          <Loader2 className="size-10 animate-spin text-muted-foreground" />
          <p className="text-sm font-medium text-muted-foreground">
            Connecting to server...
          </p>
        </div>
      )}

      {isStreamConnected && status === null && (
        <>
          <Smartphone className="mb-2 size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Status: <span className="font-medium text-foreground">Connecting</span>
          </p>
        </>
      )}

      {isStreamConnected && status === "waiting_qr" && (
        <>
          <Smartphone className="mb-2 size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Status:{" "}
            <span className="font-medium text-foreground">Waiting for Scan</span>
          </p>
          <Button onClick={onShowQr} className="mt-2">
            Show QR Code
          </Button>
        </>
      )}

      {isStreamConnected && status === "connected" && (
        <div className="flex flex-col items-center space-y-2">
          <div className="mb-2 flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="size-8 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-base font-medium">Ready to send messages</p>
          {!hasWebhookConfigured && (
            <p className="flex items-center gap-1.5 text-sm text-amber-600 dark:text-amber-400">
              <AlertTriangle className="size-4 shrink-0" />
              Webhook URL isn&apos;t configured
            </p>
          )}

          <AlertDialog
            open={isDisconnectDialogOpen}
            onOpenChange={onDisconnectDialogOpenChange}
          >
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="mt-2">
                <Unplug />
                Disconnect
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Disconnect this session?</AlertDialogTitle>
                <AlertDialogDescription>
                  This unlinks the device from WhatsApp and stops message
                  delivery. To use it again you&apos;ll need to reconnect and
                  scan a new QR code. The session itself isn&apos;t deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDisconnecting}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={(event) => {
                    event.preventDefault()
                    onDisconnect()
                  }}
                  disabled={isDisconnecting}
                  className="gap-2"
                >
                  {isDisconnecting ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Disconnecting...
                    </>
                  ) : (
                    "Disconnect"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {isStreamConnected && status === "disconnected" && (
        <>
          <XCircle className="mb-2 size-10 text-red-500" />
          <p className="text-sm text-muted-foreground">
            Status: <span className="font-medium text-red-500">Disconnected</span>
          </p>
          {disconnectReason && (
            <p className="max-w-xs text-center text-sm text-muted-foreground">
              {DISCONNECT_REASON_LABELS[disconnectReason]}
            </p>
          )}
          <Button
            onClick={onReconnect}
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
  )
}
