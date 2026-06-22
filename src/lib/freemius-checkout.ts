/**
 * Freemius Overlay Checkout helpers (BILLING.md §7).
 *
 * Two ways the dashboard opens the overlay:
 *
 *   1. New purchase / trial — the user has no license yet. We open the overlay
 *      ourselves with the Clerk email and let Freemius present the trial. This
 *      is the `checkout: {}` branch of a POST /sessions 402.
 *
 *   2. License-scoped (upgrade / convert / re-subscribe) — the backend already
 *      authorized a checkout against the user's existing license and returned
 *      `settings` (a CheckoutOptions blob). We just open it. This is the
 *      `checkout: { settings }` branch of a 402, or the POST /billing/checkout
 *      response for the trial Subscribe CTA.
 *
 * The product id / public key are public (overlay SDK), so they live in
 * NEXT_PUBLIC_* env. The plan id is only needed for the new-purchase branch;
 * the license-scoped branch carries everything in `settings`.
 */

import { Checkout, type CheckoutOptions } from "@freemius/checkout"

function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required env var: ${name}`)
  }
  return value
}

const FREEMIUS_PRODUCT_ID = requireEnv(
  "NEXT_PUBLIC_FREEMIUS_PRODUCT_ID",
  process.env.NEXT_PUBLIC_FREEMIUS_PRODUCT_ID
)
const FREEMIUS_PUBLIC_KEY = requireEnv(
  "NEXT_PUBLIC_FREEMIUS_PUBLIC_KEY",
  process.env.NEXT_PUBLIC_FREEMIUS_PUBLIC_KEY
)
const FREEMIUS_PLAN_ID = requireEnv(
  "NEXT_PUBLIC_FREEMIUS_PLAN_ID",
  process.env.NEXT_PUBLIC_FREEMIUS_PLAN_ID
)

/** Overlay settings from the backend (FreemiusService.createLicenseScopedCheckout). */
export type CheckoutSettings = CheckoutOptions

/**
 * Signed sandbox params from the backend (GET /billing/sandbox). Only the
 * new-purchase overlay needs these passed in — license-scoped settings already
 * carry the sandbox flag. Null/omitted opens the overlay in live mode.
 */
export type SandboxParams = { ctx: string; token: string }

type OverlayCallbacks = {
  /** Fired after a successful purchase once the user closes the overlay. */
  onSuccess: () => void
}

/**
 * New-purchase / trial overlay — no existing license.
 *
 * `readonly_user` forces the purchase to use the Clerk email, so the Freemius
 * account carries that exact email and the provision gate's email→freemiusUserId
 * bind (retrieveByEmail) hits the right account on the next POST /sessions
 * (BILLING.md §3/§4.3).
 */
export function openNewPurchaseCheckout(
  email: string,
  { onSuccess, sandbox }: OverlayCallbacks & { sandbox?: SandboxParams | null }
): void {
  const handler = new Checkout({
    product_id: FREEMIUS_PRODUCT_ID,
    public_key: FREEMIUS_PUBLIC_KEY
  })

  void handler.open({
    plan_id: FREEMIUS_PLAN_ID,
    user_email: email,
    readonly_user: true,
    is_marketing_allowed: false,
    licenses: 1,
    // Open in trial mode so a user with no license starts the plan's configured
    // 7-day no-payment trial instead of being sent straight to a subscription
    // dialog. `true` defers to the plan's trial type (free / no payment method).
    trial: true,
    ...(sandbox ? { sandbox } : {}),
    success: () => onSuccess()
  })
}

/**
 * License-scoped overlay — open the backend-authorized `settings` as-is. Used
 * for upgrade (402 checkout.settings) and trial convert (POST /billing/checkout).
 * Freemius knows the license owner, so it skips email/name and prorates.
 */
export function openLicenseScopedCheckout(
  settings: CheckoutSettings,
  { onSuccess }: OverlayCallbacks
): void {
  const handler = new Checkout(settings)

  void handler.open({
    success: () => onSuccess()
  })
}
