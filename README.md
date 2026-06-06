# Teiwah Board

The Teiwah dashboard and marketing site — a Next.js 15 app for the Teiwah WhatsApp messaging API. It hosts the public site (home, pricing, FAQ, about, contact, legal) and the authenticated session dashboard.

Built on the shadcnblocks "Mainline" template (Next.js 15 App Router, Tailwind 4, shadcn/ui, Clerk auth).

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Copy the required variables into `.env.local`:

```bash
# Clerk auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard

# Public site URL (used for metadata/OG). Set to https://teiwah.cloud in production.
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Backend (control + per-session SSE), routed via api.teiwah.cloud
NEXT_PUBLIC_CONTROL_APP_BASE_URL=https://api.teiwah.cloud
NEXT_PUBLIC_SESSION_STREAM_BASE_URL=https://api.teiwah.cloud
```

## Public pages

- `/` — landing (hero, how-it-works, capabilities, pricing, FAQ)
- `/pricing` — single per-session plan ($2.95/session/month)
- `/faq`, `/about`, `/contact`
- `/privacy`, `/terms`, `/refund` — legal (MDX)
- `/dashboard` — authenticated session management (Clerk-protected)

## Build

```bash
npm run build
```

## Deployment

The app uses Clerk middleware and server actions. It deploys cleanly to Vercel. For Cloudflare, use the `@cloudflare/next-on-pages` (or OpenNext) adapter, since the App Router middleware and server actions need a Node/edge runtime adapter.
