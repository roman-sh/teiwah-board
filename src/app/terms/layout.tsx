import type { Metadata } from "next";

import { createPublicMetadata } from "@/lib/seo";

export const metadata: Metadata = createPublicMetadata({
  title: "Terms of Service",
  description:
    "Read the terms governing use of the Teiwah WhatsApp messaging API and dashboard.",
  path: "/terms",
});

export default function TermsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
