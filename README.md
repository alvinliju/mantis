# Mantis

Scaffold production-ready apps in seconds. No Docker. No slop.

```bash
mantis new myapp
```

---

## What it does

Mantis generates a fully wired, production-ready project — a Ruby on Rails app with Hotwire, React sprinkles, and Pocketbase for auth and database. NixOS flakes as the dev environment. You write product code from line one.

---

## Stack

| Layer | Technology |
|---|---|
| Web framework | Ruby on Rails 8 |
| Interactivity | Hotwire (Turbo + Stimulus) |
| React islands | Vite + React (via vite_rails) |
| UI components | shadcn-style (Button, Card, Badge, Input) |
| Styling | Tailwind v4 |
| Auth + DB | Pocketbase |
| Environment | NixOS (flakes, devShell) |

---

## Usage

```bash
mantis new myapp
cd myapp
nix develop
cd rails && bundle install
cd rails && npm install
cd rails && bin/rails db:create db:migrate
cd rails && bin/dev
```

---

## What you get

```
myapp/
├── rails/        # Rails 8 app — Hotwire, Vite, React, Tailwind
├── ops/          # NixOS flake, deploy script, direnv config
└── flake.nix     # devShell covering everything
```

---

## React islands

Mount any component from any ERB view:

```erb
<%= react_component("Button", variant: "outline") %>
```

Register new components in `app/javascript/components/index.js`. Components re-mount automatically after Turbo navigations.

---

## Deployment

Deploy to any VPS via `ops/deploy.sh`. Secrets go in `rails/.env`. Update your domain in `ops/nixos/configuration.nix`.

---

## Roadmap

- **v0.1** — Rails stack, `mantis new`, works on NixOS and prod
- **v0.2** — Bug fixes, Nix hardening, zero-manual-step first run
- **v1+** — `mantis add auth`, `mantis add payments`, `mantis add s3`

---

## Philosophy

Templates are real working code — not template soup with markers and conditionals. When you clone what Mantis generates, it runs. No setup ritual. Build fast. Ship honest software.