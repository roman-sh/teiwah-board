const WORKFLOW_URL =
  "https://docs.teiwah.cloud/workflows/teiwah-ai-agent.json"

export async function GET() {
  const response = await fetch(WORKFLOW_URL, { cache: "no-store" })

  if (!response.ok) {
    return new Response("Workflow download is temporarily unavailable.", {
      status: 502,
    })
  }

  return new Response(await response.arrayBuffer(), {
    headers: {
      "Content-Disposition": 'attachment; filename="teiwah-ai-agent.json"',
      "Content-Type": "application/json; charset=utf-8",
    },
  })
}
