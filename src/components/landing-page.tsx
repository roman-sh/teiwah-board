import { Background } from "@/components/background";
import { AiAutomation } from "@/components/blocks/ai-automation";
import { FAQ } from "@/components/blocks/faq";
import { Features } from "@/components/blocks/features";
import { Hero } from "@/components/blocks/hero";
import { N8nStarter } from "@/components/blocks/n8n-starter";
import { Pricing } from "@/components/blocks/pricing";
import { ResourceAllocation } from "@/components/blocks/resource-allocation";

export function LandingPage() {
  return (
    <>
      <Background className="via-muted to-muted/80">
        <Hero />
        <N8nStarter />
        <Features />
        <ResourceAllocation />
        <AiAutomation />
      </Background>
      <Background variant="bottom">
        <Pricing />
        <FAQ />
      </Background>
    </>
  );
}
