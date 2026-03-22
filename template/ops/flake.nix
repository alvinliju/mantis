{
  description = "mantis — forge something real";

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

            # PocketBase
            pkgs.pocketbase

            # Frontend
            pkgs.nodejs_20
            pkgs.nodePackages.npm

            # Tools
            pkgs.git
            pkgs.curl
          ];

          shellHook = ''
            echo "🔥 mantis dev environment"
            echo "python:     $(python --version)"
            echo "node:       $(node --version)"
            echo "pocketbase: $(pocketbase --version)"
            echo ""

            # Start PocketBase if not already running
            export POCKETBASE_URL="http://localhost:8090"
            export POCKETBASE_DATA="$PWD/.pocketbase"

            mkdir -p $POCKETBASE_DATA

            if ! pgrep -f "pocketbase serve" > /dev/null; then
              pocketbase serve --dir=$POCKETBASE_DATA > $POCKETBASE_DATA/pocketbase.log 2>&1 &
              echo "PocketBase started."
              echo "Admin UI: http://localhost:8090/_/"
            fi

            echo ""
            echo "next steps:"
            echo "  cd backend && uv sync    # install python deps"
            echo "  cd frontend && npm i     # install node deps"
          '';
        };
      }
    );
}
