# __project_name__

Generated with [Mantis](https://github.com/alvinliju/mantis) — Rails 8 · Hotwire · Vite · React · Pocketbase

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [First-Time Setup](#first-time-setup)
- [Running the Dev Server](#running-the-dev-server)
- [Project Structure](#project-structure)
- [Pocketbase Setup](#pocketbase-setup)
- [Auth Flow](#auth-flow)
- [Adding Pages](#adding-pages)
- [Hotwire / Stimulus](#hotwire--stimulus)
- [React Component Sprinkles](#react-component-sprinkles)
- [shadcn-Style UI Components](#shadcn-style-ui-components)
- [Production Deploy](#production-deploy)
- [Common Bugs & Resolutions](#common-bugs--resolutions)

---

## Prerequisites

You need **Nix with flakes enabled**. If you just got a fresh machine:

```bash
# Install Nix (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf -L https://install.determinate.systems/nix | sh -s -- install

# Enable flakes (skip if already configured)
./setup.sh
```

Everything else — Ruby, Node, Pocketbase, Foreman — is provided by the Nix shell. You do not need to install them globally.

---

## First-Time Setup

### 1. Enter the Nix dev shell

```bash
nix develop
```

This drops you into a shell with Ruby 3.3, Node 20, Pocketbase, and Foreman available. It also starts Pocketbase automatically in the background.

Expected output:
```
🔥 mantis dev environment
ruby:       ruby 3.3.x ...
node:       v20.x.x
pocketbase: v0.x.x
PocketBase started — admin UI: http://localhost:8090/_/
```

> **Tip:** Install [direnv](https://direnv.net/) and run `direnv allow` once to auto-enter the shell whenever you `cd` into this directory.

### 2. Install Ruby gems

```bash
cd rails
bundle install
```

This installs Rails, Turbo, Stimulus, Vite Rails, and other dependencies from the Gemfile.

### 3. Install JavaScript dependencies

```bash
npm install
```

This installs Vite, React, Tailwind, Stimulus, and the shadcn utility libraries.

### 4. Generate binstubs and fix permissions

```bash
bundle binstubs --all
chmod +x bin/dev bin/rails bin/rake bin/vite
```

This creates `bin/rails`, `bin/rake`, etc. so you can run them directly instead of prefixing everything with `bundle exec`.

### 5. Set up the database

```bash
bin/rails db:create db:migrate
```

SQLite is used only for Rails internals (sessions, cache). Application data lives in Pocketbase.

### 6. Set up Pocketbase

Visit **http://localhost:8090/_/** and:

1. Create your admin account (first visit only)
2. Go to **Collections → New collection**
3. Choose **Auth collection**, name it `users`
4. Create a test user: Collections → users → New record → set email and password

This is required before the sign-in page will work.

---

## Running the Dev Server

```bash
bin/dev
```

This starts two processes together:
- **Rails** on http://localhost:3000
- **Vite** (HMR) on http://localhost:3036

Open http://localhost:3000. You should see the home page with a Stimulus demo and a React button.

To stop: `Ctrl+C`

---

## Project Structure

```
__project_name__/
├── flake.nix                    # Nix dev environment (Ruby, Node, Pocketbase)
├── setup.sh                     # One-time Nix flakes enabler
├── rails/                       # The Rails application
│   ├── app/
│   │   ├── controllers/
│   │   │   ├── application_controller.rb   # current_user, signed_in? helpers
│   │   │   ├── home_controller.rb
│   │   │   └── sessions_controller.rb      # Pocketbase auth
│   │   ├── helpers/
│   │   │   └── application_helper.rb       # react_component() ERB helper
│   │   ├── javascript/
│   │   │   ├── application.js              # JS entry point
│   │   │   ├── application.css             # Tailwind v4 entry
│   │   │   ├── controllers/                # Stimulus controllers
│   │   │   │   ├── index.js                # register controllers here
│   │   │   │   └── hello_controller.js
│   │   │   ├── components/
│   │   │   │   ├── index.js                # register React components here
│   │   │   │   └── ui/                     # shadcn-style React components
│   │   │   │       ├── Button.jsx
│   │   │   │       ├── Card.jsx
│   │   │   │       ├── Badge.jsx
│   │   │   │       └── Input.jsx
│   │   │   └── lib/
│   │   │       └── utils.js                # cn() Tailwind merge utility
│   │   └── views/
│   │       ├── layouts/application.html.erb
│   │       ├── home/index.html.erb
│   │       └── sessions/new.html.erb
│   ├── config/
│   │   ├── routes.rb
│   │   ├── vite.json                       # Vite dev server config
│   │   └── initializers/pocketbase.rb
│   ├── lib/
│   │   └── pocketbase/client.rb            # Pocketbase HTTP client
│   ├── Procfile.dev                        # bin/dev process definitions
│   └── vite.config.ts
└── ops/
    ├── deploy.sh                           # VPS deploy via nixos-anywhere
    └── nixos/configuration.nix             # Production server config
```

---

## Pocketbase Setup

Pocketbase is your auth provider and primary database. Rails talks to it over HTTP via `lib/pocketbase/client.rb`.

### Using the client in a controller

```ruby
class PostsController < ApplicationController
  before_action :require_sign_in

  def index
    client = Pocketbase::Client.new(token: session[:pb_token])
    @posts = client.records("posts")["items"]
  end

  def create
    client = Pocketbase::Client.new(token: session[:pb_token])
    client.create("posts", { title: params[:title], body: params[:body] })
    redirect_to posts_path
  end
end
```

### Client API

```ruby
client = Pocketbase::Client.new(token: session[:pb_token])

# List records (with optional filter/sort/pagination)
client.records("posts")
client.records("posts", filter: "published=true", sort: "-created", page: 2, per_page: 20)

# Single record
client.record("posts", "RECORD_ID")

# Create
client.create("posts", { title: "Hello", body: "World" })

# Update
client.update("posts", "RECORD_ID", { title: "Updated" })

# Delete
client.destroy("posts", "RECORD_ID")

# Auth (used internally by SessionsController)
client.authenticate(email: "user@example.com", password: "secret")
```

---

## Auth Flow

`ApplicationController` provides two helpers available in all controllers and views:

```ruby
current_user   # returns the Pocketbase user hash, or nil
signed_in?     # boolean
require_sign_in  # before_action — redirects to /session/new if not signed in
```

Protect a controller:

```ruby
class DashboardController < ApplicationController
  before_action :require_sign_in

  def index
  end
end
```

Access user data in views:

```erb
<% if signed_in? %>
  <p>Hello, <%= current_user["email"] %></p>
  <%= button_to "Sign out", session_path, method: :delete %>
<% else %>
  <%= link_to "Sign in", new_session_path %>
<% end %>
```

---

## Adding Pages

```bash
# Generate controller + view
bin/rails generate controller Pages about contact

# Add routes
# config/routes.rb
get "about",   to: "pages#about"
get "contact", to: "pages#contact"
```

---

## Hotwire / Stimulus

Stimulus gives you sprinkled JS behaviour tied to DOM elements — no full page JS framework needed.

### Create a controller

```bash
# create app/javascript/controllers/counter_controller.js manually, or just add the file:
```

```javascript
// app/javascript/controllers/counter_controller.js
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["count"]
  static values  = { count: { type: Number, default: 0 } }

  increment() {
    this.countValue++
    this.countTarget.textContent = this.countValue
  }
}
```

### Register it

```javascript
// app/javascript/controllers/index.js
import CounterController from "./counter_controller"
application.register("counter", CounterController)
```

### Use it in a view

```erb
<div data-controller="counter">
  <p data-counter-target="count">0</p>
  <button data-action="click->counter#increment">+1</button>
</div>
```

Turbo handles navigation automatically — links and form submissions are intercepted and the page is updated without a full reload. No extra setup required.

---

## React Component Sprinkles

React is for interactive islands where Hotwire isn't enough — complex forms, charts, rich UI widgets.

### Create a component

```jsx
// app/javascript/components/ui/Counter.jsx
import React, { useState } from "react"

export default function Counter({ start = 0 }) {
  const [count, setCount] = useState(start)
  return (
    <button onClick={() => setCount(c => c + 1)}>
      Clicked {count} times
    </button>
  )
}
```

### Register it

```javascript
// app/javascript/components/index.js
import Counter from "./ui/Counter"

const COMPONENTS = { Button, Card, Badge, Input, Counter }  // add Counter here
```

### Mount it from any ERB view

```erb
<%= react_component("Counter", start: 5) %>
```

Props are passed as JSON. Components automatically re-mount after Turbo navigations.

---

## shadcn-Style UI Components

The following components ship pre-built in `app/javascript/components/ui/` and use the same CVA + Tailwind pattern as shadcn/ui:

| Component | Variants |
|-----------|----------|
| `Button`  | `default`, `destructive`, `outline`, `secondary`, `ghost`, `link` · sizes: `default`, `sm`, `lg`, `icon` |
| `Card`    | `CardHeader`, `CardTitle`, `CardContent`, `CardFooter` named exports |
| `Badge`   | `default`, `secondary`, `destructive`, `outline` |
| `Input`   | standard input, full width |

### From ERB

```erb
<%= react_component("Button", variant: "destructive", size: "sm") { "Delete" } %>
```

### From another React component

```jsx
import Button from "./Button"
import { Card, CardHeader, CardTitle, CardContent } from "./Card"

<Card>
  <CardHeader><CardTitle>Hello</CardTitle></CardHeader>
  <CardContent>
    <Button variant="outline">Click me</Button>
  </CardContent>
</Card>
```

### Adding new shadcn components

The `cn()` utility is available at `app/javascript/lib/utils.js`:

```javascript
import { cn } from "../../lib/utils"
```

Grab any component from [shadcn/ui](https://ui.shadcn.com/), swap the import path for `cn`, and drop the file into `components/ui/`. Register it in `components/index.js`.

---

## Production Deploy

### 1. Provision a NixOS VPS (Hetzner recommended)

### 2. Update the domain

```nix
# ops/nixos/configuration.nix
virtualHosts."your-domain.com" = { ... }
```

### 3. Create a `.env` on your server

```bash
# /app/rails/.env
SECRET_KEY_BASE=<output of: bundle exec rails secret>
POCKETBASE_URL=http://127.0.0.1:8090
RAILS_ENV=production
```

### 4. Deploy

```bash
./ops/deploy.sh <server-ip>
```

This runs `nixos-anywhere` to push the full NixOS config. On subsequent deploys, use `nixos-rebuild switch`.

---

## Common Bugs & Resolutions

### `bash: mantis: command not found` after install

The installer updated your `.bashrc` but the current shell doesn't see it yet.

```bash
export PATH="$HOME/.local/bin:$PATH"
```

Or open a new terminal.

---

### `error: path is not part of a flake`

You ran `nix develop` from inside `rails/` or `ops/` instead of the project root.

```bash
cd ~/your-project   # project root, where flake.nix lives
nix develop
```

---

### `Gem::Ext::BuildError: yaml.h not found` (psych)

`libyaml` headers are missing from your environment. This happens if you're running `bundle install` outside the Nix shell, or on an older version of the template.

**Inside the Nix shell** this should not occur. If it does, exit and re-enter:

```bash
exit
nix develop
bundle install
```

If you're not using Nix, install libyaml manually:
```bash
# Ubuntu/Debian
sudo apt-get install libyaml-dev
# macOS
brew install libyaml
```

---

### `npm error notarget No matching version found for vite-plugin-ruby`

Your `package.json` has a pinned version that no longer exists on npm.

```bash
npm install vite@latest vite-plugin-ruby@latest @vitejs/plugin-react@latest \
  @tailwindcss/vite@latest tailwindcss@latest --save-dev
```

---

### `bin/dev: Permission denied`

```bash
chmod +x bin/dev
```

---

### `bin/rails: No such file or directory`

Binstubs weren't generated. Rails binstubs are not included in the scaffold — generate them after `bundle install`:

```bash
bundle binstubs --all
chmod +x bin/rails bin/rake bin/vite bin/dev
```

---

### Sign-in fails with `Pocketbase request failed`

Pocketbase isn't running. Check:

```bash
pgrep -fl pocketbase   # should show a running process
curl http://localhost:8090/api/health   # should return {"code":200}
```

If it's not running:
```bash
pocketbase serve --dir=.pocketbase &
```

---

### Sign-in returns the form again with no error

The `users` collection doesn't exist in Pocketbase yet. Visit **http://localhost:8090/_/**, create an **Auth collection** named `users`, and add a test user.

---

### React components not rendering (no error, just empty)

The component isn't registered. Check `app/javascript/components/index.js`:

```javascript
const COMPONENTS = { Button, Card, Badge, Input, YourComponent }
//                                                ↑ must be here
```

Also check the browser console for:
```
[mantis] Unknown React component: "YourComponent"
```

---

### Tailwind classes not applying

Tailwind v4 uses a different import syntax. Make sure `application.css` starts with:

```css
@import "tailwindcss";
```

Not the old `@tailwind base;` / `@tailwind components;` / `@tailwind utilities;` syntax.

---

### Vite assets returning 404 in development

Check that `config/vite.json` has `sourceCodeDir` pointing to the right place:

```json
{
  "all": {
    "sourceCodeDir": "app/javascript"
  }
}
```

And that the Vite dev server is actually running (the `vite` line in `bin/dev` output).

---

### `uninitialized constant Pocketbase` in Rails console or controller

The initializer didn't load. Check that `config/initializers/pocketbase.rb` exists and contains:

```ruby
require_relative "../../lib/pocketbase/client"
```

Then restart the server.

---

### `ActiveRecord::NoDatabaseError`

```bash
bin/rails db:create db:migrate
```

---

### Changes to JS/CSS not reflecting in browser

Make sure Vite is running (both `web` and `vite` lines should appear in `bin/dev` output). If only Rails started, kill and re-run `bin/dev`. You can also run them separately:

```bash
bin/rails server          # terminal 1
bin/vite dev              # terminal 2
```
