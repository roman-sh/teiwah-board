import React from "react";

import Link from "next/link";

import { ContactForm } from "@/components/blocks/contact-form";
import { DashedLine } from "@/components/dashed-line";

const contactInfo = [
  {
    title: "Email us",
    content: (
      <div className="mt-3">
        <p className="">Support & general enquiries</p>
        <Link
          href="mailto:support@teiwah.cloud"
          className="text-muted-foreground hover:text-foreground"
        >
          support@teiwah.cloud
        </Link>
      </div>
    ),
  },
  {
    title: "Billing",
    content: (
      <div className="mt-3">
        <p className="">Payments are handled by our reseller</p>
        <Link
          href="mailto:support@teiwah.cloud"
          className="text-muted-foreground hover:text-foreground"
        >
          support@teiwah.cloud
        </Link>
      </div>
    ),
  },
  {
    title: "Location",
    content: <p className="text-muted-foreground mt-3">Israel</p>,
  },
];

export default function Contact() {
  return (
    <section className="py-28 lg:py-32 lg:pt-44">
      <div className="container max-w-2xl">
        <h1 className="text-center text-2xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
          Contact us
        </h1>
        <p className="text-muted-foreground mt-4 text-center leading-snug font-medium lg:mx-auto">
          Questions about Teiwah, your account, or billing? Email us or use the
          form below — we read every message.
        </p>

        <div className="mt-10 flex justify-between gap-8 max-sm:flex-col md:mt-14 lg:mt-20 lg:gap-12">
          {contactInfo.map((info, index) => (
            <div key={index}>
              <h2 className="font-medium">{info.title}</h2>
              {info.content}
            </div>
          ))}
        </div>

        <DashedLine className="my-12" />

        {/* Inquiry Form */}
        <div className="mx-auto">
          <h2 className="mb-4 text-lg font-semibold">Inquiries</h2>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
