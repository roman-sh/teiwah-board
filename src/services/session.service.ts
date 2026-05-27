import {
  LOCAL_TEST_USER_ID,
  SESSIONS_CREATE_URL,
  SESSIONS_LIST_URL
} from "@/constants/session"

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

export type DashboardSession = {
  sessionId: string
  createdAt?: string
  // UI-only flag to indicate this session was just created and is waiting for
  // Kubernetes to provision the worker pod.
  isProvisioning?: boolean
}

export type CreateSessionResponse = {
  sessionId: string
  status?: string
  message?: string
}

// -----------------------------------------------------------------------------
// API METHODS
// -----------------------------------------------------------------------------

/**
 * Fetches all existing sessions for the current user from the Control App.
 * This does NOT connect to the individual worker pods; it just gets the inventory.
 */
export async function fetchSessions(): Promise<DashboardSession[]> {
  const response = await fetch(SESSIONS_LIST_URL, {
    method: "GET",
    headers: {
      "x-user-id": LOCAL_TEST_USER_ID
    }
  })
  
  if (!response.ok) {
    throw new Error(`Failed to fetch sessions: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Asks the Control App to provision a new session.
 * The Control App will create a DB record and tell Kubernetes to spin up a pod.
 */
export async function provisionSession(): Promise<CreateSessionResponse> {
  const response = await fetch(SESSIONS_CREATE_URL, {
    method: "POST",
    headers: {
      "x-user-id": LOCAL_TEST_USER_ID
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to provision session: ${response.statusText}`)
  }

  return response.json()
}