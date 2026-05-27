import { useEffect, useRef, useState } from "react"
import { fetchEventSource } from "@microsoft/fetch-event-source"
import {
  LOCAL_TEST_USER_ID,
  SSE_RETRY_INTERVAL_MS,
  SESSION_EVENTS_URL
} from "@/constants/session"

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

export type BaileysStatus =
  | "starting"
  | "waiting_qr"
  | "authenticating"
  | "connected"
  | "disconnected"

// -----------------------------------------------------------------------------
// HOOK: The "Brain" for a single session's SSE connection
// -----------------------------------------------------------------------------

export function useSessionStream(sessionId: string, initialProvisioning: boolean) {
  // --- 1. STATE DEFINITIONS ---

  // The actual status emitted by the Baileys worker via SSE.
  const [status, setStatus] = useState<BaileysStatus | null>(null)

  // Local bridge state: true while infra is still spinning up (pod/route creation)
  const [isLocalProvisioning, setIsLocalProvisioning] = useState(initialProvisioning)

  // Data payloads from the SSE stream
  const [qr, setQr] = useState<string | null>(null)
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null)

  // Connection health tracking
  const [isStreamConnected, setIsStreamConnected] = useState(false)

  // Ref used to distinguish "still booting" from "stream dropped after working"
  const hasReceivedFirstMessageRef = useRef(false)

  // --- 2. SSE CONNECTION & RETRY LOGIC ---

  useEffect(() => {
    const streamUrl = SESSION_EVENTS_URL.replace("{SESSION_ID}", sessionId)
    const abortController = new AbortController()
    
    // Reset this on mount/remount so retries work correctly
    hasReceivedFirstMessageRef.current = false

    // Custom errors to control fetch-event-source retry behavior.
    class FatalSsePayloadError extends Error {}
    class RetriableSseError extends Error {}

    async function connectSSE() {
      await fetchEventSource(streamUrl, {
        method: "GET",
        headers: {
          "x-user-id": LOCAL_TEST_USER_ID
        },
        signal: abortController.signal,
        
        async onopen(response) {
          if (response.ok) {
            setIsStreamConnected(true)
            return
          }
          
          // CRITICAL: Traefik returns a 503 while the k3s Pod is booting up during session provisioning.
          // DO NOT remove or break this block, as we rely on the 503 to trigger fetch-event-source's 
          // automatic retry mechanism until the Pod passes its readiness probe.
          if (response.status === 503) {
            throw new RetriableSseError("Service Unavailable (Provisioning)")
          }
          
          throw new FatalSsePayloadError(`Failed to connect, status: ${response.status}`)
        },
        
        onmessage(event) {
          if (!event.data?.trim()) return

          const parsed = JSON.parse(event.data)
          const payload = (parsed.data || parsed) as Record<string, unknown>

          // Fail-fast on invalid payloads.
          if (!payload || typeof payload !== "object") {
            throw new FatalSsePayloadError("Invalid SSE payload shape")
          }

          // The moment we get our first usable SSE event, we know the pod is up
          // and Traefik routing is working. We end the local provisioning handoff.
          hasReceivedFirstMessageRef.current = true
          setIsLocalProvisioning(false)

          // Update state based on the payload
          if ("status" in payload && payload.status) {
            const nextStatus = payload.status as BaileysStatus
            setStatus(nextStatus)
          }
          if (payload.qr) {
            setQr(payload.qr as string)
          }
          if ("phoneNumber" in payload) {
            setPhoneNumber(payload.phoneNumber as string | null)
          }
        },
        
        onerror(err) {
          // If we threw a fatal error during message parsing, stop retrying.
          if (err instanceof FatalSsePayloadError) {
            throw err
          }

          setIsStreamConnected(false)

          // If we had already received messages, this is a real drop, not a startup retry.
          if (hasReceivedFirstMessageRef.current) {
            setStatus("disconnected")
          }

          // Fixed retry interval while infra catches up (e.g., 503s from Traefik)
          return SSE_RETRY_INTERVAL_MS
        }
      })
    }

    void connectSSE().catch((err) => {
      // Ignore aborts caused by unmounting
      if (abortController.signal.aborted) {
        return
      }
      console.warn(`SSE connection stopped for session ${sessionId}`, err)
      setIsStreamConnected(false)
    })

    // Cleanup: close the stream when the component unmounts
    return () => {
      abortController.abort()
    }
  }, [sessionId]) // We intentionally don't include initialProvisioning here so it doesn't reconnect

  // --- 3. RETURN DATA TO THE UI ---
  return {
    status,
    isLocalProvisioning,
    qr,
    phoneNumber,
    isStreamConnected
  }
}