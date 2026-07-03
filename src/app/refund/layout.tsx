import type { Metadata } from "next";

import { createPublicMetadata } from "@/lib/seo";

export const metadata: Metadata = createPublicMetadata({
  title: "Refund Policy",
  description:
    "Read the Teiwah refund policy, including eligibility and how to request a refund.",
  path: "/refund",
});

export default function RefundLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
