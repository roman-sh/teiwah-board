import { Webhook } from "lucide-react";

import { DashedLine } from "../dashed-line";

import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    step: "01",
    title: "Create a session & scan the QR",
    description:
      "Add a session in your dashboard and scan the QR code with WhatsApp to link your number. Each session is one connected number.",
  },
  {
    step: "02",
    title: "Set your webhook URL",
    description:
      "Point the session at any URL. Every incoming message is forwarded there as a JSON POST your app or automation can act on.",
  },
  {
    step: "03",
    title: "Send messages over HTTP",
    description:
      "Use your per-session API key to POST to /messages. Wire it into your code, n8n, Make or any tool that can call an API.",
  },
];

export const Features = () => {
  return (
    <section id="how-it-works" className="pb-28 lg:pb-32">
      <div className="container">
        {/* Top dashed line with text */}
        <div className="relative flex items-center justify-center">
          <DashedLine className="text-muted-foreground" />
          <span className="bg-muted text-muted-foreground absolute px-3 font-mono text-sm font-medium tracking-wide max-md:hidden">
            CONNECT. CONFIGURE. SEND.
          </span>
        </div>

        {/* Content */}
        <div className="mx-auto mt-10 grid max-w-4xl items-center gap-3 md:gap-0 lg:mt-24 lg:grid-cols-2">
          <h2 className="text-2xl tracking-tight md:text-4xl lg:text-5xl">
            From zero to sending in minutes
          </h2>
          <p className="text-muted-foreground leading-snug">
            No business verification, no Meta app review, no SDKs to install.
            Connect a number you already own and start talking to it over HTTP.
          </p>
        </div>

        {/* Steps Card */}
        <Card className="mt-8 rounded-3xl md:mt-12 lg:mt-20">
          <CardContent className="flex p-0 max-md:flex-col">
            {steps.map((item, i) => (
              <div key={item.step} className="flex flex-1 max-md:flex-col">
                <div className="flex-1 p-6 md:p-8">
                  <div className="bg-muted text-muted-foreground flex size-11 items-center justify-center rounded-full font-mono text-sm font-semibold">
                    {item.step}
                  </div>
                  <h3 className="font-display mt-6 max-w-60 text-2xl leading-tight font-bold tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground mt-3 text-sm leading-snug">
                    {item.description}
                  </p>
                </div>
                {i < steps.length - 1 && (
                  <div className="relative hidden md:block">
                    <DashedLine orientation="vertical" />
                  </div>
                )}
                {i < steps.length - 1 && (
                  <div className="relative block md:hidden">
                    <DashedLine orientation="horizontal" />
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <p className="text-muted-foreground mt-6 flex items-center justify-center gap-2 text-center text-sm">
          <Webhook className="size-4" />
          Inbound messages arrive as JSON; outbound is a single authenticated
          POST.
        </p>
      </div>
    </section>
  );
};
