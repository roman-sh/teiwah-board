/**
 * Parse a POST /sessions failure into a structured gate outcome.
 *
 * ky throws HTTPError on non-2xx; the provision gate (BILLING.md §4.3) uses:
 *   - 402 → billing action needed. `checkout.settings` present → license-scoped
 *     overlay (upgrade / re-subscribe); absent (`{}`) → new-purchase overlay.
 *   - 429 → abuse cap (daily / concurrent).
 *   - 503 → Freemius unavailable; can't verify entitlement.
 * Anything else is unknown.
 */

import { HTTPError } from "ky"

import type { CheckoutSettings } from "@/lib/freemius-checkout"

export type CreateSessionGateError =
  | { kind: "checkout"; settings: CheckoutSettings | null }
  | { kind: "rate_limit"; message: string }
  | { kind: "unavailable"; message: string }
  | { kind: "unknown" }

type GateErrorBody = {
  message?: string
  checkout?: { settings?: CheckoutSettings }
}

export async function parseCreateSessionError(
  error: unknown
): Promise<CreateSessionGateError> {
  if (!(error instanceof HTTPError)) {
    return { kind: "unknown" }
  }

  const status = error.response.status
  let body: GateErrorBody = {}
  try {
    body = (await error.response.json()) as GateErrorBody
  } catch {
    // Non-JSON error body — fall through to status-only handling.
  }

  switch (status) {
    case 402:
      // checkout is a guaranteed field on a 402; settings present → upgrade,
      // absent → new purchase.
      return { kind: "checkout", settings: body.checkout?.settings ?? null }
    case 429:
      return {
        kind: "rate_limit",
        message: body.message ?? "You've reached your session limit. Try again later."
      }
    case 503:
      return {
        kind: "unavailable",
        message:
          body.message ??
          "Unable to verify your subscription right now. Please try again shortly."
      }
    default:
      return { kind: "unknown" }
  }
}
