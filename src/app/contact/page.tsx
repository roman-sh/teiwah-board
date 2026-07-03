import React from "react";

import type { Metadata } from "next";

import { Background } from "@/components/background";
import Contact from "@/components/blocks/contact";
import { createPublicMetadata } from "@/lib/seo";

export const metadata: Metadata = createPublicMetadata({
  title: "Contact",
  description:
    "Contact Teiwah for questions about the WhatsApp messaging API, your account, billing, or technical support.",
  path: "/contact",
});

const Page = () => {
  return (
    <Background>
      <Contact />
    </Background>
  );
};

export default Page;
