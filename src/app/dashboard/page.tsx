"use client";

import { PlusCircle } from "lucide-react"

import { SessionCard } from "@/components/blocks/session-card"
import { SessionGridGhost } from "@/components/blocks/session-grid-ghost"
import { TrialCard } from "@/components/blocks/trial-card"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { useSessions } from "@/hooks/use-sessions"
import { cn } from "@/lib/utils"

// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------

/** "in 3 days" / "tomorrow" / "today" from an ISO date, for the trial badge. */
function formatTrialEnds(trialEndsAt: string | null): string | null {
  if (!trialEndsAt) return null
  const end = new Date(trialEndsAt)
  if (Number.isNaN(end.getTime())) return null

  const msPerDay = 24 * 60 * 60 * 1000
  const days = Math.ceil((end.getTime() - Date.now()) / msPerDay)
  if (days < 0) return "trial expired"
  if (days === 0) return "trial ends today"
  if (days === 1) return "trial ends tomorrow"
  return `trial ends in ${days} days`
}

// -----------------------------------------------------------------------------
// COMPONENT
// -----------------------------------------------------------------------------

export default function DashboardPage() {
  const {
    sessions,
    billing,
    isLoading,
    isCreatingSession,
    createSession,
    deleteSession,
    openBillingPortal,
    subscribe
  } = useSessions()

  const used = sessions.length
  const isTrial = billing?.isTrial ?? false
  // Trial users keep their single session; adding more requires converting
  // first. But always show the Add card at zero sessions so a trial user who
  // deleted their only session can recreate it (their trial session is free).
  const showAddCard = !isLoading && (!isTrial || used === 0)
  const trialEndsLabel = isTrial ? formatTrialEnds(billing?.trialEndsAt ?? null) : null

  return (
    <div className="container mx-auto py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">WhatsApp Dashboard</h1>
          {isLoading && (
            <p className="text-sm text-muted-foreground mt-2" role="status" aria-live="polite">
              Loading your sessions…
            </p>
          )}
        </div>
      </div>

      <div className="grid items-stretch gap-8 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <SessionGridGhost />
        ) : (
          sessions.map((session) => (
            <SessionCard
              key={session.sessionId}
              sessionId={session.sessionId}
              isProvisioning={session.isProvisioning ?? false}
              webhookUrl={session.webhookUrl}
              apiKey={session.apiKey}
              apiKeyMasked={session.apiKeyMasked}
              onDelete={deleteSession}
              onManageBilling={() => void openBillingPortal()}
            />
          ))
        )}

        {!isLoading && isTrial && (
          <TrialCard
            trialEndsLabel={trialEndsLabel}
            onSubscribe={() => void subscribe()}
            onManageBilling={() => void openBillingPortal()}
          />
        )}

        {showAddCard && (
          <div className="flex h-full flex-col gap-2">
            {/* Spacer matches SessionCard chip row (h-7) so card bodies align */}
            <div className="h-7 shrink-0" aria-hidden />
            <button
              type="button"
              onClick={() => void createSession()}
              disabled={isCreatingSession}
              className={cn(
                "text-left flex-1 rounded-xl transition-all",
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
                      : used > 0
                        ? "Connect another WhatsApp number"
                        : "Connect a WhatsApp number"}
                  </CardDescription>
                </div>
              </CardContent>
            </Card>
          </button>
          </div>
        )}
      </div>
    </div>
  )
}
