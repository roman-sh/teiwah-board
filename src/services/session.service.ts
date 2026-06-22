import {
  BILLING_CHECKOUT_PATH,
  BILLING_SANDBOX_PATH,
  SESSIONS_PATH,
  SESSION_API_KEY_PATH
} from "@/constants/session"
import { api } from "@/lib/api"
import type { CheckoutSettings, SandboxParams } from "@/lib/freemius-checkout"

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

export type DashboardSession = {
  sessionId: string
  phoneNumber?: string | null
  webhookUrl?: string | null
  apiKeyMasked?: string | null
  createdAt?: string
  /** Full key from POST /sessions — client-only, lost on refresh. */
  apiKey?: string | null
  // UI-only flag to indicate this session was just created and is waiting for
  // Kubernetes to provision the worker pod.
  isProvisioning?: boolean
}

export type CreateSessionResponse = {
  sessionId: string
  apiKey?: string
  apiKeyMasked?: string
  status?: string
  message?: string
}

export type SessionApiKeyResponse = {
  apiKey: string
}

/**
 * Live per-user billing block (BILLING.md §7). `null` when Freemius is
 * unavailable — the grid still renders from the `sessions` array. `used` is not
 * sent; derive it from `sessions.length`.
 */
export type BillingBlock = {
  quota: number
  isTrial: boolean
  trialEndsAt: string | null
}

/** GET /sessions response — sessions always present, billing may be null. */
export type SessionsResponse = {
  sessions: DashboardSession[]
  billing: BillingBlock | null
}

/** POST /billing/checkout response — license-scoped overlay settings. */
export type CheckoutResponse = {
  checkout: { settings: CheckoutSettings }
}

// -----------------------------------------------------------------------------
// API METHODS
// -----------------------------------------------------------------------------

/**
 * Fetches all existing sessions for the current user from the Control App.
 * This does NOT connect to the individual worker pods; it just gets the inventory.
 */
export async function fetchSessions(): Promise<SessionsResponse> {
  return api.get(SESSIONS_PATH).json<SessionsResponse>()
}

/**
 * Asks the Control App to authorize a license-scoped Freemius checkout for the
 * current user (trial Subscribe / convert). Omits `quota` to stay at the current
 * seat count. Returns overlay `settings` to open with @freemius/checkout.
 */
export async function requestCheckout(): Promise<CheckoutResponse> {
  return api.post(BILLING_CHECKOUT_PATH, { json: {} }).json<CheckoutResponse>()
}

/**
 * Fetches Freemius sandbox params for the client-built new-purchase overlay.
 *
 * Short-circuits to null in production (the overlay opens live) so we never even
 * hit the endpoint there; outside production the backend returns `{ ctx, token }`
 * to put the overlay in sandbox/test mode.
 */
export async function fetchSandboxParams(): Promise<SandboxParams | null> {
  if (process.env.NODE_ENV === "production") return null
  const { sandbox } = await api
    .get(BILLING_SANDBOX_PATH)
    .json<{ sandbox: SandboxParams | null }>()
  return sandbox
}

/**
 * Asks the Control App to provision a new session.
 * The Control App will create a DB record and tell Kubernetes to spin up a pod.
 */
export async function provisionSession(): Promise<CreateSessionResponse> {
  return api.post(SESSIONS_PATH).json<CreateSessionResponse>()
}

/** GET /sessions/:id/api-key — full key from Zuplo (not stored in DB). */
export async function fetchSessionApiKey(sessionId: string): Promise<SessionApiKeyResponse> {
  return api
    .get(SESSION_API_KEY_PATH.replace("{SESSION_ID}", sessionId))
    .json<SessionApiKeyResponse>()
}
