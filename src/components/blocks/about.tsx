import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const About = () => {
  return (
    <section className="container mt-10 flex max-w-5xl flex-col-reverse gap-8 md:mt-14 md:gap-14 lg:mt-20 lg:flex-row lg:items-end">
      {/* Images Left - Text Right */}
      <div className="flex flex-col gap-8 lg:gap-16 xl:gap-20">
        <ImageSection
          images={[
            { src: "/about/1.webp", alt: "Working on Teiwah" },
            { src: "/about/2.webp", alt: "Developer workspace" },
          ]}
          className="xl:-translate-x-10"
        />

        <TextSection
          title="Who we are"
          paragraphs={[
            "Teiwah is an independent, bootstrapped product built and run from Israel. We started it to scratch our own itch: getting a WhatsApp number to talk to your code shouldn't take weeks of setup — or cost a small fortune every month.",
            "We keep the team and the product lean on purpose. Fewer features, done well, beats a sprawling platform you have to fight with. That focus is also what lets us keep the price low: we charge roughly what it costs to run, not what the market will bear.",
          ]}
        />
      </div>

      {/* Text Left - Images Right */}
      <div className="flex flex-col gap-8 lg:gap-16 xl:gap-20">
        <TextSection
          paragraphs={[
            "Our goal is simple: low-cost, low-friction access to WhatsApp for developers and automation builders. Connect a number, set a webhook, send a request — that's the whole product.",
            "We also shaped the API for the way AI agents work today: voice notes arrive ready to transcribe, generated media can be sent inline, and we infer what we can so you send only the essentials. One transparent price per number, and we never store your full API keys in plain text.",
          ]}
        />
        <ImageSection
          images={[
            { src: "/about/3.webp", alt: "Building reliable messaging" },
            { src: "/about/4.webp", alt: "Focused on developers" },
          ]}
          className="hidden lg:flex xl:translate-x-10"
        />
      </div>
    </section>
  );
};

export default About;

interface ImageSectionProps {
  images: { src: string; alt: string }[];
  className?: string;
}

export function ImageSection({ images, className }: ImageSectionProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {images.map((image, index) => (
        <div
          key={index}
          className="relative aspect-[2/1.5] overflow-hidden rounded-2xl"
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}

interface TextSectionProps {
  title?: string;
  paragraphs: string[];
  ctaButton?: {
    href: string;
    text: string;
  };
}

export function TextSection({
  title,
  paragraphs,
  ctaButton,
}: TextSectionProps) {
  return (
    <section className="flex-1 space-y-4 text-lg md:space-y-6">
      {title && <h2 className="text-foreground text-4xl">{title}</h2>}
      <div className="text-muted-foreground max-w-xl space-y-6">
        {paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
      {ctaButton && (
        <div className="mt-8">
          <Link href={ctaButton.href}>
            <Button size="lg">{ctaButton.text}</Button>
          </Link>
        </div>
      )}
    </section>
  );
}
