import { Inter } from "next/font/google";
import localFont from "next/font/local";

import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";

import { Footer } from "@/components/blocks/footer";
import { Navbar } from "@/components/blocks/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "@/styles/globals.css";

const dmSans = localFont({
  src: [
    {
      path: "../../fonts/dm-sans/DMSans-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../fonts/dm-sans/DMSans-Italic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../fonts/dm-sans/DMSans-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../fonts/dm-sans/DMSans-MediumItalic.ttf",
      weight: "500",
      style: "italic",
    },
    {
      path: "../../fonts/dm-sans/DMSans-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../fonts/dm-sans/DMSans-SemiBoldItalic.ttf",
      weight: "600",
      style: "italic",
    },
    {
      path: "../../fonts/dm-sans/DMSans-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../fonts/dm-sans/DMSans-BoldItalic.ttf",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-dm-sans",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

if (!process.env.NEXT_PUBLIC_APP_URL) {
  throw new Error("NEXT_PUBLIC_APP_URL environment variable is not defined");
}

const siteUrl = new URL(process.env.NEXT_PUBLIC_APP_URL);

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "Teiwah — WhatsApp Messaging API for Developers & Automations",
    template: "%s | Teiwah",
  },
  description:
    "Teiwah is a simple WhatsApp messaging API. Connect a number by scanning a QR code, then send and receive messages over HTTP with webhooks. Built for developers, n8n, Make and no-code automations.",
  authors: [{ name: "Teiwah" }],
  creator: "Teiwah",
  publisher: "Teiwah",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon/browser.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/favicon.png", sizes: "180x180", type: "image/png" },
    ],
    apple: [{ url: "/favicon/favicon.png", sizes: "180x180", type: "image/png" }],
    shortcut: [{ url: "/favicon/browser.png", type: "image/png" }],
  },
  openGraph: {
    title: "Teiwah — WhatsApp Messaging API",
    description:
      "Connect a WhatsApp number by scanning a QR code, then send and receive messages over HTTP with webhooks. Built for developers and automations.",
    siteName: "Teiwah",
    url: "/",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Teiwah — WhatsApp Messaging API",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Teiwah — WhatsApp Messaging API",
    description:
      "Connect a WhatsApp number by scanning a QR code, then send and receive messages over HTTP with webhooks. Built for developers and automations.",
    images: ["/og-image.jpg"],
  },
};

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl.origin}/#organization`,
    name: "Teiwah",
    url: siteUrl.origin,
    logo: `${siteUrl.origin}/favicon/favicon.png`,
    email: "support@teiwah.cloud",
  },
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${siteUrl.origin}/#software-application`,
    name: "Teiwah",
    url: siteUrl.origin,
    description:
      "A simple WhatsApp messaging API for sending and receiving messages over HTTP with webhooks.",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    provider: {
      "@id": `${siteUrl.origin}/#organization`,
    },
    offers: {
      "@type": "Offer",
      price: "2.95",
      priceCurrency: "USD",
      description: "Per connected WhatsApp session per month",
    },
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <ClerkProvider afterSignOutUrl="/">
        <body className={`${dmSans.variable} ${inter.variable} antialiased`}>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
            }}
          />
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <TooltipProvider>
              <Navbar />
              <main className="">{children}</main>
              <Footer />
            </TooltipProvider>
            <Toaster />
          </ThemeProvider>
          <Analytics />
        </body>
      </ClerkProvider>
    </html>
  );
}
