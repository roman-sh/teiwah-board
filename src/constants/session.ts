/** The mock user ID used for local development to bypass Clerk authentication. */
export const LOCAL_TEST_USER_ID = "local-test-user"

/**
 * How long fetch-event-source should wait before retrying a dropped connection
 * or a 503/404 from Traefik during pod startup.
 */
export const SSE_RETRY_INTERVAL_MS = 2000

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


// The Control App handles orchestration (creating sessions in DB, spinning up k3d pods).
export const CONTROL_APP_BASE_URL: string =
  process.env.NEXT_PUBLIC_CONTROL_APP_BASE_URL

// The Stream Base URL points to Traefik, which routes directly to the individual worker pods.
export const SESSION_STREAM_BASE_URL: string =
  process.env.NEXT_PUBLIC_SESSION_STREAM_BASE_URL

// -----------------------------------------------------------------------------
// URLS
// -----------------------------------------------------------------------------

/**
 * The URL for listing all sessions for the current user from the Control App.
 * Used for GET /sessions.
 */
export const SESSIONS_LIST_URL = `${CONTROL_APP_BASE_URL}/sessions`

/**
 * The URL for provisioning a new session via the Control App.
 * Used for POST /sessions. Creates a DB record and spins up a worker pod.
 */
export const SESSIONS_CREATE_URL = `${CONTROL_APP_BASE_URL}/sessions`

/**
 * The URL for connecting directly to a worker pod's SSE stream via Traefik.
 * Substitute `{SESSION_ID}` at the call site.
 */
export const SESSION_EVENTS_URL = `${SESSION_STREAM_BASE_URL}/sessions/{SESSION_ID}/events`

/**
 * The URL for submitting the user's webhook URL for incoming WhatsApp messages.
 * Substitute `{SESSION_ID}` at the call site.
 */
export const WEBHOOK_SUBMIT_URL = `${CONTROL_APP_BASE_URL}/sessions/{SESSION_ID}/webhook`
