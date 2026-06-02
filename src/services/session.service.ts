import { SESSIONS_PATH, SESSION_API_KEY_PATH } from "@/constants/session"
import { api } from "@/lib/api"

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

// -----------------------------------------------------------------------------
// API METHODS
// -----------------------------------------------------------------------------

/**
 * Fetches all existing sessions for the current user from the Control App.
 * This does NOT connect to the individual worker pods; it just gets the inventory.
 */
export async function fetchSessions(): Promise<DashboardSession[]> {
  return api.get(SESSIONS_PATH).json<DashboardSession[]>()
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
