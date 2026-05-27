import * as z from "zod"

export const webhookFormSchema = z.object({
  webhookUrl: z.string().superRefine((val, ctx) => {
    if (!val.trim()) return

    const result = z.httpUrl().safeParse(val.trim())
    if (!result.success) {
      ctx.addIssue({
        code: "custom",
        message: "Please enter a valid URL."
      })
    }
  })
})

export type WebhookFormValues = z.infer<typeof webhookFormSchema>
