"use client";

import { PlusCircle } from "lucide-react"

import { SessionCard } from "@/components/blocks/session-card"
import { SessionGridGhost } from "@/components/blocks/session-grid-ghost"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { useSessions } from "@/hooks/use-sessions"
import { cn } from "@/lib/utils"

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
            type="button"
            onClick={() => void createSession()}
            disabled={isCreatingSession}
            className={cn(
              "text-left h-full min-h-[380px] rounded-xl transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-60"
            )}
          >
            <Card
              className={cn(
                "h-full min-h-[380px] border-2 border-dashed shadow-sm",
                "bg-muted/10 text-muted-foreground hover:bg-muted/30 hover:text-foreground hover:border-primary/50",
                "flex flex-col items-center justify-center space-y-4 group"
              )}
            >
              <CardContent className="flex flex-col items-center justify-center space-y-4 pt-0">
                <div className="size-16 rounded-full bg-background border shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                  <PlusCircle className="size-8 text-primary" />
                </div>
                <div className="text-center">
                  <CardTitle className="text-lg">
                    {isCreatingSession ? "Creating Session..." : "Add New Session"}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {isCreatingSession
                      ? "Provisioning isolated container"
                      : "Connect another WhatsApp number"}
                  </CardDescription>
                </div>
              </CardContent>
            </Card>
          </button>
        )}
      </div>
    </div>
  )
}
