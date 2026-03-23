# 🪜 Mantis

> Scaffold production-ready apps in seconds. No Docker. No slop. No AI garbage.

```bash
mantis new myapp
```

---

## What it does

Mantis drops a fully wired, production-ready project into your directory — Next.js frontend, FastAPI backend, Pocketbase for auth and DB, NixOS-first environment. Everything talking to everything. You write product code from line one.

No more spending 4 hours on boilerplate before you've built anything real.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router, TypeScript) |
| Backend | Python / FastAPI |
| Auth + DB | Pocketbase |
| Environment | NixOS (flakes, devShell) |

---

## Usage

```bash
# scaffold a new project
mantis new myapp

# then
cd myapp && nix develop
```

That's it.

---

## What you get

```
myapp/
├── frontend/     # Next.js app, ready to run
├── backend/      # FastAPI app, auth wired in
└── flake.nix     # Nix devShell covering everything
```

---

## Roadmap

- **v0.1** — Single stack, `mantis new`, works on NixOS and prod
- **v0.2** — Bug fixes, Nix hardening, zero-manual-step first run
- **v1+** — `mantis add payments`, `mantis add s3`, more auth platforms

---

## Philosophy

Templates are real working code — not template soup with markers and conditionals baked in. When you clone what Mantis generates, it runs. No setup ritual. No decoding what `{{#if auth}}` was supposed to mean.

Build fast. Ship honest software.

---
