"use client";

import { PlusCircle } from "lucide-react"

import { SessionCard } from "@/components/blocks/session-card"
import { SessionGridGhost } from "@/components/blocks/session-grid-ghost"
import { useSessions } from "@/hooks/use-sessions"

// -----------------------------------------------------------------------------
// COMPONENT
// -----------------------------------------------------------------------------

export default function DashboardPage() {
  // Session list + create logic lives in useSessions (fetch via lib/api.ts).
  const { sessions, isLoading, isCreatingSession, createSession } = useSessions()

  // --- RENDER ---

  return (
    <div className="container mx-auto py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">WhatsApp Dashboard</h1>
          {isLoading && (
            <p className="text-sm text-muted-foreground mt-2" role="status" aria-live="polite">
              Loading your sessions…
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <SessionGridGhost />
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

        {!isLoading && (
          <button
            onClick={() => void createSession()}
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
        )}
      </div>
    </div>
  )
}
