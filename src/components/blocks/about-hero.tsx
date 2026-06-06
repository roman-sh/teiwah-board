import { DashedLine } from "@/components/dashed-line";

const facts = [
  {
    value: "$2.95",
    label: "Per session, per month",
  },
  {
    value: "QR",
    label: "Connect a number in seconds",
  },
  {
    value: "HTTP",
    label: "Send & receive with one API",
  },
  {
    value: "n8n & Make",
    label: "Drops into your automations",
  },
];

export function AboutHero() {
  return (
    <section className="">
      <div className="container flex max-w-5xl flex-col justify-between gap-8 md:gap-20 lg:flex-row lg:items-center lg:gap-24 xl:gap-24">
        <div className="flex-[1.5]">
          <h1 className="text-3xl tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
            WhatsApp messaging without the boilerplate
          </h1>

          <p className="text-muted-foreground mt-5 text-2xl md:text-3xl lg:text-4xl">
            Teiwah turns a WhatsApp number into a clean HTTP API.
          </p>

          <p className="text-muted-foreground mt-8 hidden max-w-lg space-y-6 text-lg text-balance md:block lg:mt-12">
            Wiring WhatsApp into an app or automation usually means business
            verification, app reviews and heavy SDKs. Teiwah takes a different
            path: connect a number you already own by scanning a QR code, then
            send and receive messages with a single endpoint and a webhook.
            <br />
            <br />
            It is built for developers and automation builders who just want a
            number that talks to their code. We keep the surface area small, the
            pricing simple, and your keys yours.
          </p>
        </div>

        <div
          className={`relative flex flex-1 flex-col justify-center gap-3 pt-10 lg:pt-0 lg:pl-10`}
        >
          <DashedLine
            orientation="vertical"
            className="absolute top-0 left-0 max-lg:hidden"
          />
          <DashedLine
            orientation="horizontal"
            className="absolute top-0 lg:hidden"
          />
          {facts.map((fact) => (
            <div key={fact.label} className="flex flex-col gap-1">
              <div className="font-display text-3xl tracking-wide md:text-4xl">
                {fact.value}
              </div>
              <div className="text-muted-foreground">{fact.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
