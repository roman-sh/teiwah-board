import {
  BILLING_CHECKOUT_PATH,
  BILLING_PORTAL_PATH,
  BILLING_SANDBOX_PATH,
  SESSIONS_PATH,
  SESSION_API_KEY_PATH,
  SESSION_DELETE_PATH,
  SESSION_DISCONNECT_PATH,
  SESSION_RECONNECT_PATH
} from "@/constants/session"
import { api, CONTROL_SLOW_REQUEST_TIMEOUT_MS } from "@/lib/api"
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
  return api
    .post(SESSIONS_PATH, { timeout: CONTROL_SLOW_REQUEST_TIMEOUT_MS })
    .json<CreateSessionResponse>()
}

/** GET /sessions/:id/api-key — full key from Zuplo (not stored in DB). */
export async function fetchSessionApiKey(sessionId: string): Promise<SessionApiKeyResponse> {
  return api
    .get(SESSION_API_KEY_PATH.replace("{SESSION_ID}", sessionId))
    .json<SessionApiKeyResponse>()
}

/**
 * POST /sessions/:id/reconnect — ask the worker to re-initiate its connection
 * after a logout. Returns 202; the resulting QR/status arrives on the SSE stream.
 */
export async function reconnectSession(sessionId: string): Promise<{ ok: true }> {
  return api
    .post(SESSION_RECONNECT_PATH.replace("{SESSION_ID}", sessionId))
    .json<{ ok: true }>()
}

/**
 * POST /sessions/:id/disconnect — user-initiated logout: the worker unlinks the
 * device, wipes auth, and idles in `disconnected` (reason `manual`). Returns
 * 202; the new state arrives on the SSE stream, not this response.
 */
export async function disconnectSession(sessionId: string): Promise<{ ok: true }> {
  return api
    .post(SESSION_DISCONNECT_PATH.replace("{SESSION_ID}", sessionId))
    .json<{ ok: true }>()
}

/**
 * DELETE /sessions/:id — permanently tear down a session (worker pod, Zuplo
 * consumer, DB row). Does not touch billing; reducing paid slots is a separate
 * portal action. The caller updates local state on success.
 */
export async function deleteSession(
  sessionId: string
): Promise<{ success: boolean; message?: string }> {
  return api
    .delete(SESSION_DELETE_PATH.replace("{SESSION_ID}", sessionId), {
      timeout: CONTROL_SLOW_REQUEST_TIMEOUT_MS
    })
    .json<{ success: boolean; message?: string }>()
}

/**
 * GET /billing/portal — fetch a fresh Freemius customer-portal magic link for
 * the current user. The link is short-lived, so fetch it on demand (per click)
 * rather than caching it.
 */
export async function fetchPortalLink(): Promise<{ url: string }> {
  return api.get(BILLING_PORTAL_PATH).json<{ url: string }>()
}
