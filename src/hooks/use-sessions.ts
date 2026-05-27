import { useEffect, useState } from "react"
import { fetchSessions, provisionSession, type DashboardSession } from "@/services/session.service"

// -----------------------------------------------------------------------------
// HOOK: The "Brain" for managing the list of sessions
// -----------------------------------------------------------------------------

export function useSessions() {
  // --- 1. STATE DEFINITIONS ---
  
  // Holds the list of sessions fetched from the Control App
  const [sessions, setSessions] = useState<DashboardSession[]>([])
  
  // Loading state for the initial page load
  const [isLoading, setIsLoading] = useState(true)
  
  // Loading state specifically for the "Add New Session" button
  const [isCreatingSession, setIsCreatingSession] = useState(false)

  // --- 2. DATA FETCHING ---

  useEffect(() => {
    async function loadSessions() {
      setIsLoading(true)
      try {
        const data = await fetchSessions()
        setSessions(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("Failed to load sessions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    void loadSessions()
  }, [])

  // --- 3. ACTIONS ---

  async function createSession() {
    setIsCreatingSession(true)
    try {
      const data = await provisionSession()

      if (data?.sessionId) {
        // Optimistically add the new session to the top of the UI list.
        // We set isProvisioning based on the backend response so the SessionCard
        // knows to show a loading spinner while it waits for the SSE stream to connect.
        setSessions((prev) => [
          {
            sessionId: data.sessionId,
            isProvisioning: data.status === "provisioning",
            createdAt: new Date().toISOString()
          },
          ...prev.filter((session) => session.sessionId !== data.sessionId)
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