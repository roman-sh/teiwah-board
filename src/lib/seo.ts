import type { Metadata } from "next";

const socialImage = {
  url: "/og-image.jpg",
  width: 1200,
  height: 630,
  alt: "Teiwah — WhatsApp Messaging API",
};

export function createPublicMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: `/${string}` | "/";
}): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url: path,
      siteName: "Teiwah",
      type: "website",
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage.url],
    },
  };
}
