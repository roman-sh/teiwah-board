import React from "react";

import { Background } from "@/components/background";
import { FAQ } from "@/components/blocks/faq";
import { Pricing } from "@/components/blocks/pricing";
import { DashedLine } from "@/components/dashed-line";

const Page = () => {
  return (
    <Background>
      <Pricing className="py-28 text-center lg:pt-44 lg:pb-16" />
      <DashedLine className="mx-auto max-w-xl" />
      <FAQ className="py-16 lg:py-28" />
    </Background>
  );
};

export default Page;
