import React from "react";

import type { Metadata } from "next";

import { Background } from "@/components/background";
import { FAQ, faqCategories } from "@/components/blocks/faq";
import { createPublicMetadata } from "@/lib/seo";

export const metadata: Metadata = createPublicMetadata({
  title: "WhatsApp API FAQ",
  description:
    "Answers about connecting WhatsApp, sending and receiving messages, webhooks, billing, restrictions, and using Teiwah with AI workflows.",
  path: "/faq",
});

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqCategories.flatMap((category) =>
    category.questions.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  ),
};

const Page = () => {
  return (
    <Background>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqStructuredData).replace(/</g, "\\u003c"),
        }}
      />
      <FAQ
        className="py-28 text-center lg:pt-44 lg:pb-32"
        className2="max-w-xl lg:grid-cols-1"
        headerTag="h1"
      />
    </Background>
  );
};

export default Page;
