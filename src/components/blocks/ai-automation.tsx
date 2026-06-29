import { Braces, Mic, Minimize2, Wand2 } from "lucide-react";

import { DashedLine } from "../dashed-line";

import { Card, CardContent } from "@/components/ui/card";

const choices = [
  {
    title: "Voice notes, transcription-ready",
    description:
      "Incoming voice notes arrive as base64, already decoded. Feed them straight into speech-to-text — no extra download round-trip before your model can read them.",
    icon: Mic,
  },
  {
    title: "Send what your model generates",
    description:
      "Outbound messages accept base64, so an agent can send audio or an image it just generated inline — no uploading to a file host first.",
    icon: Wand2,
  },
  {
    title: "Only the essentials",
    description:
      "We infer mime types, filenames and addressing for you. Fewer required fields means fewer things for a model to get wrong.",
    icon: Minimize2,
  },
  {
    title: "Predictable JSON",
    description:
      "Clean, consistent request and response shapes a model can format reliably, with an explicit message type on every payload for easy routing.",
    icon: Braces,
  },
];

export const AiAutomation = () => {
  return (
    <section id="ai" className="pb-28 lg:pb-32">
      <div className="container max-w-5xl">
        <div className="relative flex items-center justify-center">
          <DashedLine className="text-muted-foreground" />
          <span className="bg-muted text-muted-foreground absolute px-3 font-mono text-sm font-medium tracking-wide max-md:hidden">
            BUILT FOR AI
          </span>
        </div>

        <div className="mx-auto mt-10 max-w-3xl text-center lg:mt-20">
          <h2 className="text-2xl tracking-tight md:text-4xl lg:text-5xl">
            Made for AI automation
          </h2>
          <p className="text-muted-foreground mx-auto mt-5 max-w-2xl leading-snug text-balance">
            Most messaging APIs were designed for humans clicking buttons. Teiwah
            is shaped around how AI agents and automations actually work — so your
            model spends its effort on the conversation, not on plumbing.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:mt-12 md:grid-cols-2 lg:mt-16">
          {choices.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title} className="rounded-2xl">
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
      </div>
    </section>
  );
};
