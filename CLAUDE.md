# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Mantis is a CLI scaffold tool. Running `mantis new myapp` generates a production-ready project with a Ruby on Rails app (Hotwire + Vite + React sprinkles) and Pocketbase for auth/DB. The generated project uses NixOS flakes as the primary dev environment.

## CLI Development (Go)

All CLI source is in `cli/`. No external dependencies — stdlib only.

```bash
# Run directly
cd cli && go run . new my-project

# Build
cd cli && go build -o mantis .

# Test with a local template override (avoids GitHub download)
cd cli && go run . new my-project --template-path ../template
```

The CLI has no test files yet. When adding tests, run them with `go test ./...` from `cli/`.

## Template Structure

`template/` contains the files copied into each generated project:

- `template/rails/` — Rails 8 app:
  - Hotwire (Turbo + Stimulus) for server-driven interactivity
  - Vite via `vite_rails` for the asset pipeline
  - React sprinkles: mount any component from ERB with `react_component("Button", variant: "outline")`
  - shadcn-style UI components in `app/javascript/components/ui/` (Button, Card, Badge, Input)
  - Tailwind v4 via `@tailwindcss/vite`
  - Pocketbase client at `lib/pocketbase/client.rb` — wraps `net/http`, no gem dependency
  - Auth via Pocketbase: `SessionsController` stores `pb_token` in the Rails session
- `template/flake.nix` — NixOS flake at the project root (so `nix develop` works without arguments)
- `template/.envrc` — direnv config at project root
- `template/ops/` — deploy script and NixOS server configuration

Two placeholders are replaced at scaffold time:
- `__project_name__` → the project name as-given (e.g. `my-app`)
- `__project_name_pascal__` → PascalCase version for the Ruby module name (e.g. `MyApp`)

Binary files (SVG, PNG, fonts), `package-lock.json`, `vendor/`, `.bundle/`, `tmp/`, and `log/` are skipped during copy.

## How Template Resolution Works

`template_source.go` resolves templates in this priority order:
1. `--template-path <path>` flag (local directory)
2. `~/.mantis/cache/` (cached from last GitHub download, validated against latest release tag)
3. GitHub latest release of `alvinliju/mantis` (zipball downloaded and extracted)

Override the source repo with `MANTIS_TEMPLATE_REPO=owner/repo`. Set `MANTIS_GITHUB_TOKEN` to avoid GitHub API rate limits.

**To test CLI changes against the local template without a GitHub release**, always use `--template-path ../template`.

## Generated Project Dev Workflow

Inside a generated project:
```bash
nix develop                          # drops into shell, starts Pocketbase automatically
cd rails && bundle install           # install gems
cd rails && npm install              # install JS deps (Vite, React, Tailwind)
cd rails && bin/rails db:create db:migrate
cd rails && bin/dev                  # starts Rails + Vite dev server together
```

Or with direnv:
```bash
direnv allow       # auto-loads nix shell on cd
```

Deploy to a VPS via `ops/deploy.sh`. Secrets go in `rails/.env`, never in `flake.nix`. Update the domain in `ops/nixos/configuration.nix`.

## Adding React Components

Register new components in `app/javascript/components/index.js`, then mount them from any ERB view:

```erb
<%= react_component("MyComponent", prop: "value") %>
```

The helper is defined in `app/helpers/application_helper.rb`. Components re-mount automatically after Turbo navigations.
