nix flake for dev and prod.

nix develop — drops you into a shell with everything running.
direnv allow — loads it automatically on cd.

deploys to any vps with ssh access.
hetzner recommended. others work fine.

secrets go in .env. never in the flake.


```
in nixos/configuration.nix
virtualHosts."your-domain.com"

Replace `your-domain.com` with your actual domain when you have one.

---