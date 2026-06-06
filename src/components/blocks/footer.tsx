import Link from "next/link";

import { Button } from "@/components/ui/button";

export function Footer() {
  const navigation = [
    { name: "Product", href: "/#how-it-works" },
    { name: "About", href: "/about" },
    { name: "Pricing", href: "/pricing" },
    { name: "FAQ", href: "/faq" },
    { name: "Contact", href: "/contact" },
  ];

  const legal = [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Refund Policy", href: "/refund" },
  ];

  return (
    <footer className="flex flex-col items-center gap-14 pt-28 lg:pt-32">
      <div className="container space-y-3 text-center">
        <h2 className="text-2xl tracking-tight md:text-4xl lg:text-5xl">
          Start sending WhatsApp messages today
        </h2>
        <p className="text-muted-foreground mx-auto max-w-xl leading-snug text-balance">
          Connect a number, grab your API key, and wire it into your code or
          automation in minutes. $2.95 per session, per month.
        </p>
        <div>
          <Button size="lg" className="mt-4" asChild>
            <Link href="/dashboard">Get started</Link>
          </Button>
        </div>
      </div>

      <nav className="container flex flex-col items-center gap-4">
        <ul className="flex flex-wrap items-center justify-center gap-6">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className="font-medium transition-opacity hover:opacity-75"
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
        <ul className="flex flex-wrap items-center justify-center gap-6">
          {legal.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className="text-muted-foreground text-sm transition-opacity hover:opacity-75"
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground/80 text-center text-xs">
          © {new Date().getFullYear()} Teiwah. Teiwah is an independent service
          and is not affiliated with, endorsed by, or sponsored by WhatsApp or
          Meta Platforms, Inc.
        </p>
      </nav>

      <div className="mt-10 w-full overflow-hidden md:mt-14 lg:mt-20">
        <div className="from-primary to-primary/10 bg-linear-to-b bg-clip-text text-center leading-none font-bold tracking-tighter text-transparent select-none">
          <span className="text-[22vw] lg:text-[20vw]">Teiwah</span>
        </div>
      </div>
    </footer>
  );
}
