"use client"

import { useState } from "react"

import Image from "next/image"
import Link from "next/link"

import { Check, Copy, Download } from "lucide-react"

import { DashedLine } from "../dashed-line"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const WORKFLOW_URL =
  "https://docs.teiwah.cloud/workflows/teiwah-ai-agent.json"

export const N8nStarter = () => {
  const [copied, setCopied] = useState(false)

  async function copyWorkflowUrl() {
    await navigator.clipboard.writeText(WORKFLOW_URL)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <section id="n8n" className="pb-28 lg:pb-32">
      <div className="container max-w-5xl">
        <div className="relative flex items-center justify-center">
          <DashedLine className="text-muted-foreground" />
          <span className="bg-muted text-muted-foreground absolute px-3 font-mono text-sm font-medium tracking-wide max-md:hidden">
            IMPORT. CONNECT. RUN.
          </span>
        </div>

        <Card className="mt-10 overflow-hidden rounded-3xl lg:mt-20">
          <CardContent className="grid gap-0 p-0 lg:grid-cols-2">
            <div className="p-6 md:p-10">
              <Image
                src="/logos/n8n.svg"
                alt="n8n"
                width={48}
                height={24}
              />
              <h2 className="mt-6 text-2xl tracking-tight md:text-4xl">
                Start with a working n8n AI agent
              </h2>
              <p className="text-muted-foreground mt-4 leading-snug">
                Import a ready-made workflow with a webhook, OpenRouter model,
                conversation memory, and a Teiwah reply step. Add your two API
                credentials and connect its webhook URL to your session.
              </p>
            </div>

            <div className="bg-foreground/95 dark:bg-muted flex flex-col justify-center border-t border-white/10 p-6 lg:border-t-0 lg:border-l md:p-10">
              <p className="font-mono text-xs font-medium tracking-wide text-white/50 dark:text-muted-foreground">
                N8N · IMPORT FROM URL
              </p>
              <code className="mt-4 block break-all font-mono text-sm leading-relaxed text-green-300 dark:text-foreground">
                {WORKFLOW_URL}
              </code>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button type="button" onClick={() => void copyWorkflowUrl()}>
                  {copied ? <Check /> : <Copy />}
                  {copied ? "Copied" : "Copy import URL"}
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/workflows/teiwah-ai-agent.json">
                    Download workflow
                    <Download />
                  </Link>
                </Button>
              </div>
              <p className="sr-only" aria-live="polite">
                {copied ? "Workflow import URL copied" : ""}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
