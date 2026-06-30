"use client"

import { Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

type TrialCardProps = {
  /** Human-readable trial countdown, e.g. "trial ends in 3 days". */
  trialEndsLabel?: string | null
  /** Start the Freemius checkout to convert the trial to a paid plan. */
  onSubscribe: () => void
  /** Open the Freemius portal to manage the subscription. */
  onManageBilling: () => void
}

/**
 * Account-level trial prompt shown beside the (single) session card. The trial
 * only ever allows one session, so this lives next to it rather than inside it.
 */
export function TrialCard({
  trialEndsLabel,
  onSubscribe,
  onManageBilling
}: TrialCardProps) {
  return (
    <div className="flex h-full flex-col gap-2">
      {/* Matches SessionCard chip row so both cards align and stretch equally. */}
      <div className="h-7 shrink-0" aria-hidden />

      <Card className="flex min-h-0 flex-1 flex-col justify-between gap-6 p-6 shadow">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="size-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-display text-base font-semibold leading-none tracking-tight">
                Free trial
              </p>
              <p className="mt-1.5 truncate text-sm text-muted-foreground first-letter:uppercase">
                {trialEndsLabel ?? "Trial active"}
              </p>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground">
            Your trial includes one WhatsApp session. Subscribe to keep your
            number connected after the trial ends and to add more sessions.
          </p>
        </div>

        <div className="space-y-2">
          <Button className="w-full" onClick={onSubscribe}>
            Subscribe
          </Button>
          <button
            type="button"
            onClick={onManageBilling}
            className="w-full text-center text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            Manage billing
          </button>
        </div>
      </Card>
    </div>
  )
}
