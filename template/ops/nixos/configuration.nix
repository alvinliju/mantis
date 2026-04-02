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

  # ── rails app (puma) ─────────────────────────────────────────────────────────
  systemd.services.mantis-app = {
    enable = true;
    description = "mantis rails app";
    wantedBy = [ "multi-user.target" ];
    after = [ "pocketbase.service" ];

    environment = {
      RAILS_ENV        = "production";
      POCKETBASE_URL   = "http://127.0.0.1:8090";
      PORT             = "3000";
      # Set SECRET_KEY_BASE in /app/rails/.env or via a systemd EnvironmentFile
    };

    serviceConfig = {
      WorkingDirectory  = "/app/rails";
      ExecStartPre      = "${pkgs.ruby_3_3}/bin/bundle exec rails assets:precompile db:migrate";
      ExecStart         = "${pkgs.ruby_3_3}/bin/bundle exec puma -C config/puma.rb";
      Restart           = "always";
      RestartSec        = "5s";
      User              = "mantis";
      EnvironmentFile   = "/app/rails/.env";
    };
  };

  # ── caddy reverse proxy ───────────────────────────────────────────────────────
  # handles HTTPS automatically. no certbot. no manual certs.
  services.caddy = {
    enable = true;
    virtualHosts."your-domain.com" = {
      extraConfig = ''
        # rails handles everything
        handle {
          reverse_proxy localhost:3000
        }

        # pocketbase admin ui (restrict to your IP in production)
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
    ruby_3_3
    nodejs_20
    pocketbase
    sqlite
  ];
}
