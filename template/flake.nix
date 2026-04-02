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
            # Ruby + native gem build deps
            pkgs.ruby_3_3
            pkgs.bundler
            pkgs.libyaml       # psych (YAML parser used by Rails)
            pkgs.pkg-config    # lets extconf.rb find libraries via pkg-config
            pkgs.zlib          # nokogiri and others

            # Node (Vite asset pipeline)
            pkgs.nodejs_20

            # PocketBase
            pkgs.pocketbase

            # Dev process manager
            pkgs.foreman

            # Tools
            pkgs.git
            pkgs.curl
            pkgs.sqlite
          ];

          shellHook = ''
            echo "🔥 mantis dev environment"
            echo "ruby:       $(ruby --version)"
            echo "node:       $(node --version)"
            echo "pocketbase: $(pocketbase --version)"
            echo ""

            # PocketBase
            export POCKETBASE_URL="http://localhost:8090"
            export POCKETBASE_DATA="$PWD/.pocketbase"
            mkdir -p $POCKETBASE_DATA

            if ! pgrep -f "pocketbase serve" > /dev/null; then
              pocketbase serve --dir=$POCKETBASE_DATA > $POCKETBASE_DATA/pocketbase.log 2>&1 &
              echo "PocketBase started — admin UI: http://localhost:8090/_/"
            fi

            echo ""
            echo "next steps:"
            echo "  cd rails && bundle install   # install gems"
            echo "  cd rails && npm install      # install js deps"
            echo "  cd rails && bin/rails db:create db:migrate"
            echo "  cd rails && bin/dev          # start rails + vite"
          '';
        };
      }
    );
}
