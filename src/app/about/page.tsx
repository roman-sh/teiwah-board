import type { Metadata } from "next";

import { Background } from "@/components/background";
import About from "@/components/blocks/about";
import { AboutHero } from "@/components/blocks/about-hero";
import { createPublicMetadata } from "@/lib/seo";

export const metadata: Metadata = createPublicMetadata({
  title: "About",
  description:
    "Learn why Teiwah provides a lean, affordable WhatsApp messaging API for developers, automations, and AI agents.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <Background>
      <div className="py-28 lg:py-32 lg:pt-44">
        <AboutHero />
        <About />
      </div>
    </Background>
  );
}
