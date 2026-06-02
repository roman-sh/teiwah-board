"use client"

import { useState } from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  Check,
  CheckCircle2,
  CircleAlert,
  CircleHelp,
  Copy,
  Loader2,
  Settings2,
  X
} from "lucide-react"
import { useForm, useFormState, useWatch } from "react-hook-form"

import { INSET_WELL_CLASS } from "@/components/blocks/inset-well"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { SESSION_WEBHOOK_PATH } from "@/constants/session"
import { api } from "@/lib/api"
import {
  webhookFormSchema,
  type WebhookFormValues
} from "@/lib/webhook-schema"

type WebhookConfigFormProps = {
  sessionId: string
  initialWebhookUrl?: string | null
  onSaved?: (url: string) => void
}

export function WebhookConfigForm({
  sessionId,
  initialWebhookUrl,
  onSaved
}: WebhookConfigFormProps) {
  const [savedUrl, setSavedUrl] = useState(initialWebhookUrl?.trim() ?? "")
  const [saveState, setSaveState] = useState<"idle" | "error">("idle")
  const [copied, setCopied] = useState(false)
  const [isFieldFocused, setIsFieldFocused] = useState(false)

  const form = useForm<WebhookFormValues>({
    resolver: zodResolver(webhookFormSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      webhookUrl: initialWebhookUrl ?? ""
    }
  })

  const { isSubmitting, isValid } = useFormState({ control: form.control })
  const webhookUrl = useWatch({ control: form.control, name: "webhookUrl" }) ?? ""
  const trimmedWebhookUrl = webhookUrl.trim()
  const isEmpty = !trimmedWebhookUrl
  const isUnchanged = trimmedWebhookUrl === savedUrl
  const canSave = !isEmpty && isValid && !isUnchanged
  const showsSaved = isUnchanged && Boolean(savedUrl) && !isFieldFocused

  async function copyWebhookUrl(url: string) {
    await navigator.clipboard.writeText(url.trim())
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  async function onSubmit(values: WebhookFormValues) {
    const url = values.webhookUrl.trim()

    try {
      await api.patch(
        SESSION_WEBHOOK_PATH.replace("{SESSION_ID}", sessionId),
        { json: { webhookUrl: url } }
      )
    } catch {
      setSaveState("error")
      return
    }

    setSavedUrl(url)
    onSaved?.(url)
    setSaveState("idle")
    setIsFieldFocused(false)
  }

  return (
    <section className={INSET_WELL_CLASS}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <FormField
            control={form.control}
            name="webhookUrl"
            render={({ field }) => (
              <FormItem className="gap-1.5">
                <div className="flex items-center gap-1.5">
                  <Settings2 className="w-4 h-4 text-muted-foreground shrink-0" />
                  <FormLabel className="mb-0">Webhook URL</FormLabel>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-foreground"
                        aria-label="Webhook URL help"
                      >
                        <CircleHelp className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      When a WhatsApp message arrives for this session, Teiwah
                      forwards the message payload to this URL as an HTTP POST
                      request.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="text"
                      inputMode="url"
                      autoComplete="url"
                      className="pr-10"
                      {...field}
                      onFocus={() => setIsFieldFocused(true)}
                      onBlur={() => {
                        field.onBlur()
                        setIsFieldFocused(false)
                      }}
                      onChange={(event) => {
                        field.onChange(event)
                        setCopied(false)

                        if (saveState === "error") {
                          setSaveState("idle")
                        }
                      }}
                    />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          disabled={!field.value.trim()}
                          onClick={() => void copyWebhookUrl(field.value)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                          aria-label="Copy webhook URL"
                        >
                          {copied ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Copy URL</TooltipContent>
                    </Tooltip>
                  </div>
                </FormControl>
              </FormItem>
            )}
          />

          {saveState === "error" && (
            <Alert variant="destructive" className="relative pr-10">
              <CircleAlert />
              <AlertTitle>Failed to save webhook</AlertTitle>
              <AlertDescription>Please try again.</AlertDescription>
              <button
                type="button"
                onClick={() => setSaveState("idle")}
                className="absolute top-3 right-3 text-destructive hover:text-destructive/80"
                aria-label="Dismiss error"
              >
                <X className="w-4 h-4" />
              </button>
            </Alert>
          )}

          <Button
            type="submit"
            variant="outline"
            className="w-full bg-card hover:bg-accent/80"
            disabled={isSubmitting || !canSave}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" />
                Saving…
              </>
            ) : showsSaved ? (
              <>
                <CheckCircle2 />
                Saved
              </>
            ) : (
              "Save Webhook"
            )}
          </Button>
        </form>
      </Form>
    </section>
  )
}
