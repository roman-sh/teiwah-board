import Link from "next/link";

import { ArrowRight, ExternalLink } from "lucide-react";

export const TypeScriptSdk = () => {
  return (
    <div
      id="typescript-sdk"
      className="flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-white/10 px-5 py-4 md:px-8"
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-blue-500/15 font-mono text-xs font-semibold text-blue-300">
        TS
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-medium text-white/55">
          Prefer TypeScript?
        </span>
        <code className="font-mono text-xs text-green-300 sm:text-sm">
          npm install teiwah
        </code>
      </div>
      <div className="ml-auto flex items-center gap-4 text-xs font-medium text-white/70 sm:text-sm">
        <Link
          href="https://docs.teiwah.cloud/guides/typescript-sdk/"
          className="flex items-center gap-1.5 transition-colors hover:text-white"
        >
          SDK docs
          <ArrowRight className="size-3.5" />
        </Link>
        <Link
          href="https://www.npmjs.com/package/teiwah"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 transition-colors hover:text-white"
        >
          npm
          <ExternalLink className="size-3.5" />
        </Link>
      </div>
    </div>
  );
};
