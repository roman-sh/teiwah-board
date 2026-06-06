import {
  Code2,
  Gauge,
  KeySquare,
  MessageSquareText,
  PlugZap,
  ShieldCheck,
} from "lucide-react";

import { DashedLine } from "../dashed-line";

import { Card, CardContent } from "@/components/ui/card";

const capabilities = [
  {
    title: "Send & receive text",
    description:
      "Deliver outbound messages with a single POST, and receive inbound replies straight to your webhook.",
    icon: MessageSquareText,
  },
  {
    title: "Works with your stack",
    description:
      "Anything that can call an HTTP endpoint works — Node, Python, n8n, Make, Zapier or a cron job.",
    icon: PlugZap,
  },
  {
    title: "Per-session API keys",
    description:
      "Each connected number has its own key, so you can scope and rotate access per number.",
    icon: KeySquare,
  },
  {
    title: "Simple JSON payloads",
    description:
      "No proprietary SDK. Clear request and response shapes you can read and test in minutes.",
    icon: Code2,
  },
  {
    title: "Live status dashboard",
    description:
      "Watch connection status and the QR pairing flow in real time from your dashboard.",
    icon: Gauge,
  },
  {
    title: "Keys stay yours",
    description:
      "We store only the last characters of each key for recognition — never the full secret in plain text.",
    icon: ShieldCheck,
  },
];

export const ResourceAllocation = () => {
  return (
    <section id="features" className="overflow-hidden pb-28 lg:pb-32">
      <div className="container">
        <h2 className="text-center text-3xl tracking-tight text-balance sm:text-4xl md:text-5xl lg:text-6xl">
          Everything you need to talk to WhatsApp
        </h2>
        <p className="text-muted-foreground mx-auto mt-5 max-w-2xl text-center leading-snug text-balance">
          Teiwah handles the connection, status and message plumbing so you can
          focus on what your app or bot actually does.
        </p>

        <div className="mt-8 md:mt-12 lg:mt-20">
          <DashedLine orientation="horizontal" className="scale-x-105" />

          <div className="grid gap-0 md:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((item) => {
              const Icon = item.icon;
              return (
                <Card
                  key={item.title}
                  className="rounded-none border-0 shadow-none"
                >
                  <CardContent className="flex flex-col gap-4 p-6 md:p-8">
                    <div className="bg-muted flex size-11 items-center justify-center rounded-xl">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-snug">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <DashedLine orientation="horizontal" className="scale-x-105" />
        </div>
      </div>
    </section>
  );
};
