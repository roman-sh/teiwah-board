import { useEffect, useState } from "react"

import { useAuth } from "@clerk/nextjs"

import { fetchSessions, provisionSession, type DashboardSession } from "@/services/session.service"

/**
 * Session list + create for the dashboard.
 *
 * Create flow:
 *   1. POST /sessions via api (Zuplo → control → k8s pod + DB row)
 *   2. Append the new card to local state (no GET refetch) with isProvisioning: true
 *   3. SessionCard mounts useSessionStream(id, true) → SSE retries until worker ready
 *
 * Session order:
 *   GET /sessions returns rows sorted by createdAt ascending (oldest first).
 *   The dashboard renders in that order; new sessions are appended at the end.
 *
 * On page refresh, GET /sessions returns no isProvisioning flag — cards rely on SSE
 * alone to leave "Connecting…" state.
 */
export function useSessions() {
  const { isLoaded, isSignedIn } = useAuth()

  // --- 1. STATE DEFINITIONS ---
  
  // Holds the list of sessions fetched from the Control App
  const [sessions, setSessions] = useState<DashboardSession[]>([])
  
  // Loading state for the initial page load
  const [isLoading, setIsLoading] = useState(true)
  
  // Loading state specifically for the "Add New Session" button
  const [isCreatingSession, setIsCreatingSession] = useState(false)

  // --- 2. DATA FETCHING ---

  useEffect(() => {
    if (!isLoaded) {
      return
    }

    if (!isSignedIn) {
      setSessions([])
      setIsLoading(false)
      return
    }

    async function loadSessions() {
      setIsLoading(true)
      try {
        // Control App returns sessions sorted by createdAt asc — use as-is.
        const data = await fetchSessions()
        setSessions(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("Failed to load sessions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    void loadSessions()
  }, [isLoaded, isSignedIn])

  // --- 3. ACTIONS ---

  async function createSession() {
    setIsCreatingSession(true)
    try {
      const data = await provisionSession()

      if (data?.sessionId) {
        // POST succeeded — append to local state instead of refetching GET /sessions.
        // isProvisioning is UI-only (not returned by GET); it auto-opens the QR modal
        // for sessions created this visit. Append at end to match createdAt asc order.
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
      }
    } catch (error) {
      console.error("Failed to create session:", error)
    } finally {
      setIsCreatingSession(false)
    }
  }

  // --- 4. RETURN DATA & ACTIONS TO THE UI ---
  return {
    sessions,
    isLoading,
    isCreatingSession,
    createSession
  }
}