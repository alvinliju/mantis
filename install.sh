  #!/usr/bin/env bash
  set -e
  cd "$(dirname "$0")/cli"
  go build -o mantis .
  mkdir -p "$HOME/.local/bin"
  mv mantis "$HOME/.local/bin/mantis"
  echo "Installed to $HOME/.local/bin/mantis"
  echo 'Add to PATH: export PATH="$HOME/.local/bin:$PATH"'