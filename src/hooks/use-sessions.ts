import { useCallback, useEffect, useState } from "react"

import { useAuth, useUser } from "@clerk/nextjs"
import { toast } from "sonner"

import { parseCreateSessionError } from "@/lib/billing-errors"
import {
  openLicenseScopedCheckout,
  openNewPurchaseCheckout
} from "@/lib/freemius-checkout"
import {
  fetchSandboxParams,
  fetchSessions,
  provisionSession,
  requestCheckout,
  type BillingBlock,
  type CreateSessionResponse,
  type DashboardSession
} from "@/services/session.service"

/**
 * Session list + create + billing for the dashboard.
 *
 * Create flow:
 *   1. POST /sessions via api (Zuplo → control → k8s pod + DB row)
 *   2. On success, append the new card (no GET refetch) with isProvisioning: true
 *   3. On 402, open the Freemius overlay; on overlay success, retry POST /sessions
 *
 * Billing block drives the dashboard buttons/labels; the POST /sessions gate
 * remains authoritative (a stale display just yields a 402 we then handle).
 */
export function useSessions() {
  const { isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()

  const [sessions, setSessions] = useState<DashboardSession[]>([])
  const [billing, setBilling] = useState<BillingBlock | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingSession, setIsCreatingSession] = useState(false)

  const loadSessions = useCallback(async () => {
    try {
      // Control App returns sessions sorted by createdAt asc — use as-is.
      const data = await fetchSessions()
      setSessions(data.sessions)
      setBilling(data.billing)
    } catch (error) {
      console.error("Failed to load sessions:", error)
    }
  }, [])

  useEffect(() => {
    if (!isLoaded) {
      return
    }

    if (!isSignedIn) {
      setSessions([])
      setBilling(null)
      setIsLoading(false)
      return
    }

    async function load() {
      setIsLoading(true)
      await loadSessions()
      setIsLoading(false)
    }

    void load()
  }, [isLoaded, isSignedIn, loadSessions])

  /** POST /sessions and append the new card. Returns true if a session was created. */
  const runProvision = useCallback(async (): Promise<boolean> => {
    const data: CreateSessionResponse = await provisionSession()

    if (data?.sessionId) {
      // Append to local state instead of refetching. isProvisioning is UI-only
      // (auto-opens the QR modal); append at end to match createdAt asc order.
      setSessions((prev) => [
        ...prev.filter((session) => session.sessionId !== data.sessionId),
        {
          sessionId: data.sessionId,
          apiKey: data.apiKey,
          apiKeyMasked: data.apiKeyMasked,
          isProvisioning: data.status === "provisioning",
          createdAt: new Date().toISOString()
        }
      ])
      return true
    }

    return false
  }, [])

  /**
   * Retry the create after the overlay reports success. The gate re-fetches live
   * quota, so this normally passes; if it still fails we surface it rather than
   * reopening the overlay (avoids a loop).
   */
  const retryAfterCheckout = useCallback(async () => {
    setIsCreatingSession(true)
    try {
      await runProvision()
    } catch (error) {
      const gate = await parseCreateSessionError(error)
      toast.error(
        gate.kind === "rate_limit" || gate.kind === "unavailable"
          ? gate.message
          : "Session couldn't be created after checkout. Please try again."
      )
    } finally {
      setIsCreatingSession(false)
    }
  }, [runProvision])

  /** Branch a failed create: open the right overlay (402) or toast (429/503). */
  const handleCreateError = useCallback(
    async (error: unknown) => {
      const gate = await parseCreateSessionError(error)

      switch (gate.kind) {
        case "checkout": {
          const onSuccess = () => {
            void retryAfterCheckout()
          }
          if (gate.settings) {
            openLicenseScopedCheckout(gate.settings, { onSuccess })
          } else {
            const email = user?.primaryEmailAddress?.emailAddress
            if (!email) {
              toast.error("Could not start checkout — no email on your account.")
              return
            }
            // New-purchase overlay is built client-side, so it needs the signed
            // sandbox params from the backend in dev (null in prod → live mode).
            const sandbox = await fetchSandboxParams()
            openNewPurchaseCheckout(email, { onSuccess, sandbox })
          }
          return
        }
        case "rate_limit":
        case "unavailable":
          toast.error(gate.message)
          return
        default:
          console.error("Failed to create session:", error)
          toast.error("Failed to create session. Please try again.")
      }
    },
    [user, retryAfterCheckout]
  )

  const createSession = useCallback(async () => {
    setIsCreatingSession(true)
    try {
      await runProvision()
    } catch (error) {
      await handleCreateError(error)
    } finally {
      setIsCreatingSession(false)
    }
  }, [runProvision, handleCreateError])

  /**
   * Trial → paid convert. Authorizes a license-scoped checkout at the current
   * quota (no new session); on overlay success, re-fetch so billing flips to paid.
   */
  const subscribe = useCallback(async () => {
    try {
      const { checkout } = await requestCheckout()
      openLicenseScopedCheckout(checkout.settings, {
        onSuccess: () => {
          void loadSessions()
        }
      })
    } catch (error) {
      console.error("Failed to start checkout:", error)
      toast.error("Couldn't start checkout. Please try again shortly.")
    }
  }, [loadSessions])

  return {
    sessions,
    billing,
    isLoading,
    isCreatingSession,
    createSession,
    subscribe
  }
}
