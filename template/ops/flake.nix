{
  description = "mantis development";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.11";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          packages = [
            # Python
            pkgs.python312
            pkgs.uv

            # Database
            pkgs.postgresql_16

            # Frontend
            pkgs.nodejs_20
            pkgs.nodePackages.npm

            # Tools
            pkgs.git
            pkgs.curl
          ];

          # Runs when you enter the shell
          shellHook = ''
            echo "started mantis dev environment"
            echo "python: $(python --version)"
            echo "node:   $(node --version)"
            echo ""

            # Set up local postgres (no sudo, no system install)
            export PGDATA=$PWD/.postgres
            export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mantis"

            if [ ! -d "$PGDATA" ]; then
              echo "Setting up Postgres for the first time..."
              initdb -U postgres --auth=trust
            fi

            # Start postgres if not already running
            if ! pg_ctl status -D $PGDATA > /dev/null 2>&1; then
              pg_ctl start -D $PGDATA -l $PGDATA/postgres.log
              sleep 1
              createdb -U postgres mantis 2>/dev/null || true
              echo "Postgres started."
            fi

            echo "DATABASE_URL=$DATABASE_URL"
            echo ""
            echo "next steps:"
            echo "  cd backend && uv sync    # install python deps"
            echo "  cd frontend && npm i     # install node deps"
          '';
        };
      }
    );
}