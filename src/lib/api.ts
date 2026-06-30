/**
 * Authenticated HTTP clients for api.teiwah.cloud (Zuplo gateway).
 *
 * All control-plane calls (list/create sessions, webhook) go through `api` (ky).
 * SSE streams cannot use ky — see authenticatedFetch in use-session-stream.ts.
 *
 * CLERK JWT
 * ---------
 * Zuplo runs clerk-jwt-auth-inbound on protected routes. getToken() returns a
 * short-lived session JWT (~60s). Clerk refreshes it server-side; each getToken()
 * call returns a valid token for that moment.
 *
 * ky beforeRequest: fresh token on every REST call (POST /sessions, GET /sessions, …).
 *
 * SSE authenticatedFetch: fresh token on every fetch-event-source attempt including
 * provisioning retries and reconnects. Without this, retries after 60s get 401 from Zuplo.
 */

import { getToken } from "@clerk/nextjs"
import ky from "ky"

import { CONTROL_APP_BASE_URL } from "@/constants/session"

async function requireAuthToken(): Promise<string> {
  const token = await getToken()
  if (!token) {
    throw new Error("Not authenticated")
  }

  return token
}

/** REST client — prefix is CONTROL_APP_BASE_URL (api.teiwah.cloud in production). */
export const api = ky.create({
  prefix: CONTROL_APP_BASE_URL,
  hooks: {
    beforeRequest: [
      async ({ request }) => {
        const token = await requireAuthToken()
        request.headers.set("Authorization", `Bearer ${token}`)
      }
    ]
  }
})

/**
 * ky defaults to 10s. Provision/delete hit Zuplo + several remote k8s API calls
 * sequentially — easily exceeds that in local dev against the Hetzner cluster.
 */
export const CONTROL_SLOW_REQUEST_TIMEOUT_MS = 60_000

/**
 * Drop-in fetch() for @microsoft/fetch-event-source.
 *
 * Why not pass headers once via authHeaders()?
 * fetch-event-source calls fetch again on each retry/reconnect with the same init
 * object — a one-shot Authorization header goes stale when the Clerk JWT expires.
 */
export async function authenticatedFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const token = await requireAuthToken()
  const headers = new Headers(init?.headers)
  headers.set("Authorization", `Bearer ${token}`)
  return fetch(input, { ...init, headers })
}
