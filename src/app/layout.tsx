import { Inter } from "next/font/google";
import localFont from "next/font/local";

import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";

import { Footer } from "@/components/blocks/footer";
import { Navbar } from "@/components/blocks/navbar";
import { ThemeProvider } from "@/components/theme-provider";
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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL),
  title: {
    default: "Teiwah — WhatsApp Messaging API for Developers & Automations",
    template: "%s | Teiwah",
  },
  description:
    "Teiwah is a simple WhatsApp messaging API. Connect a number by scanning a QR code, then send and receive messages over HTTP with webhooks. Built for developers, n8n, Make and no-code automations.",
  keywords: [
    "WhatsApp API",
    "WhatsApp messaging API",
    "send WhatsApp messages",
    "WhatsApp webhook",
    "WhatsApp automation",
    "n8n WhatsApp",
    "Make WhatsApp",
    "chatbot API",
    "messaging API",
    "developer API",
  ],
  authors: [{ name: "Teiwah" }],
  creator: "Teiwah",
  publisher: "Teiwah",
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon/favicon.ico", sizes: "48x48" },
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon/favicon.ico" },
    ],
    apple: [{ url: "/favicon/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: [{ url: "/favicon/favicon.ico" }],
  },
  openGraph: {
    title: "Teiwah — WhatsApp Messaging API",
    description:
      "Connect a WhatsApp number by scanning a QR code, then send and receive messages over HTTP with webhooks. Built for developers and automations.",
    siteName: "Teiwah",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <ClerkProvider
        afterSignOutUrl="/"
        localization={{
          signIn: {
            start: {
              subtitle:
                "Teiwah is in private beta. Please join the waitlist.",
            },
          },
        }}
      >
        <body className={`${dmSans.variable} ${inter.variable} antialiased`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <TooltipProvider>
              <Navbar />
              <main className="">{children}</main>
              <Footer />
            </TooltipProvider>
          </ThemeProvider>
          <Analytics />
        </body>
      </ClerkProvider>
    </html>
  );
}
