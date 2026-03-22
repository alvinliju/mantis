{ config, pkgs, ... }:

{
  system.stateVersion = "24.11";

  # ── networking ───────────────────────────────────────────────────────────────
  networking.hostName = "mantis-server";
  networking.firewall.allowedTCPPorts = [ 22 80 443 ];
  # caddy handles 80 and 443. everything else is internal.

  # ── ssh ──────────────────────────────────────────────────────────────────────
  services.openssh = {
    enable = true;
    settings.PasswordAuthentication = false;
  };

  # ── pocketbase ───────────────────────────────────────────────────────────────
  systemd.services.pocketbase = {
    enable = true;
    description = "pocketbase — database, auth, admin ui";
    wantedBy = [ "multi-user.target" ];
    after = [ "network.target" ];

    serviceConfig = {
      ExecStart = "${pkgs.pocketbase}/bin/pocketbase serve --dir=/app/pocketbase --http=127.0.0.1:8090";
      Restart = "always";
      RestartSec = "5s";
      User = "mantis";
    };
  };

  # ── fastapi backend ───────────────────────────────────────────────────────────
  systemd.services.mantis-app = {
    enable = true;
    description = "mantis fastapi backend";
    wantedBy = [ "multi-user.target" ];
    after = [ "pocketbase.service" ];

    environment = {
      POCKETBASE_URL = "http://127.0.0.1:8090";
    };

    serviceConfig = {
      WorkingDirectory = "/app/backend";
      ExecStart = "/app/backend/.venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000";
      Restart = "always";
      RestartSec = "5s";
      User = "mantis";
    };
  };

  # ── nextjs frontend ───────────────────────────────────────────────────────────
  systemd.services.mantis-frontend = {
    enable = true;
    description = "mantis nextjs frontend";
    wantedBy = [ "multi-user.target" ];

    serviceConfig = {
      WorkingDirectory = "/app/frontend";
      ExecStart = "${pkgs.nodejs_20}/bin/node server.js";
      Restart = "always";
      RestartSec = "5s";
      User = "mantis";
    };
  };

  # ── caddy reverse proxy ───────────────────────────────────────────────────────
  # handles HTTPS automatically. no certbot. no manual certs.
  services.caddy = {
    enable = true;
    virtualHosts."your-domain.com" = {
      extraConfig = ''
        # nextjs frontend
        handle / {
          reverse_proxy localhost:3000
        }

        # fastapi backend
        handle /api/* {
          reverse_proxy localhost:8000
        }

        # pocketbase admin + api
        handle /pb/* {
          reverse_proxy localhost:8090
        }
      '';
    };
  };

  # ── app user ──────────────────────────────────────────────────────────────────
  users.users.mantis = {
    isSystemUser = true;
    group = "mantis";
    home = "/app";
  };
  users.groups.mantis = {};

  # ── packages available on server ──────────────────────────────────────────────
  environment.systemPackages = with pkgs; [
    git
    curl
    python312
    nodejs_20
    pocketbase
  ];
}
