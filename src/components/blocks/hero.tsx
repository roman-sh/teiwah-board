import Link from "next/link";

import { ArrowRight, KeyRound, QrCode, Send, Webhook } from "lucide-react";

import { DashedLine } from "@/components/dashed-line";
import { Button } from "@/components/ui/button";

const features = [
  {
    title: "Connect by QR",
    description: "Scan a QR code once to link a WhatsApp number to your account.",
    icon: QrCode,
  },
  {
    title: "Per-session API key",
    description: "Every connected number gets its own key for sending messages.",
    icon: KeyRound,
  },
  {
    title: "Inbound webhooks",
    description: "Incoming messages are delivered to your URL as a simple JSON POST.",
    icon: Webhook,
  },
  {
    title: "Send over HTTP",
    description: "One POST request sends a WhatsApp message. No SDK required.",
    icon: Send,
  },
];

const codeSnippet = `curl https://api.teiwah.cloud/messages \\
  -H "Authorization: Bearer <your-session-key>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "chatId": "15551234567",
    "text": "Hello from Teiwah 👋"
  }'`;

export const Hero = () => {
  return (
    <section className="py-28 lg:py-32 lg:pt-44">
      <div className="container flex flex-col justify-between gap-8 md:gap-14 lg:flex-row lg:gap-20">
        {/* Left side - Main content */}
        <div className="flex-1">
          <h1 className="text-foreground max-w-160 text-3xl tracking-tight md:text-4xl lg:text-5xl">
            WhatsApp automation, made simple and affordable
          </h1>

          <p className="text-muted-foreground mt-5 max-w-xl text-lg md:text-2xl">
            Connect a WhatsApp number and send and receive messages over plain
            HTTP. Teiwah exists for one reason: low-cost, low-friction access to
            WhatsApp — for developers, no-code automations, and AI agents alike.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4 lg:flex-nowrap">
            <Button asChild>
              <Link href="/dashboard">Get started</Link>
            </Button>
            <Button
              variant="outline"
              className="from-background h-auto gap-2 bg-linear-to-r to-transparent shadow-md"
              asChild
            >
              <Link href="/pricing">
                View pricing
                <ArrowRight className="stroke-3" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Right side - Features */}
        <div className="relative flex flex-1 flex-col justify-center space-y-5 max-lg:pt-10 lg:pl-10">
          <DashedLine
            orientation="vertical"
            className="absolute top-0 left-0 max-lg:hidden"
          />
          <DashedLine
            orientation="horizontal"
            className="absolute top-0 lg:hidden"
          />
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="flex gap-2.5 lg:gap-5">
                <Icon className="text-foreground mt-1 size-4 shrink-0 lg:size-5" />
                <div>
                  <h2 className="font-text text-foreground font-semibold">
                    {feature.title}
                  </h2>
                  <p className="text-muted-foreground max-w-76 text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-12 md:mt-20 lg:container lg:mt-24">
        <div className="bg-foreground/95 dark:bg-muted relative overflow-hidden rounded-2xl shadow-lg max-lg:mx-6 max-lg:rounded-tr-none">
          <div className="flex items-center gap-2 border-b border-white/10 px-5 py-3.5">
            <span className="size-3 rounded-full bg-red-400/80" />
            <span className="size-3 rounded-full bg-yellow-400/80" />
            <span className="size-3 rounded-full bg-green-400/80" />
            <span className="ml-3 font-mono text-xs text-white/50">
              Send a message
            </span>
          </div>
          <pre className="overflow-x-auto p-5 font-mono text-xs leading-relaxed text-green-300 sm:text-sm md:p-8">
            <code>{codeSnippet}</code>
          </pre>
        </div>
      </div>
    </section>
  );
};
