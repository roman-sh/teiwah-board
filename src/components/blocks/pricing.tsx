import Link from "next/link";

import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const features = [
  "One connected WhatsApp number per session",
  "Send messages over HTTP",
  "Inbound messages delivered to your webhook",
  "Your own per-session API key",
  "Live connection & QR status dashboard",
  "Cancel anytime",
];

export const Pricing = ({ className }: { className?: string }) => {
  return (
    <section className={cn("py-28 lg:py-32", className)}>
      <div className="container max-w-3xl">
        <div className="space-y-4 text-center">
          <h2 className="text-2xl tracking-tight md:text-4xl lg:text-5xl">
            Simple, per-session pricing
          </h2>
          <p className="text-muted-foreground mx-auto max-w-xl leading-snug text-balance">
            One price per connected number. Need more numbers? Just increase the
            quantity at checkout. No annual contracts, no bundles.
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-md md:mt-12 lg:mt-16">
          <Card className="outline-primary outline-4">
            <CardContent className="flex flex-col gap-7 px-6 py-8">
              <div className="space-y-2">
                <h3 className="text-foreground font-semibold">Session</h3>
                <div className="flex items-end gap-1">
                  <span className="text-foreground text-4xl font-semibold tracking-tight">
                    $2.95
                  </span>
                  <span className="text-muted-foreground pb-1">
                    per session / month
                  </span>
                </div>
                <p className="text-muted-foreground text-sm">
                  Billed monthly. Add more sessions by increasing the quantity.
                </p>
              </div>

              <div className="space-y-3">
                {features.map((feature) => (
                  <div
                    key={feature}
                    className="text-muted-foreground flex items-center gap-1.5"
                  >
                    <Check className="size-5 shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <Button className="w-full" asChild>
                <Link href="/dashboard">Get started</Link>
              </Button>
            </CardContent>
          </Card>

          <p className="text-muted-foreground mt-6 text-center text-sm">
            Prices in USD. Taxes may apply at checkout depending on your
            location.
          </p>
        </div>
      </div>
    </section>
  );
};
