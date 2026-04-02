nix dev environment and production deploy config.

flake.nix lives at the project root — run `nix develop` from there.
direnv: `direnv allow` at the project root auto-loads it on cd.

deploys to any vps with ssh access.
hetzner recommended. others work fine.

secrets go in rails/.env. never in the flake.

```
in ops/nixos/configuration.nix
virtualHosts."your-domain.com"

Replace `your-domain.com` with your actual domain when you have one.
```
