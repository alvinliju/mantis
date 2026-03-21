import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { GitBranchIcon, ArrowRightIcon } from "lucide-react";
import Link from "next/link";

const GITHUB = "https://github.com/alvinliju/mantis";

export function HeroSection() {
  return (
    <section className="mx-auto w-full max-w-5xl">
      {/* top radial glow */}
      <div
        aria-hidden="true"
        className="absolute inset-0 isolate hidden overflow-hidden contain-strict lg:block"
      >
        <div className="absolute inset-0 -top-14 isolate -z-10 bg-[radial-gradient(35%_80%_at_49%_0%,oklch(0.985_0_0_/_0.08),transparent)] contain-strict" />
      </div>

      <div className="relative flex flex-col items-center justify-center gap-5 pt-32 pb-28 text-center">
        {/* badge pill */}
        <a
          href={GITHUB}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "group mx-auto flex w-fit items-center gap-3 rounded-full border bg-card px-3 py-1 shadow",
            "fade-in slide-in-from-bottom-10 animate-in fill-mode-backwards transition-all delay-500 duration-500 ease-out",
          )}
        >
          <GitBranchIcon className="size-3 text-muted-foreground" />
          <span className="text-xs">v0.1 · open source · mit license</span>
          <span className="block h-5 border-l" />
          <ArrowRightIcon className="size-3 text-muted-foreground duration-150 ease-out group-hover:translate-x-1" />
        </a>

        {/* headline */}
        <h1
          className={cn(
            "fade-in slide-in-from-bottom-10 animate-in text-balance fill-mode-backwards text-center text-4xl font-bold tracking-tight delay-100 duration-500 ease-out md:text-5xl lg:text-6xl",
          )}
        >
          ship fast on infrastructure
          <br />
          you actually own
        </h1>

        {/* subline */}
        <p className="fade-in slide-in-from-bottom-10 mx-auto max-w-lg animate-in fill-mode-backwards text-center text-sm text-muted-foreground tracking-wide delay-200 duration-500 ease-out md:text-base">
          mantis wires next.js, fastapi, and pocketbase into a full-stack
          scaffold — auth, api, and tls included from day one.
          <br />
          no vercel. no railway. no $300 bill because someone left a tab open.
        </p>

        {/* terminal command */}
        <div className="fade-in slide-in-from-bottom-10 animate-in fill-mode-backwards delay-[250ms] duration-500 ease-out flex w-full max-w-sm items-center gap-3 rounded-sm border border-border bg-card px-5 py-3.5 text-sm font-mono">
          <span className="select-none text-muted-foreground/30">$</span>
          <span className="text-foreground">mantis new my-project</span>
        </div>

        {/* cta buttons */}
        <div className="fade-in slide-in-from-bottom-10 flex animate-in flex-row flex-wrap items-center justify-center gap-3 fill-mode-backwards pt-2 delay-300 duration-500 ease-out">
          <Link
            href="/login"
            className={cn(buttonVariants({ size: "lg" }), "rounded-sm font-mono")}
          >
            get started
          </Link>
          <a
            href={GITHUB}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "rounded-sm font-mono",
            )}
          >
            view source
          </a>
        </div>
      </div>
    </section>
  );
}
