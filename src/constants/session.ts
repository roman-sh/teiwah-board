// =============================================================================
// SESSION CONSTANTS
// =============================================================================
//
// Two base URLs — same paths, different backends:
//
//   CONTROL_APP_BASE_URL     → Zuplo → control.teiwah.cloud (NestJS)
//                              GET/POST /sessions, PATCH …/webhook
//
//   SESSION_STREAM_BASE_URL  → Zuplo → k3s/Traefik → worker pod (SSE)
//                              GET …/events  (QR, status, phone)
//
// Production: both often point at https://api.teiwah.cloud; Zuplo routes by path.
// Local dev:  stream may hit Traefik :8080 directly (no JWT) while control uses Zuplo.
// =============================================================================

// -----------------------------------------------------------------------------
// ENVIRONMENT VARIABLES
// -----------------------------------------------------------------------------

// Fail-fast: If these are missing, the app cannot function. We throw immediately
// on module load rather than failing silently later.
if (!process.env.NEXT_PUBLIC_CONTROL_APP_BASE_URL) throw new Error(
  "Missing required env var: NEXT_PUBLIC_CONTROL_APP_BASE_URL"
)

if (!process.env.NEXT_PUBLIC_SESSION_STREAM_BASE_URL) throw new Error(
  "Missing required env var: NEXT_PUBLIC_SESSION_STREAM_BASE_URL"
)

/**
 * Base URL for session management API calls (list, create, webhook).
 *
 * Production: https://api.teiwah.cloud (Cloudflare Worker → Zuplo → control).
 * Used as ky `prefix` in lib/api.ts — paths below are appended to this base.
 *
 * Set in .env.local for local dev; set in hosting env for production deploys.
 */
export const CONTROL_APP_BASE_URL: string =
  process.env.NEXT_PUBLIC_CONTROL_APP_BASE_URL

/**
 * Base URL for per-session worker SSE streams.
 *
 * Production: same as CONTROL_APP_BASE_URL once Zuplo routes /sessions/:id/events.
 * Local dev: often http://localhost:8080 (Traefik) while control goes via Zuplo.
 *
 * SSE cannot use ky (streaming) — build full URL:
 *   `${SESSION_STREAM_BASE_URL}/${SESSION_EVENTS_PATH.replace("{SESSION_ID}", id)}`
 */
export const SESSION_STREAM_BASE_URL: string =
  process.env.NEXT_PUBLIC_SESSION_STREAM_BASE_URL

// -----------------------------------------------------------------------------
// API PATHS
// -----------------------------------------------------------------------------
//
// Relative paths only — no host. Use with:
//   • lib/api.ts (ky client, prefix = CONTROL_APP_BASE_URL)
//   • Full URL for SSE (prefix = SESSION_STREAM_BASE_URL)
//
// For paths containing {SESSION_ID}, substitute at the call site:
//   SESSION_WEBHOOK_PATH.replace("{SESSION_ID}", sessionId)
// -----------------------------------------------------------------------------

/**
 * List and create sessions.
 *
 * Used for:
 *   GET  /sessions  — fetch all sessions for the authenticated user
 *   POST /sessions  — provision a new session (DB row + k8s pod)
 *
 * Called via session.service.ts → lib/api.ts.
 */
export const SESSIONS_PATH = "sessions"

/**
 * Create a license-scoped Freemius checkout (Subscribe / upgrade authorization).
 *
 * Used for POST /billing/checkout — backend resolves the license server-side and
 * returns overlay `settings`. Called via session.service.ts → lib/api.ts.
 */
export const BILLING_CHECKOUT_PATH = "billing/checkout"

/**
 * Fetch Freemius sandbox params ({ ctx, token }) for the client-built
 * new-purchase overlay. Returns `{ sandbox: null }` in production.
 *
 * Used for GET /billing/sandbox — dev/test only. Called via session.service.ts.
 */
export const BILLING_SANDBOX_PATH = "billing/sandbox"

/**
 * Save the user's inbound webhook URL for a session.
 *
 * Used for PATCH /sessions/:id/webhook.
 * Substitute {SESSION_ID} with the session id before calling api.patch().
 *
 * Example:
 *   api.patch(SESSION_WEBHOOK_PATH.replace("{SESSION_ID}", sessionId), { json: { webhookUrl } })
 */
export const SESSION_WEBHOOK_PATH = "sessions/{SESSION_ID}/webhook"

/**
 * Reveal the full session API key (fetched from Zuplo via control).
 *
 * Used for GET /sessions/:id/api-key.
 */
export const SESSION_API_KEY_PATH = "sessions/{SESSION_ID}/api-key"

/**
 * SSE stream for session status and QR code from the Baileys worker.
 *
 * GET /sessions/:id/events — long-lived text/event-stream.
 *
 * Not served by the control app. Traefik strips /sessions/:id prefix and forwards
 * to the per-session pod. Worker uses RxJS BehaviorSubject: emits current state
 * immediately on connect, then on every change (QR refresh, connected, etc.).
 *
 * Full URL: `${SESSION_STREAM_BASE_URL}/${SESSION_EVENTS_PATH.replace("{SESSION_ID}", id)}`
 * Wired in use-session-stream.ts via fetch-event-source + authenticatedFetch.
 */
export const SESSION_EVENTS_PATH = "sessions/{SESSION_ID}/events"
