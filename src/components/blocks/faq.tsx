import Link from "next/link";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export const faqCategories = [
  {
    title: "Getting started",
    questions: [
      {
        question: "What is Teiwah?",
        answer:
          "Teiwah is a WhatsApp messaging API. You connect a WhatsApp number to your account, and from then on you can send and receive messages over plain HTTP — no SDK required.",
      },
      {
        question: "Do I need the official WhatsApp Business API or Meta approval?",
        answer:
          "No. You connect a WhatsApp number you already control by scanning a QR code, the same way you would link WhatsApp Web. There is no business verification or app review step.",
      },
      {
        question: "Can I message people who haven't contacted me first?",
        answer:
          "No — Teiwah is reply-first. You can always reply to anyone who messages you, and you can post to groups, but you can't start a brand-new 1:1 conversation with someone who hasn't messaged you first. WhatsApp restricts cold outreach from non-official clients, so those sends are blocked to protect your number. If you need to message new numbers (marketing or notifications), that's what the official WhatsApp Business API is for.",
      },
      {
        question: "How do I connect a number?",
        answer:
          "Create a session in your dashboard, then scan the QR code with the WhatsApp app on your phone. The dashboard shows the connection status live. Each session represents one connected number.",
      },
    ],
  },
  {
    title: "Billing",
    questions: [
      {
        question: "How much does it cost?",
        answer:
          "Each session is $2.95 per month. A session is one connected WhatsApp number.",
      },
      {
        question: "How do I connect more than one number?",
        answer:
          "Increase the quantity at checkout. Each unit covers one additional session, billed at the same $2.95 per month. There are no annual plans or bundles.",
      },
      {
        question: "Can I cancel?",
        answer:
          "Yes. You can cancel at any time from the billing portal. Your sessions keep working until the end of the current billing period.",
      },
      {
        question: "Why is it so cheap?",
        answer:
          "We priced Teiwah at roughly what it costs us to run, not at what comparable tools tend to charge. The product is deliberately lean, so we can keep it affordable and still sustainable.",
      },
      {
        question: "Do you offer refunds?",
        answer:
          "See our Refund Policy for details on eligibility and how to request a refund.",
      },
    ],
  },
  {
    title: "Using the API",
    questions: [
      {
        question: "How do I send a message?",
        answer:
          "Send an authenticated POST to /messages with your per-session API key and a small JSON body: a chatId plus either a text string or a media object. That's the whole flow.",
      },
      {
        question: "How do I receive messages?",
        answer:
          "Set a webhook URL on your session. Every incoming message is forwarded to that URL as a JSON POST, so your app or automation can react to it.",
      },
      {
        question: "Is it good for AI and LLM workflows?",
        answer:
          "That's a core focus. Incoming voice notes are delivered as base64 so you can transcribe them with no extra download, outbound messages accept base64 so an agent can send media it just generated, and we infer fields like mime types for you — so there's less for a model to get right.",
      },
      {
        question: "Is Teiwah affiliated with WhatsApp or Meta?",
        answer:
          "No. Teiwah is an independent service and is not affiliated with, endorsed by, or sponsored by WhatsApp or Meta Platforms, Inc. You are responsible for using your number in line with WhatsApp's terms and applicable anti-spam laws.",
      },
    ],
  },
];

export const FAQ = ({
  headerTag = "h2",
  className,
  className2,
}: {
  headerTag?: "h1" | "h2";
  className?: string;
  className2?: string;
}) => {
  return (
    <section className={cn("py-28 lg:py-32", className)}>
      <div className="container max-w-5xl">
        <div className={cn("mx-auto grid gap-16 lg:grid-cols-2", className2)}>
          <div className="space-y-4">
            {headerTag === "h1" ? (
              <h1 className="text-2xl tracking-tight md:text-4xl lg:text-5xl">
                Got Questions?
              </h1>
            ) : (
              <h2 className="text-2xl tracking-tight md:text-4xl lg:text-5xl">
                Got Questions?
              </h2>
            )}
            <p className="text-muted-foreground max-w-md leading-snug lg:mx-auto">
              If you can't find what you're looking for,{" "}
              <Link href="/contact" className="underline underline-offset-4">
                get in touch
              </Link>
              .
            </p>
          </div>

          <div className="grid gap-6 text-start">
            {faqCategories.map((category, categoryIndex) => (
              <div key={category.title} className="">
                <h3 className="text-muted-foreground border-b py-4">
                  {category.title}
                </h3>
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((item, i) => (
                    <AccordionItem key={i} value={`${categoryIndex}-${i}`}>
                      <AccordionTrigger>{item.question}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
