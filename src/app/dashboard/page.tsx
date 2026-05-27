"use client";

import { useEffect, useState } from "react"
import { SessionCard } from "@/components/blocks/session-card"
import {
  LOCAL_TEST_USER_ID,
  SESSIONS_CREATE_URL,
  SESSIONS_LIST_URL
} from "@/constants/session"
import { PlusCircle } from "lucide-react"

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

type DashboardSession = {
  sessionId: string
  webhookUrl?: string | null
  createdAt?: string
  isProvisioning?: boolean
}

// -----------------------------------------------------------------------------
// COMPONENT
// -----------------------------------------------------------------------------

export default function DashboardPage() {
  // --- 1. STATE ---
  
  // Holds the list of sessions fetched from the Control App
  const [sessions, setSessions] = useState<DashboardSession[]>([])
  
  // Loading state for the initial page load
  const [isLoading, setIsLoading] = useState(true)
  
  // Loading state specifically for the "Add New Session" button
  const [isCreatingSession, setIsCreatingSession] = useState(false)

  // --- 2. DATA FETCHING ---

  useEffect(() => {
    // Fetch all existing sessions for the current user from the Control App.
    // This does NOT connect to the individual worker pods; it just gets the inventory.
    async function loadSessions() {
      setIsLoading(true)
      try {
        const response = await fetch(SESSIONS_LIST_URL, {
          method: "GET",
          headers: {
            "x-user-id": LOCAL_TEST_USER_ID
          }
        })
        const data = (await response.json()) as DashboardSession[]
        setSessions(Array.isArray(data) ? data : [])
      } finally {
        setIsLoading(false)
      }
    }

    void loadSessions()
  }, [])

  // --- 3. ACTIONS ---

  async function handleCreateSession() {
    setIsCreatingSession(true)
    try {
      // Ask the Control App to provision a new session.
      // The Control App will create a DB record and tell Kubernetes to spin up a pod.
      const response = await fetch(SESSIONS_CREATE_URL, {
        method: "POST",
        headers: {
          "x-user-id": LOCAL_TEST_USER_ID
        }
      })

      const data = (await response.json()) as {
        sessionId: string
        status?: string
        message?: string
      }

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
    } finally {
      setIsCreatingSession(false)
    }
  }

  // --- 4. RENDER ---

  return (
    <div className="container mx-auto py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">WhatsApp Dashboard</h1>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="rounded-xl border bg-card text-card-foreground shadow h-full min-h-[280px] flex items-center justify-center text-muted-foreground">
            Loading sessions...
          </div>
        ) : (
          sessions.map((session) => (
            <SessionCard
              key={session.sessionId}
              sessionId={session.sessionId}
              isProvisioning={session.isProvisioning ?? false}
              webhookUrl={session.webhookUrl}
            />
          ))
        )}

        {/* "Create New Session" Card */}
        <button
          onClick={handleCreateSession}
          disabled={isCreatingSession}
          className="rounded-xl border-2 border-dashed bg-muted/10 text-muted-foreground hover:bg-muted/30 hover:text-foreground hover:border-primary/50 transition-all shadow-sm h-full min-h-[380px] flex flex-col items-center justify-center space-y-4 group disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <div className="w-16 h-16 rounded-full bg-background border shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
            <PlusCircle className="w-8 h-8 text-primary" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-lg text-foreground">
              {isCreatingSession ? "Creating Session..." : "Add New Session"}
            </h3>
            <p className="text-sm mt-1">
              {isCreatingSession
                ? "Provisioning isolated container"
                : "Connect another WhatsApp number"}
            </p>
          </div>
        </button>
      </div>
    </div>
  )
}
