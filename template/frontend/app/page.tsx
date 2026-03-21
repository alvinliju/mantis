"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const GITHUB = "https://github.com/alvinliju/mantis";

const FEATURES = [
  { title: "full-stack scaffold",    desc: "next.js, fastapi, and pocketbase wired together. auth, api, and frontend connected from day one — not stubs." },
  { title: "reproducible dev env",   desc: "nix flake pins every tool at exact versions. identical shell on every machine. no setup docs." },
  { title: "one-command deploy",     desc: "ssh into any debian vps. the script installs, starts, and wires everything. caddy provisions tls." },
  { title: "built-in auth",          desc: "pocketbase handles user management, oauth2, and google sign-in. admin ui included." },
  { title: "your data, your server", desc: "sqlite on hardware you control. no managed database fee. no egress charges. no cold storage tier." },
  { title: "no platform bill",       desc: "hetzner cx22 is $5/month. that's your entire backend. no function timeouts. no surprise invoices." },
];

const STEPS = [
  { n: "01", cmd: "mantis new my-project", title: "scaffold",  body: "generates a working monorepo — frontend, backend, and database wired together with env vars, types, and auth pre-connected." },
  { n: "02", cmd: "nix develop",           title: "develop",   body: "drops you into a shell with python, node, pocketbase, and caddy at pinned versions. same environment on every machine, always." },
  { n: "03", cmd: "mantis deploy",         title: "ship",      body: "ssh into any debian box. installs, starts, and wires everything. caddy provisions tls. your app is live." },
];

const STACK = [
  { layer: "frontend", choice: "next.js 15",  note: "app router, standalone output" },
  { layer: "backend",  choice: "fastapi",     note: "async python" },
  { layer: "database", choice: "pocketbase",  note: "sqlite + auth ui + admin" },
  { layer: "dev env",  choice: "nix flake",   note: "reproducible, pinned versions" },
  { layer: "deploy",   choice: "any vps",     note: "$5/month hetzner cx22" },
  { layer: "proxy",    choice: "caddy",       note: "automatic tls" },
];

const PHILOSOPHY = [
  { quote: "lichess serves a hundred million games a month on three servers. it beats chess.com on every feature. you do not need kubernetes.", attr: "on complexity" },
  { quote: "kamal proved ssh and a thoughtful deploy script beats any paas. the simplicity was always there. someone just had to choose it.", attr: "on deployment" },
  { quote: "your dev environment should be identical to production. not aspirationally — literally. nix makes this a fact, not a goal.", attr: "on reproducibility" },
  { quote: "you should be able to read every line between your idea and the running server. if you can't, someone else is in control.", attr: "on ownership" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-mono text-foreground antialiased">

      {/* ── nav ── */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-12 max-w-2xl items-center justify-between px-6">
          <span className="text-sm font-bold">mantis</span>
          <nav className="flex items-center gap-4">
            <a
              href={GITHUB}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              github
            </a>
            <Link
              href="/login"
              className={cn(buttonVariants({ size: "sm" }), "rounded-sm font-mono text-xs")}
            >
              get started
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6">

        {/* ── hero ── */}
        <section className="py-20">
          <p className="text-xs text-muted-foreground mb-6">v0.1 · open source · mit license</p>

          <h1 className="text-2xl font-bold leading-snug tracking-tight">
            full-stack scaffold for
            <br />
            people who own their servers.
          </h1>

          <p className="mt-6 text-sm leading-relaxed text-muted-foreground max-w-prose">
            mantis wires next.js, fastapi, and pocketbase into a working
            application — auth, api, and tls included from day one. deploy
            to any $5 debian vps with a single command. no vercel. no docker.
            no $300 bill because someone left a tab open.
          </p>

          <div className="mt-8 inline-flex items-center gap-3 border border-border bg-card px-4 py-2.5 text-sm">
            <span className="select-none text-muted-foreground/30">$</span>
            <span>mantis new my-project</span>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <Link
              href="/login"
              className={cn(buttonVariants({ size: "sm" }), "rounded-sm font-mono")}
            >
              get started
            </Link>
            <a
              href={GITHUB}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-sm font-mono")}
            >
              view source
            </a>
          </div>
        </section>

        {/* ── features ── */}
        <section className="border-t border-border py-14">
          <p className="mb-8 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            what you get
          </p>
          <dl className="space-y-5">
            {FEATURES.map(({ title, desc }) => (
              <div key={title} className="grid gap-1 sm:grid-cols-[200px_1fr] sm:gap-6">
                <dt className="text-sm text-foreground">{title}</dt>
                <dd className="text-sm text-muted-foreground leading-relaxed">{desc}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ── how it works ── */}
        <section className="border-t border-border py-14">
          <p className="mb-8 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            how it works
          </p>
          <div className="space-y-10">
            {STEPS.map(({ n, cmd, title, body }) => (
              <div key={n}>
                <p className="mb-3 text-xs text-muted-foreground/50">{n} — {title}</p>
                <div className="inline-flex items-center gap-3 border border-border bg-card px-4 py-2 text-sm mb-3">
                  <span className="select-none text-muted-foreground/30">$</span>
                  <span>{cmd}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── stack ── */}
        <section className="border-t border-border py-14">
          <p className="mb-8 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            the stack
          </p>
          <div className="space-y-3">
            {STACK.map(({ layer, choice, note }) => (
              <div key={layer} className="grid grid-cols-[72px_120px_1fr] gap-4 text-sm items-baseline">
                <span className="text-xs text-muted-foreground/50">{layer}</span>
                <span className="text-foreground">{choice}</span>
                <span className="text-xs text-muted-foreground">{note}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── philosophy ── */}
        <section className="border-t border-border py-14">
          <p className="mb-8 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            why
          </p>
          <div className="space-y-8">
            {PHILOSOPHY.map(({ quote, attr }) => (
              <div key={attr} className="border-l-2 border-border pl-5">
                <p className="text-sm text-muted-foreground leading-relaxed">"{quote}"</p>
                <p className="mt-2 text-xs text-muted-foreground/40">{attr}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── cta ── */}
        <section className="border-t border-border py-14">
          <p className="text-sm text-muted-foreground mb-6">
            ten minutes from now you could have a full-stack application
            running on hardware you control.
          </p>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className={cn(buttonVariants({ size: "sm" }), "rounded-sm font-mono")}
            >
              get started
            </Link>
            <a
              href={GITHUB}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-sm font-mono")}
            >
              github
            </a>
          </div>
        </section>

      </main>

      {/* ── footer ── */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-6 py-4">
          <span className="text-xs text-muted-foreground">mit license · built in kerala, india</span>
          <a
            href={GITHUB}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
          >
            github.com/alvinliju/mantis
          </a>
        </div>
      </footer>

    </div>
  );
}
