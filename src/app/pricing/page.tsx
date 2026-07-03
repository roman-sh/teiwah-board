import React from "react";

import type { Metadata } from "next";

import { Background } from "@/components/background";
import { FAQ } from "@/components/blocks/faq";
import { Pricing } from "@/components/blocks/pricing";
import { DashedLine } from "@/components/dashed-line";
import { createPublicMetadata } from "@/lib/seo";

export const metadata: Metadata = createPublicMetadata({
  title: "WhatsApp API Pricing",
  description:
    "Teiwah costs $2.95 per connected WhatsApp number per month. Send messages over HTTP, receive webhooks, and cancel anytime.",
  path: "/pricing",
});

const Page = () => {
  return (
    <Background>
      <Pricing className="py-28 text-center lg:pt-44 lg:pb-16" />
      <DashedLine className="mx-auto max-w-xl" />
      <FAQ className="py-16 lg:py-28" />
    </Background>
  );
};

export default Page;
