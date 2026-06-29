/**
 * useSessionStream — live SSE connection to a single Baileys worker pod.
 *
 * ONE HOOK INSTANCE PER SESSION CARD
 * ----------------------------------
 * Dashboard renders N SessionCards → N calls to useSessionStream(sessionId, …).
 * All state (status, qr, refs) is scoped to that hook instance — sessions never
 * share connection state.
 *
 * REQUEST PATH (production)
 * -------------------------
 *   Board → api.teiwah.cloud (Zuplo + Clerk JWT) → k3s.teiwah.cloud → Traefik → worker pod
 *
 * Local dev may point SESSION_STREAM_BASE_URL at Traefik directly (no Zuplo on SSE).
 *
 * PROVISIONING vs RECONNECT (the tricky part)
 * -------------------------------------------
 * After POST /sessions the k8s pod + ingress take time to become ready. Until then
 * Traefik/Zuplo respond with 503 (no backend) or 502 (route not ready). That is
 * normal — not a bug.
 *
 * We use hasReceivedFirstMessageRef to split two phases:
 *
 *   Phase A — booting (ref === false):
 *     • 502 / 503 → retriable (keep retrying until worker sends first SSE event)
 *     • UI shows "Provisioning…" / "Connecting…"
 *
 *   Phase B — worker has spoken (ref === true):
 *     • 502 on reconnect → fatal (pod probably gone, not "still starting")
 *     • Stream drops (Zuplo/proxy blip) → onerror reconnects with fresh JWT
 *     • We still want reconnects here for status changes, QR rotation, disconnect events
 *
 * fetch-event-source RETRY MECHANICS
 * ----------------------------------
 * • Throw RetriableSseError in onopen → library calls onerror → schedules retry (~1s default)
 * • Throw FatalSsePayloadError → library stops entirely
 * • onerror must NOT throw (except re-throw Fatal) or retries stop
 * • We do NOT return a custom interval — library default (~1000ms) is used
 *
 * CLERK JWT + authenticatedFetch
 * --------------------------------
 * Zuplo validates JWT on every /events request. Clerk session tokens live ~60 seconds.
 * fetch-event-source reuses the same request config across retries — if Authorization
 * were set once at connect time, long provisioning or reconnect would hit 401.
 * See lib/api.ts authenticatedFetch (fresh getToken() per fetch).
 *
 * CLOSING THE QR MODAL
 * --------------------
 * Does NOT touch this hook. Stream stays open. Any "stream dropped, reconnecting" log
 * around modal close is Zuplo/proxy timing — not caused by the modal.
 */

import { useEffect, useRef, useState } from "react"

import { useAuth } from "@clerk/nextjs"
import { fetchEventSource } from "@microsoft/fetch-event-source"

import {
  SESSION_EVENTS_PATH,
  SESSION_STREAM_BASE_URL
} from "@/constants/session"
import { authenticatedFetch } from "@/lib/api"

// Worker-reported lifecycle (mirrors nestwaileys SessionState.status)
export type BaileysStatus =
  | "starting"
  | "waiting_qr"
  | "authenticating"
  | "connected"
  | "disconnected"

/**
 * Why a disconnected session needs the user to act, vs. a transient drop the
 * worker recovers from on its own (mirrors nestwaileys SessionDisconnectReason).
 * Set on auth-invalidating closes (where Reconnect re-pairs) and on `manual`,
 * the user's own logout via the Disconnect button.
 */
export type SessionDisconnectReason =
  | "logged_out"
  | "forbidden"
  | "bad_session"
  | "restricted"
  | "manual"
  | "number_in_use"

