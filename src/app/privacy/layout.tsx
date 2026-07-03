import type { Metadata } from "next";

import { createPublicMetadata } from "@/lib/seo";

export const metadata: Metadata = createPublicMetadata({
  title: "Privacy Policy",
  description:
    "Read the Teiwah privacy policy and learn how information is collected, used, and protected.",
  path: "/privacy",
});

export default function PrivacyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