export function useSessionStream(sessionId: string, initialProvisioning: boolean) {
  const { isLoaded, isSignedIn } = useAuth()

  // --- React state (per session) ---

  // Latest status from worker SSE payload
  const [status, setStatus] = useState<BaileysStatus | null>(null)

  // True while waiting for k8s pod + first SSE event. Seeded from POST /sessions
  // (isProvisioning) on create; on page refresh starts false until stream connects.
  const [isLocalProvisioning, setIsLocalProvisioning] = useState(initialProvisioning)

  const [qr, setQr] = useState<string | null>(null)
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null)

  // Why we're disconnected (set only on auth-invalidating closes); null while
  // connected/transient. Drives the disconnect reason text on the card.
  const [disconnectReason, setDisconnectReason] =
    useState<SessionDisconnectReason | null>(null)

  // True after HTTP 200 on the SSE connection. UI uses this with status:
  //   isStreamConnected && status === "waiting_qr" → show "Show QR Code" button
  //   !isStreamConnected → "Connecting…" (even if status is still waiting_qr in memory)
  const [isStreamConnected, setIsStreamConnected] = useState(false)

  // --- Refs (per session, survive re-renders, reset on effect remount) ---

  // Flips true on first valid onmessage — switches retry policy from Phase A to B
  const hasReceivedFirstMessageRef = useRef(false)

  // Dedupe console status logs when worker re-emits same status on reconnect
  const lastLoggedWorkerStatusRef = useRef<string | null>(null)

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      return
    }

    const streamUrl = `${SESSION_STREAM_BASE_URL}/${SESSION_EVENTS_PATH.replace("{SESSION_ID}", sessionId)}`
    const abortController = new AbortController()
    const tag = `[session ${sessionId}]`

    if (initialProvisioning) {
      console.info(`${tag} Provisioning started — waiting for worker pod…`)
    }

    hasReceivedFirstMessageRef.current = false
    lastLoggedWorkerStatusRef.current = null

    // Custom error classes — fetch-event-source uses throw type to decide retry vs stop
    class FatalSsePayloadError extends Error {}
    class RetriableSseError extends Error {}

    async function connectSSE() {
      await fetchEventSource(streamUrl, {
        method: "GET",
        signal: abortController.signal,

        // Must use authenticatedFetch, not static headers — see file header
        fetch: authenticatedFetch,

        async onopen(response) {
          if (response.ok) {
            setIsStreamConnected(true)
            console.info(`${tag} Event stream connected`)
            return
          }

          // Phase A only: infra still coming up after POST /sessions
          if (
            response.status === 503 ||
            (response.status === 502 && !hasReceivedFirstMessageRef.current)
          ) {
            // Browser Network tab will still show red 502/503 rows — that's the raw
            // fetch failing. This console.info is the human-readable counterpart.
            console.info(
              `${tag} Worker not ready (HTTP ${response.status}), retrying…`
            )
            throw new RetriableSseError("Service Unavailable (Provisioning)")
          }

          // Phase B 502, 401, 404, etc. — stop retrying
          throw new FatalSsePayloadError(`Failed to connect, status: ${response.status}`)
        },

        onmessage(event) {
          if (!event.data?.trim()) return

          const parsed = JSON.parse(event.data)
          // Worker wraps state as { data: SessionState }; tolerate bare object too
          const payload = (parsed.data || parsed) as Record<string, unknown>

          if (!payload || typeof payload !== "object") {
            throw new FatalSsePayloadError("Invalid SSE payload shape")
          }

          hasReceivedFirstMessageRef.current = true
          setIsLocalProvisioning(false)

          const workerStatus =
            "status" in payload && payload.status ? String(payload.status) : null

          if (workerStatus && workerStatus !== lastLoggedWorkerStatusRef.current) {
            lastLoggedWorkerStatusRef.current = workerStatus
            console.info(`${tag} Worker status: ${workerStatus}`)
          }

          if ("status" in payload && payload.status) {
            setStatus(payload.status as BaileysStatus)
          }
          if (payload.qr) {
            setQr(payload.qr as string)
          }
          if ("phoneNumber" in payload) {
            setPhoneNumber(payload.phoneNumber as string | null)
          }
          if ("disconnectReason" in payload) {
            setDisconnectReason(
              payload.disconnectReason as SessionDisconnectReason | null
            )
          }
        },

        onerror(err) {
          if (err instanceof FatalSsePayloadError) {
            throw err
          }

          setIsStreamConnected(false)

          // Phase B transient drop — fetch-event-source will retry (~1s).
          // Do not set status to disconnected here: worker may still be waiting_qr;
          // reconnect replays the real state. Forcing disconnected flashed pairing UI
          // and could close the onboarding modal.
          if (hasReceivedFirstMessageRef.current) {
            console.info(`${tag} Stream dropped, reconnecting…`)
          }

          // No return value → library uses default retry interval (~1000ms)
        }
      })
    }

    void connectSSE().catch((err) => {
      if (abortController.signal.aborted) {
        return
      }
      console.warn(`${tag} Event stream stopped:`, err)
      setIsStreamConnected(false)
    })

    return () => {
      abortController.abort()
    }
  }, [sessionId, isLoaded, isSignedIn, initialProvisioning])

  return {
    status,
    isLocalProvisioning,
    qr,
    phoneNumber,
    disconnectReason,
    isStreamConnected
  }
}
